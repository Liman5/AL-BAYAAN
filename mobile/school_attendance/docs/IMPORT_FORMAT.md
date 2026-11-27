# Format d'import des élèves

L'import est **local** : le fichier est lu sur l'appareil, validé, puis inséré
dans SQLite. Aucune connexion Internet n'est nécessaire.

- Écran : Admin → **Importer les élèves**
- Formats acceptés : **CSV** (séparateur `,` ou `;` ou tabulation, détecté
  automatiquement) et **JSON**.
- Taille maximale : 20 000 lignes par import.
- L'import est **atomique** : en cas d'erreur serveur/SQLite, rien n'est écrit.
- Aucun élève existant n'est supprimé. Les élèves déjà connus (même matricule
  **ou** même token) sont **mis à jour**.

## 1. Colonnes

| Colonne | Obligatoire | Alias acceptés | Description |
|---|---|---|---|
| `student_code` | ✅ | `matricule`, `code`, `code_eleve`, `matricule_scolaire` | Matricule unique de l'élève |
| `qr_token` | ✅ | `token`, `badge`, `badge_token`, `qr` | Token opaque du badge (8–128 car.) |
| `first_name` | — | `firstname`, `prenom` | Prénom |
| `last_name` | — | `lastname`, `nom`, `nom_de_famille` | Nom |
| `class_id` | — | `classe_id`, `id_classe` | Identifiant stable de la classe |
| `class_name` | — | `classname`, `classe`, `nom_classe` | Libellé affiché (« 3e A ») |
| `student_uuid` | — | `uuid`, `id_eleve` | Identifiant de la plateforme centrale |
| `is_active` | — | `actif`, `active` | `1/0`, `true/false`, `oui/non` (défaut : vrai) |
| `badge_revoked` | — | `badge_revoque` | Badge perdu/remplacé (défaut : faux) |
| `photo` | — | `photo_file`, `photo_path`, `fichier_photo` | Nom de fichier photo (informatif) |

Les en-têtes sont normalisés (majuscules, accents et espaces ignorés).

### Règles de rejet (ligne par ligne)
- matricule manquant ;
- token absent ou invalide (longueur 8–128, caractères `A-Z a-z 0-9 . _ -`) ;
- matricule déjà présent deux fois dans le même fichier ;
- token déjà présent deux fois dans le même fichier.

Les lignes rejetées sont listées dans l'aperçu ; les autres sont importées.

## 2. Exemple CSV

```csv
student_code,first_name,last_name,class_name,qr_token,is_active
EL-0248,Adjovi,Kodjo,3e A,BADGE-0248-KD,1
EL-0249,Youssef,Ait,3e A,BADGE-0249-YA,1
EL-0250,Imane,Mahmoud,4e B,BADGE-0250-IM,1
```

Fichier d'exemple : `example/sample_students.csv`.

## 3. Exemple JSON

```json
{
  "students": [
    {
      "studentCode": "EL-0248",
      "qrToken": "BADGE-0248-KD",
      "firstName": "Adjovi",
      "lastName": "Kodjo",
      "className": "3e A",
      "isActive": true
    }
  ]
}
```

Un tableau JSON racine (`[ {...}, {...} ]`) est également accepté.
Les clés `camelCase` et `snake_case` sont reconnues.

## 4. Photos

Deux possibilités :

1. **Dossier de photos** : Admin → *Importer → Associer un dossier de photos*.
   Chaque fichier doit être nommé d'après le **matricule** :
   `EL-0248.jpg`, `EL-0248.jpeg`, `EL-0248.png`, `EL-0248.webp`.
   Les images sont redimensionnées (480 px de large) et compressées (JPEG 82)
   dans `documents/student_photos/<id>.jpg`.
2. **Photo déjà présente** sur l'appareil : le dossier choisi est copié, jamais
   déplacé. L'original n'est pas modifié.

Sans photo, l'interface affiche un avatar avec les initiales — jamais de blocage.

## 5. Génération des QR codes

Le QR doit contenir **uniquement le token** (ou `ALB:<token>`).
Ne jamais encoder le nom, la classe ou le matricule dans le QR.

Exemple de contenu valide :

```
BADGE-0248-KD
```

Un QR contenant `{"nom":"...","classe":"..."}` est refusé par conception.
