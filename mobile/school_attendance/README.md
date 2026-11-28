# School Attendance — Terminal de présence par QR code

Application Android native (Flutter) de contrôle de présence des élèves.
Conçue pour un **terminal dédié** utilisé à l'entrée de l'établissement, avec
un fonctionnement **100 % hors ligne** : aucun scan ne dépend d'Internet.

> Projet indépendant de la plateforme web `AL-BAYAAN` (Next.js), situé dans
> `mobile/school_attendance`. Aucune dépendance croisée : la plateforme web
> reste intacte. La synchronisation passe par les routes serveur
> `/api/terminal/*` d'AL-BAYAAN (voir `docs/INTEGRATION.md`).

---

## 1. Fonctionnalités implémentées

### Scanner
- **Caméra avant par défaut** à la première ouverture (objectif explicite).
- Bouton **bascule avant ⇄ arrière** sur l'écran scanner ; le choix est
  mémorisé dans les paramètres locaux et restauré aux ouvertures suivantes.
- Le **flash n'est proposé que sur la caméra arrière** et si l'appareil
  possède une torche (aucune action impossible présentée au personnel).
- Caméra permanente (le flux n'est pas coupé après un scan).

- Lecture QR via `mobile_scanner` (détection native, `noDuplicates`).
- Cadre de scan animé, flash, reprise caméra après interruption.
- Anti-rebond sur un même badge + file d'attente des scans pendant le feedback
  (aucun élève perdu si deux badges passent très vite).

### Identification et enregistrement
- Le QR ne contient **qu'un token opaque** (jamais de nom/classe).
- Recherche locale par token dans SQLite (`students.qr_token`, index unique).
- Refus explicites : badge inconnu, badge révoqué, élève inactif, QR invalide.
- Enregistrement **atomique** : présence + élément de file de synchronisation,
  dans une seule transaction. En cas d'échec : « PRÉSENCE NON ENREGISTRÉE ».
- Doublon : pas de second enregistrement, affichage de la première heure.
- Retard calculé depuis l'heure limite configurable (jamais codée en dur).

### Interface
- Écran scanner : logo, établissement, date, horloge, état réseau (indicatif),
  état de synchronisation, compteurs du jour, caméra plein écran.
- Overlay de validation : photo locale, nom, matricule, classe, heure, date,
  statut, messages « VÉRIFICATION ACCEPTÉE » / « PRÉSENCE ENREGISTRÉE ».
- Mini-dashboard local, historique filtrable + export CSV.
- Espace administration protégé par code PIN (stockage sécurisé Android).

### Données
- SQLite via Drift : 6 tables, index dédiés, migrations versionnées.
- Import CSV/JSON avec aperçu, validation et rejets ligne par ligne.
- Photos élèves stockées et compressées localement (`<id>.jpg`).
- Export CSV (UTF-8 BOM, compatible Excel).
- Rétention configurable : les scans **non synchronisés ne sont jamais purgés**.

### Badges & pointage (élèves **et** personnel)
- Badges QR pour les **élèves** *et* pour les **enseignants / administration** :
  un seul scanner, deux populations identifiées séparément.
- Token opaque 256 bits, génération idempotente, révocation, renouvellement.
- Impression PDF (85,6 × 54 mm, 8 par A4) pour les deux populations.

### Synchronisation avec AL-BAYAAN (implémentée, active après appairage)
- Couche complète : `SyncApi`, `RemoteSyncApi`, `SyncService`, file locale,
  backoff exponentiel, DTO, idempotence par `eventId`.
- **Appairage** par code à usage unique ; le token d'appareil est conservé
  dans le Keystore Android (jamais dans SQLite, jamais journalisé).
- Descente : élèves, classes, configuration scanner (mode confidentialité).
- Montée : présences validées par événement (`accepted` / `duplicate` /
  `rejected`), lots de 25, reprise après interruption.
- **Envoi 100 % automatique** (`SyncEngine`) : au démarrage, au retour du
  réseau, toutes les 45 s s'il reste des scans, et récupération complète
  toutes les 10 min. Aucune action de l'opérateur.
- **Diagnostic lisible** : dernier essai + dernière erreur affichés dans
  Paramètres → Connexion à AL-BAYAAN.
- **Sans appairage, rien n'est envoyé** : le terminal reste pleinement
  fonctionnel hors ligne (voir `docs/SYNC.md` et `docs/INTEGRATION.md`).

### Retour vocal (TTS) et mise à jour
- 4 phrases configurables par l'administrateur (accepté, retard, doublon,
  refus), prononcées via la synthèse vocale Android — hors ligne, sans
  fichier audio à héberger. Désactivable.
