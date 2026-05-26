import { supabase } from '../lib/supabaseClient';

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase.from('profiles').select('role').eq('user_id', userId).single();
  return { data, error };
}
