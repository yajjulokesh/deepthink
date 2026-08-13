import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.system_settings.findMany();
    sendSuccess(res, { settings });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch system settings', 500);
  }
};

export const updateUpvoteThreshold = async (req: Request, res: Response): Promise<void> => {
  try {
    const { threshold } = req.body;

    if (!threshold || isNaN(Number(threshold)) || Number(threshold) < 1) {
      sendError(res, 'VALIDATION_ERROR', 'Valid positive threshold number is required');
      return;
    }

    const setting = await prisma.system_settings.upsert({
      where: { key: 'student_issue_upvote_threshold' },
      update: { value: String(threshold) },
      create: {
        key: 'student_issue_upvote_threshold',
        value: String(threshold),
        description: 'Number of student upvotes required to automatically trigger a Management notification',
      },
    });

    sendSuccess(res, { setting });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update threshold setting', 500);
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalIssues,
      resolvedIssues,
      thresholdReachedIssues,
      totalAnnouncements,
      totalLostFound,
      resolvedLostFound,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.student_issues.count(),
      prisma.student_issues.count({ where: { status: 'RESOLVED' } }),
      prisma.student_issues.count({ where: { threshold_reached: true } }),
      prisma.announcements.count(),
      prisma.lost_found_posts.count(),
      prisma.lost_found_posts.count({ where: { status: 'RESOLVED' } }),
    ]);

    const thresholdSetting = await prisma.system_settings.findUnique({
      where: { key: 'student_issue_upvote_threshold' },
    });

    sendSuccess(res, {
      analytics: {
        totalStudents,
        totalIssues,
        resolvedIssues,
        resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
        thresholdReachedIssues,
        totalAnnouncements,
        totalLostFound,
        resolvedLostFound,
        recoveryRate: totalLostFound > 0 ? Math.round((resolvedLostFound / totalLostFound) * 100) : 0,
        currentThreshold: thresholdSetting ? parseInt(thresholdSetting.value, 10) : 100,
      },
    });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch analytics', 500);
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const roles = await prisma.roles.findMany();

    sendSuccess(res, { users, roles });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch users', 500);
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role_name } = req.body;

    const role = await prisma.roles.findUnique({ where: { name: role_name } });
    if (!role) {
      sendError(res, 'NOT_FOUND', 'Role not found', 404);
      return;
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { role_id: role.id },
      include: { role: true },
    });

    sendSuccess(res, { user: updatedUser });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update user role', 500);
  }
};
