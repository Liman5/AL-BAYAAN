# Intégration AL-BAYAAN ↔ School Attendance Terminal

Ce document décrit **comment la plateforme web AL-BAYAAN et l'application
Android de présence communiquent réellement**, ce qui est protégé, et ce qui
reste volontairement hors périmètre.

> ⚠️ Aucune donnée n'est inventée : chaque endpoint, table et champ décrit
> ci-dessous existe dans le code livré (`app/api/...`, `prisma/sql/30-...`,
> `mobile/school_attendance/lib/...`).

---

## 1. Vue d'ensemble

```
         ┌──────────────────────────────┐        ┌────────────────────────┐
         │  AL-BAYAAN (Next.js)         │        │  Terminal Android      │
         │  Administration web          │        │  (Flutter, hors ligne) │
         ├──────────────────────────────┤        ├────────────────────────┤
         │ /admin → Badges QR           │        │ Scanner QR permanent   │
         │ /admin → Terminaux scanners  │        │ SQLite (Drift) local   │
         │ RLS + service role           │        │ File de synchro        │
         └───────────▲──────────────────┘        └───────────▲────────────┘
                     │                                       │
     navigateur ─────┘                    HTTPS (Bearer token d'appareil)
                                                     │
         ┌───────────────────────────────────────────┴───────────┐
         │  GET  /api/terminal/bootstrap   (descendant)          │
         │  POST /api/terminal/attendance  (montant, idempotent) │
         │  POST /api/terminal/heartbeat   (signal de vie)       │
         │  POST /api/terminal/pair        (appairage, 1 fois)   │
         └───────────────────────────────────────────────────────┘
```

Principe fondamental : **le terminal reste la source de vérité opérationnelle
de ses scans**. Le serveur valide et archive, il ne conditionne jamais
l'enregistrement d'une présence.

---

## 2. Base de données (migration `30-badges-terminaux.sql`)

| Table | Rôle | Accès |
|---|---|---|
| `student_badges` | badge QR d'un élève (token opaque, statut, historique) | **service role uniquement** |
| `scanner_terminals` | appareils autorisés (empreinte du token, appairage, état) | **service role uniquement** |
| `terminal_attendance_events` | présences remontées par les terminaux | **service role uniquement** |
| `parent_notifications` | file d'attente des notifications parentales | **service role uniquement** |
| `scanner_settings` | configuration centralisée du scanner | **service role uniquement** |

Sécurité appliquée par le script :

* `ENABLE ROW LEVEL SECURITY` sur les 5 tables ;
* **aucune politique** n'est créée → `anon` et `authenticated` sont refusés
  par défaut ;
* `REVOKE ALL` explicite pour contourner les `GRANT` par défaut de
  `13-grants.sql`.

Aucun accès direct depuis le navigateur ou depuis le terminal : tout passe par
les routes serveur Next.js.

---

## 3. QR codes élèves

### Contenu du QR

Le QR contient **uniquement un token opaque** :

```
ALB-2026-0001  →  QR  →  « 7QK3ZM9X2P4R8T5V… » (52 caractères base32)
```

* 256 bits d'entropie (`crypto.randomBytes(32)`), encodage base32 Crockford
  (sans `I`, `L`, `O`, `U` pour éviter les confusions visuelles) ;
* aucun nom, matricule, classe, école, téléphone ni donnée médicale ;
* un scanner générique qui lit le badge n'obtient qu'une chaîne inutilisable.

Le **matricule** reste la référence d'identité dans AL-BAYAAN et il est
imprimé sur la carte — mais il n'est **pas** encodé dans le QR.

### Génération

* **Jamais automatique à l'inscription.** L'élève apparaît dans la liste
  « Badges QR » avec l'état « Aucun ».
* L'administrateur sélectionne des élèves (ou un filtre classe/statut) puis
  clique sur « Générer ».
* L'opération est **idempotente** : un badge actif existant est réutilisé
  (réimpression), un badge révoqué impose un **renouvellement explicite**.

### Révocation / renouvellement

| Situation | Action | Effet |
|---|---|---|
| Badge perdu/volé | Révoquer | `status = revoked` ; le QR est refusé |
| Badge révoqué à remplacer | Renouveler | ancien → `replaced`, nouveau token actif |
| Réimpression | Imprimer | `printed_count` + `last_printed_at` |

