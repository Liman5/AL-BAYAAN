import { getUserRoleByUserId } from './auth.service';

// ============================================================
// PROFIL SERVICE — Inscription via API serveur
//
// ✅ Utilise la Route API /api/auth/register (clé service_role)
//    qui :
//    - Crée le compte avec email_confirm: true (aucune confirmation)
//    - Bypass RLS (peut écrire dans users, teacher_profiles...)
//    - Contourne le "email rate limit exceeded" (pas via Auth API client)
// ============================================================

// Helper : envoyer la requête à l'API serveur
async function callRegisterApi(data: any) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    return result;
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erreur réseau.' };
  }
}

// ============================================================
// ENSEIGNANT — export vers app/auth/register/teacher/page.tsx
// ============================================================
export async function registerTeacherSupabase(data: {
  first_name: string;
  last_name: string;
  gender?: string;
  email: string;
  password: string;
  subjects: string[];
  assigned_class?: string;
  school_id?: string;
}) {
  return await callRegisterApi({
    role: 'teacher',
    first_name: data.first_name,
    last_name: data.last_name,
    gender: data.gender,
    email: data.email,
    password: data.password,
    subjects: data.subjects,
    school_id: data.school_id,
  });
}

// ============================================================
// ÉLÈVE — export vers app/auth/register/student/page.tsx
// ============================================================
export async function registerStudentSupabase(data: {
  full_name: string;
  parent_name: string;
  parent_email: string;
  phone: string;
  address: string;
  class_name: string;
  academic_year: string;
  login_email: string;
  requested_password: string;
}) {
  const first_name = data.full_name.split(' ')[0] || data.full_name;
  const last_name = data.full_name.split(' ').slice(1).join(' ') || '';

  return await callRegisterApi({
    role: 'student',
    first_name,
    last_name,
    email: data.login_email,
    password: data.requested_password,
    address: data.address,
  });
}

// ============================================================
// PARENT — export vers app/auth/register/parent/page.tsx
// ============================================================
export async function registerParentSupabase(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  parent_for?: string[];
}) {
  return await callRegisterApi({
    role: 'parent',
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password: data.password,
    phone: data.phone,
  });
}

export { getUserRoleByUserId };