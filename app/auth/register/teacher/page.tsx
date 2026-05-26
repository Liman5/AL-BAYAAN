'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { registerTeacherLocal } from '@/lib/localAuth';

export default function TeacherRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = registerTeacherLocal({
      first_name: (form.elements.namedItem('first_name') as HTMLInputElement).value,
      last_name: (form.elements.namedItem('last_name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      subjects: ((form.elements.namedItem('subjects') as HTMLInputElement).value || '').split(',').map((value) => value.trim()).filter(Boolean),
      assigned_class: (form.elements.namedItem('assigned_class') as HTMLInputElement).value || undefined,
    });

    if (result.success) {
      setSubmitted(true);
      setMessage('Compte enseignant créé avec succès. Vous pouvez maintenant vous connecter.');
      form.reset();
    } else {
      setMessage(result.message ?? 'Une erreur est survenue pendant l’inscription.');
    }
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
              <input name="first_name" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Nom</span>
              <input name="last_name" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-slate-700">Adresse e-mail</span>
            <input name="email" required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Mot de passe</span>
            <input name="password" required type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Classe affectée</span>
            <input name="assigned_class" type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" placeholder="Ex: 5A" />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Matières</span>
            <input name="subjects" type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500" placeholder="Ex: Mathématiques, Sciences" />
          </label>

          <button type="submit" className="w-full rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Enregistrer l'enseignant
          </button>
        </form>

        {message ? (
          <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 text-emerald-900 shadow-sm">
            <p className="font-semibold">{submitted ? 'Inscription réussie !' : 'Veuillez vérifier les informations'}</p>
            <p className="mt-2 text-sm text-emerald-900">{message}</p>
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
