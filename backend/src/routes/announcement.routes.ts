import { Router } from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  addAnnouncementComment,
} from '../controllers/announcement.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAnnouncements);
router.get('/:id', requireAuth, getAnnouncementById);
router.post('/', requireAuth, requireRole(['MANAGEMENT', 'ADMIN']), createAnnouncement);
router.post('/:id/comments', requireAuth, addAnnouncementComment);

export default router;
