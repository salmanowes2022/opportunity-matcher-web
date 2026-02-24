import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleDiscovery } from '../controllers/discovery.controller.js';

const router = Router();
router.use(requireAuth);
router.post('/discover', handleDiscovery);
export default router;
