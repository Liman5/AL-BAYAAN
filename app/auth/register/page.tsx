import Link from 'next/link';
import { GraduationCap, BookOpen, Users, ArrowRight, School } from 'lucide-react';

const ROLES = [
  {
    href: '/auth/register/teacher',
    title: 'Enseignant',
    description: 'Créez votre compte pour gérer vos classes, devoirs et notes.',
    icon: <BookOpen size={28} />,
    gradient: 'from-emerald-500 to-teal-600',
    hover: 'hover:border-emerald-300 hover:shadow-emerald-200/50',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    badge: 'Cours & Suivi',
  },
  {
    href: '/auth/register/parent',
    title: 'Parent',
    description: 'Suivez la progression scolaire et les annonces de vos enfants.',
    icon: <Users size={28} />,
    gradient: 'from-amber-400 to-orange-500',
    hover: 'hover:border-amber-300 hover:shadow-amber-200/50',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    badge: 'Suivi & Communication',
  },
  {
    href: '/auth/register/student',
    title: 'Élève',
    description: 'Accédez à votre espace personnel : cours, devoirs, notes.',
    icon: <GraduationCap size={28} />,
    gradient: 'from-sky-500 to-indigo-600',
    hover: 'hover:border-sky-300 hover:shadow-sky-200/50',
    bg: 'bg-sky-50',
    text: 'text-sky-900',
    badge: 'Espace Personnel',
  },
];

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 px-4 py-16">
      {/* Décorations d'arrière-plan */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        {/* Colonne gauche */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-10 lg:flex">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <School size={26} className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">AL-BAYAAN</p>
                <p className="text-xs text-emerald-200/80">Plateforme institutionnelle scolaire</p>
              </div>
            </div>
          </div>

          <div className="relative space-y-6">
            <h2 className="text-3xl font-bold leading-tight text-white">
              Rejoignez la communauté <span className="text-amber-400">AL-BAYAAN</span>
            </h2>
            <p className="text-sm leading-7 text-emerald-100/70">
              Créez votre compte et accédez à un espace adapté à votre profil : enseignant, parent ou élève.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { icon: '⚡', text: 'Inscription rapide et sécurisée' },
                { icon: '🔐', text: 'Accès personnalisé selon le profil' },
                { icon: '📈', text: 'Suivi en temps réel' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-emerald-100/80">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative text-xs text-emerald-200/50">© 2026 AL-BAYAAN — Tous droits réservés</div>
        </div>

        {/* Colonne droite - choix du profil */}
        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900">
              <GraduationCap size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">AL-BAYAAN</p>
              <p className="text-xs text-slate-500">Plateforme scolaire</p>
            </div>
          </div>

          <p className="text-sm uppercase tracking-[0.25em] text-emerald-900/70">Inscription</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Choisissez votre profil</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sélectionnez le type de compte que vous souhaitez créer. Chaque profil dispose d'un espace dédié.
          </p>

          <div className="mt-8 space-y-4">
            {ROLES.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                className={`group flex items-center gap-4 rounded-2xl border-2 border-slate-100 ${role.bg} p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${role.hover}`}
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white shadow-lg`}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-lg font-bold ${role.text}`}>{role.title}</p>
                    <span className={`hidden rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${role.text} bg-white/70 sm:inline`}>
                      {role.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{role.description}</p>
                </div>
                <ArrowRight size={20} className="shrink-0 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-600" />
              </Link>
            ))}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-600">
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="font-semibold text-emerald-900 transition hover:text-emerald-700">
                Connectez-vous ici
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}