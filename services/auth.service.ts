import { HAS_SUPABASE } from '@/lib/env';
import { getUserById, signInLocal } from '@/lib/localAuth';

async function getSupabase() {
  if (!HAS_SUPABASE) {
    return null;
  }

  try {
    const mod = await import('../lib/supabaseClient');
    return mod.supabase;
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  if (!HAS_SUPABASE) {
    return signInLocal(email, password);
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return signInLocal(email, password);
  }

  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  if (!HAS_SUPABASE) {
    return signInLocal(email, password);
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return signInLocal(email, password);
  }

  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  if (!HAS_SUPABASE) {
    return { error: null } as any;
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return { error: null } as any;
  }

  return await supabase.auth.signOut();
}

export async function getProfileByUserId(userId: string) {
  if (!HAS_SUPABASE) {
    const user = getUserById(userId);
    return { data: user ? { role: user.role } : null, error: null };
  }

  const supabase = await getSupabase();
  if (!supabase) {
    const user = getUserById(userId);
    return { data: user ? { role: user.role } : null, error: null };
  }

  const { data, error } = await supabase.from('profiles').select('role').eq('user_id', userId).single();
  return { data, error };
}
