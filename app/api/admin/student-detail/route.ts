
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Détail complet élève (pour StudentDossier admin)
// GET → notes, présences, devoirs, paiement DEPUIS LA BASE
// Utilise service_role (bypass RLS) — vérité unique
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const classId = url.searchParams.get('classId');

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'studentId manquant.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Profil + users
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('*, users (*)')
      .eq('id', studentId)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Élève introuvable.' }, { status: 404 });
    }

    // 1b. Charger le parent manuellement via parent_id (plus fiable que la jointure FK)
    let studentParent = null;
    if (student.parent_id) {
      const { data: parentData } = await supabaseAdmin
        .from('parents')
        .select('*')
        .eq('id', student.parent_id)
        .maybeSingle();
      studentParent = parentData;
    }

    // Fallback 1 : chercher un parent dont l'email correspond à celui de l'élève
    if (!studentParent) {
      const studentEmail = student.users?.email;
      if (studentEmail) {
        const { data: parentByEmail } = await supabaseAdmin
          .from('parents')
          .select('*')
          .eq('email', studentEmail)
          .maybeSingle();
        if (parentByEmail) {
          studentParent = parentByEmail;
        }
      }
    }

    // Fallback 2 : chercher un parent dont le nom contient le nom de famille de l'élève
    if (!studentParent) {
      const lastName = student.users?.last_name;
      if (lastName) {
        const { data: parentByLastName } = await supabaseAdmin
          .from('parents')
          .select('*')
          .ilike('full_name', '%' + lastName + '%')
          .maybeSingle();
        if (parentByLastName) {
          studentParent = parentByLastName;
        }
      }
    }

    // Si un parent a été trouvé par fallback, l'associer à l'élève
    if (studentParent && !student.parent_id) {
      await supabaseAdmin.from('students').update({ parent_id: studentParent.id }).eq('id', studentId);
    }
    student.parents = studentParent;

    // 2. Notes / Présences / Paiement / Soumissions en parallèle
    const [gradesRes, attendanceRes, terminalAttendanceRes, paymentRes, submissionsRes] = await Promise.all([
      supabaseAdmin
        .from('student_grades')
        .select('*')
        .eq('student_id', studentId)
        .order('grade_date', { ascending: false }),
      supabaseAdmin
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false }),
      // Pointages enregistrés par le scanner d'entrée (terminal Android)
      supabaseAdmin
        .from('terminal_attendance_events')
        .select('id, local_date, scanned_at, session, status, terminal_id')
        .eq('student_id', studentId)
        .order('scanned_at', { ascending: false })
        .limit(60),
      supabaseAdmin
        .from('student_payments')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle(),
      supabaseAdmin
        .from('homework_submissions')
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false }),
    ]);

    // 3. Transactions du paiement de CET élève (filtré par student_payment_id)
    let transactions: any[] = [];
    if (paymentRes.data?.id) {
      const { data } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('student_payment_id', paymentRes.data.id)
        .order('date', { ascending: false });
      transactions = data || [];
    }

    // 4. Devoirs de la classe (si classId fourni)
    let homeworks: any[] = [];
    if (classId) {
      const { data } = await supabaseAdmin
        .from('homeworks')
        .select('*')
        .eq('class_id', classId)
        .order('due_date', { ascending: false });
      homeworks = data || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        student,
        grades: gradesRes.data || [],
        attendance: attendanceRes.data || [],   // ✅ VRAIES présences de la base
        terminalAttendance: terminalAttendanceRes.data || [], // ✅ pointages QR
        payment: paymentRes.data || null,
        homeworks,
        submissions: submissionsRes.data || [],
        transactions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}