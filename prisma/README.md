# 🗄️ Base de données AL-BAYAAN

Base de données relationnelle PostgreSQL pour la plateforme institutionnelle scolaire **Al Bayan**.

## 📁 Structure des fichiers

```
prisma/
├── schema.prisma          # Schéma Prisma (ORM) — source de vérité
├── seed.ts                # Seed programmatique Prisma
├── README.md              # Ce fichier
└── sql/
    ├── run_all.sql        # 🚀 Script maître — exécute tout dans l'ordre
    ├── 00-enums.sql       # Types ENUM PostgreSQL
    ├── 01-tables-base.sql # École, Users (SANS rôle), Années scolaires
    ├── 02-admin.sql       # 🆕 Table ADMINISTRATEURS séparée
    ├── 03-classe-enseignants.sql # Classes, Enseignants, Affectations
    ├── 04-eleves-parents.sql     # Élèves, Parents, Inscriptions
    ├── 05-scolarite.sql          # Devoirs, Présence, Notes, Rapports
    ├── 06-paiements.sql          # Paiements élèves + enseignants
    ├── 07-annonces.sql           # Annonces scolaires
    ├── 08-data-seed.sql          # Données initiales (seed)
    ├── 17-teacher-data-access.sql # Accès données enseignants (RLS)
    ├── 18-course-schedules.sql    # Emploi du temps
    └── 19-matricule-system.sql    # 🆕 Matricule auto + reset mot de passe
```

## 🆕 Architecture des profils — table users SANS rôle

La table `users` ne contient **plus de colonne `role`**.

Les rôles sont désormais déterminés par la **table de profil liée** :

```
users  ←  1:1  →  admins             (administrateurs)
users  ←  1:1  →  teacher_profiles   (enseignants)
users  ←  1:1  →  students           (élèves)
users  ←  1:1  →  parents            (parents)
```

| Table de profil | Clé unique | Rôle dérivé |
|---|---|---|
| `admins` | `user_id` | `admin_level` : `super_admin` / `school_admin` |
| `teacher_profiles` | `user_id` | Enseignant |
| `students` | `user_id` | Élève |
| `parents` | `user_id` | Parent |

**Avantages** :
- Un utilisateur a **un seul profil** (contrainte `UNIQUE` sur `user_id`)
- Chaque profil a ses propres champs spécifiques (matricule admin, permissions, matières enseignant, parent_id élève, etc.)
- La colonne `role` ne pollue plus la table commune
- Le rôle se détermine par la présence dans la table de profil correspondante

## 🎯 QUOI EXÉCUTER ? (guide rapide)

### Cas 1 : Base VIDE (aucune table créée)
Exécutez **tout dans l'ordre** :
```bash
cd prisma/sql
psql -U postgres -d al_bayan -f 00-enums.sql
psql -U postgres -d al_bayan -f 01-tables-base.sql
psql -U postgres -d al_bayan -f 02-admin.sql
psql -U postgres -d al_bayan -f 03-classe-enseignants.sql
psql -U postgres -d al_bayan -f 04-eleves-parents.sql
psql -U postgres -d al_bayan -f 05-scolarite.sql
psql -U postgres -d al_bayan -f 06-paiements.sql
psql -U postgres -d al_bayan -f 07-annonces.sql
psql -U postgres -d al_bayan -f 08-data-seed.sql
```
Ou en un seul coup : `psql -U postgres -d al_bayan -f run_all.sql`

### Cas 2 : Base DÉJÀ créée avec l'ANCIEN schéma (users avec colonne `role`)
Exécutez **uniquement** :
```bash
cd prisma/sql

# 1. Créer les nouveaux enums (si announcement_audience manquant)
psql -U postgres -d al_bayan -f 00-enums.sql  # ⚠️ peut échouer si les types existent déjà

# 2. MIGRATION : convertit votre base existante (supprime role, crée admins)
psql -U postgres -d al_bayan -f 09-migration-upgrade.sql

# 3. Si la table announcements existait avec l'ancien type :
#    (déjà géré par 09-migration-upgrade.sql)
```
> ✅ Le script `09-migration-upgrade.sql` gère :
> - Création de la table `admins`
> - Migration des données admin depuis `users.role`
> - Suppression de la colonne `role` de `users`
> - Suppression de l'enum `user_role`
> - Migration de l'audience des annonces si nécessaire

### Cas 3 : Base créée avec le NOUVEAU schéma, besoin d'ajouter des données
Exécutez uniquement :
```bash
psql -U postgres -d al_bayan -f 08-data-seed.sql  # Données initiales (si pas déjà fait)
```

---

## 🚀 Installation rapide (base vide)

### Option 1 : SQL séparé (recommandé)

1. **Créer la base de données** :
   ```sql
   CREATE DATABASE al_bayan;
   ```

2. **Exécuter les fichiers dans l'ordre** (depuis le dossier `prisma/sql/`) :
   ```bash
   cd prisma/sql

   # Via psql (tout en un coup) :
   psql -U postgres -d al_bayan -f run_all.sql

   # OU manuellement, dans l'ordre :
   psql -U postgres -d al_bayan -f 00-enums.sql
   psql -U postgres -d al_bayan -f 01-tables-base.sql
   psql -U postgres -d al_bayan -f 02-admin.sql
   psql -U postgres -d al_bayan -f 03-classe-enseignants.sql
   psql -U postgres -d al_bayan -f 04-eleves-parents.sql
   psql -U postgres -d al_bayan -f 05-scolarite.sql
   psql -U postgres -d al_bayan -f 06-paiements.sql
   psql -U postgres -d al_bayan -f 07-annonces.sql
   psql -U postgres -d al_bayan -f 08-data-seed.sql
   ```

