import { Router } from 'express';
import {
  getLostFoundPosts,
  getLostFoundPostById,
  createLostFoundPost,
  updateLostFoundStatus,
  addLostFoundComment,
} from '../controllers/lostFound.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getLostFoundPosts);
router.get('/:id', requireAuth, getLostFoundPostById);
router.post('/', requireAuth, createLostFoundPost);
router.patch('/:id/status', requireAuth, updateLostFoundStatus);
router.post('/:id/comments', requireAuth, addLostFoundComment);

export default router;
