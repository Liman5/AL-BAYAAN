# Installation, build et déploiement

## 0. Environnement **réellement vérifié** sur cette machine

Installation **portable** (aucun droit administrateur requis, rien de global
n'a été modifié dans Windows) :

| Composant | Version | Chemin |
|---|---|---|
| Flutter (stable) | 3.50.1 | `C:\dev\flutter` |
| Dart | 3.14.0 (bundled) | — |
| JDK Temurin | 17.0.21.1 | `C:\dev\jdk17` |
| Android cmdline-tools | latest (13114758) | `C:\dev\android-sdk\cmdline-tools\latest` |
| Android SDK platforms | 34, 35, **36** | `C:\dev\android-sdk\platforms` |
| Build-tools | 35.0.0, 36.0.0 | `C:\dev\android-sdk\build-tools` |
| NDK | 28.2.13676358 (auto) | `C:\dev\android-sdk\ndk` |
| CMake | 3.22.1 (auto) | `C:\dev\android-sdk\cmake` |
| Gradle | 9.5.0 | cache `C:\dev\gradle-home` |
| AGP / Kotlin | 9.3.1 / 2.4.20 | `android/settings.gradle.kts` |

`flutter doctor -v` → **No issues found**.

Variables à définir avant toute commande :

```powershell
$env:Path             = "C:\dev\flutter\bin;C:\dev\jdk17\bin;C:\dev\android-sdk\platform-tools;C:\dev\sqlite;" + $env:Path
$env:JAVA_HOME        = "C:\dev\jdk17"
$env:ANDROID_HOME     = "C:\dev\android-sdk"
$env:ANDROID_SDK_ROOT = "C:\dev\android-sdk"
$env:GRADLE_USER_HOME = "C:\dev\gradle-home"
```

### Notes spécifiques à ce poste

1. **Cache pub avec espace** (`C:\Users\DAV COMMUNICATION\...`) : l'import
   `package:sqlite3/open.dart` échoue dans les tests. Solution retenue :
   `C:\dev\sqlite\sqlite3.dll` (copie de `winsqlite3.dll`) placé dans le `PATH`.
2. **`file_picker` 11** ne compile son Kotlin que via le Kotlin intégré d'AGP 9.
   Comme `android.builtInKotlin=false` est nécessaire aux autres plugins,
   `android/build.gradle.kts` applique explicitement
   `org.jetbrains.kotlin.android` au module `:file_picker`.
3. **Avertissement non bloquant** : `mobile_scanner`, `wakelock_plus`,
   `package_info_plus` et `file_picker` appliquent encore le Kotlin Gradle
   Plugin ; Flutter prévient que les versions futures exigeront « built-in
   Kotlin ». Aucune action requise aujourd'hui.
4. **Pas d'émulateur possible ici** : virtualisation matérielle non exposée
   (`VirtualizationFirmwareEnabled=False`, `SLAT=False`).

### Si vous devez réinstaller ailleurs (résumé)

1. Flutter stable (zip officiel) → `C:\dev\flutter`, ajouter `bin` au PATH.
2. JDK 17 (Temurin zip) → `C:\dev\jdk17`, définir `JAVA_HOME`.
3. `commandlinetools-win-*_latest.zip` → `...\cmdline-tools\latest`,
   puis :
   ```powershell
   sdkmanager --sdk_root=C:\dev\android-sdk --licenses
   sdkmanager --sdk_root=C:\dev\android-sdk "platform-tools" "platforms;android-36" "build-tools;36.0.0"
   ```
4. `flutter config --android-sdk C:\dev\android-sdk`

## 1. Préparer le projet

```powershell
cd C:\AL-BAYAAN\mobile\school_attendance
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter analyze
flutter test
```

Si `android/local.properties` manque :


```powershell
flutter create --platforms=android --project-name school_attendance .
```

Cette commande complète uniquement les fichiers de plateforme manquants
(wrapper Gradle, `local.properties`). Les fichiers déjà présents ne sont pas
écrasés — vérifiez malgré tout `AndroidManifest.xml` et
`android/app/build.gradle.kts` après exécution.

## 2. Lancer sur un appareil

```powershell
flutter devices
flutter run -d <device-id>
```

Premier lancement : autoriser la caméra quand Android le demande.

## 3. APK de test (debug) — résultat vérifié

```powershell
flutter build apk --debug
```

✔ Build réellement exécuté avec succès (logs : `✓ Built build\app\outputs\flutter-apk\app-debug.apk`).

| Élément | Valeur vérifiée |
|---|---|
| Chemin | `C:\AL-BAYAAN\mobile\school_attendance\build\app\outputs\flutter-apk\app-debug.apk` |
| Taille | 177,32 Mo (185 938 442 octets) |
| package | `com.albayaan.schoolattendance` (aapt2 `dump badging`) |
| version | `versionName='1.0.0'`, `versionCode='1'` |
| SDK | compileSdk 36 · targetSdk 36 · **minSdk 24** |
| Permissions | `CAMERA`, `INTERNET`, `ACCESS_NETWORK_STATE` |
| Label | `School Attendance` |
| Signature | clé debug (v2) |
| Contenu | `classes.dex`, `AndroidManifest.xml`, `lib/arm64-v8a/libflutter.so`, `lib/arm64-v8a/libsqlite3.so` |

Installation par USB (une fois un appareil branché et autorisé) :

```powershell
adb devices                     # doit lister l'appareil (state=device)
adb install -r build\app\outputs\flutter-apk\app-debug.apk
adb shell monkey -p com.albayaan.schoolattendance -c android.intent.category.LAUNCHER 1
```

> État au moment du build : `adb devices` ne listait **aucun appareil**, et
> l'émulateur n'est pas utilisable (virtualisation non exposée). L'installation
> et les tests caméra restent donc à faire sur le terminal physique.


## 4. APK release — résultat vérifié

```powershell
flutter build apk --release              # APK universel (3 ABI)
flutter build apk --release --split-per-abi   # un APK par architecture
```

### APK réellement produits

| APK | Taille | Cible | versionCode | Signature |
|---|---|---|---|---|
| `app-release.apk` | **82,54 Mo** | universel (3 ABI) | 1 | `CN=Android Debug` |
| `app-arm64-v8a-release.apk` | **31,93 Mo** | arm64-v8a (split, le plus léger) | 2001 | `CN=Android Debug` |
| `app-armeabi-v7a-release.apk` | 28,59 Mo | armeabi-v7a | 1001 | `CN=Android Debug` |
| `app-x86_64-release.apk` | 34,16 Mo | x86_64 | 4001 | `CN=Android Debug` |

Tous vérifiés : `package com.albayaan.schoolattendance`, versionName `1.0.0`,
minSdk 24, targetSdk 36, permission `CAMERA`, et présence de `libsqlite3.so`
et `libbarhopper_v3.so`.

> **Note sur `--target-platform android-arm64`** : le moteur Flutter n'est
> compilé que pour arm64 (l'APK ne démarre que sur arm64), mais Flutter 3.50
> embarque encore les bibliothèques natives des *plugins* pour les autres ABI.
> C'est pourquoi il pèse 43,5 Mo contre **31,4 Mo** pour le split arm64 pur.
> Les deux sont installables sur le terminal de l'école.

**Quel APK installer ?**
- Téléphone/tablette récent (2017+) → **`app-arm64-v8a-release.apk`** (31,4 Mo).
- Appareil ancien 32 bits → `app-armeabi-v7a-release.apk`.
- `x86_64` : uniquement émulateurs x86.
- `app-release.apk` (43,5 Mo) : build ARM64 demandé, universel pour l'installation.


> Le `versionCode` des APK split est automatiquement décalé par Flutter
> (1000 × index ABI + version) : c'est normal et permet de coexister.

### Signature — statut réel

Aucun keystore de production n'a été fourni : les APK release sont signés avec
la **clé debug** Android (`CN=Android Debug`,
SHA-256 `443024241aa0f57381f92ad50ec131a507fc7c501b177f07c4fb697305cbcfc7`).
Ils sont **installables** pour la phase de test, mais **ne doivent pas** être
publiés sur le Play Store.

Pour une vraie signature de production :

1. Créer un keystore (à conserver précieusement, **hors du dépôt**) :
   ```powershell
   keytool -genkey -v -keystore albayaan-attendance.jks -keyalg RSA -keysize 2048 -validity 10000 -alias attendance
   ```
2. Créer `android/key.properties` :
   ```properties
   storeFile=C:/chemin/albayaan-attendance.jks
   storePassword=********
   keyAlias=attendance
   keyPassword=********
   ```
   Ce fichier est ignoré par git. **Ne jamais le committer.**
3. Reconstruire : `flutter build apk --release` (la configuration bascule
   automatiquement sur la clé release si `key.properties` existe).


## 5. Icône et nom

- Nom affiché : `School Attendance` (`AndroidManifest.xml`, `android:label`).
- Application ID : `com.albayaan.schoolattendance` — **à ne jamais changer**
  après installation sur les terminaux.
- Icône : `res/mipmap-anydpi-v26/ic_launcher.xml` (adaptative) et
  `res/mipmap-anydpi/ic_launcher.xml` (repli vectoriel). Pour une icône
  bitmap, ajouter les dossiers `mipmap-*dpi/ic_launcher.png` correspondants.

## 6. Mode terminal (kiosque) — optionnel

Non imposé par l'application (aucune configuration destructive).

Solutions Android, à activer manuellement sur l'appareil :
1. **Épinglage d'écran** : Paramètres → Sécurité → Épinglage d'écran.
2. **Mode kiosque** via un appareil géré (Android Enterprise / MDM) ou un
   launcher dédié.
3. Paramètres → Affichage → *Maintenir l'écran allumé* (ou l'option intégrée
   de l'application : Paramètres → « Garder l'écran allumé »).

## 7. Vérifications avant mise en service

- [ ] Scanner : une validation s'affiche et revient seule au scan.
- [ ] Doublon : « PRÉSENCE DÉJÀ ENREGISTRÉE » avec la première heure.
- [ ] Retard : change selon l'heure limite configurée.
- [ ] Couper le Wi-Fi et les données : le scan fonctionne toujours.
- [ ] Redémarrer l'appareil : élèves et présences conservés.
- [ ] Historique : export CSV lisible dans Excel.
- [ ] PIN admin : définition, vérification, modification.
- [ ] Photos : affichage après import du dossier.
- [ ] Batterie : session complète testée sur une journée.

## 8. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `flutter pub get` échoue | versions incompatibles | aligner Flutter sur la dernière stable |
| `app_database.g.dart` introuvable | codegen non lancé | `dart run build_runner build --delete-conflicting-outputs` |
| `local.properties` absent | projet créé sans Android | voir section 2 |
| Caméra noire | permission refusée | Réglages Android → Applications → School Attendance → Autorisations |
| « PRÉSENCE NON ENREGISTRÉE » | stockage plein / base corrompue | libérer de l'espace, exporter puis réinstaller |
| Aucun élève reconnu | token différent du badge | vérifier la colonne `qr_token` de l'import |

---

## Intégration AL-BAYAAN (Phase 4)

L'application synchronise désormais avec les routes serveur de la plateforme.

### Étapes côté serveur (une seule fois)

```powershell
cd C:\AL-BAYAAN
npm run db:sql prisma/sql/30-badges-terminaux.sql   # ou éditeur SQL Supabase
```

Puis dans l'administration web : **Badges QR** (générer/imprimer) et
**Terminaux scanners** (créer un appareil → code d'appairage).

### Étapes côté terminal

1. Installer l'APK.
2. **Paramètres → Connexion à AL-BAYAAN** : saisir l'URL de la plateforme et
   le code d'appairage → **Appairer le terminal**.
3. La première synchronisation télécharge élèves, classes et configuration.

Sans appairage, l'application fonctionne exactement comme avant : 100 %
hors ligne, aucun envoi.

### Note sur `lintVital`

`android/app/build.gradle.kts` désactive `checkReleaseBuilds` : la tâche
`lintVitalAnalyzeRelease` échouait sur ce poste avec
`FileSystemException ... utilisé par un autre processus` (cache lint verrouillé
par un démon Gradle concurrent) après ~29 min de build. L'analyse Android lint
n'est pas nécessaire pour une distribution par APK interne ; `flutter analyze`
(0 problème) et `flutter test` (80 tests) couvrent la qualité statique Dart.
Réactivation possible si l'application est publiée sur le Play Store.

