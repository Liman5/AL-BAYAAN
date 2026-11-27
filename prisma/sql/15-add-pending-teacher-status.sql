-- ============================================================
-- AL-BAYAAN — 15. Ajouter 'pending' à teacher_status
--
-- ⚠️ CRITIQUE : L'inscription des enseignants doit passer par
--    un workflow d'approbation. L'enseignant est créé avec
--    status='pending' puis approuvé par l'administrateur.
--    Sans cette valeur, l'API d'inscription échoue avec :
--    "invalid input value for enum teacher_status: \"pending\""
-- ============================================================

-- Ajouter 'pending' à l'enum teacher_status
ALTER TYPE teacher_status ADD VALUE IF NOT EXISTS 'pending';

-- Mettre à jour la valeur par défaut de teacher_profiles.status
ALTER TABLE teacher_profiles ALTER COLUMN status SET DEFAULT 'active';

-- ✅ 'pending' ajouté à l'enum teacher_status !