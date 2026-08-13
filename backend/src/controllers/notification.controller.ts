import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const notifications = await prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });

    sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch notifications', 500);
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notifications.findUnique({ where: { id } });
    if (!notification || notification.user_id !== userId) {
      sendError(res, 'NOT_FOUND', 'Notification not found', 404);
      return;
    }

    const updated = await prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });

    sendSuccess(res, { notification: updated });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update notification', 500);
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    await prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update notifications', 500);
  }
};
