import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Liste des enseignants pour l'admin
// Utilise la clé service_role (bypass RLS) pour garantir
// que l'admin voit TOUS les enseignants (active, pending, etc.)
// même si la session Supabase du navigateur n'est pas active.
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

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
      .from('teacher_profiles')
      .select(`
        id,
        matricule,
        hire_date,
        status,
        gender,
        subjects,
        specializations,
        user_id,
        users (id, email, first_name, last_name, phone, status),
        class_assignments (
          id,
          subject,
          class_id,
          academic_year_id,
          start_date,
          end_date,
          classes (id, name, level, academic_years (id, name))
        )
      `)
      .order('matricule');

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