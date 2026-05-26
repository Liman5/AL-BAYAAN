import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-20 sm:px-10">
      <div className="glass-card rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-900/80">Inscription locale</p>
            <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">Choisissez votre profil</h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Créez un compte localement en tant qu'enseignant ou parent. Pour l'instant, l'inscription reste locale et ne dépend pas encore d'un back-end externe.
            </p>
            <p className="text-sm text-slate-600">سجّل كمعلم أو ولي أمر لتبدأ تجربة AL-BAYAAN الخاصة بك.</p>
          </div>

          <div className="grid gap-4">
            <Link href="/auth/register/teacher" className="rounded-[1.5rem] border border-emerald-900/15 bg-emerald-50 px-6 py-6 text-left shadow-sm transition hover:border-emerald-900/30 hover:bg-emerald-100">
              <p className="text-lg font-semibold text-emerald-900">Enseignant</p>
              <p className="mt-2 text-sm text-slate-600">Inscription dédiée pour les enseignants, avec un accès réservé aux cours et aux suivis.</p>
            </Link>
            <Link href="/auth/register/parent" className="rounded-[1.5rem] border border-amber-900/15 bg-amber-50 px-6 py-6 text-left shadow-sm transition hover:border-amber-900/30 hover:bg-amber-100">
              <p className="text-lg font-semibold text-amber-900">Parent</p>
              <p className="mt-2 text-sm text-slate-600">Inscription dédiée pour les parents, pour suivre la progression de votre enfant et la communication scolaire.</p>
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <p>
            Déjà inscrit ?{' '}
            <Link href="/auth/login" className="font-semibold text-emerald-900 transition hover:text-emerald-700">
              Connectez-vous ici
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
