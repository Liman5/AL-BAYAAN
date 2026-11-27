# Guide rapide du personnel

## Démarrer le terminal

1. Allumer la tablette/téléphone dédié.
2. Ouvrir **School Attendance** : l'écran scanner s'affiche directement.
3. Vérifier en haut :
   - le nom de l'établissement et du terminal ;
   - la date et l'heure ;
   - le badge **HORS LIGNE** (normal) ou **CONNECTÉ** ;
   - le compteur de la journée.

Aucun réglage n'est nécessaire au quotidien.

## Faire entrer un élève

1. L'élève présente son badge QR devant la caméra.
2. L'écran affiche immédiatement :
   - la photo, le nom, le matricule et la classe ;
   - l'heure exacte ;
   - **VÉRIFICATION ACCEPTÉE** + **PRÉSENCE ENREGISTRÉE** (vert) ;
   - ou **EN RETARD** (orange).
3. L'écran revient seul au scanner après ~2 secondes.
   Les élèves suivants peuvent scanner pendant ce temps : rien n'est perdu.

## Changer de caméra

- L'application s'ouvre sur la **caméra avant** (celle qui fait face à l'élève).
- Le bouton rond avec l'icône de bascule (en haut à droite du scanner) permet
  de passer sur la **caméra arrière**, puis de revenir à l'avant.
- Le choix est **mémorisé** : le terminal rouvrira sur la dernière caméra
  utilisée, même après un redémarrage.
- Le **flash** n'apparaît que sur la caméra arrière, et seulement si l'appareil
  possède une torche.
- Changer de caméra **n'enregistre aucune présence** et ne modifie pas
  l'historique ni les données élèves.

## Messages possibles

| Message | Signification | Action |
|---|---|---|
| VÉRIFICATION ACCEPTÉE / PRÉSENCE ENREGISTRÉE | Présence enregistrée localement | Laisser passer l'élève |
| EN RETARD | Arrivée après l'heure limite | Laisser passer, c'est enregistré |
| PRÉSENCE DÉJÀ ENREGISTRÉE | Le badge a déjà été scanné aujourd'hui | Rien à faire, l'heure d'origine est affichée |
| BADGE INCONNU | Badge non importé dans le terminal | Vérifier la liste importée / créer le badge |
| BADGE DÉSACTIVÉ | Badge perdu ou remplacé | Utiliser le nouveau badge |
| ÉLÈVE INACTIF | Élève sorti de l'établissement | Vérifier avec le secrétariat |
| QR CODE NON RECONNU | Mauvais QR ou badge abîmé | Représenter le badge officiel |
| PRÉSENCE NON ENREGISTRÉE | Problème local (stockage/base) | Réessayer ; sinon prévenir l'administrateur |

## Consulter la journée

- Icône **Journée** en bas : présents, retards, répartition par classe,
  dernières présences.
- Icône **Historique** : rechercher par nom/matricule, filtrer par classe,
  date et statut, exporter en CSV.

## Espace administrateur

1. Icône **Admin** (en bas) → saisir le code PIN.
2. Première utilisation : définir un code à 4 chiffres (à conserver).
3. Actions disponibles :
   - **Journée en cours**, **Historique & export** ;
   - **Importer les élèves** (CSV/JSON + dossier de photos) ;
   - **Paramètres** : nom du terminal, heure limite, durée de confirmation,
     son, vibration, animations, écran allumé, rétention ;
   - **Synchronisation** : état (désactivée par défaut) ;
   - **Données de démonstration** : charger/supprimer les élèves « démo ».
4. Bouton **Retour au scanner** pour reprendre l'accueil des élèves.

## Bonnes pratiques

- Ne pas fermer l'application pendant les heures d'arrivée.
- Laisser le terminal branché sur secteur si possible.
- Ne pas modifier l'heure de l'appareil : elle est utilisée pour l'horodatage.
- En cas de perte du code PIN : contacter l'administrateur (le code peut être
  réinitialisé depuis les paramètres système du terminal).
- Aucune donnée n'est envoyée sur Internet tant que la synchronisation n'est
  pas explicitement configurée : les présences restent sur le terminal.
