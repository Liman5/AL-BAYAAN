import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// ============================================================
// API d'inscription sécurisée avec clé service_role
// ============================================================
// Utilise la clé SECRET (service_role) qui :
//  - Bypass RLS (peut écrire dans users, teacher_profiles, etc.)
//  - Peut créer des comptes avec email_confirm: true
//    → AUCUNE confirmation email requise
//    → Contourne "email rate limit exceeded"
//
// ⚠️ À utiliser UNIQUEMENT depuis le serveur (jamais côté client)
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
    const { role, ...data } = body;

    // Créer un client Supabase avec la clé service (bypass RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Créer l'utilisateur dans Supabase Auth avec email auto-confirmé
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // ⚠️ Confirme automatiquement l'email
        user_metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });

    if (createError) {
      return NextResponse.json(
        { success: false, message: createError.message },
        { status: createError.status || 400 }
      );
    }

    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Impossible de créer le compte.' },
        { status: 500 }
      );
    }

    // 2. Insérer dans la table users
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: data.email,
        password_hash: 'supabase-auth',
        first_name: data.first_name,
        last_name: data.last_name,
        status: role === 'student' || role === 'teacher' ? 'pending' : 'active',
        school_id: data.school_id || null,
      });

    if (usersError) {
      return NextResponse.json(
        { success: false, message: `Erreur users: ${usersError.message}` },
        { status: 400 }
      );
    }

    // 3. Insérer dans la table de profil selon le rôle
    let profileError = null;

    // Génère un ID unique pour les profils (les tables n'ont pas de DEFAULT id)
    const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Génère une matricule séquentielle unique : ALB-2026-0001, ALB-2026-0002, ...
    // Vérifie dans la base pour trouver la prochaine matricule disponible
    async function generateStudentMatricule(): Promise<string> {
      const year = new Date().getFullYear();
      const prefix = `ALB-${year}-`;

      // Récupérer les matricules existantes pour cette année
      const { data: existingStudents } = await supabaseAdmin
        .from('students')
        .select('matricule')
        .ilike('matricule', `${prefix}%`)
        .order('matricule', { ascending: false });

      // Si aucune matricule existante, commencer à 0001
      if (!existingStudents || existingStudents.length === 0) {
        return `${prefix}0001`;
      }

      // Parcourir les matricules existantes et trouver le premier numéro libre
      const usedNumbers = new Set<number>();
      for (const s of existingStudents) {
        const match = s.matricule?.match(/ALB-\d{4}-(\d+)$/);
        if (match) {
          usedNumbers.add(parseInt(match[1], 10));
        }
      }

      // Trouver le premier numéro séquentiel libre (1, 2, 3, ...)
      let nextNumber = 1;
      while (usedNumbers.has(nextNumber)) {
        nextNumber++;
      }

      return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }

    if (role === 'teacher') {
      const matricule = `ALB-T-${Date.now().toString().slice(-6)}`;
      const gender = data.gender === 'M' || data.gender === 'F' ? data.gender : null;
      // ⚠️ L'enseignant est créé avec status='pending' → doit être approuvé par l'admin
      const { error } = await supabaseAdmin.from('teacher_profiles').insert({
        id: makeId('teacher'), // ← ID explicite obligatoire
        matricule,
        hire_date: new Date().toISOString(),
        status: 'pending',
        gender,
        subjects: data.subjects || [],
        user_id: userId,
        school_id: data.school_id || null,
      });
      profileError = error;
    } else if (role === 'parent') {
      const { error } = await supabaseAdmin.from('parents').insert({
        id: makeId('parent'), // ← ID explicite obligatoire
        full_name: `${data.first_name} ${data.last_name}`,
        phone: data.phone || null,
        email: data.email,
        user_id: userId,
      });
      profileError = error;
    } else if (role === 'student') {
      // Générer une matricule séquentielle unique (ALB-2026-0001, ALB-2026-0002, ...)
      const matricule = await generateStudentMatricule();
      const { error } = await supabaseAdmin.from('students').insert({
        id: makeId('student'), // ← ID explicite obligatoire
        matricule,
        status: 'pending',
        registration_date: new Date().toISOString(),
        address: data.address || null,
        user_id: userId,
        school_id: data.school_id || null,
      });
      profileError = error;
    } else {
      profileError = { message: 'Rôle inconnu.' } as any;
    }

    if (profileError) {
      return NextResponse.json(
        { success: false, message: `Erreur profil: ${profileError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}