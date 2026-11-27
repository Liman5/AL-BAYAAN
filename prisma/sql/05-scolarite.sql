-- ============================================================
-- AL-BAYAAN — 05. Scolarité
-- Devoirs, Présence, Notes, Rapports/Bulletins
-- ============================================================

-- Devoir (Homework)
CREATE TABLE IF NOT EXISTS homeworks (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  subject        TEXT NOT NULL,
  status         homework_status NOT NULL DEFAULT 'published',
  published_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date       TIMESTAMPTZ NOT NULL,
  class_id       TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id     TEXT NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  attachment_url TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_homeworks_class_due ON homeworks(class_id, due_date);

-- Enregistrement de présence (Appel)
CREATE TABLE IF NOT EXISTS attendance_records (
  id               TEXT PRIMARY KEY,
  status           attendance_status NOT NULL,
  date             DATE NOT NULL,
  comment          TEXT,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id         TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id       TEXT NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Anti-doublon : un seul appel par élève + classe + date + année
  UNIQUE(student_id, class_id, date, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance_records(class_id, date);

-- Note d'élève
CREATE TABLE IF NOT EXISTS student_grades (
  id               TEXT PRIMARY KEY,
  grade            FLOAT NOT NULL, -- Note /20
  coefficient      FLOAT NOT NULL DEFAULT 1,
  grade_type       grade_type NOT NULL DEFAULT 'devoir',
  grade_date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id         TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id       TEXT NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  subject          TEXT NOT NULL,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  homework_id      TEXT REFERENCES homeworks(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_grades_student_subject_year ON student_grades(student_id, subject, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_subject ON student_grades(class_id, subject);

-- Rapport / Bulletin (par trimestre)
CREATE TABLE IF NOT EXISTS reports (
  id                 TEXT PRIMARY KEY,
  term               term NOT NULL,
  general_average    FLOAT,
  general_remark     TEXT,
  principal_signature TEXT,
  teacher_signature  TEXT,
  printed_at         TIMESTAMPTZ,
  student_id         TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id   TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, term, academic_year_id)
);

-- Lignes du bulletin
CREATE TABLE IF NOT EXISTS report_lines (
  id                   TEXT PRIMARY KEY,
  subject              TEXT NOT NULL,
  teacher_name         TEXT NOT NULL,
  class_assignments    FLOAT,
  homework             FLOAT,
  continuous_assessment FLOAT,
  final_exam           FLOAT,
  average              FLOAT NOT NULL,
  coefficient          FLOAT NOT NULL,
  remark               TEXT,
  report_id            TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE
);