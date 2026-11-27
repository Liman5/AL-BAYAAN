# Guide de l'administrateur — Badges QR et terminaux de présence

Ce guide s'adresse au personnel de direction. Il ne demande aucune compétence
technique.

---

## 1. À quoi sert ce système ?

Chaque élève possède une **carte avec un QR code**. À l'entrée de l'école, un
téléphone Android équipé de l'application *School Attendance* lit le QR :

1. l'élève est reconnu (nom, matricule, classe) ;
2. son heure d'arrivée est enregistrée ;
3. le statut **PRÉSENT** ou **EN RETARD** s'affiche ;
4. l'opération prend moins d'une seconde et **fonctionne sans Internet**.

---

## 2. Première mise en place (une seule fois)

### 2.1 Appliquer la mise à jour de la base

L'administrateur technique doit exécuter le fichier
`prisma/sql/30-badges-terminaux.sql` dans l'éditeur SQL de Supabase
(ou via `npm run db:sql prisma/sql/30-badges-terminaux.sql`).

### 2.2 Créer les badges des élèves

1. Ouvrir **Administration → Badges QR**.
2. Filtrer par classe si besoin.
3. Cocher les élèves (ou utiliser « Générer pour la classe / filtre »).
4. Cliquer sur **Générer pour la sélection**.

> Les badges ne sont **jamais** créés automatiquement à l'inscription : c'est
> vous qui décidez quand un élève reçoit sa carte.

### 2.3 Imprimer les cartes

1. Sélectionner les élèves concernés.
2. Cliquer sur **Imprimer la sélection** (ou **PDF de la page**).
3. Un fichier PDF se télécharge : 8 cartes par page A4.
4. Imprimer, découper sur les repères, plastifier si possible.

Chaque carte contient : nom, prénom, matricule, classe, année scolaire et le
QR code. Le QR ne contient **aucune information personnelle** : si quelqu'un
le lit avec un autre téléphone, il n'obtient qu'une suite de caractères
inutilisable.

### 2.4 Enregistrer le téléphone de l'école

1. Ouvrir **Administration → Terminaux scanners**.
2. Saisir un nom (ex. « Entrée principale ») puis **Créer le terminal**.
3. Un **code à 8 caractères** s'affiche. Il est valable 15 minutes et ne sera
   plus jamais affiché.
4. Sur le téléphone : ouvrir l'application → **Paramètres** →
   **Connexion à AL-BAYAAN** → saisir l'adresse de la plateforme et le code →
   **Appairer le terminal**.

Le téléphone télécharge alors la liste des élèves et des badges, puis
fonctionne hors ligne.

### 2.5 Vérifier les réglages du scanner

Toujours dans **Terminaux scanners**, la section des paramètres permet de
régler :

| Réglage | Conseil |
|---|---|
| Heure limite de retard | 07:30 par défaut |
| Photo de l'élève | à activer seulement si les photos sont fiables |
| Matricule / classe / heure | à laisser activés |
| Notifications parentales | à laisser désactivées tant qu'aucun fournisseur d'envoi n'est configuré |
| Tolérance hors ligne | 30 jours (alerte, ne bloque jamais le scan) |

---

## 3. Utilisation quotidienne

1. Allumer le téléphone, ouvrir l'application : le scanner s'affiche.
2. L'élève présente sa carte.
3. L'écran affiche la photo, le nom, la classe, l'heure et le statut.
4. Le scanner revient tout seul au bout de 2 secondes.

Aucun bouton à presser, aucune confirmation manuelle.

### Que signifient les messages ?

| Message | Signification | Que faire |
|---|---|---|
| **VÉRIFICATION ACCEPTÉE / PRÉSENCE ENREGISTRÉE** | tout va bien | laisser passer l'élève |
| **PRÉSENCE DÉJÀ ENREGISTRÉE** | l'élève a déjà scanné aujourd'hui | rien, c'est normal |
| **BADGE INCONNU** | la carte n'appartient pas à l'école | vérifier la carte |
| **BADGE DÉSACTIVÉ** | carte révoquée | orienter vers l'administration |
| **ÉLÈVE INACTIF** | élève radié/transféré | orienter vers l'administration |
| **PRÉSENCE NON ENREGISTRÉE** | problème de stockage | refaire scanner, prévenir le responsable |

