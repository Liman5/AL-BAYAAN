-- ============================================================
-- AL-BAYAAN — 18. Emploi du temps (Course Schedules)
--
-- ⚠️ MANQUANT dans le schéma initial : la table d'emploi du temps
--    n'existait pas. Cette migration ajoute la table course_schedules
--    + les politiques RLS pour les enseignants.
--
-- À exécuter APRÈS 17-teacher-data-access.sql
-- Ce script est CONÇU pour être re-exécutable.
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE course_schedules (créneau d'emploi du temps)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_schedules (
  id               TEXT PRIMARY KEY,
  day_of_week      TEXT NOT NULL,          -- 'Lundi' | 'Mardi' | ...
  start_time       TEXT NOT NULL,          -- '08:00'
  end_time         TEXT NOT NULL,          -- '09:00'
  room_number      TEXT,
  class_id         TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id       TEXT NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  subject          TEXT NOT NULL,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(day_of_week, start_time, class_id, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON course_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class ON course_schedules(class_id);

-- ------------------------------------------------------------
-- 2. RLS : Activer
-- ------------------------------------------------------------
ALTER TABLE course_schedules ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 3. POLITIQUES RLS
--    - L'enseignant peut LIRE, CRÉER, MODIFIER, SUPPRIMER
--      les créneaux de ses classes (affectées ou titulaire).
--    - Les utilisateurs authentifiés peuvent lire les créneaux
--      de leurs classes (élèves/parents).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "schedules_teacher_select" ON public.course_schedules;
CREATE POLICY "schedules_teacher_select" ON public.course_schedules
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id = course_schedules.teacher_id
    )
  );

DROP POLICY IF EXISTS "schedules_teacher_insert" ON public.course_schedules;
CREATE POLICY "schedules_teacher_insert" ON public.course_schedules
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id = course_schedules.teacher_id
    )
  );

DROP POLICY IF EXISTS "schedules_teacher_update" ON public.course_schedules;
CREATE POLICY "schedules_teacher_update" ON public.course_schedules
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id = course_schedules.teacher_id
    )
  );

DROP POLICY IF EXISTS "schedules_teacher_delete" ON public.course_schedules;
CREATE POLICY "schedules_teacher_delete" ON public.course_schedules
  FOR DELETE USING (
    auth.uid()::text IN (
      SELECT tp.user_id
      FROM teacher_profiles tp
      WHERE tp.id = course_schedules.teacher_id
    )
  );

-- Lecture pour les utilisateurs authentifiés des classes concernées
DROP POLICY IF EXISTS "schedules_class_select_auth" ON public.course_schedules;
CREATE POLICY "schedules_class_select_auth" ON public.course_schedules
  FOR SELECT USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM student_enrollments se
      WHERE se.class_id = course_schedules.class_id
    )
  );

-- ------------------------------------------------------------
-- 4. GRANTS
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_schedules TO authenticated;

-- ✅ Emploi du temps configuré avec succès !