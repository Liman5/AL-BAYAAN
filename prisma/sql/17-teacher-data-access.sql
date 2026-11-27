-- ============================================================
-- AL-BAYAAN — 17. Accès données Enseignants (RLS complémentaire)
--
-- ⚠️ CRITIQUE : Sans ces politiques, un enseignant connecté NE PEUT PAS
--    lire les élèves, inscriptions, présences et notes de ses classes,
--    car les politiques existantes (10-rls-policies.sql) ne donnent accès
--    qu'à son propre profil et à ses affectations de classes.
--
-- À exécuter APRÈS 10-rls-policies.sql et 16-admin-select-all.sql
-- Ce script est CONÇU pour être re-exécutable (DROP POLICY IF EXISTS).
-- ============================================================

-- ------------------------------------------------------------
-- 1. students — L'enseignant peut lire les élèves inscrits
--    dans les classes auxquelles il est affecté.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "students_select_teacher" ON public.students;
CREATE POLICY "students_select_teacher" ON public.students
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id IN (
          SELECT se.class_id
          FROM student_enrollments se
          WHERE se.student_id = students.id
        )
      )
    )
  );

-- ------------------------------------------------------------
-- 2. student_enrollments — L'enseignant peut lire les
--    inscriptions des classes auxquelles il est affecté.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "enrollments_select_teacher" ON public.student_enrollments;
CREATE POLICY "enrollments_select_teacher" ON public.student_enrollments
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id = student_enrollments.class_id
      )
    )
  );

-- ------------------------------------------------------------
-- 3. users — L'enseignant peut lire les profils users des
--    élèves inscrits dans ses classes (pour afficher les noms).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "users_select_teacher" ON public.users;
CREATE POLICY "users_select_teacher" ON public.users
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id IN (
          SELECT se.class_id
          FROM student_enrollments se
          WHERE se.student_id IN (
            SELECT s.id FROM students s WHERE s.user_id = users.id
          )
        )
      )
    )
  );

-- ------------------------------------------------------------
-- 4. attendance_records — L'enseignant peut LIRE, CRÉER et
--    MODIFIER les présences des élèves de ses classes.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "attendance_select_teacher" ON public.attendance_records;
CREATE POLICY "attendance_select_teacher" ON public.attendance_records
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id = attendance_records.class_id
      )
    )
  );

DROP POLICY IF EXISTS "attendance_insert_teacher" ON public.attendance_records;
CREATE POLICY "attendance_insert_teacher" ON public.attendance_records
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id = attendance_records.class_id
      )
    )
  );

DROP POLICY IF EXISTS "attendance_update_teacher" ON public.attendance_records;
CREATE POLICY "attendance_update_teacher" ON public.attendance_records
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id = attendance_records.class_id
      )
    )
  );

-- ------------------------------------------------------------
-- 5. student_grades — L'enseignant peut LIRE, CRÉER et
--    MODIFIER les notes des élèves de ses classes.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "grades_select_teacher" ON public.student_grades;
CREATE POLICY "grades_select_teacher" ON public.student_grades
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id = student_grades.class_id
      )
    )
  );

DROP POLICY IF EXISTS "grades_insert_teacher" ON public.student_grades;
CREATE POLICY "grades_insert_teacher" ON public.student_grades
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id = student_grades.class_id
      )
    )
  );

DROP POLICY IF EXISTS "grades_update_teacher" ON public.student_grades;
CREATE POLICY "grades_update_teacher" ON public.student_grades
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id IN (
        SELECT ca.teacher_id
        FROM class_assignments ca
        WHERE ca.class_id = student_grades.class_id
      )
    )
  );

-- ------------------------------------------------------------
-- 6. homeworks — L'enseignant peut LIRE, CRÉER et MODIFIER
--    les devoirs de ses classes (lire est déjà couvert par
--    homeworks_select_auth, on ajoute INSERT/UPDATE).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "homeworks_insert_teacher" ON public.homeworks;
CREATE POLICY "homeworks_insert_teacher" ON public.homeworks
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id = homeworks.teacher_id
    )
  );

DROP POLICY IF EXISTS "homeworks_update_teacher" ON public.homeworks;
CREATE POLICY "homeworks_update_teacher" ON public.homeworks
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id = homeworks.teacher_id
    )
  );

-- ------------------------------------------------------------
-- 7. classes — L'enseignant peut lire les classes via ses
--    affectations (déjà couvert par classes_select_auth pour
--    tous les utilisateurs authentifiés, politique conservée).

-- ------------------------------------------------------------
-- 8. class_assignments — L'enseignant peut lire ses propres
--    affectations (déjà couvert par assignments_teacher_select,
--    politique conservée).

-- ✅ Accès enseignants configuré avec succès !