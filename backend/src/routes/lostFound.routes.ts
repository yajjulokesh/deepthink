import { Router } from 'express';
import { getLostFound, getLostFoundById, createLostFound, updateLostFound, deleteLostFound } from '../controllers/lostFound.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getLostFound);
router.get('/:id', requireAuth, getLostFoundById);
router.post('/', requireAuth, createLostFound);
router.patch('/:id', requireAuth, updateLostFound);
router.delete('/:id', requireAuth, deleteLostFound);

export default router;
