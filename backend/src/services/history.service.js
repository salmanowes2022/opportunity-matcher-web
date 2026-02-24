import supabase from '../config/supabase.js';

export async function getHistory(userId, { limit = 20, offset = 0, search = '', minScore = 0, maxScore = 1 } = {}) {
  let query = supabase
    .from('match_results')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('compatibility_score', minScore)
    .lte('compatibility_score', maxScore)
    .order('evaluated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike('opportunity_title', `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: data, total: count };
}

export async function getHistoryById(userId, id) {
  const { data, error } = await supabase
    .from('match_results')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function saveMatchResult(userId, opportunitySnapshot, matchResult, opportunityId = null) {
  const { data, error } = await supabase
    .from('match_results')
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      opportunity_title: opportunitySnapshot.title,
      opportunity_type: opportunitySnapshot.opp_type,
      opportunity_description: opportunitySnapshot.description,
      compatibility_score: matchResult.compatibility_score,
      strengths: matchResult.strengths,
      gaps: matchResult.gaps,
      recommendation: matchResult.recommendation
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHistoryItem(userId, id) {
  const { error } = await supabase
    .from('match_results')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function getHistoryStats(userId) {
  const { data: results, error } = await supabase
    .from('match_results')
    .select('compatibility_score, evaluated_at')
    .eq('user_id', userId)
    .order('evaluated_at', { ascending: true });

  if (error) throw error;

  const { count: materialsCount } = await supabase
    .from('generated_materials')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const total = results.length;
  const avgScore = total > 0
    ? results.reduce((sum, r) => sum + Number(r.compatibility_score), 0) / total
    : 0;
  const bestMatch = total > 0
    ? Math.max(...results.map(r => Number(r.compatibility_score)))
    : 0;

  // Score trend: group by month for last 6 months
  const trend = {};
  results.forEach(r => {
    const month = r.evaluated_at?.slice(0, 7);
    if (!month) return;
    if (!trend[month]) trend[month] = { sum: 0, count: 0 };
    trend[month].sum += Number(r.compatibility_score);
    trend[month].count += 1;
  });
  const score_trend = Object.entries(trend)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, { sum, count }]) => ({
      month,
      avg: Math.round((sum / count) * 100)
    }));

  return {
    total,
    avg_score: Math.round(avgScore * 1000) / 1000,
    best_match: bestMatch,
    materials_generated: materialsCount || 0,
    score_trend
  };
}
