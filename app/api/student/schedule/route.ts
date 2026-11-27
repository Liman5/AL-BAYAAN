import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Emploi du temps personnel de l'élève
// GET  → récupérer l'emploi du temps de l'élève
// POST → créer/modifier une entrée d'emploi du temps
// DELETE → supprimer une entrée
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
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId manquant.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Résoudre l'élève
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Profil élève introuvable.' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('student_schedules')
      .select('*')
      .eq('student_id', student.id)
      .order('day_of_week');

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
    const { userId, day_of_week, start_time, end_time, subject, room_number, id } = body;

    if (!userId || !day_of_week || !start_time || !end_time || !subject) {
      return NextResponse.json(
        { success: false, message: 'userId, jour, horaires et matière sont requis.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Résoudre l'élève
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Profil élève introuvable.' }, { status: 404 });
    }

    let result: any;
    if (id) {
      // Mettre à jour
      const { data, error } = await supabaseAdmin
        .from('student_schedules')
        .update({
          day_of_week,
          start_time,
          end_time,
          subject,
          room_number: room_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('student_id', student.id)
        .select()
        .single();
      result = { data, error };
    } else {
      // Créer
      const { data, error } = await supabaseAdmin
        .from('student_schedules')
        .insert({
          id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          student_id: student.id,
          day_of_week,
          start_time,
          end_time,
          subject,
          room_number: room_number || null,
        })
        .select()
        .single();
      result = { data, error };
    }

    if (result.error) {
      return NextResponse.json({ success: false, message: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'id manquant.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await supabaseAdmin
      .from('student_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}