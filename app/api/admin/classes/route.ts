import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// API — Liste des classes pour l'admin
// Inclut : enseignants assignés (class_assignments) et
// nombre d'élèves par classe (student_enrollments).
// Utilise la clé service_role (bypass RLS).
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const CLASS_LEVELS = new Set(['preschool', 'primary', 'middle_school', 'high_school']);

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabaseAdmin
      .from('classes')
      .select(`
        id,
        name,
        level,
        room_number,
        description,
        academic_year_id,
        class_teacher_id,
        created_at,
        updated_at,
        academic_years (id, name),
        teacher_profiles (id, matricule, status, users (id, first_name, last_name)),
        class_assignments (
          id,
          subject,
          teacher_id,
          academic_year_id,
          teacher_profiles (id, matricule, status, users (id, first_name, last_name))
        ),
        student_enrollments (
          id,
          student_id,
          academic_year_id,
          status,
          students (
            id,
            matricule,
            status,
            date_of_birth,
            registration_date,
            users (id, email, first_name, last_name, phone)
          )
        )
      `)
      .order('name');

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const role = request.cookies.get('userRole')?.value;
    if (role !== 'school_admin' && role !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: 'Accès réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = String(body.name || '').trim();
    const level = String(body.level || '').trim();
    const academicYearId = String(body.academicYearId || '').trim();
    const roomNumber = String(body.roomNumber || '').trim();
    const description = String(body.description || '').trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Le nom de la classe est requis.' },
        { status: 400 }
      );
    }
    if (!CLASS_LEVELS.has(level)) {
      return NextResponse.json(
        { success: false, message: 'Niveau de classe invalide.' },
        { status: 400 }
      );
    }
    if (!academicYearId) {
      return NextResponse.json(
        { success: false, message: 'L’année scolaire est requise.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: year } = await supabaseAdmin
      .from('academic_years')
      .select('id')
      .eq('id', academicYearId)
      .maybeSingle();

    if (!year) {
      return NextResponse.json(
        { success: false, message: 'Année scolaire introuvable.' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('name', name)
      .eq('academic_year_id', academicYearId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Une classe porte déjà ce nom pour cette année.' },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('classes')
      .insert({
        name,
        level,
        academic_year_id: academicYearId,
        room_number: roomNumber || null,
        description: description || null,
      })
      .select(
        `id, name, level, room_number, description, academic_year_id, class_teacher_id, created_at, updated_at, academic_years (id, name)`
      )
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
