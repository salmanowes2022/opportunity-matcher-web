import supabase from '../config/supabase.js';

export async function getAllOpportunities(userId) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOpportunityById(userId, id) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
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

export async function searchOpportunities(userId, query) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,opp_type.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) throw error;
  return data;
}
