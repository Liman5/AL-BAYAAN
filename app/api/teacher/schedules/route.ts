import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Emploi du temps de l'enseignant
// GET  → récupérer les horaires de cours (course_schedules)
// POST → créer un nouveau cours (si body.action = 'create')
// Utilise la clé service_role (bypass RLS)
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
    const { userId, action, schedule } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId manquant.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Résoudre le profil enseignant
    const { data: teacherProfile } = await supabaseAdmin
      .from('teacher_profiles')
      .select('id')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!teacherProfile) {
      return NextResponse.json(
        { success: false, message: 'Profil enseignant introuvable.' },
        { status: 404 }
      );
    }

    // CRÉER un nouveau cours
    if (action === 'create') {
      const { day_of_week, start_time, end_time, room_number, class_id, subject, academic_year_id } = schedule || {};

      if (!day_of_week || !start_time || !end_time || !class_id || !subject) {
        return NextResponse.json(
          { success: false, message: 'Jour, horaires, classe et matière sont requis.' },
          { status: 400 }
        );
      }

      // ⚠️ Résoudre academic_year_id : si absent, chercher l'année scolaire active
      let yearId = academic_year_id;
      if (!yearId) {
        // 1. Depuis la classe (academic_year_id de la classe)
        const { data: classData } = await supabaseAdmin
          .from('classes')
          .select('academic_year_id')
          .eq('id', class_id)
          .maybeSingle();
        yearId = classData?.academic_year_id || null;

        // 2. Sinon, l'année scolaire la plus récente
        if (!yearId) {
          const { data: years } = await supabaseAdmin
            .from('academic_years')
            .select('id')
            .order('start_date', { ascending: false })
            .limit(1);
          yearId = years?.[0]?.id || null;
        }
      }
      if (!yearId) {
        return NextResponse.json(
          { success: false, message: 'Aucune année scolaire trouvée.' },
          { status: 400 }
        );
      }

      const { data: inserted, error } = await supabaseAdmin
        .from('course_schedules')
        .insert({
          id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          day_of_week,
          start_time,
          end_time,
          room_number: room_number || null,
          class_id,
          teacher_id: teacherProfile.id,
          subject,
          academic_year_id: yearId,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, data: inserted });
    }

    // Récupérer les horaires (par défaut)
    const { data, error } = await supabaseAdmin
      .from('course_schedules')
      .select('*, classes (id, name), academic_years (id, name)')
      .eq('teacher_id', teacherProfile.id)
      .order('day_of_week');

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
