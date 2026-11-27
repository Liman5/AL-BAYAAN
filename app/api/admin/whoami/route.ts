import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminClient, hasSupabaseAdminConfig } from '@/lib/terminalAuth';

// ============================================================
// GET /api/admin/whoami
//
// Diagnostic de la session administrateur (aucune donnée d'élève).
// Permet de comprendre pourquoi un module affiche « Accès administrateur
// requis » : cookie présent ? rôle reconnu ? profil `admins` existant ?
// combien d'élèves sont visibles ?
// ============================================================

export const runtime = 'nodejs';

export async function GET() {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { success: false, message: 'Configuration Supabase manquante.' },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || null;
  const cookieRole = cookieStore.get('userRole')?.value || null;

  const supabase = getAdminClient();

  if (!userId) {
    return NextResponse.json({
      success: true,
      data: {
        authenticated: false,
        cookieRole,
        message:
          'Aucun cookie de session « userId ». Reconnectez-vous via /auth/login.',
      },
    });
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id, admin_level, school_id, user_id')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: user } = await supabase
    .from('users')
    .select('id, email, status')
    .eq('id', userId)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        userId,
        cookieRole,
        email: user?.email || null,
        isAdmin: false,
        message:
          'Ce compte n’a pas de profil dans la table « admins ». ' +
          'Créez-le (script create-admin) ou rattachez-le, puis reconnectez-vous.',
      },
    });
  }

  const [students, studentsWithoutSchool, classes, badges, terminals] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .is('school_id', null),
    supabase.from('classes').select('id', { count: 'exact', head: true }),
    supabase
      .from('student_badges')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('scanner_terminals').select('id', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      authenticated: true,
      userId,
      cookieRole,
      email: user?.email || null,
      isAdmin: true,
      adminLevel: admin.admin_level,
      adminId: admin.id,
      schoolId: admin.school_id || null,
      counts: {
        students: students.count ?? 0,
        studentsWithoutSchool: studentsWithoutSchool.count ?? 0,
        classes: classes.count ?? 0,
        activeBadges: badges.count ?? 0,
        terminals: terminals.count ?? 0,
      },
    },
  });
}
