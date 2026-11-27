-- ============================================================
-- AL-BAYAAN — 13. Permissions (GRANTS) pour Supabase
--
-- ⚠️ CRITIQUE : Sans ces GRANT, les politiques RLS ne suffisent PAS.
--    Les requêtes du client Supabase (clé anon) échouent avec
--    "permission denied for table ..." car le rôle `authenticated`
--    n'a pas les permissions de base.
--
-- À exécuter APRÈS 10-rls-policies.sql
-- ============================================================

-- ============================================================
-- 1. Rôle "authenticated" (utilisateur connecté via Supabase Auth)
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;

-- Lecture (SELECT) sur toutes les tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Insertion/Mise à jour sur users (nécessaire pour le profil)
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- ============================================================
-- 2. Rôle "anon" (visiteur non connecté)
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon;

-- Lecture sur schools (pour la page publique)
GRANT SELECT ON public.schools TO anon;

-- ============================================================
-- 3. Privilèges par défaut pour les futures tables
-- ============================================================
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT INSERT, UPDATE ON TABLES TO authenticated;

-- ============================================================
-- 4. Fonctions RPC (déjà fait dans 10-rls-policies.sql)
--    On re-grant par sécurité
-- ============================================================
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- ✅ Permissions accordées avec succès !