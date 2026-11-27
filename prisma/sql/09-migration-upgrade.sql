-- ============================================================
-- AL-BAYAAN — 09. Migration : ancien schéma → nouveau schéma
-- SI VOUS AVEZ DÉJÀ EXÉCUTÉ l'ancien schéma (avec user_role dans users)
--
-- Ce script convertit votre base EXISTANTE vers la nouvelle architecture :
--   1. Supprime la colonne `role` de la table users
--   2. Supprime l'enum user_role (après avoir migré les données)
--   3. Crée la table admins (table admin SÉPARÉE)
--   4. Migre les utilisateurs admin existants vers la table admins
--
-- ⚠️ À Exécuter UNIQUEMENT si vous avez déjà l'ancien schéma.
-- ⚠️ Si votre base est vide : exécutez 00 → 08 (pas besoin de 09)
-- ============================================================

BEGIN;

-- ============================================================
-- 0. CRÉER LE TYPE admin_level S'IL N'EXISTE PAS
--    (permet d'exécuter ce script sans passer par 00-enums.sql)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_level') THEN
    CREATE TYPE admin_level AS ENUM ('super_admin', 'school_admin');
  END IF;
END $$;

-- Créer aussi announcement_audience s'il manque (pour la migration des annonces)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_audience') THEN
    CREATE TYPE announcement_audience AS ENUM ('admin', 'teacher', 'student', 'parent', 'class');
  END IF;
END $$;

-- ============================================================
-- 1. CRÉER LA TABLE ADMINS (si elle n'existe pas déjà)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id          TEXT PRIMARY KEY,
  matricule   TEXT NOT NULL UNIQUE,
  admin_level admin_level NOT NULL DEFAULT 'school_admin',
  permissions TEXT[] NOT NULL DEFAULT '{dashboard,students,teachers,classes,reports,payments}',
  notes       TEXT,
  user_id     TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  school_id   TEXT REFERENCES schools(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. MIGRER LES UTILISATEURS ADMIN EXISTANTS VERS LA TABLE ADMINS
--    (anciens rôles 'school_admin' et 'super_admin')
--    ⚠️ Seulement si la colonne role existe encore
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    EXECUTE '
      INSERT INTO admins (id, matricule, admin_level, permissions, user_id, school_id)
      SELECT
        ''admin-'' || u.id,
        ''ALB-A-'' || substr(replace(u.id, ''-'', ''''), 1, 8),
        CASE
          WHEN u.role = ''super_admin'' THEN ''super_admin''
          ELSE ''school_admin''
        END::admin_level,
        ''{dashboard,students,teachers,classes,reports,payments}'',
        u.id,
        u.school_id
      FROM users u
      WHERE u.role IN (''school_admin'', ''super_admin'')
        AND NOT EXISTS (SELECT 1 FROM admins a WHERE a.user_id = u.id)
    ';
  END IF;
END $$;

-- ============================================================
-- 3. MIGRER announcements.audience VERS announcement_audience
--    ⚠️ AVANT de supprimer user_role (sinon il reste une dépendance)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'audience'
  ) THEN
    ALTER TABLE announcements
      ALTER COLUMN audience TYPE announcement_audience
      USING audience::text::announcement_audience;
  END IF;
END $$;

-- ============================================================
-- 4. SUPPRIMER LA COLONNE role DE LA TABLE USERS
-- ============================================================
-- ⚠️ Si une contrainte existe sur la colonne role, la supprimer d'abord :
--    ALTER TABLE users DROP CONSTRAINT IF EXISTS "users_role_fkey";
--    ALTER TABLE users DROP CONSTRAINT IF EXISTS "check_users_role";
ALTER TABLE users
  DROP COLUMN IF EXISTS role;

-- ============================================================
-- 5. SUPPRIMER L'ENUM user_role
--    ⚠️ Maintenant que plus aucune colonne ne l'utilise
-- ============================================================
DROP TYPE IF EXISTS user_role;

COMMIT;

-- ✅ Migration terminée : table admins créée, colonne role supprimée de users.
-- Prochaines étapes :
--   - Exécutez 00-enums.sql si announcement_audience manquant
--   - Exécutez 03 → 08 pour recréer les tables si nécessaire
