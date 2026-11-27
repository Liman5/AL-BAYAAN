'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Loader2, Plus, X } from 'lucide-react';

export interface ClassFormValues {
  name: string;
  level: string;
  academicYearId: string;
  roomNumber?: string;
  description?: string;
}

interface AcademicYearOption {
  id: string;
  name: string;
  is_active: boolean;
}

interface ClassFormProps {
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: ClassFormValues) => void | Promise<void>;
}

const LEVEL_OPTIONS = [
  { value: 'preschool', label: 'Maternelle' },
  { value: 'primary', label: 'Primaire' },
  { value: 'middle_school', label: 'Collège' },
];

export default function ClassForm({ saving = false, onCancel, onSubmit }: ClassFormProps) {
  const [years, setYears] = useState<AcademicYearOption[]>([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ClassFormValues>({
    name: '',
    level: 'primary',
    academicYearId: '',
    roomNumber: '',
    description: '',
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const response = await fetch('/api/admin/academic-years', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Impossible de charger les années scolaires.');
        }
        const list: AcademicYearOption[] = data.years || [];
        if (alive) {
          setYears(list);
          const active = list.find((year) => year.is_active) || list[list.length - 1];
          setForm((previous) => ({
            ...previous,
            academicYearId: previous.academicYearId || active?.id || '',
          }));
        }
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error ? err.message : 'Impossible de charger les années scolaires.',
          );
        }
      } finally {
        if (alive) setLoadingYears(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Le nom de la classe est requis.');
      return;
    }
    if (!form.academicYearId) {
      setError('Sélectionnez une année scolaire.');
      return;
    }

    await onSubmit({
      ...form,
      name: form.name.trim(),
      roomNumber: form.roomNumber?.trim(),
      description: form.description?.trim(),
    });
  }

  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <BookOpen size={20} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Nouvelle classe</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Créez une classe pour une année scolaire. Vous pourrez ensuite y inscrire des élèves
              et y affecter des enseignants.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fermer le formulaire"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Nom de la classe *
          </span>
          <input
            type="text"
            required
            placeholder="Ex. CP1, CE2 A, 6e B, Maternelle GS…"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Niveau *
          </span>
          <select
            value={form.level}
            onChange={(event) => setForm({ ...form, level: event.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
          >
            {LEVEL_OPTIONS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Année scolaire *
          </span>
          <select
            required
            value={form.academicYearId}
            onChange={(event) => setForm({ ...form, academicYearId: event.target.value })}
            disabled={loadingYears || years.length === 0}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-60"
          >
            {loadingYears ? (
              <option value="">Chargement…</option>
            ) : years.length === 0 ? (
              <option value="">Aucune année disponible</option>
            ) : (
              years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                  {year.is_active ? ' (active)' : ''}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Salle
          </span>
          <input
            type="text"
            placeholder="Ex. Salle 3"
            value={form.roomNumber}
            onChange={(event) => setForm({ ...form, roomNumber: event.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Description
          </span>
          <textarea
            rows={2}
            placeholder="Informations complémentaires (optionnel)"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
          />
        </label>

        {years.length === 0 && !loadingYears && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:col-span-2">
            Aucune année scolaire disponible. Créez d’abord une année dans le module « Années
            scolaires ».
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || loadingYears || years.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? 'Création…' : 'Créer la classe'}
          </button>
        </div>

      </form>
    </div>
  );
}
