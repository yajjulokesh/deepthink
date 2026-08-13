import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priority, official_clarification, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (priority) where.priority = String(priority).toUpperCase();
    if (official_clarification !== undefined) {
      where.official_clarification = official_clarification === 'true';
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { content: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          author: { select: { id: true, name: true, role: { select: { name: true } } } },
          comments: {
            orderBy: { created_at: 'asc' },
          },
        },
      }),
      prisma.announcements.count({ where }),
    ]);

    sendSuccess(res, {
      announcements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch announcements', 500);
  }
};

export const getAnnouncementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcements.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: { select: { name: true } } } },
        comments: {
          orderBy: { created_at: 'asc' },
        },
      },
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
    const { title, content, priority = 'NORMAL', official_clarification = false, comments_enabled = true } = req.body;
    const userId = req.user?.id;

    if (!title || !content) {
      sendError(res, 'VALIDATION_ERROR', 'Title and content are required');
      return;
    }

    const announcement = await prisma.announcements.create({
      data: {
        title,
        content,
        priority: priority.toUpperCase(),
        official_clarification: Boolean(official_clarification),
        comments_enabled: Boolean(comments_enabled),
        author_id: userId!,
      },
      include: {
        author: { select: { id: true, name: true, role: { select: { name: true } } } },
      },
    });

    // Notify all users about new announcement
    const allUsers = await prisma.users.findMany({ select: { id: true } });
    if (allUsers.length > 0) {
      const notifications = allUsers.map(u => ({
        type: 'ANNOUNCEMENT',
        content: `New official announcement: "${title}"`,
        user_id: u.id,
      }));
      await prisma.notifications.createMany({ data: notifications });
    }

    sendSuccess(res, { announcement }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to publish announcement', 500);
  }
};

export const addAnnouncementComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      sendError(res, 'VALIDATION_ERROR', 'Comment content is required');
      return;
    }

    const announcement = await prisma.announcements.findUnique({ where: { id } });
    if (!announcement) {
      sendError(res, 'NOT_FOUND', 'Announcement not found', 404);
      return;
    }

    if (!announcement.comments_enabled) {
      sendError(res, 'FORBIDDEN', 'Comments are disabled for this announcement', 403);
      return;
    }

    const comment = await prisma.announcement_comments.create({
      data: {
        content,
        announcement_id: id,
      },
    });

    sendSuccess(res, { comment }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to add comment', 500);
  }
};
