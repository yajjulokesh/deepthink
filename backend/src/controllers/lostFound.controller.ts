import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getLostFoundPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, category, status, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (type) where.type = String(type).toUpperCase();
    if (category) where.category = String(category);
    if (status) where.status = String(status).toUpperCase();
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { location: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const [posts, total] = await Promise.all([
      prisma.lost_found_posts.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          user: { select: { id: true, name: true, role: { select: { name: true } } } },
          comments: {
            include: { user: { select: { id: true, name: true, role: { select: { name: true } } } } },
            orderBy: { created_at: 'asc' },
          },
        },
      }),
      prisma.lost_found_posts.count({ where }),
    ]);

    sendSuccess(res, {
      posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch Lost & Found posts', 500);
  }
};

export const getLostFoundPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await prisma.lost_found_posts.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: { select: { name: true } } } },
        comments: {
          include: { user: { select: { id: true, name: true, role: { select: { name: true } } } } },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!post) {
      sendError(res, 'NOT_FOUND', 'Lost & Found post not found', 404);
      return;
    }

    sendSuccess(res, { post });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch Lost & Found post', 500);
  }
};

export const createLostFoundPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, type, category, location, date } = req.body;
    const userId = req.user?.id;

    if (!title || !description || !type || !location) {
      sendError(res, 'VALIDATION_ERROR', 'Title, description, type, and location are required');
      return;
    }

    const post = await prisma.lost_found_posts.create({
      data: {
        title,
        description,
        type: type.toUpperCase(),
        category: category || 'General',
        location,
        date: date ? new Date(date) : new Date(),
        user_id: userId!,
      },
      include: {
        user: { select: { id: true, name: true, role: { select: { name: true } } } },
        comments: true,
      },
    });

    sendSuccess(res, { post }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to create Lost & Found post', 500);
  }
};

export const updateLostFoundStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const existingPost = await prisma.lost_found_posts.findUnique({ where: { id } });
    if (!existingPost) {
      sendError(res, 'NOT_FOUND', 'Post not found', 404);
      return;
    }

    if (existingPost.user_id !== userId && req.user?.role !== 'ADMIN') {
      sendError(res, 'FORBIDDEN', 'Only the post owner or admin can update status', 403);
      return;
    }

    const updatedPost = await prisma.lost_found_posts.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: {
        user: { select: { id: true, name: true, role: { select: { name: true } } } },
        comments: {
          include: { user: { select: { id: true, name: true, role: { select: { name: true } } } } },
        },
      },
    });

    sendSuccess(res, { post: updatedPost });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update post status', 500);
  }
};

export const addLostFoundComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content) {
      sendError(res, 'VALIDATION_ERROR', 'Comment content is required');
      return;
    }

    const post = await prisma.lost_found_posts.findUnique({ where: { id } });
    if (!post) {
      sendError(res, 'NOT_FOUND', 'Post not found', 404);
      return;
    }

    const comment = await prisma.lost_found_comments.create({
      data: {
        content,
        post_id: id,
        user_id: userId!,
      },
      include: {
        user: { select: { id: true, name: true, role: { select: { name: true } } } },
      },
    });

    // Notify post owner if comment is from another user
    if (post.user_id !== userId) {
      await prisma.notifications.create({
        data: {
          type: 'LOST_FOUND_COMMENT',
          content: `Someone responded to your Lost & Found post: "${post.title}"`,
          user_id: post.user_id,
        },
      });
    }

    sendSuccess(res, { comment }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to add comment', 500);
  }
};
