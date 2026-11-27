'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { registerTeacherSupabase } from '@/services/profile.service';
import { BookOpen, ArrowLeft, AlertCircle, CheckCircle2, Loader2, School, User, Mail, Lock, GraduationCap, Tag } from 'lucide-react';

export default function TeacherRegisterPage() {
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
      first_name: (form.elements.namedItem('first_name') as HTMLInputElement).value,
      last_name: (form.elements.namedItem('last_name') as HTMLInputElement).value,
      gender: (form.elements.namedItem('gender') as HTMLSelectElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      subjects: ((form.elements.namedItem('subjects') as HTMLInputElement).value || '').split(',').map((value) => value.trim()).filter(Boolean),
      assigned_class: (form.elements.namedItem('assigned_class') as HTMLInputElement).value || undefined,
    };

    // Validation
    if (!data.first_name || !data.last_name) {
      setMessage('Veuillez remplir le prénom et le nom.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (data.gender !== 'M' && data.gender !== 'F') {
      setMessage('Veuillez sélectionner votre sexe.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (!data.email) {
      setMessage('Veuillez saisir une adresse e-mail.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (data.password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const result = await registerTeacherSupabase(data);
    if (result.success) {
      setSubmitted(true);
      setMessage('Demande d\'inscription envoyée ! Votre compte devra être approuvé par l\'administrateur avant de pouvoir vous connecter.');
      setMessageType('success');
      form.reset();
    } else {
      setMessage(result.message ?? 'Une erreur est survenue pendant l\'inscription.');
      setMessageType('error');
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 px-4 py-16">
      {/* Décorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Bouton retour */}
        <Link
          href="/auth/register"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-200/80 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour au choix du profil
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {/* Header coloré */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-8 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <BookOpen size={26} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-100/80">Inscription Enseignant</p>
                <h1 className="mt-1 text-2xl font-bold">Créer votre compte enseignant</h1>
              </div>
            </div>
            <p className="relative mt-4 text-sm text-emerald-100/80">
              Rejoignez AL-BAYAAN pour gérer vos classes, devoirs et notes.
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Prénom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="first_name"
                      required
                      type="text"
                      placeholder="Imane"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Nom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="last_name"
                      required
                      type="text"
                      placeholder="Mahmoud"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Sexe *</label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    name="gender"
                    required
                    defaultValue=""
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      Sélectionnez votre sexe
                    </option>
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Adresse e-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="vous@exemple.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="password"
                    required
                    type="password"
                    placeholder="6+ caractères"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Classe affectée</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="assigned_class"
                    type="text"
                    placeholder="Ex : 5A"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Matières enseignées</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="subjects"
                    type="text"
                    placeholder="Mathématiques, Sciences"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Séparez les matières par des virgules</p>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Enregistrer l\'enseignant'
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm">
              <School size={14} className="text-slate-400" />
              <span className="text-slate-600">Vous êtes parent ?</span>
              <Link href="/auth/register/parent" className="font-semibold text-amber-700 transition hover:text-amber-600">
                Inscription Parent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}