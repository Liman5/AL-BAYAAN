import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Passage d'année / Migration des classes (Administration)
// GET   → liste des élèves avec statut de passage + classes
// POST  → migrer une classe vers la classe suivante (admis)
// PUT   → mettre à jour le statut d'un élève (admis/ajourné...)
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
    const yearId = url.searchParams.get('yearId');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Années scolaires (ordre chronologique)
    const { data: years } = await supabaseAdmin
      .from('academic_years')
      .select('*')
      .order('start_date', { ascending: true });

    // Classes de l'année sélectionnée (ou de l'année active)
    let activeYearId = yearId;
    if (!activeYearId && years && years.length > 0) {
      activeYearId =
        years.find((year: any) => year.is_active)?.id || years[years.length - 1]?.id;
    }

    // Élèves avec inscriptions + statut de progression pour cette année
    const { data: enrollments } = await supabaseAdmin
      .from('student_enrollments')
      .select(`
        id,
        student_id,
        class_id,
        academic_year_id,
        status,
        students (id, matricule, status, users (id, first_name, last_name, email)),
        classes (id, name, level, academic_year_id)
      `)
      .eq('academic_year_id', activeYearId)
      .order('class_id');

    // Progressions existantes
    const { data: progressData } = activeYearId
      ? await supabaseAdmin
          .from('student_progress')
          .select('*')
          .eq('academic_year_id', activeYearId)
      : { data: [] };

    // Classes de l'année suivante pour migrer
    let nextYearId: string | null = null;
    if (years && activeYearId) {
      const index = years.findIndex((year: any) => year.id === activeYearId);
      if (index >= 0 && index < years.length - 1) {
        nextYearId = years[index + 1].id;
      }
    }

    const { data: nextYearClasses } = nextYearId
      ? await supabaseAdmin
          .from('classes')
          .select('id, name, level')
          .eq('academic_year_id', nextYearId)
      : { data: [] };

    return NextResponse.json({
      success: true,
      data: {
        years: years || [],
        activeYearId,
        nextYearId,
        enrollments: enrollments || [],
        progress: progressData || [],
        nextYearClasses: nextYearClasses || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const body = await request.json();
    const { classId, currentYearId, nextYearId, nextClassId, statusFilter = 'admis' } = body;

    if (!classId || !currentYearId || !nextYearId) {
      return NextResponse.json(
        { success: false, message: 'classId, currentYearId et nextYearId sont requis.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: migrated, error } = await supabaseAdmin.rpc('migrate_class_to_next_year', {
      p_class_id: classId,
      p_current_year_id: currentYearId,
      p_next_year_id: nextYearId,
      p_next_class_id: nextClassId || null,
      p_status_filter: statusFilter,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: { migrated: migrated || 0 } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const body = await request.json();
    const { progressId, status, repeatCount, generalAverage, comment } = body;

    if (!progressId || !status) {
      return NextResponse.json(
        { success: false, message: 'progressId et status sont requis.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const update: any = { status };
    if (repeatCount !== undefined) update.repeat_count = repeatCount;
    if (generalAverage !== undefined) update.general_average = generalAverage;
    if (comment !== undefined) update.comment = comment;
    update.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('student_progress')
      .update(update)
      .eq('id', progressId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}