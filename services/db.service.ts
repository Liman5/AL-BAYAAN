import { HAS_SUPABASE } from '@/lib/env';
import { getAuthUserIdFromCookie } from '@/lib/authClient';

async function getSupabase() {
  if (!HAS_SUPABASE) return null;
  try {
    const mod = await import('../lib/supabaseClient');
    return mod.supabase;
  } catch {
    return null;
  }
}

// ============================================================
// ADMIN — Données de l'administration
// ============================================================

export async function fetchAdminSummary(adminUserId: string) {
  const supabase = await getSupabase();
  if (!supabase) return null;

  // Vérifier que l'utilisateur est bien un admin
  const { data: adminProfile } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', adminUserId)
    .maybeSingle();
  if (!adminProfile) return null;

  // Compter les élèves
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });
  const { count: pendingStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Compter les enseignants
  const { count: totalTeachers } = await supabase
    .from('teacher_profiles')
    .select('*', { count: 'exact', head: true });

  // Compter les parents
  const { count: totalParents } = await supabase
    .from('parents')
    .select('*', { count: 'exact', head: true });

  // Compter les classes
  const { count: totalClasses } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true });

  return {
    adminProfile,
    totalStudents: totalStudents || 0,
    pendingStudents: pendingStudents || 0,
    totalTeachers: totalTeachers || 0,
    totalParents: totalParents || 0,
    totalClasses: totalClasses || 0,
  };
}

export async function fetchAdminStudents() {
  // Utilise la route API serveur avec service_role (bypass RLS)
  try {
    const res = await fetch('/api/admin/students', { cache: 'no-store' });
    const result = await res.json();
    if (result.success) return result.data || [];
    console.error('Erreur fetchAdminStudents:', result.message);
    return [];
  } catch (e) {
    console.error('Erreur fetchAdminStudents:', e);
    return [];
  }
}

// Ajouter un nouvel élève (génération matricule automatique côté serveur)
export async function createStudent(data: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  classId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  dateOfBirth?: string;
  address?: string;
  status?: string;
}) {
  try {
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Erreur createStudent:', e);
    return { success: false, message: 'Erreur réseau.' };
  }
}

