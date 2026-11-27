'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Info,
  Loader2,
  Plus,
  Star,
} from 'lucide-react';
import { setCurrentAcademicYear } from '@/lib/schoolData';

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
}

type Feedback = { type: 'success' | 'error'; text: string } | null;

const STATUS_LABELS: Record<string, string> = {
  previous: 'Passée',
  current: 'En cours',
  upcoming: 'À venir',
};

const STATUS_STYLES: Record<string, string> = {
  previous: 'bg-slate-100 text-slate-600',
  current: 'bg-emerald-100 text-emerald-700',
  upcoming: 'bg-amber-100 text-amber-700',
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return value.slice(0, 10);
  }
}

export default function AcademicYearsManager() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  async function load() {
    try {
      const response = await fetch('/api/admin/academic-years', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Chargement impossible.');
      }
      setYears(data.years || []);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Impossible de charger les années.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/admin/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Création impossible.');
      }
      setForm({ name: '', startDate: '', endDate: '' });
      setFeedback({
        type: 'success',
        text: `Année ${data.year.name} créée. Vous pouvez maintenant l’activer.`,
      });
      await load();
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Création impossible.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(id: string) {
    setActivatingId(id);
    setFeedback(null);

    try {
      const response = await fetch('/api/admin/academic-years', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Activation impossible.');
      }

      const active = data.activeYear || (data.years || []).find((year: AcademicYear) => year.is_active);
      if (active) setCurrentAcademicYear(active.name);
      setYears(data.years || []);
      setFeedback({
        type: 'success',
        text: `Année active : ${active?.name || ''}. Le sélecteur et les tableaux de bord utiliseront cette année.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Activation impossible.',
      });
    } finally {
      setActivatingId(null);
    }
  }

  const activeYear = years.find((year) => year.is_active) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-12 text-sm text-slate-500">
        <Loader2 size={20} className="animate-spin text-emerald-600" /> Chargement des années…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CalendarRange size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Années scolaires</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Créez une nouvelle année, puis activez-la. L’année active est utilisée par le
              sélecteur d’année et les tableaux de bord.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <CalendarDays size={14} /> {years.length} année(s)
        </span>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <Info size={18} className="mt-0.5 shrink-0" />
          )}
          <p>{feedback.text}</p>
        </div>
      )}

      {activeYear && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                <Star size={14} /> Année active
              </p>
              <p className="mt-2 text-4xl font-black tracking-tight">{activeYear.name}</p>
              <p className="mt-1 text-sm text-emerald-100/70">
                {formatDate(activeYear.start_date)} → {formatDate(activeYear.end_date)}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 ring-1 ring-white/15">
              <CheckCircle2 size={14} /> Utilisée par le sélecteur et les tableaux de bord
            </span>
          </div>
        </div>
      )}

      {/* Liste des années */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">Toutes les années</h3>
          <span className="text-xs font-semibold text-slate-400">{years.length} au total</span>
        </div>

        <div className="mt-4 space-y-3">
          {years.map((year) => (
            <div
              key={year.id}
              className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                year.is_active
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-slate-100 bg-slate-50/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    year.is_active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-500 ring-1 ring-slate-200'
                  }`}
                >
                  <CalendarDays size={18} />
                </span>
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                    {year.name}
                    {year.is_active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Star size={10} /> Active
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(year.start_date)} → {formatDate(year.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLES[year.status] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {STATUS_LABELS[year.status] || year.status}
                </span>
                {!year.is_active && (
                  <button
                    type="button"
                    onClick={() => handleActivate(year.id)}
                    disabled={activatingId !== null}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {activatingId === year.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    Activer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Création */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Plus size={20} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Créer une année scolaire</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              L’année est créée avec le statut « à venir ». Activez-la quand les classes sont
              prêtes.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]"
        >
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Nom de l’année *
            </span>
            <input
              type="text"
              required
              placeholder="2027-2028"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Date de début *
            </span>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Date de fin *
            </span>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? 'Création…' : 'Créer'}
          </button>
        </form>
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          Activer une année met à jour l’année courante dans la base ET dans le sélecteur de
          l’application. Avant d’utiliser « Passage d’Années », créez les classes de la nouvelle
          année (module Classes).
        </span>
      </p>



    </div>
  );
}
