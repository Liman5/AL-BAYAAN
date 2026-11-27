-- ============================================================
-- AL-BAYAAN — 23. Premier mot de passe élève
-- Ajoute la colonne first_login_done à students
-- À la première connexion par matricule, le mot de passe saisi
-- devient le premier mot de passe de l'élève.
-- ============================================================

-- Ajouter la colonne si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'first_login_done'
  ) THEN
    ALTER TABLE students ADD COLUMN first_login_done BOOLEAN NOT NULL DEFAULT false;
  END IF;
END;
$$;

-- ============================================================
-- FIN — 23-first-login.sql
-- ============================================================