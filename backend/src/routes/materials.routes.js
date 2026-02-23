import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  handleGenerate,
  handleGetMaterials,
  handleGetMaterial,
  handleDeleteMaterial,
  handleExportMaterial
} from '../controllers/materials.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/generate', handleGenerate);
router.get('/', handleGetMaterials);
router.get('/:id', handleGetMaterial);
router.delete('/:id', handleDeleteMaterial);
router.get('/:id/export', handleExportMaterial);

export default router;
