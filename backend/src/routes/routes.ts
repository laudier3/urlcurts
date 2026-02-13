import express from 'express';
import { PrismaClient } from '@prisma/client';
import validUrl from 'valid-url';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../services/auth';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import geoip from 'geoip-lite';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSms(phone: string, message: string) {
    try {
        await twilioClient.messages.create({
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER, // Número que você obteve no Twilio
            body: message,
        });
    } catch (err) {
        console.error('Erro ao enviar SMS:', err);
        throw new Error('Erro ao enviar SMS');
    }
}

/**
 * Normaliza IP (remove IPv6 ::ffff:)
 */
function normalizeIp(ip?: string | string[]): string | null {
  if (!ip) return null;

  const rawIp = Array.isArray(ip) ? ip[0] : ip;

  if (rawIp.startsWith('::ffff:')) {
    return rawIp.replace('::ffff:', '');
  }

  return rawIp;
}

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // Ex: seuemail@gmail.com
    pass: process.env.EMAIL_PASSWORD,   // Senha ou App Password
  },
});

const router = express.Router();
const prisma = new PrismaClient();

// --- Registro ---
router.post('/api/register', async (req: any, res: any) => {
  const { name, email, password, phone, age, image, access } = req.body

  if (!name || !email || !password || !phone || !age) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' })
  }

  try {
    // Verifica se o email já existe
    const existsEmail = await prisma.user.findUnique({ where: { email } })
    if (existsEmail) {
      return res.status(400).json({ error: 'email' })
    }

    // Verifica se o telefone já existe
    const existsPhone = await prisma.user.findUnique({ where: { phone } })
    if (existsPhone) {
      return res.status(400).json({ error: 'phone' })
    }

    // Criptografa a senha
    const hashedPassword = await hashPassword(password)

    // Criação do usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        age: Number(age),
        access: access || 'user',
        image: image || 'https://i.pravatar.cc/150',
        password: hashedPassword,
      },
    })

    // Gera token JWT
    const token = generateToken({ id: user.id, email: user.email })

    return res.status(201).json({ success: true, msg: 'Usuário cadastrado com sucesso!', user })
  } catch (err) {
    console.error('Erro ao cadastrar:', err)
    return res.status(500).json({ error: 'Erro inesperado ao cadastrar usuário.' })
  }
})

// Recuperação de senha via email
router.post('/api/recover-password', async (req: any, res: any) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado com esse e-mail' });

    const resetToken = generateToken({ id: user.id, email: user.email });
    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    // Envio do e-mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperação de Senha',
      html: `
        <p>Olá, ${user.name}!</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      `,
    });

    res.json({ message: 'Link de recuperação enviado para o e-mail' });
  } catch (err) {
    console.error('Erro ao enviar e-mail de recuperação:', err);
    res.status(500).json({ error: 'Erro ao enviar link de recuperação por e-mail' });
  }
});

// --- Login com cookie HTTP‑only ---
router.post('/api/login', async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuário ou senha incorretos' });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ error: 'Usuário ou senha incorretos' });

    const token = generateToken({ id: user.id, email: user.email });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true em produção
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.urlcurt.site' : undefined,
      maxAge: 3600000, // 1h
    });    

    res.status(200).json({token: token});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});
// Rota para retornar a localização do visitante com base no IP
router.get('/api/ip-info', authMiddleware, async (req: any, res: any) => {
  const ip = req.headers['x-forwarded-for']?.toString()?.split(',')[0] || 
             req.socket.remoteAddress || '';

  const geo = geoip.lookup(ip);

  if (!geo) {
    return res.status(404).json({ error: 'Não foi possível localizar o IP.' });
  }

  return res.json({
    ip,
    country: geo.country || null,
    region: geo.region || null,
    city: geo.city || null,
    ll: geo.ll || null, // Latitude e Longitude
    timezone: geo.timezone || null
  });
});

router.get('/api/urls/:id/geo', authMiddleware, async (req: any, res: any) => {
  const urlId = Number(req.params.id);
  const userId = req.userId!;

  const url = await prisma.url.findUnique({ where: { id: urlId } });
  if (!url || url.userId !== userId)
    return res.status(404).json({ error: 'URL não encontrada' });

  const geoData = await prisma.visit.groupBy({
    by: ['country', 'region', 'city'],
    where: { urlId },
    _count: { _all: true },
  });

  const result = geoData.map(g => ({
    country: g.country || 'Desconhecido',
    region: g.region || 'Desconhecido',
    city: g.city || 'Desconhecido',
    count: g._count._all,
  }));

  res.json(result);
});

