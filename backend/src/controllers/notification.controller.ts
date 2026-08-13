import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const notifications = await prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    sendSuccess(res, { notifications });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch notifications', 500);
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationId = String(req.params.id);
    const userId = req.user?.id;

    const notification = await prisma.notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.user_id !== userId) {
      sendError(res, 'NOT_FOUND', 'Notification not found', 404);
      return;
    }

    const updated = await prisma.notifications.update({
      where: { id: notificationId },
      data: { is_read: true },
    });

    sendSuccess(res, { notification: updated });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to mark notification as read', 500);
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    await prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to mark all notifications as read', 500);
  }
};
