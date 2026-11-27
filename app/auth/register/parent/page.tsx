'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { registerParentSupabase } from '@/services/profile.service';
import { Users, ArrowLeft, AlertCircle, CheckCircle2, Loader2, School, User, Mail, Lock, Phone } from 'lucide-react';

export default function ParentRegisterPage() {
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
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      parent_for: [] as string[],
    };

    // Validation
    if (!data.first_name || !data.last_name) {
      setMessage('Veuillez remplir le prénom et le nom.');
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

    const result = await registerParentSupabase(data);
    if (result.success) {
      setSubmitted(true);
      setMessage('Compte parent créé avec succès ! Vous pouvez maintenant vous connecter.');
      setMessageType('success');
      form.reset();
    } else {
      setMessage(result.message ?? 'Une erreur est survenue pendant l\'inscription.');
      setMessageType('error');
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 px-4 py-16">
      {/* Décorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Bouton retour */}
        <Link
          href="/auth/register"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour au choix du profil
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {/* Header coloré */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-500 to-amber-500 p-8 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Users size={26} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-amber-100/80">Inscription Parent</p>
                <h1 className="mt-1 text-2xl font-bold">Créer votre compte parent</h1>
              </div>
            </div>
            <p className="relative mt-4 text-sm text-amber-100/80">
              Suivez la progression scolaire de vos enfants via AL-BAYAAN.
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
                      placeholder="Karim"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
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
                      placeholder="El Amrani"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                    />
                  </div>
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder="+212600000000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-600/30 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Enregistrer le parent'
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm">
              <School size={14} className="text-slate-400" />
              <span className="text-slate-600">Vous êtes enseignant ?</span>
              <Link href="/auth/register/teacher" className="font-semibold text-emerald-700 transition hover:text-emerald-600">
                Inscription Enseignant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}