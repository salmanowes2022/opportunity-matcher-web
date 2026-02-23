import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleGetHistory,
  handleGetHistoryItem,
  handleDeleteHistoryItem,
  handleGetStats
} from '../controllers/history.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', handleGetHistory);
router.get('/stats', handleGetStats);
router.get('/:id', handleGetHistoryItem);
router.delete('/:id', handleDeleteHistoryItem);

export default router;
