import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// AL-BAYAAN — Configuration scanner + chargement des élèves
// destinés à un terminal de présence.
//
// Ce module est la SEULE source de vérité pour :
//   - les paramètres du scanner (mode confidentialité inclus) ;
//   - la liste des élèves synchronisables (champs minimaux) ;
//   - la résolution de l'établissement d'un terminal.
//
// Il ne renvoie JAMAIS : téléphone, adresse, informations
// parentales, données médicales ou financières.
// ============================================================

export interface ScannerSettingsRow {
  school_id: string;
  show_photo: boolean;
  show_matricule: boolean;
  show_class_name: boolean;
  show_school_name: boolean;
  show_time: boolean;
  attendance_start_time: string;
  late_after_time: string;
  session: string;
  timezone: string;
  notify_parents: boolean;
  sync_photos: boolean;
  offline_grace_days: number;
  config_version: number;
  updated_at: string;
}

/** Champs strictement nécessaires au terminal (aucune PII inutile). */
export const SCANNER_SETTINGS_COLUMNS =
  'school_id, show_photo, show_matricule, show_class_name, show_school_name, show_time, ' +
  'attendance_start_time, late_after_time, session, timezone, notify_parents, sync_photos, ' +
  'offline_grace_days, config_version, updated_at';

/**
 * Détermine l'établissement effectif d'un terminal.
 *
 * - Si le terminal est rattaché à une école → cette école.
 * - Sinon, si l'installation ne contient qu'une seule école,
 *   elle est utilisée (déploiement mono-établissement).
 * - Sinon → `null` (le terminal doit être rattaché par l'admin).
 */
export async function resolveTerminalSchoolId(
  supabase: SupabaseClient,
  terminalSchoolId: string | null,
): Promise<string | null> {
  if (terminalSchoolId) return terminalSchoolId;

  const { data } = await supabase
    .from('schools')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(2);

  if (data && data.length === 1) return data[0].id as string;
  return null;
}

/** Lit (ou crée) la configuration scanner de l'établissement. */
export async function getScannerSettings(
  supabase: SupabaseClient,
  schoolId: string | null,
): Promise<ScannerSettingsRow | null> {
  if (!schoolId) return null;

  const { data } = await supabase
    .from('scanner_settings')
    .select(SCANNER_SETTINGS_COLUMNS)
    .eq('school_id', schoolId)
    .maybeSingle();

  if (data) return data as unknown as ScannerSettingsRow;

  const { data: created, error } = await supabase
    .from('scanner_settings')
    .insert({ school_id: schoolId })
    .select(SCANNER_SETTINGS_COLUMNS)
    .maybeSingle();

  if (error || !created) return null;
  return created as unknown as ScannerSettingsRow;
}

export interface TerminalStudentPayload {
  studentCode: string;
  studentUuid: string;
  firstName: string;
  lastName: string;
  classId: string | null;
  className: string;
  photoRemoteUrl: string | null;
  qrToken: string;
  isActive: boolean;
  badgeRevoked: boolean;
  updatedAt: string;
}

interface StudentRow {
  id: string;
  matricule: string;
  status: string | null;
  photo_url: string | null;
  school_id: string | null;
  updated_at: string | null;
  users?: { first_name?: string | null; last_name?: string | null } | null;
  student_enrollments?: any[] | null;
}

const STUDENT_SELECT =
  'id, matricule, status, photo_url, school_id, updated_at, ' +
  'users (first_name, last_name), ' +
  'student_enrollments (class_id, status, academic_year_id, classes (id, name, academic_year_id))';

/** Classe active retenue pour un élève (la plus récente). */
function pickEnrollment(student: StudentRow): any {
  const enrollments = (student.student_enrollments || []).filter(
    (enrollment: any) => enrollment && enrollment.class_id,
  );
  if (enrollments.length === 0) return null;
  const active = enrollments.filter(
    (enrollment: any) => (enrollment.status || 'active') === 'active',
  );
  return (active.length > 0 ? active : enrollments)[0];
}

export interface StudentsLoadResult {
  students: TerminalStudentPayload[];
  removedStudentCodes: string[];
  truncated: boolean;
}

/**
 * Charge les élèves synchronisables d'un établissement.
 *
 * @param since Curseur ISO pour une synchronisation incrémentale.
 *              `null`/absent → synchronisation complète.
 *
 * Le terminal reçoit des champs minimaux ; les élèves sans badge
 * actif sont renvoyés avec `badgeRevoked: true` afin que le
 * scanner refuse leur QR (aucun token n'est alors transmis).
 */