Côté terminal, la révocation est connue à la **prochaine synchronisation**
(voir §8, limitation assumée).

---

## 4. Badges imprimables (PDF)

* Génération **100 % côté navigateur** (`jspdf` + `qrcode`) : aucune donnée
  d'élève n'est envoyée à un service tiers d'impression.
* Format carte **85,6 × 54 mm** (ID-1), **8 cartes par page A4 portrait**,
  2 colonnes × 4 lignes, marges 14,4 mm, gouttière 10 × 8 mm.
* QR rendu à **512 px** puis inséré à **28 mm** : lisible par une caméra de
  téléphone, y compris en impression noir et blanc.
* Zone de sécurité de 1,5 mm autour du QR, aucun texte à proximité.
* Repères de découpe discrets aux quatre angles.
* Photo **facultative** (case « Photos ») ; si le chargement échoue, le badge
  est imprimé sans photo — jamais d'échec d'impression.
* Les doublons de token et les badges non actifs sont ignorés à l'export.

---

## 5. Appairage des terminaux

```
Admin (web)                          Terminal (Android)
─────────────────────────────────────────────────────────
Créer « Entrée principale »
  → code 8 caractères (15 min)  ───►  Saisir code + URL
                                       POST /api/terminal/pair
                                  ◄──  token d'appareil (256 bits)
                                       → stocké dans le Keystore
```

* Le code d'appairage est stocké **haché** (SHA-256), à usage unique, expiré
  après 15 minutes.
* Le token d'appareil n'est affiché **qu'une seule fois** et n'est jamais
  réémis : le révoquer impose un nouvel appairage.
* Le serveur ne fait jamais confiance au `schoolId` envoyé par le client : il
  le lit dans `scanner_terminals.school_id`.
* Limitation de débit : 10 tentatives / 5 minutes / adresse IP.

États d'un terminal : `pending` → `active` → (`suspended` | `revoked`).

---

## 6. Synchronisation descendante

`GET /api/terminal/bootstrap?since=ISO`

```jsonc
{
  "success": true,
  "data": {
    "cursor": "2026-11-26T07:00:00.000Z",
    "school": { "id": "...", "name": "Institut islamique AL-BAYAAN" },
    "settings": {
      "show_photo": true, "show_matricule": true, "show_class_name": true,
      "show_school_name": true, "show_time": true,
      "attendance_start_time": "07:00", "late_after_time": "07:30",
      "session": "morning", "timezone": "Africa/Lome",
      "notify_parents": false, "sync_photos": false,
      "offline_grace_days": 30, "config_version": 1
    },
    "classes": [{ "id": "class-1", "name": "3e A" }],
    "students": [{
      "studentCode": "ALB-2026-0001",
      "studentUuid": "student-...",
      "firstName": "Adjovi", "lastName": "Kodjo",
      "classId": "class-1", "className": "3e A",
      "photoRemoteUrl": null,
      "qrToken": "7QK3ZM9X…",
      "isActive": true, "badgeRevoked": false,
      "updatedAt": "2026-11-26T06:59:00.000Z"
    }],
    "removedStudentCodes": ["ALB-2025-0042"],
    "truncated": false
  }
}
```

* **Champs minimaux uniquement** : aucune donnée parentale, médicale,
  financière ou de contact.
* `since` active le mode incrémental (élèves modifiés, badges modifiés,
  inscriptions créées). Sans `since`, synchronisation complète paginée
  (200 élèves par page, plafond 5 000).
* Un élève **sans badge actif** n'est pas transmis ; un élève dont le badge a
  été **révoqué et non renouvelé** est transmis avec `qrToken: ""` et
  `badgeRevoked: true` → le terminal refuse son QR.
* `removedStudentCodes` liste les élèves non actifs (transférés, radiés) que
  le terminal doit désactiver localement — **sans supprimer** leurs présences.


---

## 7. Synchronisation montante (présences)

`POST /api/terminal/attendance` — lot de 1 à 50 événements, en-tête
`Authorization: Bearer <token d'appareil>`.

```jsonc
{
  "events": [{
    "eventId": "8f14e45f-ea6b-4c1e-9d0f-2b6f8c1a77aa",  // UUID du terminal
    "studentUuid": "student-...",
    "studentCode": "ALB-2026-0001",
    "scannedAtUtc": "2026-11-26T07:14:32.000Z",
    "localDate": "2026-11-26",
    "attendanceStatus": "present",   // ou "late"
    "terminalId": "...", "source": "qr", "session": "morning",
    "classId": "class-1", "className": "3e A"
  }],
  "pendingEvents": 0,
  "appVersion": "1.0.0"
}
```

