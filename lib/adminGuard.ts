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
  const role = (cookieStore.get('userRole')?.value || '').trim().toLowerCase();

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Session administrateur introuvable. Reconnectez-vous.' },
        { status: 401 },
      ),
    };
  }

  // Le rôle renvoyé par /api/auth/get-role correspond à `admins.admin_level`
  // (« super_admin » ou « school_admin »), et non au littéral « admin ».
  // On accepte donc toutes les variantes connues ; la vérification qui fait
  // foi reste la présence du profil dans la table `admins` (ci-dessous).
  const adminRoles = new Set([
    'admin',
    'administrateur',
    'super_admin',
    'super-admin',
    'school_admin',
    'school-admin',
    'superadmin',
    'schooladmin',
  ]);

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('admins')
    .select('id, admin_level, school_id, user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: `Vérification impossible : ${error.message}` },
        { status: 500 },
      ),
    };
  }

  if (!data) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          message:
            'Accès administrateur requis. Ce compte n’a pas de profil administrateur.',
        },
        { status: 403 },
      ),
    };
  }

  // Cookie de rôle incohérent (ou absent) : on le signale sans bloquer,
  // la base restant la source de vérité.
  if (role && !adminRoles.has(role)) {
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
