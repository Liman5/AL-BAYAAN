# Architecture & décisions techniques

## 1. Offline-first : la règle non négociable

Le chemin critique d'un scan est **entièrement local** :

```
Caméra → parser QR → recherche SQLite → règles locales → INSERT transactionnel
       → feedback UI
```

- Aucun `await` réseau dans ce chemin.
- Aucune photo téléchargée au moment du scan (chemin local uniquement).
- L'absence de réseau ne bloque jamais l'écran scanner.
- Une présence n'est déclarée qu'après le **commit** SQLite : le feedback vert
  n'apparaît jamais avant l'écriture réelle.

La connectivité (`connectivity_plus`) n'est qu'un **indicateur visuel**. Elle
n'autorise ni ne conditionne un enregistrement.

## 2. Couches

| Couche | Responsabilité | Fichiers clés |
|---|---|---|
| UI | Rendu, animations, saisie | `features/*/presentation` |
| État | Riverpod (providers + StateNotifier) | `app/providers/app_providers.dart`, `scanner_controller.dart` |
| Domaine | Règles pures, orchestration | `attendance_rules.dart`, `scan_service.dart`, `qr_payload_parser.dart` |
| Données | SQLite via Drift | `core/database`, `*/data/*_repository.dart` |
| Sync (futur) | File locale + API abstraite | `core/sync`, `features/sync` |

## 3. Modèle de données SQLite

| Table | Rôle | Index notables |
|---|---|---|
| `students` | Élèves importés (token de badge, photo locale) | `qr_token` (unique), `student_code` (unique), `class_id` |
| `school_classes` | Référentiel de classes | `remote_id` |
| `attendance_records` | Événements **immuables** | `(student_id, local_date, session)` **unique**, `local_date`, `sync_status` |
| `settings` | Paramètres du terminal (1 ligne) | — |

La table `settings` inclut la **préférence d'objectif caméra**
(`cameraFacing` : `front` par défaut / `back`), ajoutée par la migration
SQLite **v1 → v2** (`Migrator.addColumn`). Le scanner lit cette valeur avant de
créer le contrôleur : l'objectif est donc explicite dès l'ouverture, sans
dépendre d'un ordre de caméras propre au constructeur.
| `sync_queue` | File d'envoi (aucune perte) | `status`, `entity_id` |
| `terminal_logs` | Diagnostic local | `created_at` |

Garanties :
- **L'index unique** sur `(student_id, local_date, session)` rend le doublon
  impossible même en cas de double détection ou de double appui.
- Le statut de présence (`present` / `late`) est calculé avant l'insertion à
  partir de `settings.late_after_time`.
- `scanned_at_utc` conserve la référence UTC (serveur) tandis que `local_date`
  et `local_minutes` conservent la référence locale (école, statistiques).
- Migrations : `schemaVersion` + `MigrationStrategy` (aucune perte au upgrade).

## 4. Transactions et fiabilité

`ScanService.handleRawQr` exécute dans **une seule transaction** :
1. lecture de l'élève ;
2. contrôles (actif, badge révoqué, doublon) ;
3. insertion de `attendance_records` ;
4. insertion dans `sync_queue`.

Si l'étape 3 ou 4 échoue, tout est annulé et l'UI affiche
« PRÉSENCE NON ENREGISTRÉE ». Une violation d'unicité est interprétée comme un
doublon (aucun crash).

Au démarrage, `SyncRepository.resetStuckItems()` remet en `pending` tout
événement resté en `syncing` (crash, batterie faible, arrêt brutal).

## 5. Interface & performance

- Thème Material 3, tokens dans `app/theme` (couleurs, espacements, rayons).
- Overlay de validation lisible à distance (nom 20 px, heure 34 px, statut coloré).
- Animations courtes (240–320 ms) et désactivables dans les paramètres.
- Le contrôleur caméra n'est jamais recréé par scan : le flux vidéo reste actif.
- `detectionSpeed: noDuplicates` + anti-rebond 3 s sur un même token.
- File d'attente de 8 scans pendant un feedback : aucun élève perdu.
- Requêtes indexées + agrégats calculés en SQL (pas de chargement massif).
- Le dashboard « du jour » ne lit qu'une journée (`local_date` indexé).

## 6. Sécurité

- Le QR ne contient **aucune donnée personnelle**, seulement un token opaque.
- L'espace admin est protégé par un PIN haché (SHA-256 + sel aléatoire) stocké
  dans `flutter_secure_storage` (Keystore Android), jamais en clair.
- `android:allowBackup="false"` : la base n'est pas sauvegardée en cloud.
- Aucun secret dans le code ; aucune URL de backend codée en dur.
- Le trafic en clair est désactivé (`usesCleartextTraffic="false"`).

## 7. Décisions d'emplacement

Le projet vit dans `c:\AL-BAYAAN\mobile\school_attendance` :

- sous-dossier mobile dédié, sans configuration monorepo ;
- aucune dépendance partagée avec Next.js (pas de `package.json` commun) ;
- la plateforme web n'est ni modifiée ni reconstruite ;
- un seul backend à terme : celui de la plateforme AL-BAYAAN.

## 8. Points à valider sur appareil réel

- Ouverture caméra et permission refusée puis réaccordée.
- Reprise caméra après verrouillage / retour d'arrière-plan.
- Flash sur appareil sans torche.
- Lisibilité de l'overlay en plein soleil.
- Comportement avec 5 000 élèves et 50 000 événements (test de charge).
- Verrouillage de tâche Android (screen pinning) si le mode kiosque est requis.
