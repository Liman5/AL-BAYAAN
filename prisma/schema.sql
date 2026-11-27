-- ============================================================
-- AL-BAYAAN — Script SQL PostgreSQL
-- Plateforme institutionnelle scolaire
-- ============================================================
-- Exécution : psql -U postgres -d al_bayan -f prisma/schema.sql
--            (ou via pgAdmin / Supabase SQL Editor)
-- ============================================================

-- ---------- ENUMÉRATIONS ----------

CREATE TYPE user_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student', 'parent');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE student_status AS ENUM ('pending', 'active', 'transferred', 'graduated', 'inactive');
CREATE TYPE teacher_status AS ENUM ('pending', 'active', 'on_leave', 'inactive');
CREATE TYPE class_level AS ENUM ('primary', 'middle_school', 'high_school');
CREATE TYPE academic_year_status AS ENUM ('previous', 'current', 'upcoming');
CREATE TYPE term AS ENUM ('first', 'second', 'third');
CREATE TYPE assessment_type AS ENUM ('class_assignments', 'homework', 'continuous_assessment', 'final_exam');
CREATE TYPE grade_type AS ENUM ('devoir', 'interrogation', 'examen');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'unpaid', 'pending');
CREATE TYPE payment_method AS ENUM ('cash', 'check', 'transfer', 'card');
CREATE TYPE homework_status AS ENUM ('draft', 'published', 'closed');

-- ---------- TABLES ----------

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

-- Utilisateur / Compte
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  role          user_role NOT NULL,
  status        user_status NOT NULL DEFAULT 'active',
  phone         TEXT,
  avatar_url    TEXT,
  school_id     TEXT REFERENCES schools(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
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

-- Classe
CREATE TABLE IF NOT EXISTS classes (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  level            class_level NOT NULL,
  room_number      TEXT,
  description      TEXT,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_teacher_id TEXT, -- FK vers teachers_profiles ajoutée après création de la table
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);

-- Profil enseignant
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id          TEXT PRIMARY KEY,
  matricule   TEXT NOT NULL UNIQUE,
  hire_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      teacher_status NOT NULL DEFAULT 'active',
  subjects    TEXT[] NOT NULL DEFAULT '{}',
  specializations TEXT[] NOT NULL DEFAULT '{}',
  notes       TEXT,
  user_id     TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK manquante : class_teacher_id
ALTER TABLE classes
  ADD CONSTRAINT fk_class_teacher
  FOREIGN KEY (class_teacher_id)
  REFERENCES teacher_profiles(id)
  ON DELETE SET NULL;

-- Profil élève
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

-- Profil parent
CREATE TABLE IF NOT EXISTS parents (
  id         TEXT PRIMARY KEY,
  full_name  TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  user_id    TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK manquante : students.parent_id
ALTER TABLE students
  ADD CONSTRAINT fk_student_parent
  FOREIGN KEY (parent_id)
  REFERENCES parents(id)
  ON DELETE SET NULL;

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
  UNIQUE(student_id, class_id, date, academic_year_id) -- Anti-doublon
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

-- Paiement élève
CREATE TABLE IF NOT EXISTS student_payments (
  id               TEXT PRIMARY KEY,
  total_amount     FLOAT NOT NULL,
  paid_amount      FLOAT NOT NULL DEFAULT 0,
  status           payment_status NOT NULL DEFAULT 'unpaid',
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year_id)
);

-- Paiement enseignant (rémunération)
CREATE TABLE IF NOT EXISTS teacher_payments (
  id               TEXT PRIMARY KEY,
  expected_salary  FLOAT NOT NULL,
  paid_amount      FLOAT NOT NULL DEFAULT 0,
  status           payment_status NOT NULL DEFAULT 'unpaid',
  teacher_id       TEXT NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, academic_year_id)
);

