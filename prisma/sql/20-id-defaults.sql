-- ============================================================
-- AL-BAYAAN — 20. DEFAULT id pour tables critiques
-- Évite l'erreur "null value in column id violates not-null"
-- sur les tables où les insertions peuvent ne pas fournir d'id.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tables critiques où l'API insère sans id explicite parfois
ALTER TABLE class_assignments ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;
ALTER TABLE student_enrollments ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;
ALTER TABLE students ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;
ALTER TABLE parents ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;
ALTER TABLE teacher_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;
ALTER TABLE classes ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

-- ============================================================
-- FIN — 20-id-defaults.sql
-- ============================================================