Réponse **par événement** :

```jsonc
{ "success": true,
  "data": { "results": [
      { "eventId": "...", "status": "accepted",  "serverRecordId": "..." },
      { "eventId": "...", "status": "duplicate", "reason": "présence déjà enregistrée pour cette session" },
      { "eventId": "...", "status": "rejected",  "reason": "élève non actif" } ],
    "summary": { "accepted": 1, "duplicates": 1, "rejected": 1 } } }
```

### Validation serveur (jamais aveugle)

1. token d'appareil valide, `status = active` ;
2. établissement déduit du terminal, **jamais** du corps de la requête ;
3. `eventId` au format attendu, `localDate` `YYYY-MM-DD`, session autorisée,
   statut `present|late` ;
4. horodatage plausible (pas plus de 2 jours dans le futur, pas plus de
   120 jours dans le passé) ;
5. élève existant **dans cet établissement** et `status = active` ;
6. doublon logique : même élève + même jour + même session ;
7. insertion dans `terminal_attendance_events` avec
   `idempotency_key = "attendance:<eventId>"` (contrainte `UNIQUE`).

### Anti-doublons à quatre niveaux

| Niveau | Mécanisme |
|---|---|
| Terminal | anti-rebond 3 s + index SQLite `UNIQUE(studentId, localDate, session)` |
| Transport | `eventId` UUID stable conservé dans la file locale |
| Serveur (logique) | requête explicite par (élève, jour, session) |
| Serveur (base) | `PRIMARY KEY(id)` + `UNIQUE(idempotency_key)` |

Un rejeu est donc toujours sans effet : le terminal reçoit `duplicate` et
marque l'événement comme synchronisé.

---

## 8. Fonctionnement hors ligne

* Le scan, l'identification, le calcul présent/retard, l'enregistrement et
  l'affichage **ne font aucun appel réseau**.
* Chaque présence est écrite dans SQLite **et** dans `sync_queue` dans la
  **même transaction** : la file ne peut pas diverger des présences.
* Le terminal envoie par lots de 25, avec backoff exponentiel (5 s → 1 h) et
  compteur de tentatives persisté.
* Un envoi interrompu (crash, batterie) est remis en `pending` au démarrage.
* **Aucun événement local n'est supprimé** avant un `accepted`/`duplicate`
  explicite du serveur.
* La synchronisation n'est **jamais** dans le chemin de validation d'un scan.

### Limitation assumée (documentée)

Une révocation de badge décidée côté serveur n'est connue du terminal qu'à sa
**prochaine synchronisation**. Entre-temps, un badge révoqué reste accepté
localement. Pour limiter ce risque :

* `scanner_settings.offline_grace_days` (1 à 365) définit la durée maximale
  sans synchronisation avant alerte ;
* l'écran d'administration affiche « Dernière synchronisation » et le nombre
  de scans en attente ;
* aucune coupure automatique des scans légitimes n'est imposée.


---

## 9. Notifications parentales

Flux **entièrement serveur** :

```
scan local → envoi → présence validée → création des lignes
parent_notifications (channel = inapp | sms | whatsapp, status = pending)
```

* Le terminal n'envoie **jamais** de notification.
* Un message est créé **par canal disponible** du responsable : `inapp` si un
  compte existe, `sms`/`whatsapp` si un téléphone est renseigné.
* Contrainte `UNIQUE(event_id, parent_id, channel)` : pas de doublon même en
  cas de rejeu.
* Un échec de notification **ne remet jamais en cause** la présence : tout est
  encapsulé et silencieux côté route.
* **Aucun fournisseur d'envoi n'est configuré** dans cette version : les
  lignes restent `pending` avec `provider = 'none'`. Rien n'est prétendu
  « envoyé ». Brancher un fournisseur consiste à traiter ces lignes et à
  passer leur statut à `sent`/`failed`.
* Activation : `scanner_settings.notify_parents` (désactivé par défaut).

---

## 10. Mode confidentialité

Valeurs par défaut **restrictives**, imposées par le serveur :

