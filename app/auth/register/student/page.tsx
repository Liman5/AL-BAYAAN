"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { registerStudentRequest } from '@/lib/localAuth';

export default function StudentRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = {
      full_name: `${(form.elements.namedItem('first_name') as HTMLInputElement).value} ${(form.elements.namedItem('last_name') as HTMLInputElement).value}`.trim(),
      date_of_birth: (form.elements.namedItem('dob') as HTMLInputElement).value,
      gender: (form.elements.namedItem('gender') as HTMLSelectElement).value,
      parent_name: (form.elements.namedItem('parent_name') as HTMLInputElement).value,
      parent_email: (form.elements.namedItem('parent_email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      address: (form.elements.namedItem('address') as HTMLInputElement).value,
      class_name: (form.elements.namedItem('class_name') as HTMLInputElement).value,
      academic_year: (form.elements.namedItem('academic_year') as HTMLInputElement).value,
      profile_photo: '',
      login_email: (form.elements.namedItem('email') as HTMLInputElement).value,
      requested_password: (form.elements.namedItem('password') as HTMLInputElement).value,
    };

    const result = registerStudentRequest(data);
    if (result.success) {
      setSubmitted(true);
      setMessage('Votre demande d’inscription est en attente d’approbation par l’administrateur.');
      form.reset();
    } else {
      setMessage(result.message);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-20">
      <div className="glass-card rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-900/80">Inscription Élève</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Créer votre compte élève</h1>
          <p className="mt-4 text-slate-600">Inscrivez-vous localement pour accéder à votre espace élève.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-700">Prénom</span>
              <input name="first_name" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Nom</span>
              <input name="last_name" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-700">Date de naissance</span>
              <input name="dob" required type="date" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Genre</span>
              <select name="gender" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500">
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
                <option value="Other">Autre</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-700">Nom du parent</span>
              <input name="parent_name" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">E-mail du parent</span>
              <input name="parent_email" required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-700">Téléphone</span>
              <input name="phone" required type="tel" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Adresse</span>
              <input name="address" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-700">Classe / Niveau</span>
              <input name="class_name" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" placeholder="Ex: 5ème, 10ème" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Année scolaire</span>
              <input name="academic_year" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" placeholder="2025/2026" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-slate-700">Adresse e-mail de connexion</span>
            <input name="email" required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Mot de passe</span>
            <input name="password" required type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500" />
          </label>

          <button type="submit" className="w-full rounded-full bg-sky-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800">
            Soumettre la demande
          </button>
        </form>

        {message ? (
          <div className="mt-8 rounded-3xl border border-sky-100 bg-sky-50/80 p-5 text-sky-900 shadow-sm">
            <p className="font-semibold">Demande envoyée</p>
            <p className="mt-2 text-sm text-sky-900">{message}</p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Vous êtes enseignant ou parent ?</p>
          <div className="flex gap-2">
            <Link href="/auth/register/teacher" className="rounded-full border border-emerald-900/20 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100">
              Enseignant
            </Link>
            <Link href="/auth/register/parent" className="rounded-full border border-amber-900/20 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100">
              Parent
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
