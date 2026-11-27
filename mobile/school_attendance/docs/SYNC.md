# Synchronisation avec AL-BAYAAN

> **État actuel : implémentée et inactive par défaut.**
> Tant que le terminal n'est pas appairé, `UnconfiguredSyncApi` est utilisé :
> aucune requête n'est envoyée, rien n'est simulé, le terminal fonctionne
> intégralement hors ligne. Après appairage, `RemoteSyncApi` contacte
> uniquement les routes décrites ci-dessous (détail complet :
> [`INTEGRATION.md`](./INTEGRATION.md)).

## 1. Composants

| Élément | Fichier | Rôle |
|---|---|---|
| `AttendanceSyncDto` | `lib/core/sync/sync_models.dart` | Contrat JSON d'un événement (`eventId`, `studentCode`, `scannedAtUtc`, `localDate`, `attendanceStatus`, `terminalId`, `session`, …) |
| `StudentSyncDto`, `ClassSyncDto`, `ScannerConfigDto` | idem | Contrats de descente (élèves, classes, configuration) |
| `SyncApi` / `PullResult` | `lib/core/sync/sync_api.dart` | Interface (`isConfigured`, `pushAttendance`, `pullChanges`) |
| `UnconfiguredSyncApi` | idem | Terminal non appairé : ne contacte jamais le réseau |
| `RemoteSyncApi` | `lib/core/sync/remote_sync_api.dart` | Implémentation réelle (Dio), réponses par événement |
| `TerminalProvisioningService` | `lib/features/sync/data/terminal_provisioning_service.dart` | Appairage (`/api/terminal/pair`) |
| `TerminalCredentialsStore` | `lib/core/network/terminal_credentials.dart` | Token d'appareil dans le Keystore Android |
| `SyncService` | `lib/core/sync/sync_service.dart` | Orchestration, marks `syncing`/`synced`/`failed`, backoff, application des données reçues |
| `SyncBackoff` | `lib/core/sync/sync_models.dart` | 5 s, 10 s, 20 s… plafonné à 1 h |
| `sync_queue` (SQLite) | `lib/features/sync/data/sync_repository.dart` | File persistante, aucune perte |
| `ApiClient` | `lib/core/sync/api_client.dart` | Dio (timeouts, base URL, bearer) |

## 2. Routes utilisées (et uniquement celles-ci)

| Méthode | Route | Sens | Authentification |
|---|---|---|---|
| `POST` | `/api/terminal/pair` | appairage initial | code d'appairage (une fois) |
| `GET` | `/api/terminal/bootstrap` | élèves + classes + config | Bearer token d'appareil |
| `POST` | `/api/terminal/attendance` | présences (max 50/lot) | Bearer token d'appareil |
| `POST` | `/api/terminal/heartbeat` | signal de vie | Bearer token d'appareil |

Aucune route d'administration n'est appelée par le terminal.

## 3. Garanties

- une présence est insérée **avec** son élément de file dans la même transaction ;
- un envoi interrompu repasse en `pending` au démarrage ;
- les événements non synchronisés ne sont **jamais** purgés ;
- l'UI distingue « enregistré localement » et « synchronisé » ;
- la synchronisation ne bloque jamais le scanner ;
- un `eventId` rejoué renvoie `duplicate` (succès idempotent) ;
- un terminal révoqué (`401`/`403`) n'est pas retenté en boucle.

## 4. Ordre d'exécution d'un cycle

1. envoi des présences en attente (`batchSize = 25`, backoff respecté) ;
2. récupération des changements depuis le dernier curseur (`since`, avec
   2 minutes de marge pour le décalage d'horloge) ;
3. application : classes, élèves (identifiant local conservé), désactivations,
   configuration ;
4. mise à jour du curseur (`lastStudentSync`) et de `lastAttendanceSync`.

### Déclenchement automatique (`SyncEngine`)

Aucune action de l'opérateur n'est nécessaire :

| Déclencheur | Fréquence |
|---|---|
| Démarrage de l'application | immédiat |
| Retour du réseau (`connectivity_plus`) | immédiat |
| Présences en attente | toutes les **45 s** |
| Récupération complète (élèves/config) | toutes les **10 min** |

Garde-fous : une seule exécution à la fois, 20 s minimum entre deux tentatives
automatiques, aucun envoi si le terminal n'est pas appairé ou si le mode
« hors ligne volontaire » est actif. Chaque tentative est horodatée
(`lastSyncAttempt`) et l'éventuelle erreur est conservée (`lastSyncError`),
puis affichée dans **Paramètres → Connexion à AL-BAYAAN**.

### Codes d'erreur lisibles

| Situation | Message affiché |
|---|---|
| Token absent/incomplet | « Terminal non appairé : aucun envoi possible. » |
| `apiEnabled = false` | « Synchronisation désactivée dans les paramètres. » |
| `offlineMode = true` | « Mode hors ligne activé : la synchronisation est ignorée. » |
| 401/403 | message serveur (terminal révoqué/suspendu), non retenté en boucle |
| Réseau | « Synchronisation impossible (réseau) », réessayé avec backoff |


## 5. Mise en service

1. Dans AL-BAYAAN : **Terminaux scanners** → créer un terminal → noter le code.
2. Dans l'application : **Paramètres → Connexion à AL-BAYAAN** → saisir
   l'adresse et le code → **Appairer le terminal**.
3. L'application lance immédiatement une première synchronisation.

Un échec de synchronisation **n'empêche jamais** de scanner : les présences
s'accumulent dans la file locale et repartiront au prochain essai.

## 6. Limites connues

- La révocation d'un badge n'est connue qu'à la prochaine synchronisation.
- Les photos d'élèves ne sont pas encore téléchargées automatiquement
  (`sync_photos` existe côté serveur, le pré-chargement reste à faire).
- Aucun fournisseur de notifications parentales n'est configuré : les messages
  restent `pending` côté serveur, rien n'est envoyé.
