import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleGetDashboard } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', handleGetDashboard);

export default router;
