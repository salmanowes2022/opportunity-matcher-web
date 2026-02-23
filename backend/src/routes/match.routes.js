import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleEvaluate, handleBatchEvaluate } from '../controllers/match.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/evaluate', handleEvaluate);
router.post('/batch', handleBatchEvaluate);

export default router;
