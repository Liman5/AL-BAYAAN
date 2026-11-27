import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { getAdminClient } from '@/lib/terminalAuth';
import { badgeTokenPrefix, generateBadgeToken, sha256Hex } from '@/lib/badges';
import { randomUUID } from 'crypto';

// ============================================================
// API — Badges QR élèves (administration)
//
// GET   → liste des élèves + état de leur badge (filtres, pagination)
// POST  → génération IDEMPOTENTE pour une sélection d'élèves
// PATCH → révocation / renouvellement / marquage « imprimé »
//
// ⚠️ Aucun badge n'est créé automatiquement à l'inscription.
//    L'administrateur décide quand et pour qui générer un QR.
// ⚠️ Ces routes sont réservées aux administrateurs authentifiés
//    (voir lib/adminGuard.ts) et n'exposent jamais le token à
//    un terminal ou à un visiteur.
// ============================================================

export const runtime = 'nodejs';

const STUDENT_SELECT =
  'id, matricule, status, photo_url, school_id, updated_at, user_id, ' +
  'users (first_name, last_name), ' +
  'student_enrollments (class_id, status, academic_year_id, classes (id, name, level))';

async function resolveAcademicYearId(
  supabase: ReturnType<typeof getAdminClient>,
  requested: string | null,
): Promise<string | null> {
  if (requested) return requested;
  const { data } = await supabase
    .from('academic_years')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: latest } = await supabase
    .from('academic_years')
    .select('id')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return latest?.id || null;
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const classFilter = url.searchParams.get('classId') || '';
    const statusFilter = url.searchParams.get('status') || 'all';
    const academicYearId = await resolveAcademicYearId(
      supabase,
      url.searchParams.get('academicYearId'),
    );
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get('pageSize') || '25')));

    let query = supabase
      .from('students')
      .select(STUDENT_SELECT)
      .order('matricule', { ascending: true })
      .limit(3000);

    if (guard.admin.schoolId) query = query.eq('school_id', guard.admin.schoolId);

    const { data: rawStudents, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const studentIds = (rawStudents || []).map((row: any) => row.id);
    const badgeByStudent = new Map<string, any>();

    if (studentIds.length > 0) {
      let badgeQuery = supabase
        .from('student_badges')
        .select(
          'id, student_id, status, issued_at, revoked_at, revoked_reason, printed_count, ' +
            'last_printed_at, token_prefix, academic_year_id, token',
        )
        .in('student_id', studentIds);
      if (academicYearId) badgeQuery = badgeQuery.eq('academic_year_id', academicYearId);

      const { data: badges } = await badgeQuery;
      for (const badge of (badges || []) as any[]) {
        const current = badgeByStudent.get(badge.student_id);
        const rank = (value: string) => (value === 'active' ? 3 : value === 'revoked' ? 2 : 1);
        if (!current || rank(badge.status) > rank(current.status)) {
          badgeByStudent.set(badge.student_id, badge);
        }
      }
    }

    const rows = (rawStudents || []).map((row: any) => {
      const enrollments = (row.student_enrollments || []).filter((e: any) => e && e.class_id);
      const enrollment =
        enrollments.find((e: any) => (e.status || 'active') === 'active') ||
        enrollments[0] ||
        null;
      const badge = badgeByStudent.get(row.id) || null;
      return {
        studentId: row.id,
        matricule: row.matricule,
        firstName: row.users?.first_name || '',
        lastName: row.users?.last_name || '',
        photoUrl: row.photo_url || null,
        status: row.status || 'active',
        classId: enrollment?.class_id || null,
        className: enrollment?.classes?.name || '',
        classLevel: enrollment?.classes?.level || null,
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
    });

    const filtered = rows.filter((row) => {
      if (classFilter && row.classId !== classFilter) return false;
      if (statusFilter === 'none' && row.badge) return false;
      if (statusFilter === 'active' && row.badge?.status !== 'active') return false;
      if (statusFilter === 'revoked' && row.badge?.status !== 'revoked') return false;
      if (search) {
        const haystack = `${row.firstName} ${row.lastName} ${row.matricule}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const stats = {
      total: rows.length,
      withActiveBadge: rows.filter((row) => row.badge?.status === 'active').length,
      withRevokedBadge: rows.filter((row) => row.badge?.status === 'revoked').length,
      withoutBadge: rows.filter((row) => !row.badge).length,
    };

    // Nom de l'établissement (affiché sur les badges imprimés).
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
        students: slice,
        pagination: { page: safePage, pageSize, total, totalPages },
        stats,
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

// ------------------------------------------------------------
// POST — génération de badges (idempotente)
// ------------------------------------------------------------
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const body = await request.json().catch(() => ({}));
    const studentIds: string[] = Array.isArray(body?.studentIds)
      ? Array.from(new Set(body.studentIds.filter((id: unknown) => typeof id === 'string')))
      : [];

    if (studentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucun élève sélectionné.' },
        { status: 400 },
      );
    }
    if (studentIds.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Maximum 500 élèves par génération.' },
        { status: 400 },
      );
    }

    const academicYearId = await resolveAcademicYearId(
      supabase,
      typeof body?.academicYearId === 'string' ? body.academicYearId : null,
    );

    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, matricule, status, school_id')
      .in('id', studentIds);

    if (studentError || !students) {
      return NextResponse.json(
        { success: false, message: studentError?.message || 'Élèves introuvables.' },
        { status: 400 },
      );
    }

    const { data: existingBadges } = await supabase
      .from('student_badges')
      .select('id, student_id, status, token, academic_year_id')
      .in('student_id', studentIds);

    const activeByStudent = new Map<string, any>();
    const revokedByStudent = new Set<string>();
    for (const badge of existingBadges || []) {
      if (academicYearId && badge.academic_year_id && badge.academic_year_id !== academicYearId) {
        continue;
      }
      if (badge.status === 'active') activeByStudent.set(badge.student_id, badge);
      if (badge.status === 'revoked') revokedByStudent.add(badge.student_id);
    }

    const toInsert: any[] = [];
    const results: Array<{
      studentId: string;
      matricule: string;
      outcome: 'generated' | 'reused' | 'requires_renewal' | 'skipped';
      reason?: string;
      token?: string;
      badgeId?: string;
    }> = [];

    for (const student of students as any[]) {
      if (!student.matricule) {
        results.push({
          studentId: student.id,
          matricule: '',
          outcome: 'skipped',
          reason: 'matricule absent',
        });
        continue;
      }

      const existing = activeByStudent.get(student.id);
      if (existing) {
        results.push({
          studentId: student.id,
          matricule: student.matricule,
          outcome: 'reused',
          token: existing.token,
          badgeId: existing.id,
        });
        continue;
      }

      if (revokedByStudent.has(student.id)) {
        results.push({
          studentId: student.id,
          matricule: student.matricule,
          outcome: 'requires_renewal',
          reason: 'Un badge révoqué existe : utilisez « Renouveler ».',
        });
        continue;
      }

      const token = generateBadgeToken();
      const badgeId = `badge-${randomUUID()}`;
      toInsert.push({
        id: badgeId,
        student_id: student.id,
        school_id: student.school_id || guard.admin.schoolId || null,
        academic_year_id: academicYearId,
        token,
        token_sha256: sha256Hex(token),
        token_prefix: badgeTokenPrefix(token),
        status: 'active',
        issued_by: guard.admin.adminId,
      });
      results.push({
        studentId: student.id,
        matricule: student.matricule,
        outcome: 'generated',
        token,
        badgeId,
      });
    }

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('student_badges').insert(toInsert);
      if (insertError) {
        return NextResponse.json(
          { success: false, message: `Génération impossible : ${insertError.message}` },
          { status: 400 },
        );
      }

      // Rattache les élèves à l'établissement du badge (utile pour la
      // synchronisation des terminaux) sans jamais écraser une valeur.
      const schoolId = guard.admin.schoolId;
      if (schoolId) {
        await supabase
          .from('students')
          .update({ school_id: schoolId })
          .in(
            'id',
            toInsert.map((badge) => badge.student_id),
          )
          .is('school_id', null);
      }
    }

    const generated = results.filter((row) => row.outcome === 'generated').length;
    const reused = results.filter((row) => row.outcome === 'reused').length;

    return NextResponse.json({
      success: true,
      data: { results, generated, reused, academicYearId },
      message: `${generated} badge(s) généré(s), ${reused} réutilisé(s).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}


// ------------------------------------------------------------
// PATCH — révocation / renouvellement / marquage d'impression
// ------------------------------------------------------------
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
        .from('student_badges')
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
      return NextResponse.json({ success: true, message: 'Badge révoqué.' });
    }

    if (action === 'renew') {
      const studentId = typeof body?.studentId === 'string' ? body.studentId : '';
      if (!studentId) {
        return NextResponse.json(
          { success: false, message: 'Élève introuvable.' },
          { status: 400 },
        );
      }

      const academicYearId = await resolveAcademicYearId(
        supabase,
        typeof body?.academicYearId === 'string' ? body.academicYearId : null,
      );

      const { data: student } = await supabase
        .from('students')
        .select('id, matricule, school_id')
        .eq('id', studentId)
        .maybeSingle();

      if (!student) {
        return NextResponse.json(
          { success: false, message: 'Élève introuvable.' },
          { status: 404 },
        );
      }

      // Remplace l'éventuel badge actif (perte, badge compromis).
      let closeQuery = supabase
        .from('student_badges')
        .update({
          status: 'replaced',
          revoked_at: new Date().toISOString(),
          revoked_reason: 'Renouvellement du badge',
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .eq('status', 'active');
      if (academicYearId) closeQuery = closeQuery.eq('academic_year_id', academicYearId);
      await closeQuery;

      const token = generateBadgeToken();
      const badgeId = `badge-${randomUUID()}`;

      const { error: insertError } = await supabase.from('student_badges').insert({
        id: badgeId,
        student_id: studentId,
        school_id: student.school_id || guard.admin.schoolId || null,
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
        message: 'Nouveau badge généré.',
        data: { badgeId, token, matricule: student.matricule },
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
        .from('student_badges')
        .select('id, printed_count')
        .in('id', badgeIds);

      const now = new Date().toISOString();
      await Promise.all(
        (badges || []).map((badge: any) =>
          supabase
            .from('student_badges')
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

