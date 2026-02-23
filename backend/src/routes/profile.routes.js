import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleGetProfile,
  handleUpsertProfile,
  handleDeleteProfile
} from '../controllers/profile.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', handleGetProfile);
router.post('/', handleUpsertProfile);
router.put('/', handleUpsertProfile);
router.delete('/', handleDeleteProfile);

export default router;
