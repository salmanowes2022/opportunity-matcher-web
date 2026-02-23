import {
  generateApplicationMaterial,
  saveMaterial,
  getMaterials,
  getMaterialById,
  deleteMaterial
} from '../services/ai/materialGenerator.service.js';
import { getProfile } from '../services/profile.service.js';
import { z } from 'zod';
import { OpportunitySchema } from '../types/schemas.js';

const GenerateBodySchema = z.object({
  material_type: z.enum(['cover_letter', 'personal_statement', 'motivation_letter']),
  opportunity: OpportunitySchema,
  target_word_count: z.number().int().min(200).max(2000).optional().default(500),
  opportunity_id: z.string().uuid().optional()
});

export async function handleGenerate(req, res, next) {
  try {
    const { material_type, opportunity, target_word_count, opportunity_id } = GenerateBodySchema.parse(req.body);

    const profile = await getProfile(req.userId);
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found. Please create your profile first.' });
    }

    const material = await generateApplicationMaterial(profile, opportunity, material_type, target_word_count);
    const saved = await saveMaterial(req.userId, material, opportunity_id, null, opportunity.title);

    res.json({ material: saved });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMaterials(req, res, next) {
  try {
    const materials = await getMaterials(req.userId);
    res.json({ materials });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMaterial(req, res, next) {
  try {
    const material = await getMaterialById(req.userId, req.params.id);
    res.json({ material });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteMaterial(req, res, next) {
  try {
    await deleteMaterial(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function handleExportMaterial(req, res, next) {
  try {
    const { format = 'txt' } = req.query;
    const material = await getMaterialById(req.userId, req.params.id);

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${material.material_type}_${material.id}.txt"`);
      return res.send(material.content);
    }

    // PDF export
    const { generateMaterialPDF } = await import('../services/pdf.service.js');
    const pdfBuffer = generateMaterialPDF(material);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${material.material_type}_${material.id}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    next(err);
  }
}
