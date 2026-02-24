import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleGetAll,
  handleGetOne,
  handleCreate,
  handleUpdate,
  handleUpdateStatus,
  handleDelete
} from '../controllers/opportunities.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', handleGetAll);
router.post('/', handleCreate);
router.get('/:id', handleGetOne);
router.put('/:id', handleUpdate);
router.patch('/:id/status', handleUpdateStatus);
router.delete('/:id', handleDelete);

export default router;
