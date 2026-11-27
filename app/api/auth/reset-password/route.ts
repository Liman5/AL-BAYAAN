import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Réinitialisation de mot de passe élève
// L'élève doit fournir son matricule + email OU téléphone du parent.
// Si les infos parent correspondent à celles associées à l'élève,
// le mot de passe est réinitialisé sans code de vérification.
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
    const { matricule, parentEmail, parentPhone, newPassword } = body;

    if (!matricule) {
      return NextResponse.json(
        { success: false, message: 'Veuillez saisir votre matricule.' },
        { status: 400 }
      );
    }
    if (!parentEmail && !parentPhone) {
      return NextResponse.json(
        { success: false, message: 'Veuillez saisir l\'email ou le téléphone du parent.' },
        { status: 400 }
      );
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Trouver l'élève par matricule
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        user_id,
        parent_id,
        users (id, email, first_name, last_name)
      `)
      .eq('matricule', matricule)
      .maybeSingle();

    if (studentError) {
      return NextResponse.json(
        { success: false, message: studentError.message },
        { status: 400 }
      );
    }
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Aucun élève trouvé avec ce matricule.' },
        { status: 404 }
      );
    }

    // 2. Récupérer les infos du parent associé
    let parent = null;
    if (student.parent_id) {
      const { data: parentData } = await supabaseAdmin
        .from('parents')
        .select('*')
        .eq('id', student.parent_id)
        .maybeSingle();
      parent = parentData;
    }

    if (!parent) {
      return NextResponse.json(
        { success: false, message: 'Aucun parent associé à cet élève. Contactez l\'administration.' },
        { status: 400 }
      );
    }

    // 3. Vérifier que l'email ou le téléphone du parent correspond
    const parentEmailMatch = parentEmail
      ? parent.email?.toLowerCase() === parentEmail.toLowerCase() ||
        parent.user_id &&
        (
          // Vérifier aussi dans la table users du parent
          (async () => {
            const { data: parentUser } = await supabaseAdmin
              .from('users')
              .select('email')
              .eq('id', parent.user_id)
              .maybeSingle();
            return parentUser?.email?.toLowerCase() === parentEmail.toLowerCase();
          })()
        )
      : false;

    const parentPhoneMatch = parentPhone
      ? parent.phone === parentPhone ||
        (parent.phone && parent.phone.replace(/\s+/g, '') === parentPhone.replace(/\s+/g, ''))
      : false;

    if (!parentEmailMatch && !parentPhoneMatch) {
      return NextResponse.json(
        { success: false, message: 'Les informations du parent ne correspondent pas. Veuillez vérifier.' },
        { status: 403 }
      );
    }

    // 4. Réinitialiser le mot de passe avec la clé admin (sans code de vérification)
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      student.user_id,
      { password: newPassword }
    );

    if (resetError) {
      return NextResponse.json(
        { success: false, message: resetError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}