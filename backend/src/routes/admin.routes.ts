import { Router } from 'express';
import { getUsers, updateUserRole, getReports, getAnalytics, getSettings, updateSettings } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth, requireRole(['ADMIN']));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/reports', getReports);
router.get('/analytics', getAnalytics);
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;
