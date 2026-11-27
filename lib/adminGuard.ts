import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminClient, hasSupabaseAdminConfig } from '@/lib/terminalAuth';

// ============================================================
// AL-BAYAAN — Garde d'accès aux routes d'administration
//
// Les cookies `userRole` / `userId` sont posés côté client au
// moment de la connexion. Un cookie seul n'est PAS une preuve :
// on vérifie donc systématiquement que l'utilisateur possède
// réellement un profil dans la table `admins`.
//
// Les routes protégées par cette garde ne sont jamais appelées
// par un terminal scanner.
// ============================================================

export interface AdminIdentity {
  userId: string;
  adminId: string;
  adminLevel: string;
  schoolId: string | null;
}

export type AdminGuardResult =
  | { ok: true; admin: AdminIdentity }
  | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminGuardResult> {
  if (!hasSupabaseAdminConfig()) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 },
      ),
    };
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const role = cookieStore.get('userRole')?.value;

  if (!userId || role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Accès administrateur requis.' },
        { status: 401 },
      ),
    };
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('admins')
    .select('id, admin_level, school_id, user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Accès administrateur requis.' },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    admin: {
      userId,
      adminId: data.id,
      adminLevel: data.admin_level || 'school_admin',
      schoolId: data.school_id || null,
    },
  };
}
