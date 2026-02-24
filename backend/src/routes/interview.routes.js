import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleInterviewPrep } from '../controllers/interview.controller.js';

const router = Router();
router.use(requireAuth);
router.post('/prep', handleInterviewPrep);
export default router;