3. **Supabase / pgAdmin** : copier-coller le contenu de chaque fichier dans le SQL Editor, dans l'ordre 00 → 08.

### Option 2 : Prisma CLI (migration + client)

1. Installer les dépendances Prisma :
   ```bash
   npm install -D prisma @prisma/client tsx
   ```

2. Définir `DATABASE_URL` dans `.env` (voir `.env.example`)

3. Générer le client :
   ```bash
   npx prisma generate
   ```

4. Migrer la base (création des tables) :
   ```bash
   npx prisma migrate dev --name init
   ```

5. Exécuter le seed :
   ```bash
   npx prisma db seed
   ```

   Ou via npm :
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:migrate
   npm run db:seed
   npm run db:studio
   ```

## 📊 Tables par domaine

### 01 — Structure de base
| Table | Description |
|-------|-------------|
| `schools` | Établissements |
| `users` | Comptes (email, hash, **SANS rôle**) |
| `academic_years` | Années scolaires (`2024-2025`, `2025-2026`, ...) |

### 02 — Administrateurs (🆕 séparée)
| Table | Description |
|-------|-------------|
| `admins` | Profils administrateurs (matricule, `admin_level`, permissions) |

### 03 — Classes et Enseignants
| Table | Description |
|-------|-------------|
| `classes` | Classes (nom, niveau, salle, année scolaire, enseignant titulaire) |
| `teacher_profiles` | Profils enseignants (matricule, matières, statut) |
| `class_assignments` | Enseignant → Classe → Matière → Année scolaire |

### 04 — Élèves, Parents et Inscriptions
| Table | Description |
|-------|-------------|
| `students` | Profils élèves (matricule, statut, parent lié) |
| `parents` | Profils parents |
| `student_enrollments` | Élève → Classe → Année scolaire |

### 05 — Scolarité
| Table | Description |
|-------|-------------|
| `homeworks` | Devoirs donnés (titre, matière, classe, dates, enseignant) |
| `attendance_records` | Appel/présence (statut, date, élève, classe, enseignant) |
| `student_grades` | Notes (/20, type, coefficient, matière, enseignant, devoir lié) |
| `reports` + `report_lines` | Bulletins par trimestre |

### 06 — Paiements
| Table | Description |
|-------|-------------|
| `student_payments` | Paiements élèves (total, payé, statut) |
| `teacher_payments` | Rémunérations enseignants |
| `payment_transactions` | Historique des transactions (référence, méthode, date) |

### 07 — Annonces
| Table | Description |
|-------|-------------|
| `announcements` | Annonces scolaires (audience : `admin`, `teacher`, `student`, `parent`, `class`) |

## 🔒 Contraintes importantes

- **Anti-doublon appel** : `UNIQUE(student_id, class_id, date, academic_year_id)` sur `attendance_records`
- **Un devoir peut avoir une note liée** : `homework_id` sur `student_grades`
- **Un bulletin unique par élève/trimestre/année** : `UNIQUE(student_id, term, academic_year_id)` sur `reports`
- **Un paiement unique par élève/année** : `UNIQUE(student_id, academic_year_id)` sur `student_payments`
- **Archivage préféré à la suppression** : les enseignants avec historique doivent être désactivés (`status = 'inactive'` ou `'on_leave'`), pas supprimés

## 🔐 Rôles et permissions (via tables de profils)

| Rôle | Table de profil | Accès |
|------|-----------------|-------|
| `super_admin` | `admins` (`admin_level = 'super_admin'`) | Toutes les écoles / plateforme |
| `school_admin` | `admins` (`admin_level = 'school_admin'`) | Gestion : inscriptions, classes, enseignants, paiements, rapports |
| `teacher` | `teacher_profiles` | Ses classes, ses élèves, appel, devoirs, notes |
| `student` | `students` | Ses propres données (notes, devoirs, présence, paiements) |
| `parent` | `parents` | Données de ses enfants uniquement |

> **Attention** : En production avec Supabase, configurez les **Row Level Security (RLS)** pour chaque table en fonction du profil de l'utilisateur connecté.

## 🔗 Relations avec les types TypeScript existants

Ce schéma couvre les interfaces déjà implémentées dans :
- `types/index.ts` : `UserProfile`, `StudentProfile`, `SchoolClass`, `Announcement`
- `types/admin.ts` : `Class`, `Student`, `Teacher`, `ClassAssignment`, `StudentGradeReport`
- `types/grades.ts` : `AcademicLevel`, `Term`, `AssessmentType`, `GradeEntry`, `GradingConfig`
- `lib/schoolData.ts` : `AttendanceRecord`, `Homework`, `StudentGradeRecord`, `StudentPayment`, `TeacherPayment`, `PaymentTransaction`

## ❓ Questions / Dépannage

**La commande `npx prisma migrate dev` échoue ?**
- Vérifiez que `DATABASE_URL` est bien défini dans `.env`
- Vérifiez que PostgreSQL est démarré et accessible
- Vérifiez que les dépendances Prisma sont installées : `npm install -D prisma @prisma/client tsx`

**Le script SQL échoue avec "type already exists" ?**
- Utilisez `DROP TYPE IF EXISTS ... CASCADE;` avant le script ou exécutez sur une base vide

**Besoin de régénérer les mots de passe seed ?**
- Remplacez `'HASH_ADMIN_PLACEHOLDER'` par de vrais hashs bcrypt :
  ```js
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('admin123', 10);
  console.log(hash);