// Modifier les informations d'un élève
export async function updateStudent(id: string, data: Partial<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  dateOfBirth: string;
  address: string;
  status: string;
}>) {
  try {
    const res = await fetch('/api/admin/students', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
      cache: 'no-store',
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Erreur updateStudent:', e);
    return { success: false, message: 'Erreur réseau.' };
  }
}

export async function fetchAdminTeachers() {
  // Utilise la route API serveur avec service_role (bypass RLS)
  // pour garantir que l'admin voit TOUS les enseignants, même
  // sans session Supabase active dans le navigateur.
  try {
    const res = await fetch('/api/admin/teachers', { cache: 'no-store' });
    const result = await res.json();
    if (result.success) return result.data || [];
    console.error('Erreur fetchAdminTeachers:', result.message);
    return [];
  } catch (e) {
    console.error('Erreur fetchAdminTeachers:', e);
    return [];
  }
}

export async function fetchAdminClasses() {
  // Utilise la route API serveur avec service_role (bypass RLS)
  try {
    const res = await fetch('/api/admin/classes', { cache: 'no-store' });
    const result = await res.json();
    if (result.success) return result.data || [];
    console.error('Erreur fetchAdminClasses:', result.message);
    return [];
  } catch (e) {
    console.error('Erreur fetchAdminClasses:', e);
    return [];
  }
}

// Paiements — récupérer les paiements élèves/enseignants depuis la DB
export async function fetchAdminPayments() {
  try {
    const res = await fetch('/api/admin/payments', { cache: 'no-store' });
    const result = await res.json();
    if (result.success) return result.data;
    console.error('Erreur fetchAdminPayments:', result.message);
    return { studentPayments: [], teacherPayments: [], transactions: [], yearName: '' };
  } catch (e) {
    console.error('Erreur fetchAdminPayments:', e);
    return { studentPayments: [], teacherPayments: [], transactions: [], yearName: '' };
  }
}

// Paiements — enregistrer/initialiser un paiement dans la DB
export async function saveAdminPayment(data: {
  action: 'init_student' | 'pay_student' | 'init_teacher' | 'pay_teacher';
  studentId?: string;
  teacherId?: string;
  totalAmount?: number;
  amount?: number;
  method?: string;
  reference?: string;
  period?: string;
}) {
  try {
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Erreur saveAdminPayment:', e);
    return { success: false, message: 'Erreur réseau.' };
  }
}

// ============================================================
// ADMIN — Assignations Classe ↔ Enseignant / Élève
// ============================================================

export async function assignTeacherToClass(data: {
  teacherId: string;
  classId: string;
  subject: string;
  academicYearId?: string;
}) {
  try {
    const res = await fetch('/api/admin/class-assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Erreur assignTeacherToClass:', e);
    return { success: false, message: 'Erreur réseau.' };
  }
}

export async function removeTeacherFromClass(assignmentId: string) {
  try {
    const res = await fetch(`/api/admin/class-assignments?id=${encodeURIComponent(assignmentId)}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Erreur removeTeacherFromClass:', e);
    return { success: false, message: 'Erreur réseau.' };
  }
}

export async function assignStudentToClass(data: {
  studentId: string;
  classId: string;
  academicYearId?: string;
  status?: string;
}) {
  try {
    const res = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Erreur assignStudentToClass:', e);
    return { success: false, message: 'Erreur réseau.' };
  }
}

export async function removeStudentFromClass(enrollmentId: string) {
  try {
    const res = await fetch(`/api/admin/enrollments?id=${encodeURIComponent(enrollmentId)}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Erreur removeStudentFromClass:', e);
    return { success: false, message: 'Erreur réseau.' };
  }
}

export async function fetchPendingStudentRequests() {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from('students')
    .select(`
      id,
      matricule,
      status,
      registration_date,
      user_id,
      users (id, email, first_name, last_name)
    `)
    .eq('status', 'pending');
  return data || [];
}

export async function fetchPendingTeacherRequests() {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from('teacher_profiles')
    .select(`
      id,
      matricule,
      status,
      subjects,
      hire_date,
      user_id,
      users (id, email, first_name, last_name)
    `)
    .eq('status', 'pending');
  return data || [];
}

// ============================================================
// ENSEIGNANT — Données du teacher
// ============================================================

export async function fetchTeacherClasses(teacherProfileId: string | null, userId: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  const id = teacherProfileId || userId;
  const empty = {
    teacher: null,
    classes: [],
    students: [],
    notifications: [],
    submissions: [],
    homeworks: [],
  };
  if (!id) return empty;

  try {
    const res = await fetch('/api/teacher/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
      cache: 'no-store',
    });
    const result = await res.json();

    if (result.success && result.data) {
      return {
        teacher: result.data.teacher,
        classes: result.data.classes || [],
        students: result.data.students || [],
        notifications: result.data.notifications || [],
        submissions: result.data.submissions || [],
        homeworks: result.data.homeworks || [],
      };
    }
    console.error('Erreur fetchTeacherClasses:', result.message);
    return empty;
  } catch (e) {
    console.error('Erreur fetchTeacherClasses:', e);
    return empty;
  }
}

export async function fetchTeacherHomeworks(teacherProfileId: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  try {
    const res = await fetch('/api/teacher/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: teacherProfileId }),
      cache: 'no-store',
    });
    const result = await res.json();
    if (result.success && result.data) return result.data.homeworks || [];
    return [];
  } catch (e) {
    console.error('Erreur fetchTeacherHomeworks:', e);
    return [];
  }
}

export async function fetchTeacherGrades(teacherProfileId: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  try {
    const res = await fetch('/api/teacher/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: teacherProfileId }),
      cache: 'no-store',
    });
    const result = await res.json();
    if (result.success && result.data) return result.data.grades || [];
    return [];
  } catch (e) {
    console.error('Erreur fetchTeacherGrades:', e);
    return [];
  }
}

