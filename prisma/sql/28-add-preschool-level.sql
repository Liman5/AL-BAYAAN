-- ============================================================
-- 28. Ajouter le niveau "preschool" (Maternelle) à class_level
-- Nécessaire pour créer les classes de la crèche/maternelle.
-- ============================================================

ALTER TYPE class_level ADD VALUE IF NOT EXISTS 'preschool';
