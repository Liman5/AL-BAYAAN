-- ============================================================
-- AL-BAYAAN — 08. Données initiales (Seed)
-- À exécuter APRÈS les fichiers 00 → 07
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

-- ============================================================
-- UTILISATEURS (table commune SANS rôle)
-- Mot de passe : admin123 / teacher123 / student123 / parent123
-- NOTE : les hashs ci-dessous sont fictifs — régénérer avec bcrypt
-- ============================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, status, school_id) VALUES
  ('user-admin',    'admin@school.com',    'HASH_ADMIN_PLACEHOLDER',    'Admin',    'School',   'active', 'school-1'),
  ('user-teacher-1','teacher@school.com',  'HASH_TEACHER_PLACEHOLDER',  'Imane',    'Mahmoud',  'active', 'school-1'),
  ('user-student-1','student@school.com',  'HASH_STUDENT_PLACEHOLDER',  'Youssef',  'Ait',      'active', 'school-1'),
  ('user-parent-1', 'parent@school.com',   'HASH_PARENT_PLACEHOLDER',   'Karim',    'El Amrani','active', 'school-1')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROFIL ADMINISTRATEUR (table séparée)
-- ============================================================
INSERT INTO admins (id, matricule, admin_level, permissions, user_id, school_id) VALUES
  ('admin-1', 'ALB-A-001', 'school_admin', '{dashboard,students,teachers,classes,reports,payments}', 'user-admin', 'school-1')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROFIL ENSEIGNANT (table séparée)
-- ============================================================
INSERT INTO teacher_profiles (id, matricule, hire_date, status, subjects, user_id, school_id) VALUES
  ('teacher-1', 'ALB-T-001', '2020-09-01', 'active', '{Mathématiques, Sciences}', 'user-teacher-1', 'school-1')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROFIL ÉLÈVE (table séparée)
-- ============================================================
INSERT INTO students (id, matricule, date_of_birth, gender, status, user_id, school_id) VALUES
  ('student-1', 'ALB-2024-001', '2009-06-15', 'M', 'active', 'user-student-1', 'school-1')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PROFIL PARENT (table séparée)
-- ============================================================
INSERT INTO parents (id, full_name, phone, email, user_id) VALUES
  ('parent-1', 'Karim El Amrani', '+212600000001', 'parent@school.com', 'user-parent-1')
ON CONFLICT (id) DO NOTHING;

-- Lier parent → élève
UPDATE students SET parent_id = 'parent-1' WHERE id = 'student-1';

-- ============================================================
-- CLASSES ET AFFECTATIONS
-- ============================================================
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

-- ============================================================
-- EXEMPLES SCOLARITÉ
-- ============================================================
-- Devoir exemple
INSERT INTO homeworks (id, title, description, subject, status, published_date, due_date, class_id, teacher_id, academic_year_id) VALUES
  ('hw-1', 'Devoir sur les fractions', 'Résoudre les exercices du chapitre 3', 'Mathématiques', 'published', now(), '2026-06-15', 'class-1', 'teacher-1', 'ay-2025-2026')
ON CONFLICT (id) DO NOTHING;

-- Note exemple
INSERT INTO student_grades (id, grade, coefficient, grade_type, grade_date, student_id, class_id, teacher_id, subject, academic_year_id) VALUES
  ('grade-1', 16, 1, 'devoir', now(), 'student-1', 'class-1', 'teacher-1', 'Mathématiques', 'ay-2025-2026')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ANNONCES
-- ============================================================
INSERT INTO announcements (id, title, message, audience, class_id) VALUES
  ('ann-1', 'Rentrée scolaire', 'La rentrée aura lieu le 5 septembre. Préparez vos fournitures.', 'student', 'class-1'),
  ('ann-2', 'Réunion parents-professeurs', 'La réunion aura lieu le 20 octobre à 18h.', 'parent', NULL)
ON CONFLICT (id) DO NOTHING;