export async function fetchTeacherAttendance(teacherProfileId: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  try {
    const res = await fetch('/api/teacher/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: teacherProfileId }),
      cache: 'no-store',
    });
    const result = await res.json();
    if (result.success && result.data) return result.data.attendance || [];
    return [];
  } catch (e) {
    console.error('Erreur fetchTeacherAttendance:', e);
    return [];
  }
}

export async function fetchAttendanceForClass(classId: string, date: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  try {
    const userId = typeof window !== 'undefined'
      ? getAuthUserIdFromCookie()
      : null;

    const res = await fetch(
      `/api/teacher/attendance?classId=${encodeURIComponent(classId)}&date=${encodeURIComponent(date)}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}`,
      { cache: 'no-store' }
    );
    const result = await res.json();
    if (result.success) return result.data || [];
    return [];
  } catch (e) {
    console.error('Erreur fetchAttendanceForClass:', e);
    return [];
  }
}

export async function upsertAttendanceRecords(
  records: Array<{
    student_id: string;
    class_id: string;
    teacher_id: string;
    academic_year_id: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    comment?: string;
  }>
) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  const userId = records[0]?.teacher_id || null;
  try {
    const res = await fetch('/api/teacher/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, records }),
      cache: 'no-store',
    });
    const result = await res.json();
    return { success: result.success, error: result.message };
  } catch (e) {
    console.error('Erreur upsertAttendanceRecords:', e);
    return { success: false, error: e };
  }
}

export async function saveTeacherHomework(data: {
  title: string;
  description?: string;
  subject: string;
  class_id: string;
  teacher_id: string;
  academic_year_id: string;
  due_date: string;
  published_date?: string;
}) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, fallback: true };

  const { error } = await supabase.from('homeworks').insert([
    {
      ...data,
      // homeworks.id est PRIMARY KEY sans DEFAULT → obligatoire
      id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'published',
      published_date: data.published_date || new Date().toISOString(),
    },
  ]);
  return { success: !error, error };
}

