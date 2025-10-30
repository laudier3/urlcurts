import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import express from 'express';
import validUrl from 'valid-url';
import geoip from 'geoip-lite';

const prisma = new PrismaClient();
const router = express.Router();

// Criar URL
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { originalUrl, customSlug } = req.body;
  if (!validUrl.isWebUri(originalUrl)) return res.status(400).json({ error: 'URL inválida' });

  const userId = req.userId!;
  try {
    const count = await prisma.url.count({ where: { userId } });
    if (count >= 10) return res.status(403).json({ error: 'Limite de 10 URLs atingido' });

    let slug = customSlug?.trim() ?? '';
    if (!slug) {
      const generateSlug = () => 'xxxxxx'.replace(/x/g, () => Math.random().toString(36)[2]!);
      do { slug = generateSlug(); } while (await prisma.url.findUnique({ where: { slug } }));
    } else {
      const exists = await prisma.url.findUnique({ where: { slug } });
      if (exists) return res.status(400).json({ error: 'Slug já existe' });
    }

    const shortUrlFull = `${process.env.BASE_URL || 'https://urlcurt.site'}/${slug}`;
    const url = await prisma.url.create({ data: { original: originalUrl, slug, shortUrl: shortUrlFull, userId } });
    res.json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar URL' });
  }
});

// Listar URLs
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  try {
    const urls = await prisma.url.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json({ urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar URLs' });
  }
});

// Atualizar URL
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { originalUrl, shortSlug } = req.body;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const url = await prisma.url.findUnique({ where: { id } });
    if (!url || url.userId !== req.userId) return res.status(404).json({ error: 'URL não encontrada' });

    if (shortSlug !== url.slug) {
      const slugExists = await prisma.url.findUnique({ where: { slug: shortSlug } });
      if (slugExists) return res.status(400).json({ error: 'Slug já em uso' });
    }

    const updated = await prisma.url.update({
      where: { id },
      data: { original: originalUrl, slug: shortSlug, shortUrl: `${process.env.BASE_URL}/${shortSlug}` },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar URL' });
  }
});

// Deletar URL
