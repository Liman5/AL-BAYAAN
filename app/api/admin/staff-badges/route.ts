import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/adminGuard';
import { getAdminClient } from '@/lib/terminalAuth';
import { badgeTokenPrefix, generateBadgeToken, sha256Hex } from '@/lib/badges';

// ============================================================
// API — Badges QR du personnel (enseignants + administration)
//
// GET   → liste des adultes de l'établissement + état de leur badge
// POST  → génération idempotente pour une sélection de personnes
// PATCH → révocation / renouvellement / marquage « imprimé »
//
// Le QR ne contient que le token opaque : ni nom, ni matricule.
// ============================================================

export const runtime = 'nodejs';

const BADGE_COLUMNS =
  'id, user_id, staff_type, status, issued_at, revoked_at, revoked_reason, ' +
  'printed_count, last_printed_at, token_prefix, academic_year_id, token';

async function resolveAcademicYearId(
  supabase: ReturnType<typeof getAdminClient>,
  requested: string | null,
): Promise<string | null> {
  if (requested) return requested;
  const { data: active } = await supabase
    .from('academic_years')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();
  if (active?.id) return active.id;
  const { data: latest } = await supabase
    .from('academic_years')
    .select('id')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return latest?.id || null;
}

interface StaffRow {
  userId: string;
  staffType: 'teacher' | 'admin';
  staffProfileId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  status: string;
  schoolId: string | null;
}

