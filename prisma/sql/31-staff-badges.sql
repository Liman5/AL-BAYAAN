-- ============================================================
-- AL-BAYAAN — 31. Badges QR du personnel (enseignants + administration)
--
-- Étend le système de pointage aux adultes de l'établissement :
--   * enseignants  (teacher_profiles)
--   * administration (admins : direction, secrétariat…)
--
-- Aucun impact sur les données existantes :
--   * `student_badges` reste inchangée ;
--   * `terminal_attendance_events` reçoit des colonnes optionnelles
--     et son `student_id` devient nullable (les pointages du personnel
--     utilisent `staff_user_id`).
-- ============================================================

-- ------------------------------------------------------------
-- 1. BADGES DU PERSONNEL
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff_badges (
  id                TEXT PRIMARY KEY,

  -- Personne concernée : toujours un `users.id` (les deux profils
  -- teacher_profiles et admins y sont rattachés).
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_type        TEXT NOT NULL,
  staff_profile_id  TEXT,

  school_id         TEXT REFERENCES schools(id) ON DELETE SET NULL,
  academic_year_id  TEXT REFERENCES academic_years(id) ON DELETE SET NULL,

  token             TEXT NOT NULL,
  token_sha256      TEXT NOT NULL,
  token_prefix      TEXT NOT NULL,

  status            TEXT NOT NULL DEFAULT 'active',
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  issued_by         TEXT,
  revoked_at        TIMESTAMPTZ,
  revoked_reason    TEXT,
  replaced_by       TEXT,

  printed_count     INTEGER NOT NULL DEFAULT 0,
  last_printed_at   TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT staff_badges_type_check
    CHECK (staff_type IN ('teacher', 'admin')),
  CONSTRAINT staff_badges_status_check
    CHECK (status IN ('active', 'revoked', 'replaced')),
  CONSTRAINT staff_badges_token_len_check
    CHECK (char_length(token) >= 32)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_badges_token
  ON staff_badges (token);
CREATE INDEX IF NOT EXISTS idx_staff_badges_sha
  ON staff_badges (token_sha256);
CREATE INDEX IF NOT EXISTS idx_staff_badges_user
  ON staff_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_staff_badges_status
  ON staff_badges (status);

-- Un seul badge actif par personne et par année scolaire.
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_badges_one_active
  ON staff_badges (user_id, COALESCE(academic_year_id, 'none'))
  WHERE status = 'active';

-- ------------------------------------------------------------
-- 2. POINTAGES : ouverture aux membres du personnel
-- ------------------------------------------------------------
ALTER TABLE terminal_attendance_events
  ADD COLUMN IF NOT EXISTS person_type TEXT NOT NULL DEFAULT 'student';

ALTER TABLE terminal_attendance_events
  ADD COLUMN IF NOT EXISTS staff_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- Un pointage de personnel n'a pas de `students.id`.
ALTER TABLE terminal_attendance_events
  ALTER COLUMN student_id DROP NOT NULL;

ALTER TABLE terminal_attendance_events
  DROP CONSTRAINT IF EXISTS terminal_attendance_status_check;

ALTER TABLE terminal_attendance_events
  ADD CONSTRAINT terminal_attendance_status_check
  CHECK (status IN ('present', 'late'));

ALTER TABLE terminal_attendance_events
  DROP CONSTRAINT IF EXISTS terminal_attendance_person_type_check;

ALTER TABLE terminal_attendance_events
  ADD CONSTRAINT terminal_attendance_person_type_check
  CHECK (person_type IN ('student', 'staff'));

-- Unicité : un seul pointage par personne, par jour et par session.
-- Les index sont partiels car `student_id` et `staff_user_id` sont
-- mutuellement exclusifs.
DROP INDEX IF EXISTS idx_terminal_attendance_unique_session;

CREATE UNIQUE INDEX IF NOT EXISTS idx_terminal_attendance_unique_student
  ON terminal_attendance_events (student_id, local_date, session)
  WHERE student_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_terminal_attendance_unique_staff
  ON terminal_attendance_events (staff_user_id, local_date, session)
  WHERE staff_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_terminal_attendance_staff
  ON terminal_attendance_events (staff_user_id, local_date);

-- ------------------------------------------------------------
-- 3. SÉCURITÉ
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS staff_badges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_badges FROM anon, authenticated;

-- ✅ Migration 31 appliquée.
