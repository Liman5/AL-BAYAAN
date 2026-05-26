'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const currentSession = supabase.auth.getSession();
    currentSession.then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_, authSession) => {
      setSession(authSession);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { session };
}
