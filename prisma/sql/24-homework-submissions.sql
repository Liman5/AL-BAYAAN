-- ============================================================
-- AL-BAYAAN — 24. Soumissions de devoirs des élèves
-- Table pour permettre à l'élève d'envoyer sa réponse à un devoir
-- (photo jointe + texte) à son enseignant.
-- ============================================================

CREATE TABLE IF NOT EXISTS homework_submissions (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  homework_id      TEXT NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content          TEXT,                    -- texte de la réponse
  attachment_url   TEXT,                    -- photo/URL du fichier envoyé
  status           TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  grade            NUMERIC(5,2),            -- note donnée par l'enseignant (optionnel)
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(homework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_student ON homework_submissions(student_id);

-- ============================================================
-- FIN — 24-homework-submissions.sql
-- ============================================================