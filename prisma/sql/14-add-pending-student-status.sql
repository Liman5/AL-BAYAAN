-- ============================================================
-- AL-BAYAAN — 14. Ajouter 'pending' à student_status
--
-- ⚠️ CRITIQUE : L'inscription des élèves utilise status='pending',
--    mais l'enum student_status ne contient pas cette valeur.
--    Sans ce correctif, l'API d'inscription échoue avec :
--    "invalid input value for enum student_status: \"pending\""
-- ============================================================

-- Ajouter 'pending' à l'enum student_status
ALTER TYPE student_status ADD VALUE IF NOT EXISTS 'pending';

-- Mettre à jour la valeur par défaut de students.status
ALTER TABLE students ALTER COLUMN status SET DEFAULT 'active';

-- ✅ 'pending' ajouté à l'enum student_status !