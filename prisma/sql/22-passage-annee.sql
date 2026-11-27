-- ============================================================
-- AL-BAYAAN — 22. Passage d'année scolaire / Migration classes
-- Table des résultats de fin d'année pour chaque élève.
-- Permet la migration par classe : admis → classe suivante,
-- avec conservation du matricule et données vierges nouvelle année.
-- ============================================================

-- ------------------------------------------------------------------
-- TABLE — student_progress
-- Statut de fin d'année pour chaque élève / année scolaire
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_progress (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id        TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id  TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id          TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  -- statut de fin d'année
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('admis', 'ajourne', 'refuse', 'pending')),
  -- nombre de redoublement de CET élève pour CETTE classe (0 = jamais redoublé cette classe)
  repeat_count      INTEGER NOT NULL DEFAULT 0,
  -- classe de destination si admis (classe suivante)
  next_class_id     TEXT REFERENCES classes(id) ON DELETE SET NULL,
  -- note de passage / moyenne générale
  general_average   NUMERIC(5,2),
  -- commentaires du conseil
  comment           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_year ON student_progress(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_status ON student_progress(status);
CREATE INDEX IF NOT EXISTS idx_student_progress_class ON student_progress(class_id);

-- ------------------------------------------------------------------
-- TABLE — class_progression (mapping classe → classe suivante)
-- Définit l'ordre des classes par niveau : 6ème → 5ème → 4ème → ...
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_progression (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  class_id     TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  next_class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,  -- ordre dans le cursus
  UNIQUE(class_id)
);

CREATE INDEX IF NOT EXISTS idx_class_progression ON class_progression(class_id);

-- ------------------------------------------------------------------
-- VUE — Récapitulatif passage / migration pour admin
-- Affiche pour l'année sélectionnée : élèves par classe avec statut
-- et nombre de redoublement.
-- ------------------------------------------------------------------
CREATE OR REPLACE VIEW v_student_progress AS
SELECT
  sp.id AS progress_id,
  sp.status,
  sp.repeat_count,
  sp.general_average,
  sp.comment,
  s.id AS student_id,
  s.matricule,
  u.first_name,
  u.last_name,
  c.id AS class_id,
  c.name AS class_name,
  nc.id AS next_class_id,
  nc.name AS next_class_name,
  ay.id AS academic_year_id,
  ay.name AS academic_year_name
FROM student_progress sp
LEFT JOIN students s ON s.id = sp.student_id
LEFT JOIN users u ON u.id = s.user_id
LEFT JOIN classes c ON c.id = sp.class_id
LEFT JOIN classes nc ON nc.id = sp.next_class_id
LEFT JOIN academic_years ay ON ay.id = sp.academic_year_id;

-- ------------------------------------------------------------------
-- Fonction — Initialiser automatiquement le statut en fin d'année
-- Crée une entrée `pending` pour chaque élève de chaque classe
-- si elle n'existe pas déjà (pour préparer le passage).
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prepare_student_progress(p_year_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_enr RECORD;
BEGIN
  FOR v_enr IN
    SELECT
      se.id,
      se.student_id,
      se.class_id,
      se.academic_year_id
    FROM student_enrollments se
    WHERE se.academic_year_id = p_year_id
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM student_progress
      WHERE student_id = v_enr.student_id
        AND academic_year_id = v_enr.academic_year_id
    ) THEN
      INSERT INTO student_progress (student_id, academic_year_id, class_id, status, repeat_count)
      VALUES (v_enr.student_id, v_enr.academic_year_id, v_enr.class_id, 'pending', 0);
      v_count := v_count + 1;
    END IF;
  END LOOP;
  RETURN v_count;
END;
$$;

-- ------------------------------------------------------------------
-- Fonction — Migrer une classe entière vers la classe suivante
-- crée les inscriptions pour l'année suivante (prochaine année scolaire)
-- garde le matricule, données vierges nouvelle année (nouveau academic_year_id)
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION migrate_class_to_next_year(
  p_class_id TEXT,          -- classe actuelle
  p_current_year_id TEXT,   -- année actuelle
  p_next_year_id TEXT,      -- année suivante
  p_next_class_id TEXT,     -- classe de destination (optionel — sinon auto)
  p_status_filter TEXT DEFAULT 'admis'  -- uniquement les admis par défaut
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_migrated INTEGER := 0;
  v_next_class TEXT := p_next_class_id;
  v_enr RECORD;
BEGIN
  -- Si pas de classe cible, utiliser la progression définie
  IF v_next_class IS NULL THEN
    SELECT next_class_id INTO v_next_class
    FROM class_progression
    WHERE class_id = p_class_id;
  END IF;

  -- Si toujours pas de classe cible, activer le mapping automatique
  -- par ordre de nom (6ème A → 5ème A, 5ème → 4ème...) en ignorant les préfixes
  IF v_next_class IS NULL THEN
    SELECT id INTO v_next_class
    FROM classes
    WHERE id <> p_class_id
      AND academic_year_id = p_next_year_id
    ORDER BY name
    LIMIT 1;
  END IF;

  IF v_next_class IS NULL THEN
    RAISE NOTICE 'Aucune classe de destination trouvée pour la migration.';
    RETURN 0;
  END IF;

  -- Migrer chaque élève inscrit dans cette classe avec le statut voulu
  FOR v_enr IN
    SELECT
      se.student_id
    FROM student_enrollments se
    WHERE se.class_id = p_class_id
      AND se.academic_year_id = p_current_year_id
      AND se.status = 'active'
      AND (
        p_status_filter IS NULL OR p_status_filter = '' OR
        EXISTS (
          SELECT 1 FROM student_progress sp
          WHERE sp.student_id = se.student_id
            AND sp.academic_year_id = p_current_year_id
            AND sp.status = p_status_filter
        )
      )
  LOOP
    -- Inscrire dans la classe suivante pour l'année suivante (si pas déjà)
    IF NOT EXISTS (
      SELECT 1 FROM student_enrollments
      WHERE student_id = v_enr.student_id
        AND academic_year_id = p_next_year_id
        AND class_id = v_next_class
        AND status = 'active'
    ) THEN
      INSERT INTO student_enrollments (
        id, student_id, class_id, academic_year_id, enrollment_date, status
      ) VALUES (
        'enr-' || gen_random_uuid()::TEXT,
        v_enr.student_id,
        v_next_class,
        p_next_year_id,
        NOW(),
        'active'
      )
      ON CONFLICT DO NOTHING;
      v_migrated := v_migrated + 1;
    END IF;
  END LOOP;

  -- Mettre à jour la classe de destination dans student_progress
  UPDATE student_progress
  SET next_class_id = v_next_class
  WHERE class_id = p_class_id
    AND academic_year_id = p_current_year_id
    AND status = p_status_filter;

  RETURN v_migrated;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION prepare_student_progress(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION migrate_class_to_next_year(TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT SELECT ON v_student_progress TO service_role;
GRANT SELECT ON v_student_progress TO authenticated;

-- ============================================================
-- FIN — 22-passage-annee.sql
-- ============================================================