import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// DEBUG — Audit de la présence élève
// Retourne pour diagnostiquer pourquoi l'élève ne voit pas
// ses présences alors qu'elles existent côté admin.
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Élève trouvé par le cookie (id OU user_id)
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id, matricule, user_id, status')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    const result: any = {
      requestUserId: userId,
      studentFound: student ? { id: student.id, matricule: student.matricule, user_id: student.user_id } : null,
    };

    if (!student) {
      return NextResponse.json({ success: true, debug: result, note: 'Aucun élève trouvé avec cet ID' });
    }

    // 2. Ses inscriptions (classe)
    const { data: enrollments } = await supabaseAdmin
      .from('student_enrollments')
      .select('id, class_id, academic_year_id, status, classes (id, name)')
      .eq('student_id', student.id);

    result.enrollments = enrollments || [];

    const classIds = (enrollments || []).map((e: any) => e.class_id);

    // 3. Présences AVEC son student_id exact
    const { data: hisAttendance } = await supabaseAdmin
      .from('attendance_records')
      .select('id, student_id, class_id, date, status')
      .eq('student_id', student.id);
    result.hisAttendance = hisAttendance || [];

    // 4. Présences de SES classes (pour voir les 2 présences citées côté admin)
    let classAttendance: any[] = [];
    if (classIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('attendance_records')
        .select('id, student_id, class_id, date, status, students (id, matricule)')
        .in('class_id', classIds);
      classAttendance = data || [];
    }
    result.classAttendance = classAttendance;

    // 5. Vérifier si les 2 présences de sa classe utilisent un AUTRE student_id
    const presentStudentIds = new Set(classAttendance.map((a: any) => a.student_id));
    result.presentButDifferentStudent = presentStudentIds.has(student.id)
      ? false
      : { message: 'Les présences de la classe utilisent un AUTRE student_id que celui de l\'élève connecté', classStudentIds: [...presentStudentIds] };

    return NextResponse.json({ success: true, debug: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' });
  }
}