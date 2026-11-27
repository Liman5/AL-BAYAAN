-- ============================================================
-- AL-BAYAAN — 12. Migration : ajouter les colonnes manquantes
--
-- ⚠️ À exécuter UNE FOIS dans le SQL Editor de Supabase
-- si votres tables ont été créées avec un schéma antérieur
-- qui ne contient pas la colonne school_id.
--
-- Ce script ajoute school_id aux tables de profils si absent.
-- ============================================================

-- ---- teacher_profiles : ajouter school_id si absent ----
ALTER TABLE IF EXISTS teacher_profiles
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL;

-- ---- students : ajouter school_id si absent ----
ALTER TABLE IF EXISTS students
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL;

-- ---- admins : ajouter school_id si absent ----
ALTER TABLE IF EXISTS admins
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL;

-- ---- users : ajouter school_id si absent ----
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL;

-- ---- parents : ajouter school_id si absent (cohérence) ----
ALTER TABLE IF EXISTS parents
  ADD COLUMN IF NOT EXISTS school_id TEXT REFERENCES schools(id) ON DELETE SET NULL;

-- ✅ Colonnes school_id ajoutées avec succès si elles étaient manquantes !