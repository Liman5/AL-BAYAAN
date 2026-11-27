-- ============================================================
-- AL-BAYAAN — 01. Tables de base
-- École, Utilisateurs (sans rôle), Années scolaires
-- ============================================================

-- École (établissement)
CREATE TABLE IF NOT EXISTS schools (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  address    TEXT,
  phone      TEXT,
  email      TEXT,
  logo_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Utilisateur / Compte (table commune — SANS rôle)
-- Le rôle est déterminé par la table de profil liée :
-- admins, teacher_profiles, students, parents
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  status        user_status NOT NULL DEFAULT 'active',
  phone         TEXT,
  avatar_url    TEXT,
  school_id     TEXT REFERENCES schools(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);

-- Année scolaire
CREATE TABLE IF NOT EXISTS academic_years (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE, -- "2024-2025"
  start_date TIMESTAMPTZ NOT NULL,
  end_date   TIMESTAMPTZ NOT NULL,
  status     academic_year_status NOT NULL DEFAULT 'current',
  is_active  BOOLEAN NOT NULL DEFAULT false
);