| Champ | Défaut | Visible sur le terminal |
|---|---|---|
| `show_photo` | ✅ | photo locale de l'élève |
| `show_matricule` | ✅ | matricule |
| `show_class_name` | ✅ | classe |
| `show_school_name` | ✅ | établissement |
| `show_time` | ✅ | heure d'arrivée |

Ne sont **jamais** transmis au terminal, quel que soit le réglage : téléphone,
adresse, informations parentales, données médicales, données financières, date
de naissance.

Le terminal applique ces drapeaux dans l'overlay de validation (couvert par un
test automatisé).

---

## 11. Sécurité — synthèse

| Risque | Protection |
|---|---|
| Lecture directe des tables | RLS activée + aucune politique + `REVOKE` |
| Accès admin par API | `requireAdmin()` : cookie `userId` **et** profil réel dans `admins` |
| Terminal anonyme | appairage à usage unique + token de 256 bits haché |
| Terminal d'une autre école | `school_id` lu en base, jamais accepté du client |
| Brute force du code d'appairage | code 8 caractères, 15 min, rate limit IP |
| Injection dans les payloads | validation stricte (regex, listes fermées, bornes) |
| Journalisation excessive | aucun token, aucun numéro, aucune donnée de santé |
| Secrets dans l'APK | aucun : seul le token d'appareil, dans le Keystore |

---

## 12. Comptes administrateurs et visibilité des élèves

Deux points ont été corrigés après les premiers tests terrain :

1. **Reconnaissance du rôle** — la connexion pose dans le cookie `userRole` la
   valeur de `admins.admin_level` (`super_admin` ou `school_admin`), et non le
   littéral `admin`. La garde serveur accepte désormais
   `admin`, `super_admin`, `school_admin` (et variantes `super-admin`,
   `school-admin`), la **vérification qui fait foi** restant la présence du
   profil dans la table `admins` (via `user_id`).
2. **Élèves sans établissement** — les élèves créés avant l'intégration ont
   `students.school_id = NULL`. Toutes les lectures (module Badges, bootstrap
   du terminal, validation des présences) incluent désormais
   `school_id IS NULL` en plus de l'école du terminal : aucun élève existant
   n'est masqué. La génération d'un badge rattache l'élève à l'établissement
   lorsqu'il ne l'était pas.

