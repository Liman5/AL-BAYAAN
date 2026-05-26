 'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getProfileByUserId } from '@/services/auth.service';
import { roles } from '@/lib/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      const user = res.data.user;
      const userId = user?.id;

      if (!userId) {
        setError('Utilisateur introuvable après connexion.');
        setLoading(false);
        return;
      }

      // Retrieve profile to get role
      const { data, error: profileError } = await getProfileByUserId(userId);
      if (profileError) {
        // fallback to a generic dashboard
        router.push('/dashboard');
        return;
      }

      const role = data?.role as string | undefined;

      // Redirect according to role
      switch (role) {
        case roles.TEACHER:
          router.push('/dashboard/teacher');
          break;
        case roles.STUDENT:
          router.push('/dashboard/student');
          break;
        case roles.PARENT:
          router.push('/dashboard/parent');
          break;
        case roles.SCHOOL_ADMIN:
        case roles.SUPER_ADMIN:
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-20">
      <div className="glass-card w-full rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <h1 className="text-3xl font-semibold text-slate-950">Connexion</h1>
        <p className="mt-3 text-slate-600">Accédez au tableau de bord AL-BAYAAN avec vos identifiants.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-slate-700">Adresse e-mail</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Mot de passe</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>
          <button disabled={loading} type="submit" className="w-full rounded-full bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

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
