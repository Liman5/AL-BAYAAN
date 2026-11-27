'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Save, ShieldCheck, X } from 'lucide-react';

// ============================================================
// AL-BAYAAN — Paramètres centralisés du scanner
//
// Contrôle ce que le terminal a le droit d'afficher lors d'un
// scan valide. Les valeurs par défaut sont RESTRICTIVES :
// seules les informations strictement nécessaires au personnel
// sont visibles (nom, matricule, classe, heure, statut).
//
// ⚠️ Aucune donnée sensible (téléphone, adresse, parents,
//    informations médicales ou financières) n'est transmissible
//    au terminal, quel que soit le réglage.
// ============================================================

interface ScannerSettings {
  school_id: string;
  show_photo: boolean;
  show_matricule: boolean;
  show_class_name: boolean;
  show_school_name: boolean;
  show_time: boolean;
  attendance_start_time: string;
  late_after_time: string;
  session: string;
  timezone: string;
  notify_parents: boolean;
  sync_photos: boolean;
  offline_grace_days: number;
  config_version: number;
  updated_at: string;
}

const DISPLAY_OPTIONS: Array<{ key: keyof ScannerSettings; label: string; hint: string }> = [
  { key: 'show_photo', label: 'Photo de l’élève', hint: 'Uniquement si la photo est disponible hors ligne.' },
  { key: 'show_matricule', label: 'Matricule', hint: 'Utile au personnel pour vérifier l’identité.' },
  { key: 'show_class_name', label: 'Classe', hint: 'Affichée sous le nom de l’élève.' },
  { key: 'show_school_name', label: 'Nom de l’établissement', hint: 'Rappel du contexte sur le terminal.' },
  { key: 'show_time', label: 'Heure du scan', hint: 'Heure d’arrivée enregistrée.' },
];

export default function ScannerSettingsPanel() {
  const [settings, setSettings] = useState<ScannerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/scanner-settings', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setNotice({ type: 'error', text: payload?.message || 'Chargement impossible.' });
        return;
      }
      setSettings(payload.data.settings as ScannerSettings);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur réseau.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = <K extends keyof ScannerSettings>(key: K, value: ScannerSettings[K]) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const save = useCallback(async () => {
    if (!settings || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/scanner-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: settings.school_id,
          show_photo: settings.show_photo,
          show_matricule: settings.show_matricule,
          show_class_name: settings.show_class_name,
          show_school_name: settings.show_school_name,
          show_time: settings.show_time,
          attendance_start_time: settings.attendance_start_time,
          late_after_time: settings.late_after_time,
          session: settings.session,
          timezone: settings.timezone,
          notify_parents: settings.notify_parents,
          sync_photos: settings.sync_photos,
          offline_grace_days: settings.offline_grace_days,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setNotice({ type: 'error', text: payload?.message || 'Enregistrement impossible.' });
        return;
      }
      setSettings(payload.data.settings as ScannerSettings);
      setNotice({ type: 'success', text: payload.message || 'Paramètres enregistrés.' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur réseau.',
      });
    } finally {
      setSaving(false);
    }
  }, [saving, settings]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        {notice?.text || 'Paramètres du scanner indisponibles.'}
        <p className="mt-2 text-xs">
          Vérifiez que la migration <code className="font-mono">30-badges-terminaux.sql</code> a été
          appliquée sur la base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Politique d'affichage */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Informations affichées au scan</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Mode confidentialité : seules ces informations peuvent apparaître sur le terminal.
        </p>

        <div className="mt-3 space-y-2">
          {DISPLAY_OPTIONS.map((option) => (
            <label
              key={String(option.key)}
              className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50"
            >
              <span>
                <span className="block text-sm font-medium text-slate-800">{option.label}</span>
                <span className="block text-[11px] text-slate-500">{option.hint}</span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(settings[option.key])}
                onChange={(event) => update(option.key, event.target.checked as never)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          Téléphone, adresse, informations parentales, médicales et financières ne sont{' '}
          <strong>jamais</strong> transmises au terminal, quel que soit ce réglage.
        </div>
      </div>

      {/* Horaires */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-sm font-bold text-slate-900">Horaires de présence</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Ouverture
            </span>
            <input
              type="time"
              value={settings.attendance_start_time}
              onChange={(event) => update('attendance_start_time', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Limite de retard
            </span>
            <input
              type="time"
              value={settings.late_after_time}
              onChange={(event) => update('late_after_time', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Session
            </span>
            <select
              value={settings.session}
              onChange={(event) => update('session', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="morning">Matin</option>
              <option value="afternoon">Après-midi</option>
              <option value="evening">Soir</option>
            </select>
          </label>
        </div>


        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Fuseau horaire
            </span>
            <input
              value={settings.timezone}
              onChange={(event) => update('timezone', event.target.value)}
              placeholder="Africa/Lome"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tolérance hors ligne (jours)
            </span>
            <input
              type="number"
              min={1}
              max={365}
              value={settings.offline_grace_days}
              onChange={(event) => update('offline_grace_days', Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <span className="mt-1 block text-[10px] text-slate-400">
              Durée maximale sans synchronisation avant alerte (n’interrompt jamais les scans).
            </span>
          </label>
        </div>
      </div>

      {/* Services optionnels */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Services optionnels</h3>
        </div>

        <label className="mt-3 flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
          <span>
            <span className="block text-sm font-medium text-slate-800">
              Notifications parentales
            </span>
            <span className="block text-[11px] text-slate-500">
              Planifie un message à l’arrivée. Aucun fournisseur d’envoi n’est configuré : les
              messages restent en attente côté serveur.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.notify_parents}
            onChange={(event) => update('notify_parents', event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>

        <label className="mt-2 flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
          <span>
            <span className="block text-sm font-medium text-slate-800">
              Synchroniser les photos
            </span>
            <span className="block text-[11px] text-slate-500">
              Nécessite des photos autorisées et un stockage accessible par le terminal.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.sync_photos}
            onChange={(event) => update('sync_photos', event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">
          Version de configuration : {settings.config_version} · dernière mise à jour{' '}
          {new Date(settings.updated_at).toLocaleString('fr-FR')}
        </p>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer les paramètres
        </button>
      </div>
    </div>
  );
}

