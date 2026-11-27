-- ============================================================
-- AL-BAYAAN — 04. Élèves, Parents et Inscriptions
-- Tables élèves/parents liées à users
-- ============================================================

-- Profil élève (lié à users)
CREATE TABLE IF NOT EXISTS students (
  id                 TEXT PRIMARY KEY,
  matricule          TEXT NOT NULL UNIQUE,
  date_of_birth      TIMESTAMPTZ,
  gender             TEXT,
  address            TEXT,
  photo_url          TEXT,
  status             student_status NOT NULL DEFAULT 'active',
  registration_date  TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id            TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  school_id          TEXT REFERENCES schools(id) ON DELETE SET NULL,
  parent_id          TEXT, -- FK vers parents ajoutée après création de la table
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profil parent (lié à users)
CREATE TABLE IF NOT EXISTS parents (
  id         TEXT PRIMARY KEY,
  full_name  TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  user_id    TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK : Parent de l'élève
ALTER TABLE students
  ADD CONSTRAINT fk_student_parent
  FOREIGN KEY (parent_id)
  REFERENCES parents(id)
  ON DELETE SET NULL;

-- Inscription élève → Classe → Année scolaire
CREATE TABLE IF NOT EXISTS student_enrollments (
  id               TEXT PRIMARY KEY,
  enrollment_date  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status           student_status NOT NULL DEFAULT 'active',
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id         TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON student_enrollments(class_id);