- **Mise à jour OTA** : l'app interroge `/api/terminal/app-version` et propose
  le téléchargement de l'APK si une version plus récente est publiée
  (aucune proposition si l'URL n'est pas configurée).


---

## 2. Environnement vérifié (build réel)

| Outil | Version installée | Emplacement |
|---|---|---|
| Flutter | **3.50.1** (stable) | `C:\dev\flutter` |
| Dart | **3.14.0** (fourni avec Flutter) | — |
| JDK | **Temurin 17.0.21.1** | `C:\dev\jdk17` |
| Android SDK | **API 34 / 35 / 36**, build-tools 35.0.0 + 36.0.0 | `C:\dev\android-sdk` |
| NDK | 28.2.13676358 (installé par le build) | `C:\dev\android-sdk\ndk` |
| CMake | 3.22.1 (assets natifs) | `C:\dev\android-sdk\cmake` |
| Gradle | **9.5.0** (wrapper) | cache `C:\dev\gradle-home` |
| AGP | **9.3.1** | `android/settings.gradle.kts` |
| Kotlin | **2.4.20** | `android/settings.gradle.kts` |

`flutter doctor -v` : **No issues found** (Flutter, Windows, Android toolchain, réseau).

Application : `compileSdk 36`, `targetSdk 36`, **`minSdk 24`** (valeur Flutter),
`applicationId com.albayaan.schoolattendance`.

Aucun droit administrateur n'était disponible : tous les outils sont installés
en **portable dans le profil** (`C:\dev`), sans modification système globale.
Les variables `JAVA_HOME`, `ANDROID_HOME`, `ANDROID_SDK_ROOT` doivent être
positionnées (ou utiliser les scripts du projet) :

```powershell
$env:Path        = "C:\dev\flutter\bin;C:\dev\jdk17\bin;C:\dev\android-sdk\platform-tools;" + $env:Path
$env:JAVA_HOME   = "C:\dev\jdk17"
$env:ANDROID_HOME= "C:\dev\android-sdk"
$env:GRADLE_USER_HOME = "C:\dev\gradle-home"
```

## 3. Installation et lancement

```powershell
cd C:\AL-BAYAAN\mobile\school_attendance
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # génère app_database.g.dart
flutter analyze
flutter test
flutter run -d <device-id>
```

Particularité de cette machine : le cache pub est dans un chemin contenant un
espace (`C:\Users\DAV COMMUNICATION\...`). Les tests SQLite utilisent donc une
bibliothèque `sqlite3.dll` fournie via le `PATH` :

```powershell
# une seule fois : copie de winsqlite3.dll
New-Item -ItemType Directory -Force C:\dev\sqlite | Out-Null
Copy-Item C:\Windows\System32\winsqlite3.dll C:\dev\sqlite\sqlite3.dll
$env:Path = "C:\dev\sqlite;" + $env:Path
flutter test
```

## 4. Construire l'APK (résultat réel)

```powershell
flutter build apk --debug
```

✔ **Build réussi** :

| Élément | Valeur |
|---|---|
| APK | `C:\AL-BAYAAN\mobile\school_attendance\build\app\outputs\flutter-apk\app-debug.apk` |
| Taille | **177,32 Mo** (185 938 442 octets) |
| Package | `com.albayaan.schoolattendance` |
| versionName / versionCode | `1.0.0` / `1` |
| Signature | clé **debug** (installable pour test) |
| Contenu vérifié | `classes.dex`, `AndroidManifest.xml`, `lib/arm64-v8a/libflutter.so`, `libsqlite3.so` |

