import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priority, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (priority) where.priority = String(priority);

    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.announcements.count({ where }),
    ]);

    sendSuccess(res, { announcements, total });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch announcements', 500);
  }
};

export const getAnnouncementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = String(req.params.id);
    const announcement = await prisma.announcements.findUnique({
      where: { id: announcementId },
      include: { comments: true },
    });

    if (!announcement) {
      sendError(res, 'NOT_FOUND', 'Announcement not found', 404);
      return;
    }

    sendSuccess(res, { announcement });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch announcement', 500);
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, priority, official_clarification, comments_enabled } = req.body;
    const userId = req.user?.id;

    if (!title || !content || !priority) {
      sendError(res, 'VALIDATION_ERROR', 'Title, content, and priority are required');
      return;
    }

    const announcement = await prisma.announcements.create({
      data: {
        title: String(title),
        content: String(content),
        priority: String(priority),
        official_clarification: Boolean(official_clarification),
        comments_enabled: comments_enabled !== undefined ? Boolean(comments_enabled) : true,
        author_id: userId!,
      },
    });

    sendSuccess(res, { announcement }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to create announcement', 500);
  }
};

export const updateAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = String(req.params.id);
    const announcement = await prisma.announcements.findUnique({ where: { id: announcementId } });

    if (!announcement) {
      sendError(res, 'NOT_FOUND', 'Announcement not found', 404);
      return;
    }

    const updated = await prisma.announcements.update({
      where: { id: announcementId },
      data: req.body,
    });

    sendSuccess(res, { announcement: updated });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update announcement', 500);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = String(req.params.id);
    const announcement = await prisma.announcements.findUnique({ where: { id: announcementId } });

    if (!announcement) {
      sendError(res, 'NOT_FOUND', 'Announcement not found', 404);
      return;
    }

    await prisma.announcements.delete({ where: { id: announcementId } });
    sendSuccess(res, null, 204);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to delete announcement', 500);
  }
};
