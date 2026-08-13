import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { upvoteIssue, removeUpvote } from '../services/issue.service';

export const getIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, sort, page = '1', limit = '20' } = req.query;

    const queryOptions: any = {
      where: {},
      orderBy: { created_at: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    };

    if (category) queryOptions.where.category = String(category);
    if (status) queryOptions.where.status = String(status);
    if (sort === 'trending') queryOptions.orderBy = { current_votes: 'desc' };

    const [issues, total] = await Promise.all([
      prisma.student_issues.findMany(queryOptions),
      prisma.student_issues.count({ where: queryOptions.where }),
    ]);

    sendSuccess(res, {
      issues,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch issues', 500);
  }
};

export const getIssueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const issueId = String(req.params.id);
    const issue = await prisma.student_issues.findUnique({
      where: { id: issueId },
      include: { author: { select: { name: true, role_id: true } } },
    });

    if (!issue) {
      sendError(res, 'NOT_FOUND', 'Issue not found', 404);
      return;
    }

    sendSuccess(res, { issue });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch issue', 500);
  }
};

export const createIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user?.id;

    if (!title || !description || !category) {
      sendError(res, 'VALIDATION_ERROR', 'Title, description, and category are required');
      return;
    }

    const issue = await prisma.student_issues.create({
      data: {
        title: String(title),
        description: String(description),
        category: String(category),
        author_id: userId!,
      },
    });

    sendSuccess(res, { issue }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to create issue', 500);
  }
};

export const upvote = async (req: Request, res: Response): Promise<void> => {
  try {
    const issueId = String(req.params.id);
    const userId = req.user?.id;

    const issue = await upvoteIssue(issueId, userId!);
    sendSuccess(res, { issue });
  } catch (error: any) {
    if (error.message === 'User has already voted for this issue') {
      sendError(res, 'CONFLICT', error.message, 409);
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to upvote issue', 500);
    }
  }
};

export const removeVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const issueId = String(req.params.id);
    const userId = req.user?.id;

    const issue = await removeUpvote(issueId, userId!);
    sendSuccess(res, { issue });
  } catch (error: any) {
    if (error.message === 'Vote not found') {
      sendError(res, 'NOT_FOUND', error.message, 404);
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to remove upvote', 500);
    }
  }
};

export const changeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const issueId = String(req.params.id);
    const { status, reason } = req.body;
    const userId = req.user?.id;

    if (!status) {
      sendError(res, 'VALIDATION_ERROR', 'Status is required');
      return;
    }

    const issue = await prisma.student_issues.findUnique({ where: { id: issueId } });
    if (!issue) {
      sendError(res, 'NOT_FOUND', 'Issue not found', 404);
      return;
    }

    const updatedIssue = await prisma.$transaction(async (tx) => {
      const updated = await tx.student_issues.update({
        where: { id: issueId },
        data: { status: String(status) },
      });

      await tx.issue_status_history.create({
        data: {
          issue_id: issueId,
          old_status: issue.status,
          new_status: String(status),
          reason: reason ? String(reason) : null,
          changed_by: userId!,
        },
      });

      return updated;
    });

    sendSuccess(res, { issue: updatedIssue });
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to change issue status', 500);
  }
};

export const respondToIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const issueId = String(req.params.id);
    const { response } = req.body;
    const userId = req.user?.id;

    if (!response) {
      sendError(res, 'VALIDATION_ERROR', 'Response text is required');
      return;
    }

    const managementResponse = await prisma.management_responses.create({
      data: {
        response: String(response),
        issue_id: issueId,
        management_user_id: userId!,
      },
    });

    sendSuccess(res, { managementResponse }, 201);
  } catch (error) {
    sendError(res, 'INTERNAL_ERROR', 'Failed to post management response', 500);
  }
};
