# Validation sur appareil réel — checklist

> Ce document accompagne la phase de test physique. Les tests automatisés
> (49) couvrent la logique ; les points ci-dessous exigent **l'appareil**.

## 1. Préparer l'appareil

1. Activer le mode développeur : Paramètres → À propos → taper 7 fois sur
   « Numéro de build ».
2. Activer **Débogage USB** (Options développeur).
3. Brancher en USB, choisir « Transfert de fichiers » si demandé.
4. Autoriser l'empreinte RSA sur le téléphone.
5. Vérifier sur le PC :
   ```powershell
   adb devices -l        # doit afficher "<serial>  device usb:..."
   ```

## 2. Installer

```powershell
# APK recommandé (téléphone récent, arm64)
adb install -r "C:\AL-BAYAAN\mobile\school_attendance\build\app\outputs\flutter-apk\app-arm64-v8a-release.apk"

# ou version universelle si architecture inconnue
adb install -r "C:\AL-BAYAAN\mobile\school_attendance\build\app\outputs\flutter-apk\app-release.apk"
```

Lancer :

```powershell
adb shell monkey -p com.albayaan.schoolattendance -c android.intent.category.LAUNCHER 1
```

## 3. Préparer les données de démonstration

1. Écran scanner → **Admin** (en bas) → définir un code PIN à 4 chiffres.
2. Admin → **Données de démonstration → Charger** (6 élèves `DEMO-0001…6`).
3. Vérifier : Admin → Paramètres → heure limite `07:30` (ou l'heure souhaitée).

Aucune donnée réelle n'est nécessaire.

## 4. Badges QR de test

Kit généré (hors dépôt, données fictives uniquement) :

```
C:\dev\qr-demo\badges.html      ← à ouvrir dans un navigateur et imprimer
C:\dev\qr-demo\badges\*.png     ← images individuelles
```

| Badge | Jeton | Élève (démo) |
|---|---|---|
| DEMO-0001 | `DEMO-BADGE-0001` | Adjovi Kodjo — 3e A |
| DEMO-0002 | `DEMO-BADGE-0002` | Youssef Ait — 3e A |
| DEMO-0003 | `DEMO-BADGE-0003` | Imane Mahmoud — 4e B |
| DEMO-0004 | `DEMO-BADGE-0004` | Karim El Amrani — 4e B |
| DEMO-0005 | `DEMO-BADGE-0005` | Aminata Diallo — 5e A |
| DEMO-0006 | `DEMO-BADGE-0006` | Sara Bensalem — 5e A |
| INCONNU | `DEMO-BADGE-9999` | badge volontairement inconnu |

## 5. Scénarios à exécuter

| # | Action | Résultat attendu | Fait |
|---|---|---|---|
| 1 | Scanner `DEMO-0001` | Carte élève : nom, matricule `DEMO-0001`, classe `3e A`, heure, « VÉRIFICATION ACCEPTÉE / PRÉSENCE ENREGISTRÉE », statut PRÉSENT (ou EN RETARD après l'heure limite) | ☐ |
| 2 | Re-scanner `DEMO-0001` | « PRÉSENCE DÉJÀ ENREGISTRÉE » + heure du **premier** passage ; aucun second enregistrement | ☐ |
| 3 | Scanner `DEMO-BADGE-9999` | « BADGE INCONNU », aucune présence | ☐ |
| 4 | Activer le **mode avion**, scanner `DEMO-0002` | Identique au cas 1 ; badge réseau « HORS LIGNE » ; aucune erreur | ☐ |
| 5 | Fermer l'app (récents → balayer), rouvrir → **Historique** | Les présences des cas 1 et 4 sont présentes, état « en attente » conservé | ☐ |
| 6 | Scanner `DEMO-0003`, `DEMO-0004`, `DEMO-0005` en rafale | Chaque élève s'affiche correctement, aucun mélange de données, compteurs cohérents | ☐ |
| 7 | Quitter le scanner (Journée) et revenir ; verrouiller/déverrouiller ; passer en arrière-plan puis revenir | Caméra reprise, pas de crash, pas de scanner figé | ☐ |
| 8 | Appuyer sur le **flash** | Torche allumée/éteinte (ou message « Flash indisponible ») | ☐ |
| 9 | Journée → vérifier les compteurs | Présents + retards = nombre de scans acceptés | ☐ |
| 10 | Historique → **export CSV** | Message avec chemin du fichier ; fichier lisible dans Excel | ☐ |
| 11 | Au tout premier lancement (installation neuve) | Le scanner s'ouvre sur la **caméra avant** | ☐ |
| 12 | Appuyer sur le bouton **bascule caméra** | Passage sur la caméra arrière + message « Caméra arrière activée » ; le flash apparaît si l'appareil a une torche | ☐ |
| 13 | Appuyer de nouveau sur la bascule | Retour caméra avant ; le flash **disparaît** et est éteint | ☐ |
| 14 | Basculer sur l'arrière, fermer l'app, rouvrir | L'application rouvre **sur la caméra arrière** (préférence mémorisée) | ☐ |
| 15 | Basculer sur l'avant, fermer, rouvrir | Réouverture sur la **caméra avant** | ☐ |
| 16 | Basculer pendant que personne ne scanne, puis vérifier « Journée » | Aucune présence créée par les bascules | ☐ |

## 6. Journaux utiles en cas d'anomalie

```powershell
adb logcat -d -s flutter:* MobileScanner:* CameraX:* AndroidRuntime:E > logcat.txt
adb shell dumpsys package com.albayaan.schoolattendance | Select-String versionName
adb shell run-as com.albayaan.schoolattendance ls -l files/../
```

## 7. Retirer les données de démonstration (sans toucher aux vraies données)

Admin → **Données de démonstration → Supprimer** : seuls les élèves marqués
`isDemo = true` sont supprimés. **Les présences déjà enregistrées restent**
(elles constituent l'historique local) et les élèves importés ne sont pas
touchés.

Pour repartir de zéro sur un terminal de test uniquement :

```powershell
adb shell pm clear com.albayaan.schoolattendance
```

⚠️ `pm clear` efface **toute** la base locale (élèves + présences non
synchronisées). À ne jamais utiliser sur un terminal de production.
