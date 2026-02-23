import { analyzeDocumentImage, extractProfileFromText } from '../services/ai/documentAnalyzer.service.js';
import { z } from 'zod';

export async function handleAnalyzeDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const documentTypeHint = req.body.document_type_hint || null;
    const analysis = await analyzeDocumentImage(req.file.buffer, req.file.mimetype, documentTypeHint);

    res.json({ analysis });
  } catch (err) {
    next(err);
  }
}

export async function handleExtractProfile(req, res, next) {
  try {
    const { extracted_text, current_profile } = req.body;
    if (!extracted_text) {
      return res.status(400).json({ error: 'extracted_text is required' });
    }

    const suggested_profile_updates = await extractProfileFromText(extracted_text, current_profile || null);
    res.json({ suggested_profile_updates });
  } catch (err) {
    next(err);
  }
}
