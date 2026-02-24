import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleEvaluate, handleBatchEvaluate, handleExportPDF } from '../controllers/match.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/evaluate', handleEvaluate);
router.post('/batch', handleBatchEvaluate);
router.post('/export-pdf', handleExportPDF);

export default router;
