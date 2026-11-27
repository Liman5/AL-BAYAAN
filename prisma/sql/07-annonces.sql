-- ============================================================
-- AL-BAYAAN — 07. Annonces
-- ============================================================

CREATE TABLE IF NOT EXISTS announcements (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  audience   announcement_audience NOT NULL DEFAULT 'student',
  class_id   TEXT REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);