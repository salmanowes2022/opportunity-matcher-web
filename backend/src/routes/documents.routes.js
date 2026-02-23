import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { handleAnalyzeDocument, handleExtractProfile } from '../controllers/documents.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/analyze', upload.single('image'), handleAnalyzeDocument);
router.post('/extract-profile', handleExtractProfile);

export default router;
