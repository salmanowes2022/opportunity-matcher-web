import { orchestrateAIAnalysis } from '../services/ai/agents/orchestrator.js';
import { getProfile } from '../services/profile.service.js';
import { getHistory } from '../services/history.service.js';
import { getAllOpportunities } from '../services/opportunities.service.js';
import { z } from 'zod';

const StrategyBodySchema = z.object({
  opportunity_ids: z.array(z.string().uuid()).optional()
});

export async function handleRunStrategy(req, res, next) {
  try {
    const { opportunity_ids } = StrategyBodySchema.parse(req.body);

    const profile = await getProfile(req.userId);
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found. Please create your profile first.' });
    }

    let opportunities = [];

    if (opportunity_ids?.length) {
      // Use specified opportunities
      const allOpps = await getAllOpportunities(req.userId);
      const filtered = allOpps.filter(o => opportunity_ids.includes(o.id));
      // Get match scores from history for these opportunities
      const { items: historyItems } = await getHistory(req.userId, { limit: 100 });
      opportunities = filtered.map(opp => {
        const latestMatch = (historyItems || []).find(h => h.opportunity_id === opp.id);
        return {
          opportunity: opp,
          score: latestMatch ? Number(latestMatch.compatibility_score) : 0.5
        };
      });
    } else {
      // Use top evaluated opportunities from history
      const { items: historyItems } = await getHistory(req.userId, { limit: 10 });
      const topHistory = historyItems || [];

      const allOpps = await getAllOpportunities(req.userId);
      const oppMap = new Map(allOpps.map(o => [o.id, o]));

      opportunities = topHistory
        .filter(h => h.opportunity_id && oppMap.has(h.opportunity_id))
        .map(h => ({
          opportunity: oppMap.get(h.opportunity_id),
          score: Number(h.compatibility_score)
        }));
    }

    const result = await orchestrateAIAnalysis(profile, opportunities);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
