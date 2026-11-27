import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API — Connexion élève par matricule
// L'élève saisit son matricule (ALB-2026-0001) + mot de passe.
// ✅ La PREMIÈRE fois : le mot de passe saisi devient le premier
//    mot de passe de l'élève (aucun défaut requis).
// ✅ Ensuite : il se connecte avec ce mot de passe.
// ✅ S'il oublie : il peut le réinitialiser via le parent.
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
    const { matricule, password } = body;

    if (!matricule || !password) {
      return NextResponse.json(
        { success: false, message: 'Matricule et mot de passe sont requis.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Trouver l'élève par matricule → récupérer user_id, first_login_done, email
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        user_id,
        first_login_done,
        users (id, email, first_name, last_name, status)
      `)
      .eq('matricule', matricule.trim())
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

    // La relation users peut être un objet ou un tableau
    const userData = Array.isArray(student.users)
      ? (student.users as any[])[0]
      : (student.users as any);

    const userId = userData?.id || student.user_id;
    const userEmail = userData?.email;
    const userStatus = userData?.status;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Aucun compte lié à cet élève.' },
        { status: 400 }
      );
    }
    if (userStatus === 'suspended') {
      return NextResponse.json(
        { success: false, message: 'Ce compte a été suspendu. Contactez l\'administration.' },
        { status: 403 }
      );
    }
    if (userStatus === 'pending') {
      return NextResponse.json(
        { success: false, message: 'Ce compte est en attente d\'approbation par l\'administration.' },
        { status: 403 }
      );
    }

    // 2. 🆕 PREMIÈRE CONNEXION : le mot de passe saisi devient le premier mot de passe
    const isFirstLogin = student.first_login_done === false || student.first_login_done === null;
    if (isFirstLogin) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Votre premier mot de passe doit contenir au moins 6 caractères.' },
          { status: 400 }
        );
      }

      // Mettre à jour le mot de passe dans Supabase Auth (avec clé admin)
      const { error: updatePassError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );

      if (updatePassError) {
        return NextResponse.json(
          { success: false, message: updatePassError.message },
          { status: 500 }
        );
      }

      // Marquer la première connexion comme faite
      await supabaseAdmin
        .from('students')
        .update({ first_login_done: true })
        .eq('id', student.id);

      // Connecter directement avec le nouveau mot de passe
      const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (signInError) {
        return NextResponse.json(
          { success: false, message: 'Matricule ou mot de passe incorrect.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: sessionData,
        user: student.users,
        firstLogin: true,
      });
    }

    // 3. CONNEXION NORMALE : vérifier email + mot de passe
    const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { success: false, message: signInError.message === 'Invalid login credentials'
          ? 'Matricule ou mot de passe incorrect.'
          : signInError.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sessionData,
      user: student.users,
      firstLogin: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}