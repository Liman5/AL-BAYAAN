// Lazily import the Supabase client to avoid accessing environment variables
// during server-side prerender/build time when pages import this module.
async function getSupabase() {
  const mod = await import('../lib/supabaseClient');
  return mod.supabase;
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabase();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  const supabase = await getSupabase();
  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = await getSupabase();
  return await supabase.auth.signOut();
}

export async function getProfileByUserId(userId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('profiles').select('role').eq('user_id', userId).single();
  return { data, error };
}
