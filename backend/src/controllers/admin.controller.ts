import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (role) where.role = String(role);

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: { id: true, name: true, email: true, role_id: true, created_at: true },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.users.count({ where }),
    ]);

    sendSuccess(res, { users, total });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch users', 500);
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.id);
    const { role } = req.body;

    if (!role) {
      sendError(res, 'VALIDATION_ERROR', 'Role is required');
      return;
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { role_id: String(role) },
    });

    sendSuccess(res, { user: updatedUser });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update user role', 500);
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = await prisma.reports.findMany({
      orderBy: { created_at: 'desc' },
    });
    sendSuccess(res, { reports });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch reports', 500);
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalIssues, resolvedIssues, activeLostFound] = await Promise.all([
      prisma.users.count(),
      prisma.student_issues.count(),
      prisma.student_issues.count({ where: { status: 'RESOLVED' } }),
      prisma.lost_found_posts.count({ where: { status: 'OPEN' } }),
    ]);

    sendSuccess(res, {
      analytics: {
        totalUsers,
        totalIssues,
        resolvedIssues,
        activeLostFound,
      },
    });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch analytics', 500);
  }
};

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.system_settings.findMany();
    sendSuccess(res, { settings });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch settings', 500);
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      sendError(res, 'VALIDATION_ERROR', 'Key and value are required');
      return;
    }

    const setting = await prisma.system_settings.upsert({
      where: { key: String(key) },
      update: { value: String(value), description: description ? String(description) : undefined },
      create: { key: String(key), value: String(value), description: description ? String(description) : undefined },
    });

    sendSuccess(res, { setting });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update setting', 500);
  }
};
