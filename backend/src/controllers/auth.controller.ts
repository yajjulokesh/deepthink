import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'VALIDATION_ERROR', 'Email and password are required');
      return;
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Invalid credentials', 401);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      sendError(res, 'UNAUTHORIZED', 'Invalid credentials', 401);
      return;
    }

    const token = generateToken({
      id: user.id,
      role: user.role.name,
    });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'An error occurred during login', 500);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role_name } = req.body;

    if (!name || !email || !password || !role_name) {
      sendError(res, 'VALIDATION_ERROR', 'All fields are required');
      return;
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, 'VALIDATION_ERROR', 'Email is already in use');
      return;
    }

    const role = await prisma.roles.findUnique({ where: { name: role_name } });
    if (!role) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid role');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role_id: role.id,
      },
      include: { role: true },
    });

    const token = generateToken({
      id: user.id,
      role: user.role.name,
    });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'An error occurred during registration', 500);
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'User ID not found in token', 401);
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      sendError(res, 'NOT_FOUND', 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'An error occurred while fetching current user', 500);
  }
};
