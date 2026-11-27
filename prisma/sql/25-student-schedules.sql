-- ============================================================
-- AL-BAYAAN — 25. Emploi du temps personnel de l'élève
-- L'élève définit lui-même son emploi du temps.
-- ============================================================

CREATE TABLE IF NOT EXISTS student_schedules (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
  day_of_week      TEXT NOT NULL,   -- Lundi, Mardi, ...
  start_time       TEXT NOT NULL,
  end_time         TEXT NOT NULL,
  subject          TEXT NOT NULL,
  room_number      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_schedules_student ON student_schedules(student_id);

-- ============================================================
-- FIN — 25-student-schedules.sql
-- ============================================================