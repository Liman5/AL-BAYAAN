-- ============================================================
-- AL-BAYAAN — 02. Administrateurs
-- Table admin SÉPARÉE de la table users
-- ============================================================

-- Profil administrateur
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