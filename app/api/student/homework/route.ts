import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Soumission de devoirs (Élève)
// POST → soumettre la réponse d'un devoir (texte + photo/URL)
// GET  → liste des soumissions de l'élève pour une classe
// Utilise service_role (bypass RLS)
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, homeworkId, content, attachmentUrl } = body;

    if (!userId || !homeworkId) {
      return NextResponse.json(
        { success: false, message: 'userId et homeworkId sont requis.' },
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

    // Vérifier que le devoir existe
    const { data: homework } = await supabaseAdmin
      .from('homeworks')
      .select('id')
      .eq('id', homeworkId)
      .maybeSingle();
    if (!homework) {
      return NextResponse.json({ success: false, message: 'Devoir introuvable.' }, { status: 404 });
    }

    // Upsert la soumission (une seule par devoir/élève)
    const { data: existing } = await supabaseAdmin
      .from('homework_submissions')
      .select('id')
      .eq('homework_id', homeworkId)
      .eq('student_id', student.id)
      .maybeSingle();

    let error: any = null;
    if (existing) {
      // Mettre à jour la soumission existante
      const { error: upError } = await supabaseAdmin
        .from('homework_submissions')
        .update({
          content: content ?? undefined,
          attachment_url: attachmentUrl ?? undefined,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      error = upError;
    } else {
      // Créer une nouvelle soumission
      const { error: insError } = await supabaseAdmin
        .from('homework_submissions')
        .insert({
          id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          homework_id: homeworkId,
          student_id: student.id,
          content: content || null,
          attachment_url: attachmentUrl || null,
          status: 'submitted',
        });
      error = insError;
    }

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const homeworkId = url.searchParams.get('homeworkId');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let query = supabaseAdmin
      .from('homework_submissions')
      .select('*, homeworks (*), students (*, users (*))');

    if (userId) {
      // Résoudre l'élève
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('id')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();
      if (student) query = query.eq('student_id', student.id);
    }
    if (homeworkId) query = query.eq('homework_id', homeworkId);

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}