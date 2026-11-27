import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// POST /api/parent/terminal-attendance
//
// Renvoie, pour **les enfants du parent authentifié**, leurs derniers
// pointages enregistrés par le scanner d'entrée (terminal Android).
//
// ⚠️ Aucune liste d'élèves n'est acceptée en entrée : le serveur
//    détermine lui-même les enfants à partir de `userId` (table parents).
//    Un parent ne peut donc jamais lire les présences d'un autre enfant.
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : '';
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId manquant.' },
        { status: 400 },
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Parent authentifié
    const { data: parent } = await admin
      .from('parents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!parent) {
      return NextResponse.json(
        { success: false, message: 'Profil parent introuvable.' },
        { status: 404 },
      );
    }

    // 2. Ses enfants uniquement
    const { data: children } = await admin
      .from('students')
      .select('id')
      .eq('parent_id', parent.id);

    const studentIds = (children || []).map((row: any) => row.id);
    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, data: { attendance: [] } });
    }

    // 3. Derniers pointages de ces enfants
    const { data: events, error } = await admin
      .from('terminal_attendance_events')
      .select('id, student_id, local_date, scanned_at, session, status')
      .in('student_id', studentIds)
      .order('scanned_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { attendance: events || [] },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}
