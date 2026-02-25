import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleGenerate, handleList, handleGetById, handleDelete } from '../controllers/smartApply.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/generate', handleGenerate);
router.get('/', handleList);
router.get('/:id', handleGetById);
router.delete('/:id', handleDelete);

export default router;
