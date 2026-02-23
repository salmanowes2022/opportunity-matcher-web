import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleRunStrategy } from '../controllers/strategy.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/run', handleRunStrategy);

export default router;
