-- Politiques RLS : permettre à l'admin de voir TOUTES les données
-- ⚠️ CRITIQUE : sans ces politiques, l'admin ne peut pas voir les profils
-- car les politiques existantes limitent la lecture à l'utilisateur lui-même.

-- 1. teacher_profiles
DROP POLICY IF EXISTS "teacher_select_admin" ON public.teacher_profiles;
CREATE POLICY "teacher_select_admin" ON public.teacher_profiles
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.admins)
  );

-- 2. students
DROP POLICY IF EXISTS "students_select_admin" ON public.students;
CREATE POLICY "students_select_admin" ON public.students
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.admins)
  );

-- 3. parents
DROP POLICY IF EXISTS "parents_select_admin" ON public.parents;
CREATE POLICY "parents_select_admin" ON public.parents
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.admins)
  );

-- 4. users
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    auth.uid()::text IN (SELECT user_id FROM public.admins)
  );

-- 5. teacher_profiles UPDATE (approbation)
DROP POLICY IF EXISTS "teacher_update_admin" ON public.teacher_profiles;
CREATE POLICY "teacher_update_admin" ON public.teacher_profiles
  FOR UPDATE USING (
    auth.uid()::text IN (SELECT user_id FROM public.admins)
  );

-- 6. users UPDATE (activation compte)
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    auth.uid()::text IN (SELECT user_id FROM public.admins)
  );

-- ✅ Politiques admin créées !