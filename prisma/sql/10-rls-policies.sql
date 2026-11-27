-- ============================================================
-- AL-BAYAAN — 10. Politiques RLS (Row Level Security)
--
-- ⚠️ NOTE IMPORTANTE :
-- Ce script est CONÇU pour être re-exécutable.
-- Il supprime d'abord TOUTES les versions des fonctions,
-- puis recrée les fonctions, accorde les droits, et configure les politiques.
-- ============================================================

-- ============================================================
-- 0. SUPPRIMER TOUTES LES VERSIONS ANTÉRIEURES DES FONCTIONS
--    ⚠️ Résout l'erreur 42725 "function is not unique"
-- ============================================================
DROP FUNCTION IF EXISTS public.create_teacher_profile(text, text, text, text[], text) CASCADE;
DROP FUNCTION IF EXISTS public.create_teacher_profile(text, text, text, text[], text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_teacher_profile(text, text, text, text, text[], text) CASCADE;
DROP FUNCTION IF EXISTS public.create_teacher_profile(text, text, text, text, text[], text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_teacher_profile(text, text, text, text[]) CASCADE;
DROP FUNCTION IF EXISTS public.create_teacher_profile() CASCADE;

DROP FUNCTION IF EXISTS public.create_parent_profile(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_parent_profile(text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_parent_profile(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_parent_profile() CASCADE;

DROP FUNCTION IF EXISTS public.create_student_request(text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_student_request(text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_student_request(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_student_request() CASCADE;

-- ============================================================
-- 1. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================================
ALTER TABLE IF EXISTS schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS homeworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. CRÉER LES FONCTIONS RPC
-- ============================================================

-- 2.1 Enseignant
CREATE OR REPLACE FUNCTION public.create_teacher_profile(
  p_user_id TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_subjects TEXT[],
  p_school_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricule TEXT;
BEGIN
  -- Vérifier que l'utilisateur existe dans auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id::uuid) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Utilisateur inconnu.');
  END IF;

  -- Vérifier que l'email correspond
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_user_id::uuid AND email = p_email
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email invalide.');
  END IF;

  -- Générer un matricule unique
  v_matricule := 'ALB-T-' || to_char(now(), 'YYMM') || '-' || substr(replace(p_user_id, '-', ''), 1, 6);

  -- Insérer dans users (id = TEXT)
  INSERT INTO public.users (id, email, password_hash, first_name, last_name, status, school_id)
  VALUES (p_user_id, p_email, 'supabase-auth', p_first_name, p_last_name, 'active', p_school_id);

  -- Insérer dans teacher_profiles
  INSERT INTO public.teacher_profiles (matricule, hire_date, status, subjects, user_id, school_id)
  VALUES (v_matricule, now(), 'active', p_subjects, p_user_id, p_school_id);

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'matricule', v_matricule);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 2.2 Parent
CREATE OR REPLACE FUNCTION public.create_parent_profile(
  p_user_id TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id::uuid) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Utilisateur inconnu.');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_user_id::uuid AND email = p_email
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email invalide.');
  END IF;

  INSERT INTO public.users (id, email, password_hash, first_name, last_name, status)
  VALUES (p_user_id, p_email, 'supabase-auth', p_first_name, p_last_name, 'active');

  INSERT INTO public.parents (full_name, phone, email, user_id)
  VALUES (p_first_name || ' ' || p_last_name, p_phone, p_email, p_user_id);

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 2.3 Élève (demande d'inscription)
CREATE OR REPLACE FUNCTION public.create_student_request(
  p_user_id TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_class_name TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricule TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id::uuid) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Utilisateur inconnu.');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_user_id::uuid AND email = p_email
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email invalide.');
  END IF;

  v_matricule := 'ALB-' || to_char(now(), 'YYMM') || '-' || substr(replace(p_user_id, '-', ''), 1, 6);

  INSERT INTO public.users (id, email, password_hash, first_name, last_name, status)
  VALUES (p_user_id, p_email, 'supabase-auth', p_first_name, p_last_name, 'pending');

  INSERT INTO public.students (matricule, status, registration_date, address, user_id)
  VALUES (v_matricule, 'pending', now(), p_address, p_user_id);

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'matricule', v_matricule);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- ============================================================
-- 3. ACCORDER LES DROITS D'EXÉCUTION
--    ⚠️ On spécifie la signature complète pour lever toute ambiguïté
-- ============================================================
GRANT EXECUTE ON FUNCTION public.create_teacher_profile(
  text, text, text, text, text[], text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_parent_profile(
  text, text, text, text, text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_student_request(
  text, text, text, text, text, text
) TO authenticated;

-- ============================================================
-- 4. POLITIQUES : Accès aux données selon le rôle
-- ============================================================

-- ---- users ----
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

-- ---- teacher_profiles ----
DROP POLICY IF EXISTS "teacher_select_own" ON public.teacher_profiles;
CREATE POLICY "teacher_select_own" ON public.teacher_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "teacher_update_own" ON public.teacher_profiles;
CREATE POLICY "teacher_update_own" ON public.teacher_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

-- ---- students ----
DROP POLICY IF EXISTS "students_select_own" ON public.students;
CREATE POLICY "students_select_own" ON public.students
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "students_update_own" ON public.students;
CREATE POLICY "students_update_own" ON public.students
  FOR UPDATE USING (auth.uid()::text = user_id);

-- ---- parents ----
DROP POLICY IF EXISTS "parents_select_own" ON public.parents;
CREATE POLICY "parents_select_own" ON public.parents
  FOR SELECT USING (auth.uid()::text = user_id);

-- ---- admins ----
DROP POLICY IF EXISTS "admins_select_own" ON public.admins;
CREATE POLICY "admins_select_own" ON public.admins
  FOR SELECT USING (auth.uid()::text = user_id);

-- ---- classes ----
DROP POLICY IF EXISTS "classes_select_auth" ON public.classes;
CREATE POLICY "classes_select_auth" ON public.classes
  FOR SELECT USING (auth.role() = 'authenticated');

-- ---- academic_years ----
DROP POLICY IF EXISTS "academic_years_select_auth" ON public.academic_years;
CREATE POLICY "academic_years_select_auth" ON public.academic_years
  FOR SELECT USING (auth.role() = 'authenticated');

-- ---- announcements ----
DROP POLICY IF EXISTS "announcements_select_auth" ON public.announcements;
CREATE POLICY "announcements_select_auth" ON public.announcements
  FOR SELECT USING (auth.role() = 'authenticated');

-- ---- homeworks ----
DROP POLICY IF EXISTS "homeworks_select_auth" ON public.homeworks;
CREATE POLICY "homeworks_select_auth" ON public.homeworks
  FOR SELECT USING (auth.role() = 'authenticated');

-- ---- attendance_records ----
DROP POLICY IF EXISTS "attendance_student_select" ON public.attendance_records;
CREATE POLICY "attendance_student_select" ON public.attendance_records
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.students WHERE id = attendance_records.student_id)
  );

-- ---- student_grades ----
DROP POLICY IF EXISTS "grades_student_select" ON public.student_grades;
CREATE POLICY "grades_student_select" ON public.student_grades
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.students WHERE id = student_grades.student_id)
  );

-- ---- student_payments ----
DROP POLICY IF EXISTS "payments_student_select" ON public.student_payments;
CREATE POLICY "payments_student_select" ON public.student_payments
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.students WHERE id = student_payments.student_id)
  );

-- ---- student_enrollments ----
DROP POLICY IF EXISTS "enrollments_student_select" ON public.student_enrollments;
CREATE POLICY "enrollments_student_select" ON public.student_enrollments
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.students WHERE id = student_enrollments.student_id)
  );

-- ---- class_assignments ----
DROP POLICY IF EXISTS "assignments_teacher_select" ON public.class_assignments;
CREATE POLICY "assignments_teacher_select" ON public.class_assignments
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.teacher_profiles WHERE id = class_assignments.teacher_id)
  );

-- ✅ Politiques RLS configurées avec succès !