-- Transaction de paiement
CREATE TABLE IF NOT EXISTS payment_transactions (
  id                 TEXT PRIMARY KEY,
  amount             FLOAT NOT NULL,
  date               TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference          TEXT NOT NULL UNIQUE,
  method             payment_method NOT NULL DEFAULT 'cash',
  period             TEXT, -- ex: "Janvier 2026"
  student_payment_id TEXT REFERENCES student_payments(id) ON DELETE CASCADE,
  teacher_payment_id TEXT REFERENCES teacher_payments(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON payment_transactions(student_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_teacher ON payment_transactions(teacher_payment_id);

-- Annonce
CREATE TABLE IF NOT EXISTS announcements (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  audience   user_role NOT NULL,
  class_id   TEXT REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DONNÉES INITIALES (SEED)
-- ============================================================

-- Années scolaires
INSERT INTO academic_years (id, name, start_date, end_date, status, is_active) VALUES
  ('ay-2024-2025', '2024-2025', '2024-09-01', '2025-07-01', 'previous', false),
  ('ay-2025-2026', '2025-2026', '2025-09-01', '2026-07-01', 'current', true),
  ('ay-2026-2027', '2026-2027', '2026-09-01', '2027-07-01', 'upcoming', false)
ON CONFLICT (name) DO NOTHING;

-- École
INSERT INTO schools (id, name, slug, address, phone, email) VALUES
  ('school-1', 'AL-BAYAAN', 'al-bayaan', 'Adresse de l''école', '+213 555 000 000', 'contact@albayan.edu')
ON CONFLICT (id) DO NOTHING;

-- Comptes utilisateurs (mot de passe : admin123 / teacher123 etc.)
-- NOTE : les hashs ci-dessous sont fictifs — régénérer avec bcrypt en production
-- (ex: '$2b$10$...')
INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, school_id) VALUES
  ('user-admin',    'admin@school.com',    'HASH_ADMIN_PLACEHOLDER',    'Admin',    'School',   'school_admin', 'active', 'school-1'),
  ('user-teacher-1','teacher@school.com',  'HASH_TEACHER_PLACEHOLDER',  'Imane',    'Mahmoud',  'teacher',      'active', 'school-1'),
  ('user-student-1','student@school.com',  'HASH_STUDENT_PLACEHOLDER',  'Youssef',  'Ait',      'student',      'active', 'school-1'),
  ('user-parent-1', 'parent@school.com',   'HASH_PARENT_PLACEHOLDER',   'Karim',    'El Amrani','parent',       'active', 'school-1')
ON CONFLICT (id) DO NOTHING;

-- Profils enseignants
INSERT INTO teacher_profiles (id, matricule, hire_date, status, subjects, user_id) VALUES
  ('teacher-1', 'ALB-T-001', '2020-09-01', 'active', '{Mathématiques, Sciences}', 'user-teacher-1')
ON CONFLICT (id) DO NOTHING;

-- Profils élèves
INSERT INTO students (id, matricule, date_of_birth, gender, status, user_id, school_id) VALUES
  ('student-1', 'ALB-2024-001', '2009-06-15', 'M', 'active', 'user-student-1', 'school-1')
ON CONFLICT (id) DO NOTHING;

-- Profils parents
INSERT INTO parents (id, full_name, phone, email, user_id) VALUES
  ('parent-1', 'Karim El Amrani', '+212600000001', 'parent@school.com', 'user-parent-1')
ON CONFLICT (id) DO NOTHING;

-- Lier parent → élève
UPDATE students SET parent_id = 'parent-1' WHERE id = 'student-1';

-- Classes
INSERT INTO classes (id, name, level, room_number, academic_year_id, class_teacher_id) VALUES
  ('class-1', '6ème A', 'middle_school', '301', 'ay-2025-2026', 'teacher-1'),
  ('class-2', '5ème A', 'middle_school', '302', 'ay-2025-2026', 'teacher-1')
ON CONFLICT (id) DO NOTHING;

-- Inscription élève → classe
INSERT INTO student_enrollments (id, student_id, class_id, academic_year_id) VALUES
  ('enroll-1', 'student-1', 'class-1', 'ay-2025-2026')
ON CONFLICT (id) DO NOTHING;

-- Affectation enseignant → classe → matière
INSERT INTO class_assignments (id, subject, teacher_id, class_id, academic_year_id) VALUES
  ('assign-1', 'Mathématiques', 'teacher-1', 'class-1', 'ay-2025-2026')
ON CONFLICT (id) DO NOTHING;