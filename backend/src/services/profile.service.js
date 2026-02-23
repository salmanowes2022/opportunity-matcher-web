import supabase from '../config/supabase.js';

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null; // No row found
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId, profileData) {
  const payload = { ...profileData, user_id: userId };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile(userId) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}
