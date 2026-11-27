-- ============================================================
-- 29. Genre des enseignants
-- Permet d'afficher « Enseignant » ou « Enseignante » selon le sexe.
-- ============================================================

ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS gender TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teacher_profiles_gender_check'
  ) THEN
    ALTER TABLE teacher_profiles
      ADD CONSTRAINT teacher_profiles_gender_check
      CHECK (gender IN ('M', 'F') OR gender IS NULL);
  END IF;
END
$$;
