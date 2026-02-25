import supabase from '../config/supabase.js';

export async function getAllOpportunities(userId) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('saved_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOpportunityById(userId, id) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createOpportunity(userId, oppData) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert({ ...oppData, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOpportunity(userId, id, oppData) {
  const { data, error } = await supabase
    .from('opportunities')
    .update(oppData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOpportunity(userId, id) {
  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function updateOpportunityStatus(userId, id, status) {
  const { data, error } = await supabase
    .from('user_opportunity_status')
    .upsert({ user_id: userId, opportunity_id: id, status, updated_at: new Date().toISOString() }, { onConflict: 'user_id,opportunity_id' })
    .select()
    .single();

  if (error) throw error;
  return { id, status: data.status };
}

export async function getUserStatuses(userId) {
  const { data, error } = await supabase
    .from('user_opportunity_status')
    .select('opportunity_id, status')
    .eq('user_id', userId);

  if (error) throw error;
  // Return as a map { opportunity_id: status }
  return Object.fromEntries((data || []).map(r => [r.opportunity_id, r.status]));
}

export async function searchOpportunities(userId, query) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .or(`title.ilike.%${query}%,opp_type.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) throw error;
  return data;
}
