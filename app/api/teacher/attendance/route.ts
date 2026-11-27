import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Présences de l'enseignant
// GET  → récupérer les présences d'une classe pour une date
// POST → enregistrer/modifier les présences
// Utilise la clé service_role (bypass RLS)
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
    const classId = url.searchParams.get('classId');
    const date = url.searchParams.get('date');
    const userId = url.searchParams.get('userId');

    if (!classId || !date) {
      return NextResponse.json({ success: false, message: 'classId et date sont requis.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Résoudre le profil enseignant si userId fourni
    let teacherId: string | null = null;
    if (userId) {
      const { data: teacherProfile } = await supabaseAdmin
        .from('teacher_profiles')
        .select('id')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();
      teacherId = teacherProfile?.id || null;
    }

    let query = supabaseAdmin
      .from('attendance_records')
      .select('*, students (*, users (*))')
      .eq('class_id', classId)
      .eq('date', date);

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data || [] });
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
    const { userId, records } = body;

    if (!userId || !records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, message: 'records et userId sont requis.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Résoudre le vrai teacher_profiles.id
    const { data: teacherProfile } = await supabaseAdmin
      .from('teacher_profiles')
      .select('id')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!teacherProfile) {
      return NextResponse.json({ success: false, message: 'Profil enseignant introuvable.' }, { status: 404 });
    }

    // Préparer les records avec le vrai teacher_id + un ID explicite
    // (attendance_records.id est PRIMARY KEY sans DEFAULT → obligatoire)
    const prepared = records.map((r: any) => ({
      ...r,
      id: r.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      teacher_id: teacherProfile.id,
    }));

    const { error } = await supabaseAdmin
      .from('attendance_records')
      .upsert(prepared, { onConflict: 'student_id,class_id,date,academic_year_id' });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}