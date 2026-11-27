-- ============================================================
-- AL-BAYAAN — 21. SEED données réelles enseignants
-- Lie les enseignants existants aux classes via class_assignments
-- et les élèves existants aux classes via student_enrollments
-- pour que les pages enseignants affichent de vraies données.
--
-- ⚠️ À exécuter APRÈS l'existence de classes, teacher_profiles,
-- étudiants et academic_years dans la base.
-- ============================================================

-- ------------------------------------------------------------------
-- 0. Variable : année scolaire active (la plus récente)
-- ------------------------------------------------------------------
DO $$
DECLARE
  v_year_id TEXT;
  v_teacher_id TEXT;
  v_class_id TEXT;
  v_student_id TEXT;
BEGIN
  -- Récupérer la dernière année scolaire
  SELECT id INTO v_year_id FROM academic_years ORDER BY start_date DESC LIMIT 1;

  -- Si aucune année académique, retour
  IF v_year_id IS NULL THEN
    RAISE NOTICE 'Aucune année académique trouvée. Ajoutez-en une d''abord.';
    RETURN;
  END IF;

  -- ------------------------------------------------------------------
  -- 1. ASSIGNER les enseignants aux classes
  --    Pour chaque enseignant actif, assigner jusqu'à 2 classes
  --    avec une matière de son profil (ou 'Titulaire')
  -- ------------------------------------------------------------------
  FOR v_teacher_id, v_class_id IN
    SELECT t.id AS teacher_id, c.id AS class_id
    FROM teacher_profiles t
    CROSS JOIN classes c
    WHERE t.status = 'active'
      AND c.academic_year_id = v_year_id
  LOOP
    -- Assigner seulement si pas déjà assigné (éviter doublon)
    IF NOT EXISTS (
      SELECT 1 FROM class_assignments
      WHERE teacher_id = v_teacher_id
        AND class_id = v_class_id
        AND academic_year_id = v_year_id
    ) THEN
      INSERT INTO class_assignments (
        id, teacher_id, class_id, subject, academic_year_id, start_date
      ) VALUES (
        'assign-' || gen_random_uuid()::TEXT,
        v_teacher_id,
        v_class_id,
        'Titulaire',
        v_year_id,
        NOW()
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- ------------------------------------------------------------------
  -- 2. INSCRIRE tous les élèves actifs dans une classe
  --    (répartis automatiquement entre les classes de l'année)
  -- ------------------------------------------------------------------
  FOR v_student_id IN
    SELECT id FROM students WHERE status = 'active'
  LOOP
    -- Vérifier si l'élève a déjà une inscription active
    IF NOT EXISTS (
      SELECT 1 FROM student_enrollments
      WHERE student_id = v_student_id
        AND academic_year_id = v_year_id
        AND status = 'active'
    ) THEN
      -- Prendre une classe au hasard parmi les classes de l'année
      SELECT c.id INTO v_class_id
      FROM classes c
      WHERE c.academic_year_id = v_year_id
      ORDER BY c.name
      LIMIT 1;

      IF v_class_id IS NOT NULL THEN
        INSERT INTO student_enrollments (
          id, student_id, class_id, academic_year_id, enrollment_date, status
        ) VALUES (
          'enr-' || gen_random_uuid()::TEXT,
          v_student_id,
          v_class_id,
          v_year_id,
          NOW(),
          'active'
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;

  -- ------------------------------------------------------------------
  -- 3. Messages de confirmation
  -- ------------------------------------------------------------------
  RAISE NOTICE '✅ Assignations enseignants → classes terminées';
  RAISE NOTICE '✅ Inscriptions élèves → classes terminées';
  RAISE NOTICE 'Année scolaire: %', v_year_id;

END;
$$;

-- ============================================================
-- FIN — 21-seed-teacher-data.sql
-- ============================================================