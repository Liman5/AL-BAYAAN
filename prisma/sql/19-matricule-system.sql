-- ============================================================
-- AL-BAYAAN — 19. Système de matricule automatique
-- Génération automatique des matricules élèves : ALB-2026-0001
-- Connexion par matricule + vérification parent pour reset
-- ============================================================

-- ------------------------------------------------------------------
-- 1. INDEX — Accélérer les recherches par matricule (login, reset)
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_matricule
  ON students(matricule);

-- Index pour la recherche de la prochaine matricule séquentielle
CREATE INDEX IF NOT EXISTS idx_students_matricule_prefix
  ON students(matricule text_pattern_ops);

-- Index pour retrouver les élèves par parent (vérification reset)
CREATE INDEX IF NOT EXISTS idx_students_parent_id
  ON students(parent_id);

-- Index pour retrouver le parent par email/téléphone
CREATE INDEX IF NOT EXISTS idx_parents_email
  ON parents(email);
CREATE INDEX IF NOT EXISTS idx_parents_phone
  ON parents(phone);

-- ------------------------------------------------------------------
-- 2. FONCTION — Générer la prochaine matricule séquentielle
--    Format : ALB-{année}-{numéro 4 chiffres}
--    Vérifie les matricules existantes et trouve le premier numéro libre
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_student_matricule()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  prefix TEXT := 'ALB-' || current_year || '-';
  existing_matricules TEXT[];
  used_numbers INTEGER[] DEFAULT '{}';
  m TEXT;
  num INTEGER;
  next_num INTEGER := 1;
  found INTEGER;
BEGIN
  -- Récupérer toutes les matricules de l'année courante
  SELECT ARRAY_AGG(matricule)
  INTO existing_matricules
  FROM students
  WHERE matricule LIKE prefix || '%';

  -- Si aucune matricule n'existe, commencer à 0001
  IF existing_matricules IS NULL OR array_length(existing_matricules, 1) IS NULL THEN
    RETURN prefix || '0001';
  END IF;

  -- Extraire les numéros existants
  FOREACH m IN ARRAY existing_matricules
  LOOP
    -- Extraire le numéro à la fin (après le dernier '-')
    BEGIN
      num := substring(m FROM 'ALB-\d{4}-(\d+)$')::INTEGER;
      used_numbers := array_append(used_numbers, num);
    EXCEPTION WHEN OTHERS THEN
      -- Ignorer les matricules invalides
      NULL;
    END;
  END LOOP;

  -- Trouver le premier numéro séquentiel libre (1, 2, 3, ...)
  LOOP
    SELECT 1 INTO found FROM unnest(used_numbers) AS n WHERE n = next_num;
    EXIT WHEN found IS NULL;
    next_num := next_num + 1;
  END LOOP;

  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- ------------------------------------------------------------------
-- 3. TRIGGER — Générer automatiquement la matricule à l'insertion
--    Si aucune matricule n'est fournie, la générer automatiquement
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_student_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.matricule IS NULL OR NEW.matricule = '' THEN
    NEW.matricule := generate_student_matricule();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_student_matricule ON students;

CREATE TRIGGER trg_set_student_matricule
  BEFORE INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_student_matricule();

-- ------------------------------------------------------------------
-- 4. CONTRAINTE — Matricule UNIQUE (elle existe déjà mais on la garantit)
-- ------------------------------------------------------------------
-- La contrainte UNIQUE(matricule) est déjà définie dans la table students.
-- Cette requête la recrée si elle n'existe pas.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_matricule_key'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_matricule_key UNIQUE (matricule);
  END IF;
END;
$$;

-- ------------------------------------------------------------------
-- 5. VUE — Liste des élèves avec leurs parents (pour vérification)
--    Facilite la vérification parent pour le reset de mot de passe
-- ------------------------------------------------------------------
CREATE OR REPLACE VIEW v_students_with_parents AS
SELECT
  s.id AS student_id,
  s.matricule,
  s.user_id AS student_user_id,
  s.status AS student_status,
  u_student.email AS student_email,
  u_student.first_name AS student_first_name,
  u_student.last_name AS student_last_name,
  p.id AS parent_id,
  p.full_name AS parent_name,
  p.email AS parent_email,
  p.phone AS parent_phone,
  p.user_id AS parent_user_id,
  u_parent.email AS parent_user_email
FROM students s
LEFT JOIN users u_student ON u_student.id = s.user_id
LEFT JOIN parents p ON p.id = s.parent_id
LEFT JOIN users u_parent ON u_parent.id = p.user_id;

-- ------------------------------------------------------------------
-- 6. FONCTION — Vérifier l'identité du parent pour réinitialisation
--    Retourne TRUE si l'email ou le téléphone correspond au parent
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_parent_identity(
  p_matricule TEXT,
  p_parent_email TEXT DEFAULT NULL,
  p_parent_phone TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_email TEXT;
  v_parent_phone TEXT;
  v_parent_user_email TEXT;
  v_result BOOLEAN := FALSE;
BEGIN
  -- Trouver les infos du parent de l'élève
  SELECT
    p.email,
    p.phone,
    u.email
  INTO
    v_parent_email,
    v_parent_phone,
    v_parent_user_email
  FROM students s
  LEFT JOIN parents p ON p.id = s.parent_id
  LEFT JOIN users u ON u.id = p.user_id
  WHERE s.matricule = p_matricule;

  -- Vérifier l'email ou le téléphone
  IF p_parent_email IS NOT NULL AND p_parent_email <> '' THEN
    IF v_parent_email = p_parent_email
       OR LOWER(v_parent_email) = LOWER(p_parent_email)
       OR LOWER(v_parent_user_email) = LOWER(p_parent_email) THEN
      v_result := TRUE;
    END IF;
  END IF;

  IF NOT v_result AND p_parent_phone IS NOT NULL AND p_parent_phone <> '' THEN
    -- Comparer en ignorant les espaces
    IF v_parent_phone = p_parent_phone
       OR REPLACE(v_parent_phone, ' ', '') = REPLACE(p_parent_phone, ' ', '') THEN
      v_result := TRUE;
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

-- ------------------------------------------------------------------
-- 7. GRANTS — Autoriser l'utilisation des fonctions
-- ------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION generate_student_matricule() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_student_matricule() TO service_role;
GRANT EXECUTE ON FUNCTION verify_parent_identity(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_parent_identity(TEXT, TEXT, TEXT) TO service_role;
GRANT SELECT ON v_students_with_parents TO authenticated;
GRANT SELECT ON v_students_with_parents TO service_role;

-- ------------------------------------------------------------------
-- 8. Test rapide de la fonction de génération
--    Exécuter pour voir la prochaine matricule qui sera générée
-- ------------------------------------------------------------------
-- SELECT generate_student_matricule() AS next_matricule;

-- ============================================================
-- FIN — 19-matricule-system.sql
-- ============================================================