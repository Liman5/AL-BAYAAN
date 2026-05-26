// Lazily import the Supabase client to avoid accessing environment variables
// during server-side prerender/build time when pages import this module.
async function getSupabase() {
  try {
    const mod = await import('../lib/supabaseClient');
    return mod.supabase;
  } catch (err) {
    // Supabase client couldn't be loaded (likely missing env vars during build).
    return null as any;
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabase();
  if (!supabase) {
    // Local/dev fallback: return a mock user object
    return { data: { user: { id: 'local-user' } }, error: null } as any;
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  const supabase = await getSupabase();
  if (!supabase) {
    return { data: { user: { id: 'local-user' } }, error: null } as any;
  }
  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = await getSupabase();
  if (!supabase) return { error: null } as any;
  return await supabase.auth.signOut();
}

export async function getProfileByUserId(userId: string) {
  const supabase = await getSupabase();
  if (!supabase) {
    // Unable to query DB in local mode — caller should handle redirect accordingly.
    return { data: null, error: null } as any;
  }
  const { data, error } = await supabase.from('profiles').select('role').eq('user_id', userId).single();
  return { data, error };
}
