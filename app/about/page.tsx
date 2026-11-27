import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, HeartHandshake, Laptop } from 'lucide-react';

const VALUES = [
  {
    icon: GraduationCap,
    title: 'Excellence académique',
    text: 'Des programmes exigeants, un suivi individualisé et une équipe pédagogique engagée pour la réussite de chaque élève.',
  },
  {
    icon: BookOpen,
    title: 'Valeurs islamiques',
    text: 'Mémorisation du Coran, éducation morale et pratique religieuse encadrées avec bienveillance et respect de chacun.',
  },
  {
    icon: Laptop,
    title: 'Ouverture & numérique',
    text: 'Arabe, français, anglais, sciences et informatique : une éducation complète pour révéler tous les talents.',
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
      >
        <ArrowLeft size={16} /> Retour à l’accueil
      </Link>

      <section className="mt-8 rounded-3xl border border-emerald-900/10 bg-white p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">Notre école</p>
        <h1 className="mt-3 text-4xl font-black text-emerald-950">Institut Islamique AL-BAYAAN</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          AL-BAYAAN est un institut islamique de base qui accueille les élèves de la maternelle au
          collège. Depuis plus de 15 ans, nous accompagnons les familles avec une conviction : chaque
          enfant possède un potentiel unique qu’il faut cultiver avec exigence et bienveillance.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Notre projet éducatif associe les savoirs fondamentaux, l’enseignement de l’arabe et du
          Coran, le trilinguisme (arabe, français, anglais) et une vraie initiation à l’informatique.
        </p>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <Icon size={21} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-emerald-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-emerald-950 p-8 text-white">
        <div>
          <h2 className="text-xl font-bold">Envie de nous rencontrer ?</h2>
          <p className="mt-1 text-sm text-emerald-100/70">
            Les préinscriptions sont ouvertes. Contactez notre secrétariat pour organiser une visite.
          </p>
        </div>
        <Link
          href="/#contact"
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-amber-300"
        >
          <HeartHandshake size={17} /> Nous contacter
        </Link>
      </section>
    </main>
  );
}

