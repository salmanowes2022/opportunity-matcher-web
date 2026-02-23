import { evaluateMatch } from '../services/ai/evaluator.service.js';
import { getProfile } from '../services/profile.service.js';
import { saveMatchResult } from '../services/history.service.js';
import { createOpportunity, getOpportunityById } from '../services/opportunities.service.js';
import { OpportunitySchema } from '../types/schemas.js';
import { z } from 'zod';

const EvaluateBodySchema = z.object({
  opportunity: OpportunitySchema,
  save_opportunity: z.boolean().optional().default(false),
  opportunity_id: z.string().uuid().optional()
});

const BatchBodySchema = z.object({
  opportunity_ids: z.array(z.string().uuid()).min(1)
});

export async function handleEvaluate(req, res, next) {
  try {
    const { opportunity, save_opportunity, opportunity_id } = EvaluateBodySchema.parse(req.body);

    const profile = await getProfile(req.userId);
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found. Please create your profile first.' });
    }

    // Evaluate the match
    const result = await evaluateMatch(profile, opportunity);

    // Optionally save opportunity to DB
    let savedOppId = opportunity_id || null;
    if (save_opportunity && !opportunity_id) {
      const saved = await createOpportunity(req.userId, {
        title: opportunity.title,
        opp_type: opportunity.opp_type,
        description: opportunity.description,
        requirements: opportunity.requirements,
        deadline: opportunity.deadline || null,
        source: 'manual'
      });
      savedOppId = saved.id;
    }

    // Always save to match history
    const matchRecord = await saveMatchResult(req.userId, opportunity, result, savedOppId);

    res.json({
      result,
      match_result_id: matchRecord.id,
      opportunity_id: savedOppId
    });
  } catch (err) {
    next(err);
  }
}

export async function handleBatchEvaluate(req, res, next) {
  try {
    const { opportunity_ids } = BatchBodySchema.parse(req.body);

    const profile = await getProfile(req.userId);
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found. Please create your profile first.' });
    }

    // Fetch all opportunities and evaluate in parallel
    const evaluations = await Promise.allSettled(
      opportunity_ids.map(async (id) => {
        const opp = await getOpportunityById(req.userId, id);
        const result = await evaluateMatch(profile, opp);
        await saveMatchResult(req.userId, opp, result, id);
        return {
          opportunity_id: id,
          opportunity_title: opp.title,
          ...result
        };
      })
    );

    const results = evaluations
      .filter(e => e.status === 'fulfilled')
      .map(e => e.value)
      .sort((a, b) => b.compatibility_score - a.compatibility_score);

    res.json({ results });
  } catch (err) {
    next(err);
  }
}
