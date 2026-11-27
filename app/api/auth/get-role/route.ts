import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// API PRIVILÉGIÉE : retourne user + rôle en UN SEUL appel
// Clé service_role → bypass RLS → fiable 100%
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId manquant.' }, { status: 400 });
    }

    const sb = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // 0. Récupérer l'email via Auth (pour chercher par email si l'ID ne matche pas)
    const { data: authUser } = await sb.auth.admin.getUserById(userId);
    const authEmail = authUser?.user?.email;

    // 1. Utilisateur : d'abord par ID, sinon par email (gère les comptes seed avec ID texte)
    let { data: user } = await sb.from('users').select('*').eq('id', userId).maybeSingle();
    if (!user && authEmail) {
      ({ data: user } = await sb.from('users').select('*').eq('email', authEmail).maybeSingle());
    }
    if (!user) {
      return NextResponse.json({ success: false, message: 'Utilisateur introuvable.' }, { status: 404 });
    }

    // 2. Statut
    if (user.status === 'pending') {
      return NextResponse.json({ success: false, status: 'pending', message: 'Votre compte est en attente d\'approbation par l\'administrateur.' });
    }
    if (user.status === 'suspended') {
      return NextResponse.json({ success: false, status: 'suspended', message: 'Votre compte a été suspendu. Contactez l\'administration.' });
    }

    // ⚠️ Utiliser l'ID RÉEL de users (dans admins/teacher_profiles etc.
    // la clé user_id fait référence à users.id, pas à l'UUID Supabase Auth)
    const realUserId = user.id;

    // 3. Rôle (admins → teachers → students → parents)
    let role: string | null = null;

    const { data: admin } = await sb.from('admins').select('admin_level').eq('user_id', realUserId).maybeSingle();
    if (admin) role = admin.admin_level;
    else {
      const { data: teacher } = await sb.from('teacher_profiles').select('id').eq('user_id', realUserId).maybeSingle();
      if (teacher) role = 'teacher';
      else {
        const { data: student } = await sb.from('students').select('id').eq('user_id', realUserId).maybeSingle();
        if (student) role = 'student';
        else {
          const { data: parent } = await sb.from('parents').select('id').eq('user_id', realUserId).maybeSingle();
          if (parent) role = 'parent';
        }
      }
    }

    if (!role) {
      return NextResponse.json({ success: false, message: 'Aucun rôle trouvé pour ce compte.' }, { status: 404 });
    }

    // Retourner l'ID RÉEL (users.id) et non l'UUID supabase auth
    // pour que les cookies/dashboards retrouvent le bon profil
    return NextResponse.json({ success: true, user, role, userId: realUserId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erreur serveur.' }, { status: 500 });
  }
}