export async function loadStudentsForTerminal(
  supabase: SupabaseClient,
  schoolId: string,
  options: { since?: string | null; maxStudents?: number } = {},
): Promise<StudentsLoadResult> {
  const maxStudents = options.maxStudents ?? 5000;
  const since = options.since || null;

  let studentIds: string[] | null = null;

  if (since) {
    const changed = new Set<string>();

    const { data: changedStudents } = await supabase
      .from('students')
      .select('id')
      .eq('school_id', schoolId)
      .gte('updated_at', since);
    (changedStudents || []).forEach((row: any) => changed.add(row.id));

    const { data: changedBadges } = await supabase
      .from('student_badges')
      .select('student_id')
      .gte('updated_at', since);
    (changedBadges || []).forEach((row: any) => row.student_id && changed.add(row.student_id));

    const { data: changedEnrollments } = await supabase
      .from('student_enrollments')
      .select('student_id')
      .gte('created_at', since);
    (changedEnrollments || []).forEach((row: any) => row.student_id && changed.add(row.student_id));

    studentIds = Array.from(changed);
    if (studentIds.length === 0) {
      const removed = await loadRemovedStudentCodes(supabase, schoolId, since);
      return { students: [], removedStudentCodes: removed, truncated: false };
    }
  }

  const rows: StudentRow[] = [];
  const pageSize = 200;
  let from = 0;
  let truncated = false;

  while (true) {
    let query = supabase
      .from('students')
      .select(STUDENT_SELECT)
      .or(`school_id.eq.${schoolId},school_id.is.null`)
      .order('updated_at', { ascending: true })
      .range(from, from + pageSize - 1);

    if (studentIds) query = query.in('id', studentIds);

    const { data, error } = await query;
    if (error || !data || data.length === 0) break;

    rows.push(...(data as unknown as StudentRow[]));
    if (data.length < pageSize) break;

    from += pageSize;
    if (rows.length >= maxStudents) {
      truncated = true;
      break;
    }
  }

  // Badges actifs (et révoqués) des élèves concernés.
  const studentDbIds = rows.map((row) => row.id);
  const badgeByStudent = new Map<string, string>();
  const revokedStudents = new Set<string>();

  if (studentDbIds.length > 0) {
    const chunkSize = 150;
    for (let i = 0; i < studentDbIds.length; i += chunkSize) {
      const chunk = studentDbIds.slice(i, i + chunkSize);

      const { data: activeBadges } = await supabase
        .from('student_badges')
        .select('student_id, token')
        .in('student_id', chunk)
        .eq('status', 'active');
      (activeBadges || []).forEach((badge: any) => {
        if (badge.token) badgeByStudent.set(badge.student_id, badge.token);
      });

      const { data: revokedBadges } = await supabase
        .from('student_badges')
        .select('student_id')
        .in('student_id', chunk)
        .eq('status', 'revoked');
      (revokedBadges || []).forEach((badge: any) => revokedStudents.add(badge.student_id));
    }
  }

  const students: TerminalStudentPayload[] = [];

  for (const row of rows) {
    const enrollment = pickEnrollment(row);
    const activeBadge = badgeByStudent.get(row.id) || null;
    const base = {
      studentCode: row.matricule,
      studentUuid: row.id,
      firstName: row.users?.first_name || '',
      lastName: row.users?.last_name || '',
      classId: enrollment?.class_id || null,
      className: enrollment?.classes?.name || '',
      updatedAt: row.updated_at || new Date().toISOString(),
    };

    if (activeBadge) {
      students.push({
        ...base,
        photoRemoteUrl: row.photo_url || null,
        qrToken: activeBadge,
        isActive: (row.status || 'active') === 'active',
        badgeRevoked: false,
      });
      continue;
    }

    // Badge révoqué sans renouvellement : le terminal doit refuser le QR
    // même s'il possède encore l'ancien token en cache.
    if (revokedStudents.has(row.id)) {
      students.push({
        ...base,
        photoRemoteUrl: null,
        qrToken: '',
        isActive: false,
        badgeRevoked: true,
      });
    }
    // Élève sans badge : simplement absent de la synchronisation
    // (il reste visible dans l'admin pour générer son badge).
  }

  const removedStudentCodes = await loadRemovedStudentCodes(supabase, schoolId, since);

  return { students, removedStudentCodes, truncated };
}

/**
 * Matricules des élèves qui ne doivent plus être scannés :
 * statut non actif (transféré, radié, diplômé, inactif, en attente).
 */
async function loadRemovedStudentCodes(
  supabase: SupabaseClient,
  schoolId: string,
  since: string | null,
): Promise<string[]> {
  let query = supabase
    .from('students')
    .select('matricule, status, updated_at')
    .or(`school_id.eq.${schoolId},school_id.is.null`)
    .neq('status', 'active');

  if (since) query = query.gte('updated_at', since);

  const { data } = await query;
  return (data || []).map((row: any) => row.matricule).filter(Boolean);
}
