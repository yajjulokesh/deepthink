import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getUserNotifications);
router.patch('/read-all', requireAuth, markAllNotificationsAsRead);
router.patch('/:id/read', requireAuth, markNotificationAsRead);

export default router;
