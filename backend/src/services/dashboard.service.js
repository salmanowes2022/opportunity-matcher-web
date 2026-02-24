import supabase from '../config/supabase.js';

export async function getDashboardStats(userId) {
  const [oppsResult, historyResult, materialsResult] = await Promise.all([
    supabase.from('opportunities').select('id, title, opp_type, deadline, status, saved_at').eq('user_id', userId),
    supabase.from('evaluation_history').select('compatibility_score, evaluated_at').eq('user_id', userId).order('evaluated_at', { ascending: false }),
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

  // Application status breakdown
  const statusBreakdown = opps.reduce((acc, o) => {
    const s = o.status || 'saved';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Recent activity (last 5 evaluations with opp info)
  const recentActivity = history.slice(0, 5);

  return {
    total_opportunities: opps.length,
    total_evaluations: history.length,
    total_materials: materials.length,
    avg_score: Math.round(avgScore * 100),
    best_score: Math.round(bestScore * 100),
    upcoming_deadlines: upcoming,
    status_breakdown: statusBreakdown,
    recent_activity: recentActivity,
  };
}
