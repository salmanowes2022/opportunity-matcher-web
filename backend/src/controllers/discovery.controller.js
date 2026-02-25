import { getProfile } from '../services/profile.service.js';
import { getAllOpportunities } from '../services/opportunities.service.js';
import { getHistory } from '../services/history.service.js';
import { generateSearchStrategies } from '../services/ai/agents/opportunityScout.agent.js';

export async function handleDiscovery(req, res, next) {
  try {
    const profile = await getProfile(req.userId);
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found. Please create your profile first.' });
    }

    // Get top matches from history
    const { items: historyItems } = await getHistory(req.userId, { limit: 50 });
    const allOpps = await getAllOpportunities(req.userId);
    const oppMap = new Map(allOpps.map(o => [o.id, o]));

    const topMatches = (historyItems || [])
      .filter(h => h.opportunity_id && oppMap.has(h.opportunity_id) && Number(h.compatibility_score) >= 0.5)
      .slice(0, 5)
      .map(h => oppMap.get(h.opportunity_id));

    const result = await generateSearchStrategies(profile, topMatches);
    if (!result) {
      return res.status(500).json({ error: 'Discovery generation failed. Please try again.' });
    }

    res.json({ result, profile_name: profile.name });
  } catch (err) {
    next(err);
  }
}
