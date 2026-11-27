'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signInWithMatricule, resetPasswordWithParentVerification } from '@/services/auth.service';
import { getProfileByUserId } from '@/services/auth.service';
import { roles } from '@/lib/constants';
import { setAuthCookies } from '@/lib/authClient';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  School,
  KeyRound,
  UserRound,
  Phone,
  ArrowLeft,
} from 'lucide-react';

type LoginMode = 'email' | 'matricule' | 'reset';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('email');
  const [email, setEmail] = useState('');
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  async function redirectToDashboard(profileRole: string, userId: string) {
    setAuthCookies(profileRole as any, userId);
    setSuccess('Connexion réussie ! Redirection...');

    setTimeout(() => {
      switch (profileRole) {
        case roles.TEACHER:
          router.push('/teacher/dashboard');
          break;
        case roles.STUDENT:
          router.push('/student/dashboard');
          break;
        case roles.PARENT:
          router.push('/parent/dashboard');
          break;
        case roles.SCHOOL_ADMIN:
        case roles.SUPER_ADMIN:
          router.push('/admin');
          break;
        default:
          setError('Rôle inconnu. Contactez l\'administrateur.');
          setLoading(false);
      }
    }, 800);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Mode 1 : Connexion par email
      if (mode === 'email') {
        if (!email.trim()) {
          setError('Veuillez saisir votre adresse e-mail.');
          setLoading(false);
          return;
        }
        if (!password) {
          setError('Veuillez saisir votre mot de passe.');
          setLoading(false);
          return;
        }

        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect.'
            : res.error.message);
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

        const { data, error: profileError } = await getProfileByUserId(userId);
        if (profileError) {
          setError(profileError.message || 'Votre profil est introuvable ou incomplet. Contactez l\'administrateur.');
          setLoading(false);
          return;
        }

        if (!data?.role) {
          setError('Aucun rôle trouvé pour ce compte. Votre inscription est peut-être en attente d\'approbation.');
          setLoading(false);
          return;
        }

        const profileRole = data.role as string;
        const realUserId = (data as any).id || userId;
        await redirectToDashboard(profileRole, realUserId);
      }

      // Mode 2 : Connexion par matricule (élèves)
      else if (mode === 'matricule') {
        if (!matricule.trim()) {
          setError('Veuillez saisir votre matricule.');
          setLoading(false);
          return;
        }
        if (!password) {
          setError('Veuillez saisir votre mot de passe.');
          setLoading(false);
          return;
        }

        const { data, error: matriculeError } = await signInWithMatricule(matricule.trim(), password);
        if (matriculeError) {
          setError(matriculeError.message || 'Matricule ou mot de passe incorrect.');
          setLoading(false);
          return;
        }

        const userId = data?.user?.id;
        if (!userId) {
          setError('Utilisateur introuvable après connexion.');
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await getProfileByUserId(userId);
        if (profileError) {
          setError(profileError.message || 'Votre profil est introuvable.');
          setLoading(false);
          return;
        }

        const profileRole = profileData?.role as string;
        const realUserId = (profileData as any)?.id || userId;
        await redirectToDashboard(profileRole, realUserId);
      }

      // Mode 3 : Réinitialisation mot de passe
      else if (mode === 'reset') {
        if (!matricule.trim()) {
          setError('Veuillez saisir votre matricule.');
          setLoading(false);
          return;
        }
        if (!parentEmail.trim() && !parentPhone.trim()) {
          setError('Veuillez saisir l\'email OU le téléphone du parent.');
          setLoading(false);
          return;
        }
        if (!newPassword || newPassword.length < 6) {
          setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
          setLoading(false);
          return;
        }

        const result = await resetPasswordWithParentVerification({
          matricule: matricule.trim(),
          parentEmail: parentEmail.trim() || undefined,
          parentPhone: parentPhone.trim() || undefined,
          newPassword,
        });

        if (result.success) {
          setSuccess(result.message);
          setError(null);
          // Passer en mode connexion par matricule après succès
          setTimeout(() => {
            setMode('matricule');
            setNewPassword('');
            setParentEmail('');
            setParentPhone('');
            setSuccess(null);
          }, 2000);
        } else {
          setError(result.message);
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 px-4 py-16">
      {/* Décorations d'arrière-plan */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-2">
        {/* Colonne gauche - branding */}
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
              Bienvenue sur la plateforme <span className="text-amber-400">AL-BAYAAN</span>
            </h2>
            <p className="text-sm leading-7 text-emerald-100/70">
              Accédez à votre espace dédié : enseignement, suivi des élèves, notes, devoirs, présences et paiements — tout au même endroit.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { icon: '📚', text: 'Gérez vos classes et vos devoirs' },
                { icon: '📊', text: 'Suivez les notes et la progression' },
                { icon: '👨‍👩‍👧', text: 'Restez connecté avec les parents' },
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

        {/* Colonne droite - formulaire */}
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

          {mode === 'reset' ? (
            <button
              onClick={() => { setMode('email'); setError(null); setSuccess(null); }}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={16} />
              Retour à la connexion
            </button>
          ) : null}

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {mode === 'reset' ? 'Réinitialiser le mot de passe' : 'Connexion'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'email' && 'Accédez à votre tableau de bord avec votre e-mail.'}
            {mode === 'matricule' && 'Connectez-vous avec votre matricule (ALB-2026-0001).'}
            {mode === 'reset' && 'Vérifiez votre identité via les informations du parent.'}
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm animate-fade-in">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm animate-fade-in">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
              <p>{success}</p>
            </div>
          )}

          {/* Choix du mode */}
          {mode !== 'reset' && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setMode('email'); setError(null); setSuccess(null); }}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  mode === 'email'
                    ? 'bg-emerald-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mail size={16} />
                E-mail
              </button>
              <button
                type="button"
                onClick={() => { setMode('matricule'); setError(null); setSuccess(null); }}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  mode === 'matricule'
                    ? 'bg-emerald-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <UserRound size={16} />
                Matricule (Élève)
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Mode Email */}
            {mode === 'email' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Adresse e-mail</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="vous@exemple.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Mode Matricule */}
            {mode === 'matricule' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Matricule</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      type="text"
                      placeholder="ALB-2026-0001"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(null); setSuccess(null); }}
                    className="text-sm text-sky-600 hover:text-sky-800 transition-colors font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </>
            )}

            {/* Mode Reset */}
            {mode === 'reset' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Matricule de l'élève</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      type="text"
                      placeholder="ALB-2026-0001"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail du parent (optionnel)</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      type="email"
                      placeholder="parent@exemple.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Téléphone du parent (optionnel)</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      type="tel"
                      placeholder="+212 6 00 00 00 00"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  L'email ou le téléphone du parent doit correspondre à celui associé à l'élève lors de l'inscription.
                </p>
              </>
            )}

            <button
              disabled={loading}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-900 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-900/30 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {mode === 'reset' ? 'Réinitialisation...' : 'Connexion en cours...'}
                </>
              ) : mode === 'reset' ? (
                'Réinitialiser le mot de passe'
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-sm text-slate-600">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="font-semibold text-emerald-900 transition hover:text-emerald-700">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}