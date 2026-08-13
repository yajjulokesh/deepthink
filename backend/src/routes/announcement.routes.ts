import { Router } from 'express';
import { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcement.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAnnouncements);
router.get('/:id', requireAuth, getAnnouncementById);
router.post('/', requireAuth, requireRole(['MANAGEMENT', 'ADMIN']), createAnnouncement);
router.patch('/:id', requireAuth, requireRole(['MANAGEMENT', 'ADMIN']), updateAnnouncement);
router.delete('/:id', requireAuth, requireRole(['MANAGEMENT', 'ADMIN']), deleteAnnouncement);

export default router;
