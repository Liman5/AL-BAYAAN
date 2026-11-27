'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { registerStudentSupabase } from '@/services/profile.service';
import { GraduationCap, ArrowLeft, AlertCircle, CheckCircle2, Loader2, School } from 'lucide-react';

export default function StudentRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType(null);

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

    // Validation
    if (!data.full_name) {
      setMessage('Veuillez saisir votre prénom et nom.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (!data.login_email) {
      setMessage('Veuillez saisir une adresse e-mail de connexion.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (data.requested_password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const result = await registerStudentSupabase(data);
    if (result.success) {
      setSubmitted(true);
      setMessage('Votre demande d\'inscription a été envoyée ! Elle sera examinée par l\'administration.');
      setMessageType('success');
      form.reset();
    } else {
      setMessage(result.message ?? 'Une erreur est survenue pendant l\'envoi de la demande.');
      setMessageType('error');
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950 px-4 py-16">
      {/* Décorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl">
        {/* Bouton retour */}
        <Link
          href="/auth/register"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-sky-200/80 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour au choix du profil
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {/* Header coloré */}
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-blue-600 to-indigo-600 p-8 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <GraduationCap size={26} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-sky-100/80">Inscription Élève</p>
                <h1 className="mt-1 text-2xl font-bold">Créer votre compte élève</h1>
              </div>
            </div>
            <p className="relative mt-4 text-sm text-sky-100/80">
              Votre demande sera soumise à l'approbation de l'administration.
            </p>
          </div>

          <div className="p-8">
            {/* Messages de feedback */}
            {message && (
              <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm shadow-sm animate-fade-in ${
                messageType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {messageType === 'success'
                  ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  : <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                }
                <p>{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Prénom</span>
                  <input name="first_name" required type="text" placeholder="Youssef" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Nom</span>
                  <input name="last_name" required type="text" placeholder="Ait" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Date de naissance</span>
                  <input name="dob" required type="date" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Genre</span>
                  <select name="gender" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100">
                    <option value="Male">Homme</option>
                    <option value="Female">Femme</option>
                    <option value="Other">Autre</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Nom du parent</span>
                  <input name="parent_name" required type="text" placeholder="Karim El Amrani" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">E-mail du parent</span>
                  <input name="parent_email" required type="email" placeholder="parent@exemple.com" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Téléphone</span>
                  <input name="phone" required type="tel" placeholder="+212600000000" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Adresse</span>
                  <input name="address" required type="text" placeholder="Rabat, Maroc" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Classe / Niveau</span>
                  <input name="class_name" required type="text" placeholder="Ex : 5ème" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Année scolaire</span>
                  <input name="academic_year" required type="text" placeholder="2025/2026" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Adresse e-mail de connexion</span>
                <input name="email" required type="email" placeholder="vous@exemple.com" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</span>
                <input name="password" required type="password" placeholder="6+ caractères" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" />
              </label>

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-600/30 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Envoi de la demande...
                  </>
                ) : (
                  'Soumettre la demande'
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 text-sm sm:flex-row sm:items-center">
              <School size={14} className="text-slate-400" />
              <span className="text-slate-600">Vous êtes enseignant ou parent ?</span>
              <div className="flex gap-3">
                <Link href="/auth/register/teacher" className="font-semibold text-emerald-700 transition hover:text-emerald-600">
                  Enseignant
                </Link>
                <Link href="/auth/register/parent" className="font-semibold text-amber-700 transition hover:text-amber-600">
                  Parent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}