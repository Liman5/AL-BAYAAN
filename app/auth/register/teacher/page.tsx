'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    // Redirect user to login after successful (local) registration
    router.push('/auth/login');
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-20">
      <div className="glass-card rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-900/80">Inscription Enseignant</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Créer votre compte enseignant</h1>
          <p className="mt-4 text-slate-600">Inscrivez-vous localement pour accéder au portail enseignant d'AL-BAYAAN.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-700">Prénom</span>
              <input required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Nom</span>
              <input required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-slate-700">Adresse e-mail</span>
            <input required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Mot de passe</span>
            <input required type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">École ou matière</span>
            <input type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" placeholder="Ex: Mathématiques, Sciences" />
          </label>

          <button type="submit" className="w-full rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Enregistrer l'enseignant
          </button>
        </form>

        {submitted ? (
          <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 text-emerald-900 shadow-sm">
            <p className="font-semibold">Inscription réussie !</p>
            <p className="mt-2 text-sm text-emerald-900">Votre compte enseignant a été créé localement. Vous pouvez maintenant retourner à la connexion.</p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Vous êtes parent ?</p>
          <Link href="/auth/register/parent" className="rounded-full border border-amber-900/20 bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100">
            Inscription Parent
          </Link>
        </div>
      </div>
    </main>
  );
}
