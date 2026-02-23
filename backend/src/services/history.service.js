import supabase from '../config/supabase.js';

export async function getHistory(userId) {
  const { data, error } = await supabase
    .from('match_results')
    .select('*')
    .eq('user_id', userId)
    .order('evaluated_at', { ascending: false });

  if (error) throw error;
  return data;
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
    .select('compatibility_score')
    .eq('user_id', userId);

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

  return {
    total,
    avg_score: Math.round(avgScore * 1000) / 1000,
    best_match: bestMatch,
    materials_generated: materialsCount || 0
  };
}