async function loadStaff(
  supabase: ReturnType<typeof getAdminClient>,
  schoolId: string | null,
): Promise<StaffRow[]> {
  const rows: StaffRow[] = [];

  let teacherQuery = supabase
    .from('teacher_profiles')
    .select('id, matricule, status, subjects, user_id, school_id, users (first_name, last_name)');
  if (schoolId) {
    teacherQuery = teacherQuery.or(`school_id.eq.${schoolId},school_id.is.null`);
  }
  const { data: teachers } = await teacherQuery;

  for (const row of (teachers || []) as any[]) {
    rows.push({
      userId: row.user_id,
      staffType: 'teacher',
      staffProfileId: row.id,
      matricule: row.matricule || '',
      firstName: row.users?.first_name || '',
      lastName: row.users?.last_name || '',
      roleLabel: Array.isArray(row.subjects) && row.subjects.length > 0
        ? `Enseignant · ${row.subjects.slice(0, 2).join(', ')}`
        : 'Enseignant',
      status: row.status || 'active',
      schoolId: row.school_id || null,
    });
  }

  let adminQuery = supabase
    .from('admins')
    .select('id, matricule, admin_level, user_id, school_id, users (first_name, last_name)');
  if (schoolId) {
    adminQuery = adminQuery.or(`school_id.eq.${schoolId},school_id.is.null`);
  }
  const { data: admins } = await adminQuery;

  for (const row of (admins || []) as any[]) {
    rows.push({
      userId: row.user_id,
      staffType: 'admin',
      staffProfileId: row.id,
      matricule: row.matricule || '',
      firstName: row.users?.first_name || '',
      lastName: row.users?.last_name || '',
      roleLabel:
        row.admin_level === 'super_admin' ? 'Direction · Super admin' : 'Administration',
      status: 'active',
      schoolId: row.school_id || null,
    });
  }

  return rows;
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const typeFilter = url.searchParams.get('staffType') || 'all';
    const statusFilter = url.searchParams.get('status') || 'all';
    const academicYearId = await resolveAcademicYearId(
      supabase,
      url.searchParams.get('academicYearId'),
    );

    const staff = await loadStaff(supabase, guard.admin.schoolId);

    const userIds = staff.map((row) => row.userId).filter(Boolean);
    const badgeByUser = new Map<string, any>();

    if (userIds.length > 0) {
      let badgeQuery = supabase
        .from('staff_badges')
        .select(BADGE_COLUMNS)
        .in('user_id', userIds);
      if (academicYearId) badgeQuery = badgeQuery.eq('academic_year_id', academicYearId);

      const { data: badges } = await badgeQuery;
      for (const badge of (badges || []) as any[]) {
        const current = badgeByUser.get(badge.user_id);
        const rank = (value: string) => (value === 'active' ? 3 : value === 'revoked' ? 2 : 1);
        if (!current || rank(badge.status) > rank(current.status)) {
          badgeByUser.set(badge.user_id, badge);
        }
      }
    }

    const rows = staff
      .map((person) => {
        const badge = badgeByUser.get(person.userId) || null;
        return {
          ...person,
          badge: badge
            ? {
                id: badge.id,
                status: badge.status,
                issuedAt: badge.issued_at,
                revokedAt: badge.revoked_at,
                revokedReason: badge.revoked_reason,
                printedCount: badge.printed_count || 0,
                lastPrintedAt: badge.last_printed_at,
                tokenPrefix: badge.token_prefix,
                token: badge.status === 'active' ? badge.token : null,
              }
            : null,
        };
      })
      .filter((person) => {
        if (typeFilter === 'teacher' && person.staffType !== 'teacher') return false;
        if (typeFilter === 'admin' && person.staffType !== 'admin') return false;
        if (statusFilter === 'none' && person.badge) return false;
        if (statusFilter === 'active' && person.badge?.status !== 'active') return false;
        if (statusFilter === 'revoked' && person.badge?.status !== 'revoked') return false;
        if (search) {
          const haystack = `${person.firstName} ${person.lastName} ${person.matricule} ${person.roleLabel}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));

    let schoolName = 'AL-BAYAAN';
    if (guard.admin.schoolId) {
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', guard.admin.schoolId)
        .maybeSingle();
      if (school?.name) schoolName = school.name;
    }

    let academicYearName: string | null = null;
    if (academicYearId) {
      const { data: year } = await supabase
        .from('academic_years')
        .select('name')
        .eq('id', academicYearId)
        .maybeSingle();
      academicYearName = year?.name || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        staff: rows,
        stats: {
          total: staff.length,
          teachers: staff.filter((row) => row.staffType === 'teacher').length,
          admins: staff.filter((row) => row.staffType === 'admin').length,
          withActiveBadge: rows.filter((row) => row.badge?.status === 'active').length,
          withoutBadge: rows.filter((row) => !row.badge).length,
        },
        academicYearId,
        academicYearName,
        schoolName,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}


export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const body = await request.json().catch(() => ({}));
    const userIds: string[] = Array.isArray(body?.userIds)
      ? Array.from(new Set(body.userIds.filter((id: unknown) => typeof id === 'string')))
      : [];

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucune personne sélectionnée.' },
        { status: 400 },
      );
    }
    if (userIds.length > 300) {
      return NextResponse.json(
        { success: false, message: 'Maximum 300 badges par génération.' },
        { status: 400 },
      );
    }

    const academicYearId = await resolveAcademicYearId(
      supabase,
      typeof body?.academicYearId === 'string' ? body.academicYearId : null,
    );

    // Détermination du type de personnel (enseignant prioritaire).
    const { data: teacherRows } = await supabase
      .from('teacher_profiles')
      .select('id, user_id, school_id')
      .in('user_id', userIds);
    const { data: adminRows } = await supabase
      .from('admins')
      .select('id, user_id, school_id')
      .in('user_id', userIds);

    const teacherByUser = new Map<string, any>();
    for (const row of (teacherRows || []) as any[]) teacherByUser.set(row.user_id, row);
    const adminByUser = new Map<string, any>();
    for (const row of (adminRows || []) as any[]) adminByUser.set(row.user_id, row);

    const { data: existingBadges } = await supabase
      .from('staff_badges')
      .select('id, user_id, status, token, academic_year_id')
      .in('user_id', userIds);

    const activeByUser = new Map<string, any>();
    const revokedUsers = new Set<string>();
    for (const badge of (existingBadges || []) as any[]) {
      if (academicYearId && badge.academic_year_id && badge.academic_year_id !== academicYearId) {
        continue;
      }
      if (badge.status === 'active') activeByUser.set(badge.user_id, badge);
      if (badge.status === 'revoked') revokedUsers.add(badge.user_id);
    }

    const toInsert: any[] = [];
    const results: Array<{
      userId: string;
      outcome: 'generated' | 'reused' | 'requires_renewal' | 'skipped';
      reason?: string;
      token?: string;
      badgeId?: string;
      staffType?: 'teacher' | 'admin';
    }> = [];

    for (const userId of userIds) {
      const teacher = teacherByUser.get(userId);
      const admin = adminByUser.get(userId);
      if (!teacher && !admin) {
        results.push({ userId, outcome: 'skipped', reason: 'aucun profil enseignant/administration' });
        continue;
      }
      const staffType: 'teacher' | 'admin' = teacher ? 'teacher' : 'admin';
      const staffProfileId = teacher ? teacher.id : admin.id;

      const existing = activeByUser.get(userId);
      if (existing) {
        results.push({
          userId,
          outcome: 'reused',
          token: existing.token,
          badgeId: existing.id,
          staffType,
        });
        continue;
      }

      if (revokedUsers.has(userId)) {
        results.push({
          userId,
          outcome: 'requires_renewal',
          reason: 'Un badge révoqué existe : utilisez « Renouveler ».',
          staffType,
        });
        continue;
      }

      const token = generateBadgeToken();
      const badgeId = `sbadge-${randomUUID()}`;
      toInsert.push({
        id: badgeId,
        user_id: userId,
        staff_type: staffType,
        staff_profile_id: staffProfileId,
        school_id: (teacher?.school_id || admin?.school_id) || guard.admin.schoolId || null,
        academic_year_id: academicYearId,
        token,
        token_sha256: sha256Hex(token),
        token_prefix: badgeTokenPrefix(token),
        status: 'active',
        issued_by: guard.admin.adminId,
      });
      results.push({ userId, outcome: 'generated', token, badgeId, staffType });
    }

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('staff_badges').insert(toInsert);
      if (insertError) {
        return NextResponse.json(
          { success: false, message: `Génération impossible : ${insertError.message}` },
          { status: 400 },
        );
      }
    }

    const generated = results.filter((row) => row.outcome === 'generated').length;
    const reused = results.filter((row) => row.outcome === 'reused').length;

    return NextResponse.json({
      success: true,
      data: { results, generated, reused, academicYearId },
      message: `${generated} badge(s) du personnel généré(s), ${reused} réutilisé(s).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}


export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const body = await request.json().catch(() => ({}));
    const action = typeof body?.action === 'string' ? body.action : '';

    if (action === 'revoke') {
      const badgeId = typeof body?.badgeId === 'string' ? body.badgeId : '';
      if (!badgeId) {
        return NextResponse.json(
          { success: false, message: 'Badge introuvable.' },
          { status: 400 },
        );
      }
      const reason =
        typeof body?.reason === 'string' && body.reason.trim().length > 0
          ? body.reason.trim().slice(0, 200)
          : 'Révocation administrative';

      const { error } = await supabase
        .from('staff_badges')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', badgeId)
        .eq('status', 'active');

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Badge du personnel révoqué.' });
    }

    if (action === 'renew') {
      const userId = typeof body?.userId === 'string' ? body.userId : '';
      if (!userId) {
        return NextResponse.json(
          { success: false, message: 'Personne introuvable.' },
          { status: 400 },
        );
      }

      const academicYearId = await resolveAcademicYearId(
        supabase,
        typeof body?.academicYearId === 'string' ? body.academicYearId : null,
      );

      const { data: teacher } = await supabase
        .from('teacher_profiles')
        .select('id, user_id, school_id')
        .eq('user_id', userId)
        .maybeSingle();
      const { data: admin } = teacher
        ? { data: null }
        : await supabase
            .from('admins')
            .select('id, user_id, school_id')
            .eq('user_id', userId)
            .maybeSingle();

      if (!teacher && !admin) {
        return NextResponse.json(
          { success: false, message: 'Aucun profil enseignant/administration pour cet utilisateur.' },
          { status: 404 },
        );
      }

      let closeQuery = supabase
        .from('staff_badges')
        .update({
          status: 'replaced',
          revoked_at: new Date().toISOString(),
          revoked_reason: 'Renouvellement du badge',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('status', 'active');
      if (academicYearId) closeQuery = closeQuery.eq('academic_year_id', academicYearId);
      await closeQuery;

      const token = generateBadgeToken();
      const badgeId = `sbadge-${randomUUID()}`;

      const { error: insertError } = await supabase.from('staff_badges').insert({
        id: badgeId,
        user_id: userId,
        staff_type: teacher ? 'teacher' : 'admin',
        staff_profile_id: teacher?.id || admin?.id,
        school_id: (teacher?.school_id || admin?.school_id) || guard.admin.schoolId || null,
        academic_year_id: academicYearId,
        token,
        token_sha256: sha256Hex(token),
        token_prefix: badgeTokenPrefix(token),
        status: 'active',
        issued_by: guard.admin.adminId,
      });

      if (insertError) {
        return NextResponse.json({ success: false, message: insertError.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Nouveau badge du personnel généré.',
        data: { badgeId, token },
      });
    }

    if (action === 'mark-printed') {
      const badgeIds: string[] = Array.isArray(body?.badgeIds)
        ? body.badgeIds.filter((id: unknown) => typeof id === 'string')
        : [];
      if (badgeIds.length === 0) {
        return NextResponse.json({ success: true, message: 'Rien à marquer.' });
      }

      const { data: badges } = await supabase
        .from('staff_badges')
        .select('id, printed_count')
        .in('id', badgeIds);

      const now = new Date().toISOString();
      await Promise.all(
        ((badges || []) as any[]).map((badge) =>
          supabase
            .from('staff_badges')
            .update({
              printed_count: (badge.printed_count || 0) + 1,
              last_printed_at: now,
              updated_at: now,
            })
            .eq('id', badge.id),
        ),
      );

      return NextResponse.json({ success: true, message: 'Impression enregistrée.' });
    }

    return NextResponse.json({ success: false, message: 'Action inconnue.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}

