'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSiteImages } from '@/components/providers/site-images-provider';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Facebook,
  FlaskConical,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Quote,
  ShieldCheck,
  Users,
  X,
  Youtube,
} from 'lucide-react';

// ============================================================================
// 🔧 ZONE PERSONNALISABLE — textes et coordonnées
// ----------------------------------------------------------------------------
// 1. Les photos et le logo se gèrent depuis l’administration :
//    Espace admin → module « Images du site ».
//    (valeurs par défaut : lib/siteImages.ts)
// 2. Adaptez les coordonnées, chiffres et textes ci-dessous à votre établissement.
// 3. Pour le bouton WhatsApp, renseignez SCHOOL.whatsappGroupUrl (lien d’invitation du groupe parents)
//    ou SCHOOL.whatsappPhone (numéro WhatsApp de l’école, sans + ni espaces).
// ============================================================================

const SCHOOL = {
  name: 'AL-BAYAAN',
  fullName: 'Institut Islamique AL-BAYAAN',
  slogan: 'Excellence académique, valeurs islamiques, ouverture au monde.',
  phone: '+213 555 000 000',
  phoneHref: '+213555000000',
  email: 'contact@albayan.edu',
  address: 'Adresse de l’école',
  hours: 'Lundi – Vendredi · 07h30 – 16h30',
  admissionYear: '2026 / 2027',
  // 🔧 Lien d'invitation du groupe WhatsApp des parents (ex. https://chat.whatsapp.com/...)
  // Laissez vide pour utiliser le numéro WhatsApp de l'école ci-dessous.
  whatsappGroupUrl: '',
  whatsappPhone: '213555000000',
  whatsappMessage:
    'Bonjour, je souhaite rejoindre le groupe WhatsApp des parents d’élèves de AL-BAYAAN.',
};


const WHATSAPP_HREF =
  SCHOOL.whatsappGroupUrl.trim() ||
  `https://wa.me/${SCHOOL.whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    SCHOOL.whatsappMessage,
  )}`;

const NAV_LINKS = [
  { label: 'Accueil', href: '#accueil' },
  { label: "L'école", href: '#ecole' },
  { label: 'Nos cycles', href: '#cycles' },
  { label: 'Événements', href: '#evenements' },
  { label: 'Actualités', href: '#actualites' },
  { label: 'Admissions', href: '#admissions' },
  { label: 'Contact', href: '#contact' },
];

const STATS = [
  { value: '15+', label: "Années d'expérience" },
  { value: '500', label: 'Élèves accompagnés' },
  { value: '50', label: 'Enseignants qualifiés' },
  { value: '98%', label: 'Taux de réussite' },
];

const VALUES = [
  {
    icon: Award,
    title: 'Excellence académique',
    text: 'Un enseignement exigeant et structuré, avec un suivi individuel de chaque élève tout au long de l’année.',
  },
  {
    icon: BookOpen,
    title: 'Éducation islamique & valeurs',
    text: 'Mémorisation du Coran, éducation morale et pratique religieuse encadrées avec bienveillance et respect.',
  },
  {
    icon: Globe2,
    title: 'Trilinguisme',
    text: 'Arabe, français et anglais dès le primaire, pour préparer les élèves à un monde sans frontières.',
  },
  {
    icon: FlaskConical,
    title: 'Informatique & sciences',
    text: 'Cours d’informatique, robotique et outils numériques : les élèves apprennent à coder, créer et raisonner.',
  },
  {
    icon: HeartHandshake,
    title: 'Encadrement bienveillant',
    text: 'Des équipes attentives qui accompagnent les élèves dans leurs apprentissages comme dans leur épanouissement.',
  },
  {
    icon: ShieldCheck,
    title: 'Un cadre sain et sécurisé',
    text: 'Un environnement accueillant, surveillé et propice à la concentration, dans un esprit de discipline et de respect.',
  },
];


