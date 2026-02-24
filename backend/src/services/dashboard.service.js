import supabase from '../config/supabase.js';

export async function getDashboardStats(userId) {
  const [oppsResult, historyResult, materialsResult] = await Promise.all([
    supabase.from('opportunities').select('id, title, opp_type, deadline, status, saved_at').eq('user_id', userId),
    supabase.from('match_results').select('compatibility_score, evaluated_at').eq('user_id', userId).order('evaluated_at', { ascending: false }),
    supabase.from('generated_materials').select('id').eq('user_id', userId),
  ]);

  const opps = oppsResult.data || [];
  const history = historyResult.data || [];
  const materials = materialsResult.data || [];

  // Upcoming deadlines (next 30 days)
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcoming = opps
    .filter(o => o.deadline && new Date(o.deadline) >= now && new Date(o.deadline) <= in30)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  // Score stats
  const scores = history.map(h => Number(h.compatibility_score)).filter(s => !isNaN(s));
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  // Score distribution
  const score_distribution = {
    excellent: scores.filter(s => s >= 0.7).length,
    good: scores.filter(s => s >= 0.5 && s < 0.7).length,
    needs_work: scores.filter(s => s < 0.5).length,
  };

  // Application status breakdown
  const statusBreakdown = opps.reduce((acc, o) => {
    const s = o.status || 'saved';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Opportunity type breakdown
  const type_breakdown = opps.reduce((acc, o) => {
    acc[o.opp_type] = (acc[o.opp_type] || 0) + 1;
    return acc;
  }, {});

  // Recent activity (last 5 evaluations)
  const recentActivity = history.slice(0, 5);

  return {
    total_opportunities: opps.length,
    total_evaluations: history.length,
    total_materials: materials.length,
    avg_score: Math.round(avgScore * 100),
    best_score: Math.round(bestScore * 100),
    upcoming_deadlines: upcoming,
    status_breakdown: statusBreakdown,
    type_breakdown,
    score_distribution,
    recent_activity: recentActivity,
  };
}
