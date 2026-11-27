-- ============================================================
-- 27. Correctif RLS — récursion infinie
-- Chaîne problématique :
--   users_select_teacher -> students -> student_enrollments -> students
-- Solution : fonctions SECURITY DEFINER (elles contournent la RLS)
-- et policies simplifiées.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()::text
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_class(p_class_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_assignments ca
    JOIN public.teacher_profiles tp ON tp.id = ca.teacher_id
    WHERE ca.class_id = p_class_id
      AND tp.user_id = auth.uid()::text
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_student(p_student_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_enrollments se
    JOIN public.class_assignments ca ON ca.class_id = se.class_id
    JOIN public.teacher_profiles tp ON tp.id = ca.teacher_id
    WHERE se.student_id = p_student_id
      AND tp.user_id = auth.uid()::text
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_user(p_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.student_enrollments se ON se.student_id = s.id
    JOIN public.class_assignments ca ON ca.class_id = se.class_id
    JOIN public.teacher_profiles tp ON tp.id = ca.teacher_id
    WHERE s.user_id = p_user_id
      AND tp.user_id = auth.uid()::text
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_class(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_student(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_user(text) TO authenticated;

-- ---------- Policies admin ----------
DROP POLICY IF EXISTS students_select_admin ON public.students;
CREATE POLICY students_select_admin ON public.students
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS users_select_admin ON public.users;
CREATE POLICY users_select_admin ON public.users
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS users_update_admin ON public.users;
CREATE POLICY users_update_admin ON public.users
  FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS parents_select_admin ON public.parents;
CREATE POLICY parents_select_admin ON public.parents
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS teacher_select_admin ON public.teacher_profiles;
CREATE POLICY teacher_select_admin ON public.teacher_profiles
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS teacher_update_admin ON public.teacher_profiles;
CREATE POLICY teacher_update_admin ON public.teacher_profiles
  FOR UPDATE TO authenticated USING (public.is_admin());

-- ---------- Policies enseignant ----------
DROP POLICY IF EXISTS users_select_teacher ON public.users;
CREATE POLICY users_select_teacher ON public.users
  FOR SELECT TO authenticated USING (public.is_teacher_of_user(id));

DROP POLICY IF EXISTS students_select_teacher ON public.students;
CREATE POLICY students_select_teacher ON public.students
  FOR SELECT TO authenticated USING (public.is_teacher_of_student(id));

DROP POLICY IF EXISTS enrollments_select_teacher ON public.student_enrollments;
CREATE POLICY enrollments_select_teacher ON public.student_enrollments
  FOR SELECT TO authenticated USING (public.is_teacher_of_class(class_id));
