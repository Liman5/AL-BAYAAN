import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Approuver un enseignant en attente
// Utilise la clé service_role pour :
//  - Mettre à jour teacher_profiles.status → 'active'
//  - Mettre à jour users.status → 'active'
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
    const { teacherId } = body;

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: 'ID de l\'enseignant manquant.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Récupérer le profil enseignant
    const { data: teacher, error: fetchError } = await supabaseAdmin
      .from('teacher_profiles')
      .select('*, users (id, email, first_name, last_name)')
      .eq('id', teacherId)
      .maybeSingle();

    if (fetchError || !teacher) {
      return NextResponse.json(
        { success: false, message: fetchError?.message || 'Enseignant introuvable.' },
        { status: 404 }
      );
    }

    // 2. Mettre à jour le profil enseignant → active
    const { error: teacherError } = await supabaseAdmin
      .from('teacher_profiles')
      .update({ status: 'active' })
      .eq('id', teacherId);

    if (teacherError) {
      return NextResponse.json(
        { success: false, message: `Erreur: ${teacherError.message}` },
        { status: 400 }
      );
    }

    // 3. Mettre à jour le statut de l'utilisateur → active
    if (teacher.user_id) {
      const { error: userError } = await supabaseAdmin
        .from('users')
        .update({ status: 'active' })
        .eq('id', teacher.user_id);

      if (userError) {
        return NextResponse.json(
          { success: false, message: `Erreur user: ${userError.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Enseignant ${teacher.users?.first_name || ''} ${teacher.users?.last_name || ''} approuvé avec succès.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}