### Changer de caméra

Le bouton en forme d'appareil photo inversé bascule entre la caméra avant et
la caméra arrière. Le choix est mémorisé pour les fois suivantes.

### Activer la voix

**Paramètres → Retour vocal** :

1. activer « Activer la voix » ;
2. personnaliser les 4 phrases (scan accepté, retard, déjà enregistré, refus) ;
3. appuyer sur **Tester la voix**.

Le terminal prononce la phrase correspondante à chaque scan. La voix fonctionne
**sans Internet** et ne dépend d'aucun fichier à télécharger.

### Mettre à jour l'application

Lorsqu'une nouvelle version est publiée, un encart **« Mise à jour
disponible »** apparaît dans **Paramètres → Connexion à AL-BAYAAN**. Appuyer
sur le bouton : l'APK se télécharge dans le navigateur, puis l'installer
par-dessus l'ancienne version — **les présences et les élèves déjà
enregistrés sont conservés**.

> Une mise à jour ne doit jamais être installée si Android affiche
> « Application non installée » : cela signifie que la nouvelle version n'a
> pas été signée avec la même clé.

---

## 4. Gérer les cas particuliers

### Un élève a perdu sa carte

1. **Badges QR** → rechercher l'élève → icône **Révoquer**.
2. Puis icône **Renouveler** : un nouveau QR est créé.
3. Réimprimer la carte et la remettre à l'élève.

L'ancienne carte ne fonctionnera plus dès que le téléphone se synchronise.

### Un élève change de classe

Modifier sa classe dans **Élèves**. La prochaine synchronisation met à jour
le terminal ; le badge reste valable.

### Un élève quitte l'école

Passer son statut à *transféré* ou *inactif* dans **Élèves**. La
synchronisation suivante refusera son badge.

### Le téléphone est perdu ou volé

**Terminaux scanners** → bouton **Révoquer**. Le téléphone ne peut plus rien
envoyer ni télécharger. Créer ensuite un nouveau terminal et l'appairer.

### Le téléphone n'a pas été synchronisé depuis longtemps

L'écran **Terminaux scanners** affiche la dernière synchronisation et le
nombre de scans en attente. Brancher le téléphone au Wi-Fi ou activer les
données mobiles, puis appuyer sur **Synchroniser maintenant** dans
l'application.

---

## 5. Où retrouver les présences ?

**Terminaux scanners → Présences du jour** : nombre d'arrivées, retards,
heure de chaque scan et état des notifications parentales.

Le terminal conserve aussi un historique local (bouton **Historique**) avec
recherche par nom/matricule et export CSV — utile si Internet est coupé.

---

## 6. Questions fréquentes

**Faut-il Internet toute la journée ?**
Non. Internet ne sert qu'à la synchronisation (élèves, badges, présences).

**Que se passe-t-il si le téléphone s'éteint ?**
Les présences déjà enregistrées sont conservées ; au redémarrage, la file
d'envoi reprend automatiquement.

**Les parents reçoivent-ils un message ?**
Pas encore. Les messages sont **préparés** côté serveur mais aucun service
d'envoi (SMS/WhatsApp) n'est branché. Rien n'est donc envoyé pour l'instant.

**Peut-on utiliser plusieurs téléphones ?**
Oui : créer un terminal par porte. Chacun reçoit son propre code.

**Le QR peut-il être copié par un élève ?**
Techniquement oui (comme une carte d'identité), mais le QR est propre à
l'élève et non transférable : le scan d'une copie enregistrerait la présence
de l'élève d'origine. En cas de fraude suspectée, révoquer et renouveler.