// --- Verifica usuário logado ---
router.get("/api/me", authMiddleware, async (req: AuthRequest, res:any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        image: true,
        access: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Atualizar perfil completo do usuário autenticado
router.put('/api/me', authMiddleware, async (req: AuthRequest, res: any) => {
  const userId = req.userId!;
  const { name, email, phone, age, image, access } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        image,
        access,
        age: age ? Number(age) : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        image: true,
        access: true,
      },
    });

    res.json(updated);
  } catch (err: any) {
    console.error('Erro ao atualizar usuário:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email ou telefone já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// Deletar conta do usuário logado
router.delete('/api/me', authMiddleware, async (req: AuthRequest, res: any) => {
  const userId = req.userId!;

  try {
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Deleta o usuário (URLs e Visits são deletadas automaticamente)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
    });

    return res.json({ message: 'Conta e dados relacionados excluídos com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar conta:', err);
    return res.status(500).json({ error: 'Erro ao excluir conta' });
  }
});

router.post('/api/recover-password', async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado com esse e-mail' });

    const resetToken = generateToken({ id: user.id, email: user.email });
    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperação de Senha',
      html: `
        <p>Olá, ${user.name}!</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      `,
    });

    res.json({ message: 'Link de recuperação enviado para o e-mail' });
  } catch (err) {
    console.error('Erro ao enviar e-mail de recuperação:', err);
    res.status(500).json({ error: 'Erro ao enviar link de recuperação por e-mail' });
  }
});

router.post('/api/reset-password', async (req: any, res: any) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
  }

  try {
    // Verifica se o token é válido
    const decoded: any = verifyToken(token); // retorna { id, email }

    // Criptografa a nova senha
    const hashed = await hashPassword(newPassword);

    // Atualiza o usuário no banco
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed },
    });

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    return res.status(400).json({ error: 'Token inválido ou expirado' });
  }
});

router.get('/api/check', (req: any, res: any) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ authenticated: false });

  try {
    const decoded = verifyToken(token);
    return res.json({ authenticated: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
});

// --- Logout (limpa cookie) ---
router.post('/api/logout', (req: any, res: any) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,           // ESSENCIAL para HTTPS
    sameSite: 'None',       // ESSENCIAL para cross-site cookie
    path: '/',              // garante que a exclusão funcione em todo o domínio
  });
  return res.json({ message: 'Logout realizado com sucesso' });
});

router.post('/api/urls', authMiddleware, async (req: AuthRequest, res: any) => {
  const { originalUrl, customSlug } = req.body;
  if (!validUrl.isWebUri(originalUrl)) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  const userId = req.userId!;

  try {
    // 🔒 Verifica se o usuário já tem 10 URLs
    const count = await prisma.url.count({ where: { userId } });
    if (count >= 10) {
      return res.status(403).json({ error: 'Limite de 3 URLs atingido. Exclua uma para adicionar outra.' });
    }

    let slug = customSlug?.trim() ?? '';
    if (slug) {
      const exists = await prisma.url.findUnique({ where: { slug } });
      if (exists) return res.status(400).json({ error: 'Slug personalizado já existe' });
    } else {
      const generateSlug = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      };
      do {
        slug = generateSlug();
      } while (await prisma.url.findUnique({ where: { slug } }));
    }

    const shortUrlFull = `${process.env.BASE_URL || 'https://urlcurt.site'}/${slug}`;
    const url = await prisma.url.create({
      data: { original: originalUrl, slug, shortUrl: shortUrlFull, userId },
    });

    res.json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar URL' });
  }
});


// --- Deletar URL ---
router.delete('/api/urls/:id', authMiddleware, async (req: AuthRequest, res: any) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const userId = req.userId!;
  try {
    const url = await prisma.url.findUnique({ where: { id } });
    if (!url || url.userId !== userId) return res.status(404).json({ error: 'URL não encontrada' });

    await prisma.url.delete({ where: { id } });
    res.json({ message: 'URL deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar URL' });
  }
});

