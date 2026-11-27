import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Données complètes de l'enseignant (profil, classes,
// élèves, devoirs, notes, présence)
// Utilise la clé service_role (bypass RLS) pour garantir que
// l'enseignant voit TOUTES ses données même sans session active.
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId manquant.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Trouver le profil enseignant (par id OU par user_id)
    const { data: teacherProfile } = await supabaseAdmin
      .from('teacher_profiles')
      .select('*, users (*)')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!teacherProfile) {
      return NextResponse.json(
        { success: false, message: 'Profil enseignant introuvable.' },
        { status: 404 }
      );
    }

    const teacherId = teacherProfile.id;

    // 2. Récupérer en parallèle toutes les données
    const [assignmentsRes, homeworksRes, gradesRes, attendanceRes] = await Promise.all([
      supabaseAdmin
        .from('class_assignments')
        .select('*, classes (*), academic_years (*)')
        .eq('teacher_id', teacherId),
      supabaseAdmin
        .from('homeworks')
        .select('*, classes (*), academic_years (*)')
        .eq('teacher_id', teacherId)
        .order('due_date', { ascending: false }),
      supabaseAdmin
        .from('student_grades')
        .select('*, students (*, users (*)), classes (*)')
        .eq('teacher_id', teacherId)
        .order('grade_date', { ascending: false }),
      supabaseAdmin
        .from('attendance_records')
        .select('*, students (*, users (*)), classes (*)')
        .eq('teacher_id', teacherId)
        .order('date', { ascending: false }),
    ]);

    const assignments = assignmentsRes.data || [];
    const homeworks = homeworksRes.data || [];
    const homeworkIds = homeworks.map((homework: any) => homework.id);
    const classes = assignments.map((a: any) => a.classes).filter(Boolean) || [];
    const classIds = classes.map((c: any) => c.id);

    // 3. Élèves des classes assignées
    let students: any[] = [];
    if (classIds.length > 0) {
      const { data: enrollments } = await supabaseAdmin
        .from('student_enrollments')
        .select('*, students (*, users (*)), classes (id, name)')
        .in('class_id', classIds);
      students = enrollments?.map((e: any) => ({
        ...e.students,
        className: e.classes?.name || '',
        classId: e.class_id || '',
      })).filter(Boolean) || [];
    }

    // 4. Soumissions de devoirs (notifications réelles)
    let submissions: any[] = [];
    let notifications: Array<{ id: number; message: string; time: string }> = [];

    if (homeworkIds.length > 0) {
      const { data: submissionsData } = await supabaseAdmin
        .from('homework_submissions')
        .select(
          'id, submitted_at, status, homework_id, student_id, students (id, users (first_name, last_name)), homeworks (id, title)',
        )
        .in('homework_id', homeworkIds)
        .order('submitted_at', { ascending: false })
        .limit(15);

      submissions = submissionsData || [];

      notifications = submissions
        .filter((submission: any) => submission.status === 'submitted')
        .map((submission: any, index: number) => {
          const firstName = submission.students?.users?.first_name || '';
          const lastName = submission.students?.users?.last_name || '';
          const studentName = `${firstName} ${lastName}`.trim() || 'Un élève';
          const title = submission.homeworks?.title || 'un devoir';
          return {
            id: index + 1,
            message: `${studentName} a remis son devoir — ${title}`,
            time: formatRelativeTime(submission.submitted_at),
          };
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        teacher: teacherProfile,
        classes,
        assignments,
        students,
        homeworks,
        grades: gradesRes.data || [],
        attendance: attendanceRes.data || [],
        submissions,
        notifications,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}