import { Router } from 'express';
import {
  getSystemSettings,
  updateUpvoteThreshold,
  getAnalytics,
  getUsers,
  updateUserRole,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['ADMIN', 'MANAGEMENT']));

router.get('/settings', getSystemSettings);
router.patch('/settings/threshold', requireRole(['ADMIN']), updateUpvoteThreshold);
router.get('/analytics', getAnalytics);
router.get('/users', requireRole(['ADMIN']), getUsers);
router.patch('/users/:userId/role', requireRole(['ADMIN']), updateUserRole);

export default router;