Diagnostic intégré : `GET /api/admin/whoami` renvoie (sans donnée d'élève)
l'état de la session, le rôle stocké, la présence du profil `admins`, et des
compteurs (élèves, élèves sans école, classes, badges actifs, terminaux).
Le module Badges l'affiche automatiquement en cas de refus d'accès.

## 13. Synchronisation automatique, retour vocal et mise à jour

### 13.1 Synchronisation automatique (aucune action manuelle)

`SyncEngine` (Flutter) déclenche un cycle : au **démarrage**, au **retour du
réseau**, toutes les **45 s** s'il reste des présences en attente, et toutes
les **10 min** pour récupérer élèves/configuration. Un verrou empêche deux
exécutions simultanées et le scanner n'attend jamais le réseau.

Chaque tentative est tracée : `settings.lastSyncAttempt` + `settings.lastSyncError`,
affichés dans **Paramètres → Connexion à AL-BAYAAN** (avec le nombre de
présences en attente et d'élèves disponibles hors ligne). Les causes possibles
d'un non-envoi sont désormais explicites : terminal non appairé, synchronisation
désactivée, mode hors ligne volontaire, terminal révoqué, erreur réseau.

### 13.2 Retour vocal (TTS, hors ligne)

L'administrateur définit les phrases dans **Paramètres → Retour vocal** :

| Situation | Réglage | Défaut |
|---|---|---|
| Scan accepté à l'heure | `voiceSuccess` | « Présence enregistrée » |
| Scan accepté en retard | `voiceLate` | « En retard » |
| Déjà scanné aujourd'hui | `voiceDuplicate` | « Déjà enregistré » |
| Badge inconnu/révoqué, élève inactif, QR invalide | `voiceRefused` | « Accès refusé » |

Technique : `flutter_tts` (synthèse vocale Android, **aucun fichier audio à
héberger**, fonctionne hors ligne). Si l'appareil n'a pas de moteur TTS, le
retour visuel reste seul — le scan n'est jamais bloqué.

### 13.3 Mise à jour de l'application (OTA)

Trois options, par ordre de simplicité :

1. **Mise à jour intégrée (implémentée)** — l'application interroge
   `GET /api/terminal/app-version` ; si la version publiée est supérieure
   **et** qu'une URL d'APK est configurée, un bandeau « Télécharger la vX »
   ouvre le lien dans le navigateur. L'installation par-dessus conserve
   **toutes** les données locales (SQLite, file d'attente).
2. **Play Store / test interne** — mises à jour gérées par Android, aucune
   action de l'école. Recommandé pour le long terme (APK signé requis).
3. **Shorebird** — correctifs Dart livrés sans APK, service tiers payant.

Configuration côté serveur (variables d'environnement) :

```env
TERMINAL_APP_VERSION="1.1.0"
TERMINAL_APP_APK_URL="https://github.com/Liman5/AL-BAYAAN/releases/download/v1.1.0/app-arm64-v8a-release.apk"
TERMINAL_APP_NOTES="Corrections de synchronisation"
```

⚠️ Une mise à jour doit être **signée avec la même clé** que l'application
installée (ici la clé de debug tant qu'aucun keystore de production n'est
fourni), sinon Android refuse l'installation. Si `TERMINAL_APP_APK_URL` est
vide, aucune proposition n'est affichée : rien n'est simulé.

## 14. Présences visibles côté plateforme (admin, élève, parent)

Les pointages du scanner sont stockés dans `terminal_attendance_events` et
exposés en lecture sur trois écrans :

| Écran | Où | Source |
|---|---|---|
| **Admin → dossier élève → onglet Présence** | `/admin` → Élèves → dossier | `GET /api/admin/student-detail` → `terminalAttendance` |
| **Espace élève → tableau de bord** | `/student/dashboard` | `POST /api/student/data` → `terminalAttendance` |
| **Espace parent → carte enfant** | `/parent/dashboard` | `POST /api/parent/terminal-attendance` (route serveur) |

Le parent ne peut lire que les pointages **de ses propres enfants** : le
serveur déduit la liste des enfants à partir du `userId` (table `parents`),
jamais d'une liste fournie par le client.

Les appels de classe (`attendance_records`, faits par les enseignants) restent
distincts : les deux sources sont affichées séparément pour éviter toute
confusion (un scan d'entrée n'est pas un appel de présence en classe).

## 15. Personnel : enseignants et administration (migration 31)

Le même badge QR peut être émis pour **les adultes** de l'établissement.

### Base de données (`31-staff-badges.sql`)

| Élément | Détail |
|---|---|
| `staff_badges` | 1 badge par personne (`users.id`), `staff_type` = `teacher` ou `admin`, token opaque + empreinte, statut |
| `terminal_attendance_events` | + `person_type` (`student`\|`staff`), + `staff_user_id`, `student_id` devient **nullable** |
| Unicité | index partiels : `(student_id, local_date, session)` **et** `(staff_user_id, local_date, session)` → un seul pointage par personne et par session, même avec deux terminaux |
| Sécurité | RLS activée, aucun accès anon/authenticated |

### API

| Route | Rôle |
|---|---|
| `GET/POST/PATCH /api/admin/staff-badges` | liste des enseignants + administration, génération, révocation, renouvellement, marquage d'impression |
| `GET /api/terminal/bootstrap` | ajoute `staff[]` (badge actif) et `removedStaffCodes` |
| `POST /api/terminal/attendance` | accepte `personType: 'staff'` : validation du matricule dans `teacher_profiles` puis `admins`, badge actif obligatoire, doublon par session, **aucune notification parentale** |

### Application

* table locale `staff_members` (Drift v6) : identifiant, matricule, nom, rôle, token, statut ;
* le scan cherche d'abord un élève, **puis** un membre du personnel (`ScanService`) ;
* l'overlay affiche « Matricule : ENS-0001 » et le rôle (« Enseignant · Mathématiques », « Administration ») ;
* l'événement local porte `personType = 'staff'` et part dans la même file de synchronisation ;
* écran admin **Badges personnel** : filtres, sélection, génération, révocation, renouvellement, PDF.

## 16. Ce qui reste volontairement hors périmètre

* Envoi effectif des notifications (fournisseur SMS/WhatsApp/push non choisi).
* Téléchargement automatique des photos vers le terminal (`sync_photos`
  existe côté serveur, le pré-chargement n'est pas implémenté).
* Scan de sortie / multi-sessions (schéma prêt : `session` accepte
  `morning|afternoon|evening`).
* Publication de l'APK signé pour production (keystore à fournir).

