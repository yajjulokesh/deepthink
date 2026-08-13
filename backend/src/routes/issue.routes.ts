import { Router } from 'express';
import { getIssues, getIssueById, createIssue, upvote, removeVote, changeStatus, respondToIssue } from '../controllers/issue.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getIssues);
router.get('/:id', requireAuth, getIssueById);
router.post('/', requireAuth, createIssue);

router.post('/:id/upvote', requireAuth, requireRole(['STUDENT', 'REPRESENTATIVE']), upvote);
router.delete('/:id/upvote', requireAuth, requireRole(['STUDENT', 'REPRESENTATIVE']), removeVote);

router.patch('/:id/status', requireAuth, requireRole(['MANAGEMENT', 'ADMIN']), changeStatus);
router.post('/:id/response', requireAuth, requireRole(['MANAGEMENT']), respondToIssue);

export default router;
