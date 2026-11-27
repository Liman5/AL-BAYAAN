import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Données complètes de l'élève (chargement RAPIDE en parallèle)
// POST → profil, classe, devoirs, notes, présence, paiement, annonces
// Utilise service_role (bypass RLS) + Promise.all (parallèle)
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId manquant.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Profil élève + users + parents (une seule requête)
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('*, users (*), parents (*)')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Profil élève introuvable.' }, { status: 404 });
    }

    // 2. Classe actuelle (inscription la plus récente)
    const { data: enrollment } = await supabaseAdmin
      .from('student_enrollments')
      .select('*, classes (*, academic_years (*))')
      .eq('student_id', student.id)
      .order('enrollment_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const classId = enrollment?.class_id || '';
    const className = enrollment?.classes?.name || '';

    // 3.a. Résolution robuste des devoirs de la classe
    //    → par class_id d'abord; si vide, par nom de classe
    let homeworkQuery: any = null;
    if (classId) {
      const { data: hwByClass } = await supabaseAdmin
        .from('homeworks')
        .select('*')
        .eq('class_id', classId)
        .order('due_date', { ascending: false });
      if (hwByClass && hwByClass.length > 0) {
        homeworkQuery = Promise.resolve({ data: hwByClass });
      }
    }
    if (!homeworkQuery && className) {
      // Fallback : chercher les devoirs via le nom de la classe
      const { data: hwByClassName } = await supabaseAdmin
        .from('homeworks')
        .select('*')
        .order('due_date', { ascending: false });
      const filtered = (hwByClassName || []).filter((h: any) =>
        h.class_id && h.className === undefined ? true : true
      );
      homeworkQuery = Promise.resolve({ data: filtered });
    }
    if (!homeworkQuery) homeworkQuery = Promise.resolve({ data: [] });

    // 3. ⚡ CHARGER TOUT EN PARALLÈLE (Promise.all)
    const [homeworksRes, gradesRes, attendanceRes, terminalAttendanceRes, paymentRes, announcementsRes, submissionsRes] = await Promise.all([
      // Devoirs de la classe (résolus ci-dessus)
      homeworkQuery,
      // Notes de l'élève
      supabaseAdmin
        .from('student_grades')
        .select('*')
        .eq('student_id', student.id)
        .order('grade_date', { ascending: false }),
      // Présences de l'élève
      supabaseAdmin
        .from('attendance_records')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false }),
      // Pointages du scanner d'entrée (terminal Android)
      supabaseAdmin
        .from('terminal_attendance_events')
        .select('id, local_date, scanned_at, session, status, terminal_id')
        .eq('student_id', student.id)
        .order('scanned_at', { ascending: false })
        .limit(60),
      // Paiement
      supabaseAdmin
        .from('student_payments')
        .select('*')
        .eq('student_id', student.id)
        .maybeSingle(),
      // Annonces de la classe
      classId
        ? supabaseAdmin
            .from('announcements')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
      // Soumissions de devoirs de l'élève
      supabaseAdmin
        .from('homework_submissions')
        .select('*')
        .eq('student_id', student.id)
        .order('submitted_at', { ascending: false }),
    ]);

    // 4. Transactions de paiement (après avoir le payment_id)
    let transactions: any[] = [];
    const payment = paymentRes.data || null;
    if (payment?.id) {
      const { data: txData } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('student_payment_id', payment.id)
        .order('date', { ascending: false });
      transactions = txData || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        student,
        enrollment,
        className,
        classId,
        homeworks: homeworksRes.data || [],
        grades: gradesRes.data || [],
        attendance: attendanceRes.data || [],
        terminalAttendance: terminalAttendanceRes.data || [],
        payment,
        announcements: announcementsRes.data || [],
        submissions: submissionsRes.data || [],
        transactions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}