const CYCLES = [
  {
    title: 'Maternelle',
    ages: '3 – 5 ans',
    description:
      'Un premier pas en douceur dans la vie scolaire, fondé sur l’éveil, le jeu, l’autonomie et les premières notions d’arabe.',
    points: ['Éveil sensoriel et motricité', 'Premiers rudiments d’arabe et de Coran', 'Vie en groupe et autonomie'],
  },
  {
    title: 'Primaire',
    ages: '6 – 11 ans',
    description:
      'Les apprentissages fondamentaux dans un cadre rassurant, avec une attention particulière à chaque élève.',
    points: ['Lecture, écriture, mathématiques', 'Trilinguisme progressif (arabe, français, anglais)', 'Initiation à l’informatique et au Coran'],
  },
  {
    title: 'Collège',
    ages: '12 – 15 ans',
    description:
      'Approfondissement des savoirs, méthode de travail et projets pour gagner en confiance et préparer sereinement la poursuite d’études.',
    points: ['Sciences expérimentales', 'Méthodologie et orientation', 'Projets numériques et interdisciplinaires'],
  },
];

const GALLERY = [
  {
    title: 'Fête de la rentrée scolaire',
    date: 'Septembre 2025',
    category: 'Rentrée',
    featured: true,
  },
  {
    title: 'Semaine du Coran et de la mémorisation',
    date: 'Novembre 2025',
    category: 'Vie islamique',
    featured: false,
  },
  {
    title: 'Journée sportive inter-cycles',
    date: 'Octobre 2025',
    category: 'Sport',
    featured: false,
  },
  {
    title: 'Spectacle de fin d’année',
    date: 'Juin 2025',
    category: 'Culture',
    featured: false,
  },
  {
    title: 'Sortie pédagogique',
    date: 'Mai 2025',
    category: 'Sortie',
    featured: false,
  },
];

const NEWS = [
  {
    date: '12 septembre 2025',
    category: 'Admissions',
    title: `Préinscriptions ${SCHOOL.admissionYear} ouvertes`,
    text: 'Les dossiers de préinscription pour la prochaine rentrée sont disponibles au secrétariat et en ligne. Les places sont limitées par cycle.',
  },
  {
    date: '28 juin 2025',
    category: 'Réussites',
    title: 'Nos élèves distingués au concours de récitation du Coran',
    text: 'Plusieurs de nos élèves ont été mis à l’honneur lors de la compétition régionale. Félicitations à eux et à leurs enseignants !',
  },
  {
    date: '05 septembre 2025',
    category: 'Numérique',
    title: 'Un nouveau dispositif d’accompagnement scolaire',
    text: 'Soutien personnalisé, ateliers de méthode et temps d’étude encadré : découvrez le dispositif mis en place cette année.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Une équipe à l’écoute et un vrai suivi individuel. Nos enfants vont à l’école avec plaisir chaque matin.',
    name: 'Mme A. Bensalem',
    role: 'Maman de deux élèves — Primaire',
    initials: 'AB',
  },
  {
    quote:
      'La communication avec les familles est excellente et l’enseignement de l’arabe est très solide. Un cadre sérieux et chaleureux.',
    name: 'M. K. Haddad',
    role: 'Papa d’un élève — Collège',
    initials: 'KH',
  },
  {
    quote:
      'J’ai beaucoup progressé grâce aux ateliers de méthode et au soutien des professeurs. Je me sens prêt pour l’année suivante.',
    name: 'Youssef, 14 ans',
    role: 'Élève — 3e année moyenne',
    initials: 'Y',
  },
];


const ADMISSION_STEPS = [
  {
    title: 'Prendre contact',
    text: 'Appelez-nous ou remplissez le formulaire en ligne pour recevoir le dossier de préinscription.',
  },
  {
    title: 'Visiter l’établissement',
    text: 'Rencontrez l’équipe pédagogique et découvrez nos classes, nos espaces et nos projets.',
  },
  {
    title: 'Constituer le dossier',
    text: 'Déposez les pièces demandées au secrétariat : acte de naissance, bulletins, photos et fiche familiale.',
  },
  {
    title: 'Confirmer l’inscription',
    text: 'Après l’entretien, validez la place de votre enfant et préparez sereinement la rentrée.',
  },
];

function WhatsAppIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
    </svg>
  );
}

function BrandMark({ compact = false, logoUrl }: { compact?: boolean; logoUrl: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 shadow-lg ring-1 ring-emerald-900/10">
        {logoUrl ? (
          <Image src={logoUrl} alt={`Logo ${SCHOOL.fullName}`} fill className="object-cover" sizes="44px" />
        ) : (
          <GraduationCap size={23} />
        )}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-black tracking-tight text-emerald-950">{SCHOOL.name}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
          {compact ? 'École' : SCHOOL.fullName}
        </span>
      </span>
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
  light = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`${center ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'} space-y-4`}>
      <p
        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] ${
          light ? 'text-amber-300' : 'text-amber-700'
        }`}
      >
        <span className={`h-px w-8 ${light ? 'bg-amber-300/70' : 'bg-amber-500/60'}`} />
        {eyebrow}
      </p>
      <h2
        className={`text-3xl font-black tracking-tight sm:text-4xl ${
          light ? 'text-white' : 'text-emerald-950'
        }`}
      >
        {title}
      </h2>
      {text && (
        <p className={`text-base leading-7 ${light ? 'text-emerald-100/75' : 'text-slate-600'}`}>{text}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const { images } = useSiteImages();
  const [menuOpen, setMenuOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [activePhoto, setActivePhoto] = useState<
    ((typeof GALLERY)[number] & { src: string }) | null
  >(null);

  useEffect(() => {
    if (!activePhoto) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActivePhoto(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activePhoto]);

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Demande d'information — ${SCHOOL.name}`);
    const body = encodeURIComponent(
      `Nom et prénom : ${data.get('name')}\n` +
        `E-mail : ${data.get('email')}\n` +
        `Téléphone : ${data.get('phone')}\n\n` +
        `${data.get('message')}`,
    );
    window.location.href = `mailto:${SCHOOL.email}?subject=${subject}&body=${body}`;
    setMessageSent(true);
  }

  return (
    <main id="accueil" className="min-h-screen bg-[#f7f8f4] text-slate-900">
      {/* ================= BARRE D'INFORMATIONS ================= */}
      <div className="hidden bg-emerald-950 text-emerald-100/80 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-2.5 text-xs">
          <div className="flex items-center gap-6">
            <a href={`tel:${SCHOOL.phoneHref}`} className="flex items-center gap-2 transition hover:text-amber-300">
              <Phone size={13} /> {SCHOOL.phone}
            </a>
            <a href={`mailto:${SCHOOL.email}`} className="flex items-center gap-2 transition hover:text-amber-300">
              <Mail size={13} /> {SCHOOL.email}
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={13} /> {SCHOOL.address}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Clock size={13} /> {SCHOOL.hours}
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="transition hover:text-amber-300">
                <Facebook size={14} />
              </a>
              <a href="#" aria-label="Instagram" className="transition hover:text-amber-300">
                <Instagram size={14} />
              </a>
              <a href="#" aria-label="YouTube" className="transition hover:text-amber-300">
                <Youtube size={14} />
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="#accueil" aria-label={SCHOOL.fullName}>
            <BrandMark logoUrl={images.logo} />
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-full border border-emerald-900/20 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-emerald-50 sm:inline-flex"
            >
              Espace scolaire
            </Link>
            <Link
              href="/auth/register"
              className="hidden items-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 md:inline-flex"
            >
              Préinscription <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-100 xl:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 xl:hidden">
            <nav className="grid gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-900"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 grid gap-2">
              <Link
                href="/auth/login"
                className="rounded-xl border border-emerald-900/20 px-4 py-3 text-center text-sm font-semibold text-emerald-900"
              >
                Espace scolaire
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl bg-emerald-900 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Préinscription
              </Link>
            </div>
          </div>
        )}

      </header>

      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden bg-emerald-950">
        <Image
          src={images.hero}
          alt="Élèves en classe à l’Institut Islamique AL-BAYAAN"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/92 to-emerald-900/40" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
              </span>
              Rentrée {SCHOOL.admissionYear} · Préinscriptions ouvertes
            </span>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Un avenir d’excellence commence à{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                AL-BAYAAN
              </span>
              .
            </h1>

            <p className="max-w-xl text-base leading-8 text-emerald-100/80 sm:text-lg">
              {SCHOOL.fullName} accompagne chaque élève, de la maternelle au collège, dans un cadre
              bienveillant, exigeant et résolument tourné vers l’avenir.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#ecole"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-emerald-950 shadow-xl shadow-black/20 transition hover:bg-amber-50"
              >
                Découvrir l’école <ArrowRight size={17} />
              </a>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-amber-300/60 hover:bg-white/10"
              >
                Préinscrire mon enfant
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-emerald-100/75">
              {['De la maternelle au collège', 'Enseignement trilingue', 'Suivi personnalisé'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Carte portes ouvertes */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-amber-300/20 to-emerald-300/10 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 p-7 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-emerald-950 shadow-lg shadow-amber-500/20">
                  <Calendar size={21} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                    Portes ouvertes
                  </p>
                  <p className="text-lg font-bold">Venez nous rencontrer</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-emerald-50/80">
                Visitez nos classes, échangez avec l’équipe pédagogique et découvrez notre projet
                éducatif. Accueil sur rendez-vous.
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <p className="flex items-start gap-3 text-emerald-50/90">
                  <Clock size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  Samedi · 09h00 – 12h00 (sur rendez-vous)
                </p>
                <p className="flex items-start gap-3 text-emerald-50/90">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  {SCHOOL.address}
                </p>
                <p className="flex items-start gap-3 text-emerald-50/90">
                  <Phone size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  {SCHOOL.phone}
                </p>
              </div>

              <a
                href="#contact"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-amber-300"
              >
                Prendre rendez-vous <ArrowRight size={16} />
              </a>
              <p className="mt-3 text-center text-[11px] text-emerald-100/60">
                Places limitées — priorité aux préinscriptions en ligne
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CHIFFRES CLÉS ================= */}
      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-emerald-900/10 bg-emerald-900/10 shadow-2xl shadow-emerald-950/10 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-7 text-center">
              <p className="text-3xl font-black tracking-tight text-emerald-900 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= VALEURS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Nos engagements"
          title="Pourquoi choisir AL-BAYAAN ?"
          text="Une école à taille humaine où l’exigence académique, les valeurs islamiques et le bien-être de l’enfant avancent ensemble, chaque jour."
          center
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <article
                key={value.title}
                className="group rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl hover:shadow-emerald-900/10"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 transition-colors group-hover:bg-amber-400 group-hover:text-emerald-950">
                  <Icon size={23} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-emerald-950">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{value.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= L'ÉCOLE ================= */}
      <section id="ecole" className="scroll-mt-24 bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="relative h-[300px] overflow-hidden rounded-[2rem] shadow-2xl shadow-emerald-950/15 sm:h-[420px]">
              <Image
                src={images.about}
                alt="Salle de classe de l’Institut Islamique AL-BAYAAN"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 to-transparent" />
            </div>

            <div className="absolute -bottom-10 right-2 hidden w-52 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:block lg:-right-6">
              <div className="relative h-36">
                <Image
                  src={images.aboutSmall}
                  alt="Élève en pleine activité pédagogique"
                  fill
                  sizes="208px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="absolute -left-2 top-6 rounded-2xl bg-emerald-900 px-5 py-4 text-white shadow-xl lg:-left-6">
              <p className="text-2xl font-black text-amber-300">15+</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                Années d’expérience
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Notre établissement"
              title="Une école qui cultive le potentiel de chaque enfant"
              text="Depuis plus de 15 ans, l’Institut Islamique AL-BAYAAN accueille les enfants de la maternelle au collège dans un environnement à la fois structurant et chaleureux."
            />

            <p className="mt-5 text-sm leading-7 text-slate-600">
              Notre projet éducatif repose sur trois piliers : la maîtrise des savoirs fondamentaux,
              l’ouverture aux langues et aux cultures, et la formation de citoyens responsables,
              curieux et confiants.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                'Effectifs réduits et suivi individualisé',
                'Équipe pédagogique diplômée et stable',
                'Locaux modernes, laboratoires et bibliothèque',
                'Communication régulière avec les familles',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cycles"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
              >
                Découvrir nos cycles <ArrowRight size={16} />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-900/20 px-6 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CYCLES ================= */}
      <section id="cycles" className="scroll-mt-24 bg-[#f1f5ee] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Parcours scolaire"
            title="Trois cycles, une même exigence"
            text="De l’éveil de la maternelle à la fin du collège, chaque étape bénéficie d’un programme adapté et d’un accompagnement attentif."
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CYCLES.map((cycle, index) => (
              <article
                key={cycle.title}
                className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={images[`cycle-${index + 1}`]}
                    alt={`Cycle ${cycle.title} — ${SCHOOL.fullName}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-emerald-950/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-emerald-900 shadow-sm">
                    {cycle.ages}
                  </span>
                  <h3 className="absolute bottom-4 left-4 text-lg font-bold text-white drop-shadow">
                    {cycle.title}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm leading-6 text-slate-600">{cycle.description}</p>
                  <ul className="mt-4 space-y-2">
                    {cycle.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#admissions"
                    className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-emerald-800 transition group-hover:text-amber-700"
                  >
                    Inscrire mon enfant <ArrowRight size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <BookOpen size={15} className="text-emerald-700" />
            Programmes, horaires et tarifs détaillés disponibles auprès du secrétariat.
          </p>
        </div>
      </section>

      {/* ================= ÉVÉNEMENTS / GALERIE ================= */}
      <section id="evenements" className="scroll-mt-24 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="La vie à AL-BAYAAN"
              title="Nos événements en images"
              text="Rentrée, semaine du Coran, sport, culture et sorties pédagogiques : retrouvez les moments forts qui rythment l’année scolaire de nos élèves."
            />
            <a
              href="#contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-900/20 px-5 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
            >
              Partager un souvenir <ArrowRight size={15} />
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[210px]">
            {GALLERY.map((photo, index) => {
              const imageSrc = images[`gallery-${index + 1}`];
              return (
              <button
                key={photo.title}
                type="button"
                onClick={() => setActivePhoto({ ...photo, src: imageSrc })}
                className={`group relative overflow-hidden rounded-3xl text-left shadow-sm ring-1 ring-emerald-900/10 transition duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  photo.featured
                    ? 'min-h-[320px] sm:col-span-2 lg:row-span-2 lg:min-h-0'
                    : 'min-h-[210px]'
                }`}
                aria-label={`Agrandir la photo : ${photo.title}`}
              >
                <Image
                  src={imageSrc}
                  alt={`${photo.title} — ${SCHOOL.fullName}`}
                  fill
                  sizes={photo.featured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-amber-400/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-950 shadow-sm">
                  {photo.category}
                </span>
                <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                    <Calendar size={13} /> {photo.date}
                  </span>
                  <span
                    className={`mt-1.5 block font-bold leading-snug ${
                      photo.featured ? 'text-xl sm:text-2xl' : 'text-base'
                    }`}
                  >
                    {photo.title}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-100/80 transition group-hover:text-amber-200">
                    Voir la photo <ArrowRight size={13} />
                  </span>
                </span>
              </button>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Cliquez sur une photo pour l’agrandir — d’autres albums sont disponibles sur nos réseaux sociaux.
          </p>
        </div>
      </section>

      {/* ================= ACTUALITÉS ================= */}
      <section id="actualites" className="scroll-mt-24 bg-[#f1f5ee] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="À la une"
              title="Actualités & informations"
              text="Inscriptions, résultats, projets pédagogiques : suivez la vie de l’établissement et les informations utiles aux familles."
            />
            <a
              href="#contact"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-emerald-900 transition hover:text-amber-700"
            >
              Toutes les actualités <ArrowRight size={15} />
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {NEWS.map((news) => (
              <article
                key={news.title}
                className="group flex flex-col rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800">
                    {news.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Calendar size={13} /> {news.date}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug text-emerald-950">{news.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{news.text}</p>
                <a
                  href="#contact"
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-emerald-800 transition group-hover:text-amber-700"
                >
                  Lire la suite <ArrowRight size={15} />
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-emerald-900/10 bg-white/70 p-6 sm:grid-cols-3">
            {[
              { icon: Clock, title: 'Horaires', text: SCHOOL.hours },
              { icon: Users, title: 'Accueil des familles', text: 'Secrétariat ouvert du lundi au vendredi' },
              { icon: ShieldCheck, title: 'Cantine & transport', text: 'Services disponibles sur inscription' },
            ].map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Icon size={19} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">{info.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">{info.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TÉMOIGNAGES ================= */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Ils nous font confiance"
            title="Paroles de familles et d’élèves"
            text="Le meilleur ambassadeur d’une école, ce sont ses familles. Découvrez leurs témoignages."
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex flex-col rounded-3xl border border-emerald-900/10 bg-[#f8faf6] p-7 shadow-sm"
              >
                <Quote size={28} className="text-amber-500" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-700">
                  « {testimonial.quote} »
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-emerald-900/10 pt-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900 text-sm font-bold text-amber-300">
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ADMISSIONS ================= */}
      <section id="admissions" className="relative isolate scroll-mt-24 overflow-hidden bg-emerald-950 py-20">
        <Image
          src={images.admissions}
          alt="Élèves de l’Institut Islamique AL-BAYAAN"
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/95 to-emerald-900/70" />
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Admissions"
              title={`Rejoindre AL-BAYAAN — rentrée ${SCHOOL.admissionYear}`}
              text="Les préinscriptions sont ouvertes. Quatre étapes simples pour offrir à votre enfant un parcours scolaire solide et épanouissant."
              light
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold text-emerald-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
              >
                Remplir une préinscription <ArrowRight size={16} />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Demander le dossier
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-emerald-100/70">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-amber-300" /> Places limitées par classe
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-amber-300" /> Entretien avec la direction
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-amber-300" /> Réponse sous 72 h
              </span>
            </div>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2">
            {ADMISSION_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur transition hover:border-amber-300/40 hover:bg-white/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-emerald-950">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-base font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-emerald-100/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="scroll-mt-24 bg-[#f1f5ee] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Parlons de l’avenir de votre enfant"
                text="Une question sur les inscriptions, les programmes ou la vie scolaire ? Notre équipe vous répond avec plaisir."
              />

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Phone,
                    label: 'Téléphone',
                    value: SCHOOL.phone,
                    href: `tel:${SCHOOL.phoneHref}`,
                  },
                  {
                    icon: Mail,
                    label: 'E-mail',
                    value: SCHOOL.email,
                    href: `mailto:${SCHOOL.email}`,
                  },
                  {
                    icon: MapPin,
                    label: 'Adresse',
                    value: SCHOOL.address,
                    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SCHOOL.address)}`,
                  },
                  {
                    icon: Clock,
                    label: 'Horaires',
                    value: SCHOOL.hours,
                    href: undefined,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noreferrer' : undefined}
                          className="mt-1 block break-words text-sm font-semibold text-slate-700 transition hover:text-amber-700"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Suivez-nous
                </span>
                <span className="h-px flex-1 bg-emerald-900/10" />
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Youtube, label: 'YouTube' },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-900/10 bg-white text-emerald-800 transition hover:border-amber-400 hover:bg-amber-400 hover:text-emerald-950"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
                    <WhatsAppIcon size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      Groupe WhatsApp des parents
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Rejoignez le groupe officiel pour recevoir les informations importantes de
                      l’école.
                    </p>
                  </div>
                </div>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1ebe5b]"
                >
                  <WhatsAppIcon size={16} /> Rejoindre le groupe
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-xl shadow-emerald-950/5 sm:p-9">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-900 text-amber-300">
                  <Mail size={20} />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">Envoyez-nous un message</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Nous vous répondons sous 24 h ouvrées.
                  </p>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="mt-7 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Nom complet *
                    </span>
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Votre nom et prénom"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      E-mail *
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Téléphone
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+213 ..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Votre message *
                  </span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Précisez le cycle concerné, la classe et votre demande…"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
                >
                  Envoyer le message <ArrowRight size={16} />
                </button>

                {messageSent && (
                  <p
                    role="status"
                    className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                  >
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                    Merci ! Votre message est prêt à être envoyé depuis votre application de
                    messagerie.
                  </p>
                )}

                <p className="text-[11px] leading-5 text-slate-400">
                  Ce formulaire ouvre votre application de messagerie avec le message prérempli.
                  Vous pouvez aussi nous écrire à {SCHOOL.email}.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-emerald-950 text-emerald-100/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-amber-300 ring-1 ring-white/15">
                  <Image src={images.logo} alt={`Logo ${SCHOOL.fullName}`} fill className="object-cover" sizes="44px" />
                </span>
                <div>
                  <p className="text-lg font-black tracking-tight text-white">{SCHOOL.name}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                    {SCHOOL.fullName}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-emerald-100/60">{SCHOOL.slogan}</p>
              <div className="mt-5 flex items-center gap-2">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Youtube, label: 'YouTube' },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-emerald-100 transition hover:bg-amber-400 hover:text-emerald-950"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366]/15 px-3 py-1.5 text-xs font-semibold text-[#8ef0b5] transition hover:bg-[#25D366]/25 hover:text-white"
              >
                <WhatsAppIcon size={14} /> Groupe WhatsApp parents
              </a>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Navigation</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="transition hover:text-amber-300">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Nos cycles</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {CYCLES.map((cycle) => (
                  <li key={cycle.title}>
                    <a href="#cycles" className="transition hover:text-amber-300">
                      {cycle.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Nous contacter</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  <span>{SCHOOL.address}</span>
                </li>
                <li>
                  <a href={`tel:${SCHOOL.phoneHref}`} className="flex items-start gap-2.5 transition hover:text-amber-300">
                    <Phone size={16} className="mt-0.5 shrink-0 text-amber-300" />
                    {SCHOOL.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${SCHOOL.email}`} className="flex items-start gap-2.5 transition hover:text-amber-300">
                    <Mail size={16} className="mt-0.5 shrink-0 text-amber-300" />
                    {SCHOOL.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  <span>{SCHOOL.hours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row sm:px-6">
            <p>
              © 2026 {SCHOOL.name} — {SCHOOL.fullName}. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth/login" className="transition hover:text-amber-300">
                Espace scolaire
              </Link>
              <Link href="/auth/register" className="transition hover:text-amber-300">
                Préinscription
              </Link>
              <a href="#accueil" className="transition hover:text-amber-300">
                Haut de page ↑
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= BOUTON WHATSAPP ================= */}
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Rejoindre le groupe WhatsApp des parents d’élèves"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 text-white shadow-2xl shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-[#1ebe5b] sm:bottom-6 sm:right-6"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30" />
          <WhatsAppIcon size={23} />
        </span>
        <span className="hidden text-sm font-bold sm:inline">Groupe parents</span>
      </a>

      {/* ================= VISIONNEUSE PHOTO ================= */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-emerald-950/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              aria-label="Fermer la photo"
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-amber-400 hover:text-emerald-950"
            >
              <X size={20} />
            </button>

            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-emerald-900 shadow-2xl">
              <Image
                src={activePhoto.src}
                alt={`${activePhoto.title} — ${SCHOOL.fullName}`}
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 text-white">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                  <Calendar size={13} /> {activePhoto.date} · {activePhoto.category}
                </p>
                <h3 className="mt-1 text-lg font-bold sm:text-xl">{activePhoto.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="rounded-full border border-white/25 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