Installation sur un appareil :

```powershell
adb install -r build\app\outputs\flutter-apk\app-debug.apk
```

La signature de production se configure dans `android/key.properties`
(non versionné) — voir `docs/INSTALL_AND_BUILD.md`.



## Release, taille d'APK et appareil réel

### APK disponibles (tous reconstruits et vérifiés après l'intégration)

| APK | Taille | ABI | Usage |
|---|---|---|---|
| `app-debug.apk` | 177,46 Mo | 3 ABI | diagnostic uniquement |
| `app-release.apk` | **82,54 Mo** | universel (3 ABI) | dépannage multi-appareils |
| `app-arm64-v8a-release.apk` | **31,93 Mo** | arm64-v8a (split) | **recommandé** (téléphones récents) |
| `app-armeabi-v7a-release.apk` | 28,59 Mo | armeabi-v7a | appareils 32 bits |
| `app-x86_64-release.apk` | 34,16 Mo | x86_64 | émulateurs x86 |

Tous dans `build\app\outputs\flutter-apk\`, package
`com.albayaan.schoolattendance`, versionName `1.0.0`, minSdk 24, targetSdk 36,
permissions `CAMERA` + `INTERNET`, signés **clé debug** (test only) — voir
`docs/INSTALL_AND_BUILD.md`.

> Le contrôle `lintVital` d'Android est désactivé pour les builds release
> (`android/app/build.gradle.kts`) : il provoquait un conflit de verrou de
> fichier sur le poste de build et n'apporte rien pour une distribution par
> APK interne. La qualité statique reste garantie par `flutter analyze`
> (0 problème) et `flutter test` (80 tests).


### Pourquoi le debug pesait 177 Mo (analyse mesurée du contenu)

| Contenu | Taille (non compressée) |
|---|---|
| `assets/flutter_assets/kernel_blob.bin` | **80,6 Mo** (JIT debug, absent en release) |
| `lib/<abi>/libflutter.so` | 36,3 Mo **par ABI** (debug, symboles inclus) |
| `lib/<abi>/libVkLayer_khronos_validation.so` | 15,0 Mo **par ABI** (couche de validation, debug) |
| `assets/flutter_assets/isolate_snapshot_data` | 11,1 Mo (debug) |
| `lib/<abi>/libbarhopper_v3.so` | 4,7 Mo × 3 ABI (scanner de codes ML Kit) |
| `lib/<abi>/libsqlite3.so` | 1,7 Mo × 3 ABI (base locale Drift) |
| 3 ABI embarquées | 138 Mo de bibliothèques natives au total |

Le release supprime kernel/snapshot de debug, réduit fortement `libflutter.so`
et ne garde que l'ABI demandée en mode `--split-per-abi` → **31 Mo** pour arm64.

### Appareil réel — état honnête

- `adb devices -l` : **aucun appareil** ; aucun périphérique USB Android détecté
  par Windows (aucun `VID_18D1/04E8/2717…`), donc rien à autoriser.
- Émulateur impossible : `VirtualizationFirmwareEnabled=False`, `SLAT=False`.
- **Conséquence** : installation, caméra réelle, scan d'un badge imprimé, mode
  avion et redémarrage **n'ont pas été exécutés**. La logique correspondante est
  couverte par les tests automatiques (`scan_service_e2e_test.dart`), mais cela
  ne remplace pas un essai sur matériel.
- Procédure et scénarios prêts à l'emploi : `docs/DEVICE_TEST_CHECKLIST.md`
  (+ badges QR de démonstration générés dans `C:\dev\qr-demo\badges.html`).

## 5. Premiers pas sur le terminal


1. Installer l'APK, accorder la permission caméra.
2. Ouvrir l'application → le scanner démarre directement.
3. Icône **Admin** en bas → définir un code PIN à 4 chiffres.
4. Importer la liste des élèves (`CSV`/`JSON`) : Admin → *Importer les élèves*.
5. Facultatif : associer un dossier de photos nommées `<matricule>.jpg`.
6. Régler l'heure limite (défaut 07:30) → Admin → *Paramètres*.
7. Les élèves scannent : validation immédiate, présence enregistrée localement.

Pour tester sans vraie liste : Admin → *Charger les données de démonstration*
(6 élèves `DEMO-*`), puis générer leurs QR codes (tokens fournis dans
`lib/core/database/demo_data.dart`, ex. `DEMO-BADGE-0001`).

## 6. Architecture

```
lib/
├── main.dart                    # démarrage : DB, paramètres, purge, wakelock
├── app/                         # app, router, thème, config, providers
├── core/
│   ├── database/                # tables Drift + base + données de démo
│   ├── scanner/                 # analyse défensive du contenu QR
│   ├── security/                # PIN (SHA-256 salé, secure storage)
│   ├── sync/                    # API abstraite, DTO, service, backoff
│   ├── utils/                   # dates, CSV
│   └── widgets/                 # design system (badges, cartes, identité)
├── features/
│   ├── attendance_scanner/      # domain (règles, service), data, presentation
│   ├── students/                # repositories élèves + photos
│   ├── dashboard/               # mini-dashboard local
│   ├── history/                 # historique + export CSV
│   ├── import_students/         # import CSV/JSON + aperçu
│   ├── terminal_settings/       # paramètres du terminal
│   ├── sync/                    # file d'attente + journaux
│   └── administration/          # accès PIN + sommaire admin
└── shared/models/               # modèles de présentation
```

Flux de validation :

```
QR → QrPayloadParser → ScanService (transaction)
      → StudentRepository.findByQrToken
      → contrôles (actif, badge, doublon)
      → AttendanceRules.statusFor(now)
      → AttendanceRepository.createRecord (+ SyncQueue)
      → ScanOutcome → ValidationOverlay
