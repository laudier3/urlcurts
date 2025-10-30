import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { hashPassword } from '../services/auth';

const prisma = new PrismaClient();

// Listar todos os usuários
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, age: true } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Buscar usuário por ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) }, select: { id: true, name: true, email: true, phone: true, age: true } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// Atualizar usuário
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, age, password } = req.body;

  try {
    const data: any = { name, email, phone, age: age ? Number(age) : undefined };
    if (password) data.password = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, name: true, email: true, phone: true, age: true },
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// Deletar usuário
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};
