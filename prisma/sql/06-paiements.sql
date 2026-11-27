-- ============================================================
-- AL-BAYAAN — 06. Paiements
-- Paiements élèves, rémunérations enseignants, transactions
-- ============================================================

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

-- Transaction de paiement (élève ou enseignant)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id                 TEXT PRIMARY KEY,
  amount             FLOAT NOT NULL,
  date               TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference          TEXT NOT NULL UNIQUE,
  method             payment_method NOT NULL DEFAULT 'cash',
  period             TEXT, -- ex: "Janvier 2026"
  student_payment_id TEXT REFERENCES student_payments(id) ON DELETE CASCADE,
  teacher_payment_id TEXT REFERENCES teacher_payments(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (student_payment_id IS NOT NULL AND teacher_payment_id IS NULL)
    OR
    (student_payment_id IS NULL AND teacher_payment_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON payment_transactions(student_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_teacher ON payment_transactions(teacher_payment_id);