```

## 7. Tests — résultats réels

```powershell
flutter test
```

**100 tests — 100 % réussis** (dernière exécution : 16 s) :

| Fichier | Couverture |
|---|---|
| `qr_payload_parser_test.dart` | 8 cas : token simple, préfixes, JSON minimal, vide, trop court/long, caractères interdits, rejet des données personnelles |
| `attendance_rules_test.dart` | présent/retard, heure limite configurable, conversion de statut |
| `csv_utils_test.dart` | lecture CSV, guillemets, BOM/CRLF, `;`, lignes vides, encodage, normalisation d'en-têtes |
| `sync_backoff_test.dart` | backoff exponentiel, plafond 1 h, fenêtre de reprise, DTO, clé d'idempotence |
| `validation_overlay_test.dart` | overlays : validation, retard, doublon, badge inconnu, échec d'enregistrement, **mode confidentialité (matricule/classe masqués)** |
| `database_persistence_test.dart` | **SQLite réel** : présence + file, doublon refusé, comptage, persistance après réouverture, **préférence caméra (défaut avant, back, invalide, sans effet sur les présences)** |
| `scan_service_e2e_test.dart` | **flux complet** : badge valide, préfixe `ALB|`, retard, doublon, badge inconnu/inactif/révoqué, QR malformé, scans successifs, **bascule caméra bloquant la détection** |
| `camera_preference_test.dart` | **objectif caméra** : défaut avant, restauration `back`/`front`, valeurs absentes/invalides, sérialisation, opposition, **flash uniquement sur l'arrière si matériel** |
| `remote_sync_api_test.dart` | **client HTTP réel** (adaptateur factice) : réponses par événement (`accepted`/`duplicate`/`rejected`), terminal révoqué non retenté, erreur réseau réessayable, analyse du bootstrap, erreur 401, valeurs par défaut de la configuration |
| `sync_apply_test.dart` | **SQLite réel** : élève synchronisé scannable, pas de doublon au 2e passage (id local conservé), badge révoqué → scan refusé sans suppression, élève retiré désactivé, configuration serveur appliquée, configuration partielle non destructive |
| `sync_service_state_test.dart` | **diagnostic de synchronisation** : non appairé, synchronisation désactivée, mode hors ligne volontaire, cycle réussi — et persistance de `lastSyncAttempt`/`lastSyncError` |
| `voice_feedback_test.dart` | **retour vocal** : voix désactivée, succès, retard, doublon, tous les cas de refus (badge inconnu/révoqué, élève inactif, QR invalide, erreur base) |
| `pin_service_test.dart` | **code administrateur** : configuré au 2ᵉ démarrage (non-régression du bug « redéfini à chaque fois »), jamais stocké en clair, remplacement invalide l'ancien, format refusé |
| `staff_scan_test.dart` | **pointage du personnel** : enseignant identifié par son badge, doublon refusé (1 seul enregistrement), badge révoqué refusé, personnel désactivé refusé, événement mis en file avec `personType=staff`, token inconnu refusé |




`flutter analyze` : **0 erreur, 0 warning, 0 info**.

## 8. Limites connues (état réel)

- **Aucun appareil Android physique n'était connecté** (aucun périphérique USB
  Android détecté) : les APK debug **et release** ont été construits et vérifiés,
  mais l'installation, la caméra réelle, le scan d'un badge imprimé, le mode
  avion et le redémarrage n'ont pas pu être exécutés ici.
- **Émulateur impossible sur cette machine** : la virtualisation matérielle
  n'est pas exposée (`VirtualizationFirmwareEnabled=False`, `SLAT=False`).
  → checklist prête : `docs/DEVICE_TEST_CHECKLIST.md`.
- Les APK release sont signés avec la **clé debug** (aucun keystore de production
  fourni) : installables pour test, non publiable sur le Play Store.
- La synchronisation est **implémentée mais inactive sans appairage** : aucun
  envoi n'a lieu tant que le terminal n'est pas autorisé dans AL-BAYAAN.
- Aucun fournisseur de notifications parentales n'est configuré (les messages
  sont planifiés côté serveur, statut `pending`, rien n'est envoyé).
- La révocation d'un badge n'est connue du terminal qu'à la prochaine
  synchronisation (limitation documentée, `offline_grace_days` configurable).
- Le PIN protège l'interface ; il ne chiffre pas la base SQLite.
- Une seule session journalière (`morning`) en v1 ; la colonne `session` est prête
  pour plusieurs sessions.
- Plugins utilisant encore le Kotlin Gradle Plugin (`mobile_scanner`,
  `wakelock_plus`, `package_info_plus`, `file_picker`) : Flutter émet un
  **avertissement non bloquant** ; les builds futurs exigeront des versions
  « built-in Kotlin ». `file_picker` reçoit le plugin Kotlin via
  `android/build.gradle.kts`.
- `package:flutter/material.dart` est déprécié au profit de `material_ui` dans
  Flutter 3.50 : migration appliquée via la dépendance `material_ui`.
- Performance sur matériel (démarrage, fluidité, mémoire) : **non mesurée**,
  faute d'appareil.



## 9. Documentation

- `docs/ARCHITECTURE.md` — décisions techniques, offline-first, performances.
- `docs/INTEGRATION.md` — **intégration complète AL-BAYAAN ↔ terminal** (QR,
  badges, PDF, appairage, synchronisation, notifications, sécurité).
- `docs/SYNC.md` — contrat et mise en service de la synchronisation.
- `docs/IMPORT_FORMAT.md` — format CSV/JSON et photos.
- `docs/INSTALL_AND_BUILD.md` — SDK, signature, APK, kiosque.
- `docs/DEVICE_TEST_CHECKLIST.md` — tests sur appareil réel + badges de démo.
- `docs/STAFF_GUIDE.md` — guide rapide du personnel.
- `docs/ADMIN_GUIDE.md` — **guide de l'administrateur** (badges, impression,
  appairage, cas particuliers).
