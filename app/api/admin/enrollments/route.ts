import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Assigner un élève à une classe (inscription)
// POST /api/admin/enrollments
// DELETE /api/admin/enrollments?id=...
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

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
    const { studentId, classId, academicYearId, status = 'active' } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { success: false, message: 'Élève et classe sont requis.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Si pas d'année scolaire fournie, prendre la plus récente
    let yearId = academicYearId;
    if (!yearId) {
      const { data: years } = await supabaseAdmin
        .from('academic_years')
        .select('id, name')
        .order('start_date', { ascending: false })
        .limit(1);
      yearId = years?.[0]?.id;
    }
    if (!yearId) {
      return NextResponse.json(
        { success: false, message: 'Aucune année scolaire trouvée.' },
        { status: 400 }
      );
    }

    // La table n'a PAS de DEFAULT pour id → générer un ID explicite
    const enrollmentId = `enr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { data, error } = await supabaseAdmin
      .from('student_enrollments')
      .insert({
        id: enrollmentId,
        student_id: studentId,
        class_id: classId,
        academic_year_id: yearId,
        enrollment_date: new Date().toISOString(),
        status,
      })
      .select(
        `
        id,
        student_id,
        class_id,
        academic_year_id,
        status,
        enrollment_date
      `
      )
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'Cet élève est déjà inscrit dans cette classe pour cette année.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID d\'inscription requis.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await supabaseAdmin
      .from('student_enrollments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}