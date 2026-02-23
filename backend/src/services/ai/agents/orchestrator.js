import { analyzeProfile } from './profileOptimizer.agent.js';
import { generateSearchStrategies } from './opportunityScout.agent.js';
import { createApplicationStrategy } from './applicationStrategist.agent.js';

export async function orchestrateAIAnalysis(profile, opportunities = []) {
  const topOpps = opportunities.slice(0, 3).map(item => item.opportunity);

  // Promise.allSettled = Node.js equivalent of Python's asyncio + ThreadPoolExecutor
  // If one agent fails, the other two still return results
  const [profileResult, scoutResult, strategyResult] = await Promise.allSettled([
    analyzeProfile(profile),
    topOpps.length ? generateSearchStrategies(profile, topOpps) : Promise.resolve(null),
    opportunities.length ? createApplicationStrategy(profile, opportunities) : Promise.resolve(null)
  ]);

  const prof = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const scout = scoutResult.status === 'fulfilled' ? scoutResult.value : null;
  const strategy = strategyResult.status === 'fulfilled' ? strategyResult.value : null;

  // Synthesize results (mirrors Python orchestrator.py logic exactly)
  const priorityActions = [];
  const recommendedNextSteps = [];

  if (prof) {
    priorityActions.push(...(prof.quick_wins?.slice(0, 3).map(qw => qw.action) || []));
    priorityActions.push(...(prof.critical_gaps?.slice(0, 2).map(g => `Address: ${g.description}`) || []));
  }

  if (strategy) {
    recommendedNextSteps.push(
      ...(strategy.prioritized_applications?.slice(0, 3)
        .map(app => `${app.opportunity_title} - ${app.priority_level} priority`) || [])
    );
  }

  let successProbability = 0;
  if (prof && strategy && strategy.prioritized_applications?.length) {
    const topFive = strategy.prioritized_applications.slice(0, 5);
    const avgAppProb = topFive.reduce((sum, a) => sum + a.success_probability, 0) / topFive.length;
    successProbability = (prof.profile_strength_score / 10 + avgAppProb) / 2;
  }

  return {
    profile_optimization: prof || {},
    search_strategies: scout || {},
    application_strategy: strategy || {},
    priority_actions: priorityActions.slice(0, 5),
    success_probability: Math.round(successProbability * 1000) / 1000,
    time_investment_hours: strategy?.effort_estimate_total_hours || 0,
    recommended_next_steps: recommendedNextSteps.slice(0, 5)
  };
}
