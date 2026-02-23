import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { handleScrapeUrl, handleExtractFromImage } from '../controllers/scraper.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/url', handleScrapeUrl);
router.post('/image', upload.single('image'), handleExtractFromImage);

export default router;
