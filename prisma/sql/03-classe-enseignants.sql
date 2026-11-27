-- ============================================================
-- AL-BAYAAN — 03. Classes et Enseignants
-- ============================================================

-- Classe
CREATE TABLE IF NOT EXISTS classes (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  level            class_level NOT NULL,
  room_number      TEXT,
  description      TEXT,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_teacher_id TEXT, -- FK vers teacher_profiles ajoutée après création de la table
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);

-- Profil enseignant (lié à users)
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id          TEXT PRIMARY KEY,
  matricule   TEXT NOT NULL UNIQUE,
  hire_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      teacher_status NOT NULL DEFAULT 'active',
  subjects    TEXT[] NOT NULL DEFAULT '{}',
  specializations TEXT[] NOT NULL DEFAULT '{}',
  notes       TEXT,
  user_id     TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  school_id   TEXT REFERENCES schools(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK : Enseignant principal de la classe
ALTER TABLE classes
  ADD CONSTRAINT fk_class_teacher
  FOREIGN KEY (class_teacher_id)
  REFERENCES teacher_profiles(id)
  ON DELETE SET NULL;

-- Affectation Enseignant → Classe → Matière
CREATE TABLE IF NOT EXISTS class_assignments (
  id               TEXT PRIMARY KEY,
  subject          TEXT NOT NULL,
  teacher_id       TEXT NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  class_id         TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  start_date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, class_id, subject, academic_year_id)
);