export async function saveStudentGrades(
  records: Array<{
    grade: number;
    coefficient: number;
    grade_type: 'devoir' | 'interrogation' | 'examen';
    grade_date: string;
    student_id: string;
    class_id: string;
    teacher_id: string;
    subject: string;
    academic_year_id: string;
    homework_id?: string;
  }>
) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, fallback: true };

  // student_grades.id est PRIMARY KEY sans DEFAULT → générer un id pour chaque record
  const prepared = records.map((r) => ({
    ...r,
    id: `grade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }));
  const { error } = await supabase.from('student_grades').insert(prepared);
  return { success: !error, error };
}

export async function fetchTeacherDashboardSummary(teacherProfileId: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS) pour garantir
  // que l'enseignant voit TOUTES ses données même sans session Supabase active.
  try {
    const res = await fetch('/api/teacher/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: teacherProfileId }),
      cache: 'no-store',
    });
    const result = await res.json();

    if (result.success && result.data) {
      return result.data;
    }
    console.error('Erreur fetchTeacherDashboardSummary:', result.message);
    return null;
  } catch (e) {
    console.error('Erreur fetchTeacherDashboardSummary:', e);
    return null;
  }
}

export async function fetchTeacherSchedules(teacherProfileId: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  try {
    const res = await fetch('/api/teacher/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: teacherProfileId }),
      cache: 'no-store',
    });
    const result = await res.json();
    if (result.success) return result.data || [];
    console.error('Erreur fetchTeacherSchedules:', result.message);
    return [];
  } catch (e) {
    console.error('Erreur fetchTeacherSchedules:', e);
    return [];
  }
}

const DAY_ORDER: Record<string, number> = {
  Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5,
};

export function sortSchedulesByDay(schedules: any[]) {
  return [...schedules].sort((a, b) => {
    const da = DAY_ORDER[a.day_of_week] ?? 99;
    const db = DAY_ORDER[b.day_of_week] ?? 99;
    if (da !== db) return da - db;
    return (a.start_time || '').localeCompare(b.start_time || '');
  });
}

export async function saveTeacherSchedule(data: {
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  class_id: string;
  teacher_id: string;
  subject: string;
  academic_year_id?: string;
}) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  try {
    const res = await fetch('/api/teacher/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.teacher_id,
        action: 'create',
        schedule: data,
      }),
      cache: 'no-store',
    });
    const result = await res.json();
    return { success: result.success, error: result.message };
  } catch (e) {
    console.error('Erreur saveTeacherSchedule:', e);
    return { success: false, error: e };
  }
}

export async function deleteTeacherSchedule(scheduleId: string) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, fallback: true };

  const { error } = await supabase
    .from('course_schedules')
    .delete()
    .eq('id', scheduleId);
  return { success: !error, error };
}

// ============================================================
// ÉLÈVE — Données du student
// ============================================================

export async function fetchStudentData(userId: string) {
  // 🔑 Utilise la route API serveur (service_role bypass RLS)
  // ⚡ Chargement TOUT EN PARALLÈLE (Promise.all) → beaucoup plus rapide
  try {
    const res = await fetch('/api/student/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      cache: 'no-store',
    });
    const result = await res.json();
    if (result.success && result.data) return result.data;
    console.error('Erreur fetchStudentData:', result.message);
    return null;
  } catch (e) {
    console.error('Erreur fetchStudentData:', e);
    return null;
  }
}

// ============================================================
// PARENT — Données du parent
// ============================================================

export async function fetchParentData(userId: string) {
  const supabase = await getSupabase();
  if (!supabase) return null;

  // Profil parent
  const { data: parent } = await supabase
    .from('parents')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (!parent) return null;

  // Enfants du parent
  const { data: children } = await supabase
    .from('students')
    .select('*, user')
    .eq('parent_id', parent.id);

  const childrenData = children || [];

  // Pointages du scanner d'entrée — via une route serveur (RLS interdit
  // l'accès direct à `terminal_attendance_events` depuis le navigateur).
  let terminalAttendance: any[] = [];
  try {
    const res = await fetch('/api/parent/terminal-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      cache: 'no-store',
    });
    const payload = await res.json();
    if (payload?.success) terminalAttendance = payload.data?.attendance || [];
  } catch (error) {
    console.error('Erreur pointages terminal (parent):', error);
  }

  // Pour chaque enfant, charger ses données récentes
  const enrichedChildren = await Promise.all(
    childrenData.map(async (child: any) => {
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('*, classes (name)')
        .eq('student_id', child.id)
        .order('enrollment_date', { ascending: false })
        .limit(1);

      const { count: gradesCount } = await supabase
        .from('student_grades')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', child.id);

      const { count: absencesCount } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', child.id)
        .neq('status', 'present');

      const childScans = terminalAttendance.filter(
        (event: any) => event.student_id === child.id,
      );

      return {
        ...child,
        className: enrollments?.[0]?.classes?.name || 'Non affecté',
        gradesCount: gradesCount || 0,
        absencesCount: absencesCount || 0,
        lastScan: childScans[0] || null,
        scanCount: childScans.length,
      };
    })
  );

  // Annonces parents
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('audience', 'parent')
    .order('created_at', { ascending: false });

  return {
    parent,
    children: enrichedChildren,
    announcements: announcements || [],
  };
}

// ============================================================
// NOTES / MOYENNES
// ============================================================

export function computeStudentAverage(grades: any[]) {
  if (!grades || grades.length === 0) return null;
  const totalWeighted = grades.reduce(
    (acc, g) => acc + (g.grade || 0) * (g.coefficient || 1),
    0
  );
  const totalCoef = grades.reduce((acc, g) => acc + (g.coefficient || 1), 0);
  return totalCoef > 0 ? Math.round((totalWeighted / totalCoef) * 10) / 10 : null;
}

export function computeAttendanceSummary(attendance: any[]) {
  if (!attendance) {
    return { present: 0, late: 0, absent: 0, excused: 0, total: 0, records: [] };
  }
  return {
    present: attendance.filter((r) => r.status === 'present').length,
    late: attendance.filter((r) => r.status === 'late').length,
    absent: attendance.filter((r) => r.status === 'absent').length,
    excused: attendance.filter((r) => r.status === 'excused').length,
    total: attendance.length,
    records: attendance,
  };
}