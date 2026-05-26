import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-20">
      <div className="glass-card w-full rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-slate-950">Connexion</h1>
        <p className="mt-3 text-slate-600">Accédez au tableau de bord AL-BAYAAN avec vos identifiants.</p>

        <form className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-slate-700">Adresse e-mail</span>
            <input type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Mot de passe</span>
            <input type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>
          <button type="submit" className="w-full rounded-full bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="font-semibold text-emerald-900 transition hover:text-emerald-700">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </main>
  );
}
