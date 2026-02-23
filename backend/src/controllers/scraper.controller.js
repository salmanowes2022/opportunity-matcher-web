import { scrapeOpportunityFromUrl } from '../services/scraper.service.js';
import { extractOpportunityFromImage } from '../services/ai/opportunityExtractor.service.js';
import { z } from 'zod';

const UrlBodySchema = z.object({
  url: z.string().url()
});

export async function handleScrapeUrl(req, res, next) {
  try {
    const { url } = UrlBodySchema.parse(req.body);
    const opportunity = await scrapeOpportunityFromUrl(url);
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function handleExtractFromImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const opportunity = await extractOpportunityFromImage(req.file.buffer, req.file.mimetype);

    if (!opportunity) {
      return res.status(422).json({
        error: 'Could not extract opportunity from image. Make sure the image contains a scholarship, job, or program announcement.'
      });
    }

    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}
