-- ============================================================
-- AL-BAYAAN — Exécution complète du schéma
-- Applique tous les fichiers SQL dans le bon ordre.
--
-- Pour l'utiliser avec psql :
--   psql -U postgres -d al_bayan -f prisma/sql/run_all.sql
--
-- Ou via Supabase SQL Editor : copier le contenu de chaque fichier
-- dans l'ordre ci-dessous.
-- ============================================================

\begin

-- 00. Énumérations
\i 00-enums.sql

-- 01. Tables de base (école, users SANS rôle, années scolaires)
\i 01-tables-base.sql

-- 02. Administrateurs (table admin séparée)
\i 02-admin.sql

-- 03. Classes et Enseignants
\i 03-classe-enseignants.sql

-- 04. Élèves, Parents et Inscriptions
\i 04-eleves-parents.sql

-- 05. Scolarité (devoirs, présence, notes, rapports)
\i 05-scolarite.sql

-- 06. Paiements
\i 06-paiements.sql

-- 07. Annonces
\i 07-annonces.sql

-- 08. Données initiales
\i 08-data-seed.sql

-- 09. Migration upgrade (si base existante)
-- ⚠️ À exécuter UNIQUEMENT si la base a été créée avec l'ANCIEN schéma (users avec colonne role)
-- \i 09-migration-upgrade.sql

-- 10. Politiques RLS (sécurité row-level)
\i 10-rls-policies.sql

-- 11. Désactiver la confirmation d'email
-- ⚠️ Nécessite une action manuelle dans le dashboard Supabase
-- \i 11-disable-email-confirmation.sql

-- 12. Alter add school_id (si nécessaire)
-- \i 12-alter-add-school-id.sql

-- 13. Permissions GRANT pour Supabase (CRITIQUE pour le login)
\i 13-grants.sql

-- 14. Ajouter 'pending' à l'enum student_status
-- ⚠️ Déjà inclu dans 00-enums.sql pour les nouvelles bases.
--    Ce script est pour les bases EXISTANTES où l'enum a été créé sans 'pending'.
\i 14-add-pending-student-status.sql

-- 15. Ajouter 'pending' à l'enum teacher_status
-- ⚠️ Déjà inclu dans 00-enums.sql pour les nouvelles bases.
--    Ce script est pour les bases EXISTANTES où l'enum a été créé sans 'pending'.
\i 15-add-pending-teacher-status.sql

-- 16. Politiques RLS admin (lire toutes les données)
-- ⚠️ CRITIQUE : sans cela, l'admin ne peut pas voir les demandes
\i 16-admin-select-all.sql

-- 17. Accès données Enseignants (RLS, élèves/présences/notes/classe)
-- ⚠️ CRITIQUE : sans cela, l'enseignant ne peut pas voir les élèves
--    de ses classes ni enregistrer présences/notes.
\i 17-teacher-data-access.sql

-- 18. Emploi du temps (table course_schedules + RLS enseignants)
-- ⚠️ MANQUANT : la table d'emploi du temps n'existait pas dans le schéma initial.
\i 18-course-schedules.sql

-- 19. Système de matricule automatique + reset mot de passe par parent
-- Génération séquentielle ALB-2026-0001, index, fonctions, trigger, vue
-- Nécessaire pour la connexion par matricule et la réinitialisation.
\i 19-matricule-system.sql

-- 20. DEFAULT id pour les tables critiques (gen_random_uuid)
-- Évite l'erreur "null value in column id violates not-null constraint"
-- quand une insertion ne fournit pas d'id explicite.
\i 20-id-defaults.sql

-- 21. SEED : lier enseignants ↔ classes ↔ élèves avec de vraies données
-- Assignations class_assignments + inscriptions student_enrollments
-- pour que les pages enseignants affichent de vraies données (pas de mock).
\i 21-seed-teacher-data.sql

-- 22. Passage d'année / Migration des classes
-- Tables student_progress + class_progression + fonctions de migration
-- Permet : admis → classe suivante, garde matricule, données vierges nouvelle année
\i 22-passage-annee.sql

-- 23. Premier mot de passe élève
-- Colonne first_login_done : à la 1ère connexion, le mdp saisi
-- devient le premier mot de passe de l'élève.
\i 23-first-login.sql

-- 24. Soumissions de devoirs des élèves
-- Table homework_submissions : l'élève envoie sa réponse (photo + texte)
-- à l'enseignant via son espace devoirs.
\i 24-homework-submissions.sql

-- 25. Emploi du temps personnel de l'élève
-- Table student_schedules : l'élève définit son propre emploi du temps.
\i 25-student-schedules.sql

-- 26. Parents indépendants
-- Permet aux parents de créer leur compte et de lier leurs enfants.
\i 26-parents-independants.sql

-- 27. Correctif RLS — récursion infinie
-- Fonctions SECURITY DEFINER + policies simplifiées.
\i 27-fix-rls-recursion.sql

-- 28. Niveau "preschool" (Maternelle) pour les classes
\i 28-add-preschool-level.sql

-- 29. Genre des enseignants (Enseignant / Enseignante)
\i 29-add-teacher-gender.sql

-- 30. Badges QR élèves, terminaux scanners, présence et
--     notifications parentales (outbox serveur).
--     RLS activée, aucun accès anon/authenticated.
\i 30-badges-terminaux.sql

-- 31. Badges QR du personnel (enseignants + administration)
--     et ouverture des pointages aux adultes de l'établissement.
\i 31-staff-badges.sql

\echo '✅ Schéma AL-BAYAAN créé avec succès !'
\echo ''
\echo '⚠️ ÉTAPE SUIVANTE : Après avoir exécuté ce script, lancez le serveur et'
\echo '   cliquez sur "Configurer les comptes démo" sur la page de connexion'
\echo '   pour créer les comptes de démonstration dans Supabase Auth.'
\echo ''

\end
