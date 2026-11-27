// ============================================================================
// Images du site — source de vérité pour les valeurs par défaut et les
// emplacements affichés dans l'admin (menu « Images du site »).
// Les surcharges enregistrées par l'admin sont stockées dans
// data/site-images.json et servies par /api/site-images.
//
// ⚠️ Les photos ci-dessous sont celles d'AL-BAYAAN (logo officiel + photos
// libres d'illustration). Remplacez-les depuis l'administration :
// Espace admin → module « Images du site ».
// ============================================================================

export interface SiteImageSlot {
  key: string;
  label: string;
  group: string;
  /** Où la photo apparaît sur le site (affiché dans l'admin). */
  location: string;
  /** Fichier / constante à modifier si l'on passe par le code. */
  fileHint: string;
  defaultSrc: string;
}

// Logo officiel AL-BAYAAN (déjà utilisé dans les en-têtes et la connexion)
const LOGO_SRC =
  'https://www.image2url.com/r2/default/images/1779783874231-dae3f087-5437-4ef2-98c9-67a961155f8f.jpg';

// Photos d'illustration (à remplacer par les photos réelles de l'établissement)
const PHOTO_CLASSE =
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80';
const PHOTO_ELEVES =
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80';
const PHOTO_SALLE =
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80';

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: 'logo',
    label: 'Logo officiel',
    group: 'Identité',
    location:
      'En-tête et pied de page de l’accueil, barre latérale et en-têtes des espaces admin, enseignant, élève et parent.',
    fileHint: 'lib/siteImages.ts → LOGO_SRC',
    defaultSrc: LOGO_SRC,
  },
  {
    key: 'hero',
    label: 'Photo d’ouverture (hero)',
    group: 'Page d’accueil',
    location: 'Accueil — grande bannière en haut de page, derrière le titre principal.',
    fileHint: 'app/page.tsx → section HERO',
    defaultSrc: PHOTO_CLASSE,
  },
  {
    key: 'about',
    label: 'Présentation — grande photo',
    group: 'Page d’accueil',
    location: 'Section « Notre établissement » — image principale à gauche.',
    fileHint: 'app/page.tsx → section L’ÉCOLE',
    defaultSrc: PHOTO_ELEVES,
  },
  {
    key: 'aboutSmall',
    label: 'Présentation — vignette',
    group: 'Page d’accueil',
    location: 'Section « Notre établissement » — petite photo superposée en bas à droite.',
    fileHint: 'app/page.tsx → section L’ÉCOLE',
    defaultSrc: PHOTO_SALLE,
  },
  {
    key: 'admissions',
    label: 'Fond de la section Admissions',
    group: 'Page d’accueil',
    location: 'Section « Admissions » — photo d’arrière-plan derrière les 4 étapes.',
    fileHint: 'app/page.tsx → section ADMISSIONS',
    defaultSrc: PHOTO_CLASSE,
  },
  {
    key: 'cycle-1',
    label: 'Cycle 1 — Maternelle',
    group: 'Cycles',
    location: 'Section « Nos cycles » — carte 1 (Maternelle, 3–5 ans).',
    fileHint: 'app/page.tsx → CYCLES[0]',
    defaultSrc: PHOTO_ELEVES,
  },
  {
    key: 'cycle-2',
    label: 'Cycle 2 — Primaire',
    group: 'Cycles',
    location: 'Section « Nos cycles » — carte 2 (Primaire, 6–11 ans).',
    fileHint: 'app/page.tsx → CYCLES[1]',
    defaultSrc: PHOTO_CLASSE,
  },
  {
    key: 'cycle-3',
    label: 'Cycle 3 — Collège',
    group: 'Cycles',
    location: 'Section « Nos cycles » — carte 3 (Collège, 12–15 ans).',
    fileHint: 'app/page.tsx → CYCLES[2]',
    defaultSrc: PHOTO_SALLE,
  },
  {
    key: 'gallery-1',
    label: 'Événement 1 — Rentrée scolaire',
    group: 'Galerie d’événements',
    location: 'Section « Nos événements en images » — grande photo (2 colonnes × 2 lignes).',
    fileHint: 'app/page.tsx → GALLERY[0]',
    defaultSrc: PHOTO_CLASSE,
  },
  {
    key: 'gallery-2',
    label: 'Événement 2 — Semaine du Coran',
    group: 'Galerie d’événements',
    location: 'Section « Nos événements en images » — carte 2.',
    fileHint: 'app/page.tsx → GALLERY[1]',
    defaultSrc: PHOTO_ELEVES,
  },
  {
    key: 'gallery-3',
    label: 'Événement 3 — Journée sportive',
    group: 'Galerie d’événements',
    location: 'Section « Nos événements en images » — carte 3.',
    fileHint: 'app/page.tsx → GALLERY[2]',
    defaultSrc: PHOTO_SALLE,
  },
  {
    key: 'gallery-4',
    label: 'Événement 4 — Spectacle de fin d’année',
    group: 'Galerie d’événements',
    location: 'Section « Nos événements en images » — carte 4.',
    fileHint: 'app/page.tsx → GALLERY[3]',
    defaultSrc: PHOTO_CLASSE,
  },
  {
    key: 'gallery-5',
    label: 'Événement 5 — Sortie pédagogique',
    group: 'Galerie d’événements',
    location: 'Section « Nos événements en images » — carte 5.',
    fileHint: 'app/page.tsx → GALLERY[4]',
    defaultSrc: PHOTO_ELEVES,
  },
];


export type SiteImageMap = Record<string, string>;

export const DEFAULT_SITE_IMAGES: SiteImageMap = SITE_IMAGE_SLOTS.reduce<SiteImageMap>(
  (acc, slot) => {
    acc[slot.key] = slot.defaultSrc;
    return acc;
  },
  {},
);

export function mergeSiteImages(overrides: SiteImageMap = {}): SiteImageMap {
  const merged: SiteImageMap = { ...DEFAULT_SITE_IMAGES };
  for (const slot of SITE_IMAGE_SLOTS) {
    const value = overrides[slot.key];
    if (typeof value === 'string' && value.trim()) {
      merged[slot.key] = value.trim();
    }
  }
  return merged;
}

// Formats cibles utilisés par l'outil de recadrage de l'administration.
export const SITE_IMAGE_ASPECTS: Record<string, number> = {
  logo: 1,
  hero: 16 / 9,
  about: 4 / 3,
  aboutSmall: 4 / 3,
  admissions: 16 / 9,
  'cycle-1': 3 / 2,
  'cycle-2': 3 / 2,
  'cycle-3': 3 / 2,
  'gallery-1': 1,
  'gallery-2': 4 / 3,
  'gallery-3': 4 / 3,
  'gallery-4': 4 / 3,
  'gallery-5': 4 / 3,
};

export const SITE_IMAGE_ASPECT_LABELS: Record<string, string> = {
  logo: '1:1',
  hero: '16:9',
  about: '4:3',
  aboutSmall: '4:3',
  admissions: '16:9',
  'cycle-1': '3:2',
  'cycle-2': '3:2',
  'cycle-3': '3:2',
  'gallery-1': '1:1',
  'gallery-2': '4:3',
  'gallery-3': '4:3',
  'gallery-4': '4:3',
  'gallery-5': '4:3',
};

export function getSlotAspect(key: string): number {
  return SITE_IMAGE_ASPECTS[key] ?? 4 / 3;
}

export function getSlotAspectLabel(key: string): string {
  return SITE_IMAGE_ASPECT_LABELS[key] ?? '4:3';
}
