import { HAS_SUPABASE } from '@/lib/env';

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

// Détermine le rôle d'un utilisateur via l'API serveur
// ⚠️ Utilise la clé service_role (bypass RLS) pour être fiable à 100%
export async function getUserRoleByUserId(userId: string): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/get-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const result = await res.json();
    if (result.success && result.role) {
      return result.role;
    }
    return null;
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  try {
    // 1. Authentification côté serveur : plus fiable que le fetch direct
    //    du navigateur vers Supabase (extensions, cache, réseau...).
    const response = await fetch('/api/auth/login-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
      cache: 'no-store',
    });

    const result = await response.json().catch(() => ({} as any));

    if (!response.ok || !result.success) {
      return {
        data: { user: null, session: null },
        error: {
          message: result.message || 'Connexion impossible. Veuillez réessayer.',
        } as any,
      };
    }

    // 2. Reconstruire la session Supabase côté navigateur sans refaire
    //    d'appel réseau d'authentification (les tokens viennent du serveur).
    const supabase = await getSupabase();
    if (supabase && result.session?.access_token && result.session?.refresh_token) {
      try {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      } catch (sessionError) {
        // La session locale n'est pas indispensable : les pages utilisent
        // les cookies de rôle et les API serveur.
        console.warn('Session Supabase locale non restaurée:', sessionError);
      }
    }

    return {
      data: { user: result.user, session: result.session },
      error: null,
    };
  } catch {
    return {
      data: { user: null, session: null },
      error: {
        message:
          'Impossible de joindre le serveur de connexion. Vérifiez votre connexion internet puis réessayez.',
      } as any,
    };
  }
}

// Connexion élève par matricule (ALB-2026-0001) + mot de passe
export async function signInWithMatricule(matricule: string, password: string) {
  try {
    const res = await fetch('/api/auth/login-matricule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricule, password }),
    });
    const result = await res.json();

    if (!result.success) {
      return {
        error: { message: result.message || 'Erreur lors de la connexion par matricule.' } as any,
        data: null,
      };
    }

    return { data: result.data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message || 'Erreur réseau.' } as any };
  }
}

// Réinitialisation de mot de passe par vérification parent
export async function resetPasswordWithParentVerification(data: {
  matricule: string;
  parentEmail?: string;
  parentPhone?: string;
  newPassword: string;
}) {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    return {
      success: result.success,
      message: result.message || (result.success ? 'Mot de passe réinitialisé.' : 'Erreur.'),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Erreur réseau.',
    };
  }
}

export async function signUp(email: string, password: string) {
  const supabase = await getSupabase();
  if (!supabase) {
    throw new Error('Supabase non configuré.');
  }

  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = await getSupabase();
  if (!supabase) {
    return { error: null } as any;
  }

  return await supabase.auth.signOut();
}

export async function getProfileByUserId(userId: string) {
  // 🔑 UN SEUL appel serveur (service_role) : user + statut + rôle en 1 requête
  try {
    const res = await fetch('/api/auth/get-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const result = await res.json();

    if (!result.success) {
      if (result.status === 'pending') {
        return { data: null, error: { message: 'Votre compte est en attente d\'approbation par l\'administrateur. Veuillez réessayer plus tard.' } as any };
      }
      if (result.status === 'suspended') {
        return { data: null, error: { message: 'Votre compte a été suspendu. Contactez l\'administration.' } as any };
      }
      return { data: null, error: { message: result.message || 'Aucun rôle trouvé pour ce compte.' } as any };
    }

    return { data: { ...result.user, role: result.role }, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err?.message || 'Erreur lors de la récupération du profil.' } as any };
  }
}
