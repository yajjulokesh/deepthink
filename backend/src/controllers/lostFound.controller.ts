import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getLostFound = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, category, status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (type) where.type = String(type);
    if (category) where.category = String(category);
    if (status) where.status = String(status);

    const [posts, total] = await Promise.all([
      prisma.lost_found_posts.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.lost_found_posts.count({ where }),
    ]);

    sendSuccess(res, { posts, total });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch lost & found posts', 500);
  }
};

export const getLostFoundById = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const post = await prisma.lost_found_posts.findUnique({
      where: { id: postId },
      include: { comments: true },
    });

    if (!post) {
      sendError(res, 'NOT_FOUND', 'Post not found', 404);
      return;
    }

    sendSuccess(res, { post });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch post', 500);
  }
};

export const createLostFound = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, type, category, location, date } = req.body;
    const userId = req.user?.id;

    if (!title || !description || !type || !category || !location || !date) {
      sendError(res, 'VALIDATION_ERROR', 'All fields are required');
      return;
    }

    const post = await prisma.lost_found_posts.create({
      data: {
        title: String(title),
        description: String(description),
        type: String(type),
        category: String(category),
        location: String(location),
        date: new Date(date),
        user_id: userId!,
      },
    });

    sendSuccess(res, { post }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to create post', 500);
  }
};

export const updateLostFound = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const userId = req.user?.id;

    const post = await prisma.lost_found_posts.findUnique({ where: { id: postId } });

    if (!post) {
      sendError(res, 'NOT_FOUND', 'Post not found', 404);
      return;
    }

    if (post.user_id !== userId && req.user?.role !== 'ADMIN') {
      sendError(res, 'FORBIDDEN', 'You can only update your own posts', 403);
      return;
    }

    const updated = await prisma.lost_found_posts.update({
      where: { id: postId },
      data: req.body,
    });

    sendSuccess(res, { post: updated });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update post', 500);
  }
};

export const deleteLostFound = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const userId = req.user?.id;

    const post = await prisma.lost_found_posts.findUnique({ where: { id: postId } });

    if (!post) {
      sendError(res, 'NOT_FOUND', 'Post not found', 404);
      return;
    }

    if (post.user_id !== userId && req.user?.role !== 'ADMIN') {
      sendError(res, 'FORBIDDEN', 'You can only delete your own posts', 403);
      return;
    }

    await prisma.lost_found_posts.delete({ where: { id: postId } });
    sendSuccess(res, null, 204);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to delete post', 500);
  }
};
