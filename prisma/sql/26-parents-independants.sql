-- ============================================================
-- AL-BAYAAN — 26. Parents indépendants
-- Les infos parents sont enregistrées sur la fiche élève
-- sans exiger de compte parent préalable
-- ============================================================

-- Permettre aux parents d'être enregistrés SANS compte utilisateur
-- (les infos sont stockées sur la fiche élève)
ALTER TABLE parents
  ALTER COLUMN user_id DROP NOT NULL;