// --- Atualizar URL ---
router.put('/api/urls/:id', authMiddleware, async (req: AuthRequest, res: any) => {
  const id = Number(req.params.id);
  const { originalUrl, shortSlug } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const url = await prisma.url.findUnique({ where: { id } });
    if (!url || url.userId !== req.userId) {
      return res.status(404).json({ error: 'URL não encontrada ou sem permissão' });
    }

    // Verifica se o slug novo já existe (e não é o mesmo da URL atual)
    if (shortSlug !== url.slug) {
      const slugExists = await prisma.url.findUnique({ where: { slug: shortSlug } });
      if (slugExists) return res.status(400).json({ error: 'Slug já em uso' });
    }

    const updated = await prisma.url.update({
      where: { id },
      data: {
        original: originalUrl,
        slug: shortSlug,
        shortUrl: `${process.env.BASE_URL || 'https://urlcurt.site'}/${shortSlug}`
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar URL' });
  }
});

// --- Listar URLs do usuário ---
router.get('/api/urls', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  try {
    const urls = await prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar URLs' });
  }
});

// --- Deletar URL ---
router.delete('/api/urls/:id', authMiddleware, async (req: AuthRequest, res: any) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const userId = req.userId!;
  try {
    const url = await prisma.url.findUnique({ where: { id } });
    if (!url || url.userId !== userId) return res.status(404).json({ error: 'URL não encontrada' });

    await prisma.url.delete({ where: { id } });
    res.json({ message: 'URL deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar URL' });
  }
});

/**
 * Rota pública da URL encurtada
 * Rastreia IP + localização + incrementa visitas
 */
router.get('/:slug', async (req: any, res: any) => {
  const { slug } = req.params;

  try {
    // 🔹 Captura IP real (proxy / produção)
    const ip = normalizeIp(
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress
    );

    // 🔹 Geolocalização
    const geo = ip ? geoip.lookup(ip) : null;

    // 🔹 Busca URL
    const url = await prisma.url.findUnique({
      where: { slug },
    });

    if (!url) {
      return res.status(404).send('URL não encontrada');
    }

    // 🔹 Salva visita (log detalhado)
    await prisma.visit.create({
      data: {
        urlId: url.id,
        ip,
        country: geo?.country ?? null,
        region: geo?.region ?? null,
        city: geo?.city ?? null,
        timestamp: new Date(),
      },
    });

    // 🔹 Incrementa contador rápido
    await prisma.url.update({
      where: { id: url.id },
      data: {
        visits: { increment: 1 },
      },
    });

    // 🔹 Redireciona
    return res.redirect(url.original);
  } catch (error) {
    console.error('Erro ao rastrear visita:', error);
    return res.status(500).send('Erro interno do servidor');
  }
});

router.get('/api/urls/:id/traffic', async (req: any, res: any) => {
  try {
    const urlId = Number(req.params.id);

    const visits = await prisma.$queryRaw<
      { date: Date; count: bigint }[]
    >`
      SELECT 
        DATE("timestamp") as date,
        COUNT(*) as count
      FROM "Visit"
      WHERE "urlId" = ${urlId}
      GROUP BY DATE("timestamp")
      ORDER BY DATE("timestamp") ASC
    `;

    const result = visits.map(v => ({
      date: v.date.toISOString().split('T')[0],
      count: Number(v.count),
    }));

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar tráfego:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

router.get('/api/urls/:id/clicks', authMiddleware, async (req: AuthRequest, res: any) => {
  const urlId = Number(req.params.id);
  const userId = req.userId!;

  if (isNaN(urlId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    // 🔒 Verifica se a URL pertence ao usuário
    const url = await prisma.url.findUnique({ where: { id: urlId } });
    if (!url || url.userId !== userId) {
      return res.status(404).json({ error: 'URL não encontrada' });
    }

    const visits = await prisma.visit.findMany({
      where: { urlId },
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        ip: true,
        country: true,
        region: true,
        city: true,
        timestamp: true,
      },
      take: 100, // limite de segurança
    });

    // 🔹 Aplica valores padrão para city, region, country
    const visitsWithDefaults = visits.map(v => ({
      ...v,
      city: v.city || 'Desconhecido',
      region: v.region || 'Desconhecido',
      country: v.country || 'Desconhecido',
      timestamp: new Date(v.timestamp).toISOString(), // opcional: formata a data
    }));

    // 🔹 Retorna o array plano com defaults
    res.json(visitsWithDefaults);
  } catch (err) {
    console.error('Erro ao buscar cliques:', err);
    res.status(500).json({ error: 'Erro ao buscar cliques' });
  }
});

export { router };