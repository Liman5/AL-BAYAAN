'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Crop,
  ImageIcon,
  Info,
  Loader2,
  MapPin,
  RotateCcw,
  Save,
} from 'lucide-react';
import {
  SITE_IMAGE_SLOTS,
  getSlotAspectLabel,
  type SiteImageMap,
  type SiteImageSlot,
} from '@/lib/siteImages';
import { useSiteImages } from '@/components/providers/site-images-provider';
import ImageCropper from '@/components/admin/image-cropper';

const GROUP_ORDER = ['Identité', 'Page d’accueil', 'Cycles', 'Galerie d’événements'];

type Feedback = { type: 'success' | 'error'; text: string } | null;

export default function SiteImagesManager() {
  const { refresh } = useSiteImages();
  const [values, setValues] = useState<SiteImageMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [cropping, setCropping] = useState<SiteImageSlot | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch('/api/site-images', { cache: 'no-store' });
        const data = await response.json();
        if (alive && data?.success && data.images) {
          setValues(data.images as SiteImageMap);
        }
      } catch {
        if (alive) {
          setFeedback({
            type: 'error',
            text: 'Impossible de charger les images personnalisées. Les images par défaut restent actives.',
          });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        slots: SITE_IMAGE_SLOTS.filter((slot) => slot.group === group),
      })).filter((entry) => entry.slots.length > 0),
    [],
  );

  function handleChange(key: string, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setFeedback(null);
  }

  function handleResetSlot(key: string) {
    setValues((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
    setFeedback(null);
  }

  async function persist(nextValues: SiteImageMap) {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: nextValues }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Enregistrement impossible.');
      }
      setValues((data.images || {}) as SiteImageMap);
      await refresh();
      setFeedback({
        type: 'success',
        text: 'Images enregistrées. Elles sont désormais visibles sur tout le site.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue pendant l’enregistrement.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetAll() {
    if (!window.confirm('Rétablir toutes les images par défaut ?')) return;
    setValues({});
    await persist({});
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <ImageIcon size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Images du site</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Modifiez les photos et le logo affichés sur la page d’accueil et dans les espaces
              internes. Chaque image est listée avec son emplacement exact.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={14} /> Enregistrement côté serveur
        </span>
      </div>

      {/* Mode d'emploi */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 text-sm text-sky-900">
        <p className="flex items-center gap-2 font-bold">
          <Info size={17} /> Comment remplacer une image ?
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-xs leading-6 text-sky-900/80">
          <li>
            Déposez votre fichier dans le dossier{' '}
            <code className="rounded bg-white px-1 py-0.5 font-semibold">public/image/</code> du
            projet.
          </li>
          <li>
            Indiquez son chemin dans le champ de l’image concernée, par exemple{' '}
            <code className="rounded bg-white px-1 py-0.5 font-semibold">/image/ma-photo.jpg</code>.
          </li>
          <li>
            Vous pouvez aussi coller une URL complète commençant par{' '}
            <code className="rounded bg-white px-1 py-0.5 font-semibold">https://</code>.
          </li>
          <li>
            Cliquez sur « Enregistrer les images » : la modification s’applique à tous les
            visiteurs après rechargement de la page.
          </li>
          <li>
            Pour ajuster le cadrage, cliquez sur <strong>« Recadrer »</strong> sur la fiche de
            l’image : déplacez la photo dans le cadre, zoomez, puis validez. Le fichier recadré est
            téléversé automatiquement.
          </li>
        </ol>
        <p className="mt-2 text-[11px] text-sky-900/60">
          Formats conseillés : JPG, PNG ou WebP — logo carré 512×512 px, bannière 1920×1080 px,
          cartes 900×600 px.
        </p>
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

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          <Loader2 size={20} className="animate-spin text-emerald-600" /> Chargement des images…
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ group, slots }) => (
            <section key={group}>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                  {group}
                </h3>
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">{slots.length} image(s)</span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {slots.map((slot) => {
                  const value = values[slot.key] ?? '';
                  const preview = value.trim() || slot.defaultSrc;
                  return (
                    <article
                      key={slot.key}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="relative flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                          {preview ? (
                            <img
                              key={preview}
                              src={preview}
                              alt={`Aperçu — ${slot.label}`}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.visibility = 'hidden';
                              }}
                            />
                          ) : (
                            <ImageIcon size={28} className="text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{slot.label}</h4>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              {getSlotAspectLabel(slot.key)}
                            </span>
                            {value.trim() && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                Personnalisée
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                            <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                            {slot.location}
                          </p>
                          <p className="mt-1 break-words text-[11px] text-slate-400">
                            Référence :{' '}
                            <code className="rounded bg-slate-100 px-1 py-0.5">{slot.fileHint}</code>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                        <label
                          htmlFor={`image-${slot.key}`}
                          className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500"
                        >
                          Chemin du fichier ou URL
                        </label>
                        <div className="mt-1.5 flex gap-2">
                          <input
                            id={`image-${slot.key}`}
                            type="text"
                            value={value}
                            onChange={(event) => handleChange(slot.key, event.target.value)}
                            placeholder={slot.defaultSrc}
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                          />
                          <button
                            type="button"
                            onClick={() => handleResetSlot(slot.key)}
                            disabled={!value}
                            title="Revenir à l’image par défaut"
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-amber-400 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <RotateCcw size={15} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate text-[10px] text-slate-400">
                            Par défaut : {slot.defaultSrc}
                          </p>
                          <button
                            type="button"
                            onClick={() => setCropping(slot)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100"
                          >
                            <Crop size={13} /> Recadrer
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

      )}

      {/* Barre d'actions */}
      <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Les modifications sont enregistrées dans{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">data/site-images.json</code> et
          s’appliquent à tous les visiteurs.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleResetAll}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={16} /> Tout réinitialiser
          </button>
          <button
            type="button"
            onClick={() => persist(values)}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Enregistrement…' : 'Enregistrer les images'}
          </button>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          Astuce : après avoir ajouté un nouveau fichier dans{' '}
          <code>public/image/</code>, indiquez son chemin ci-dessus. Les fichiers statiques sont
          servis depuis la racine : <code>public/image/photo.jpg</code> correspond à{' '}
          <code>/image/photo.jpg</code>.
        </span>
      </p>

      {cropping && (
        <ImageCropper
          slotKey={cropping.key}
          title={cropping.label}
          imageSrc={(values[cropping.key] || cropping.defaultSrc).trim()}
          onClose={() => setCropping(null)}
          onCropped={async (path) => {
            const key = cropping.key;
            const next = { ...values, [key]: path };
            setValues(next);
            await persist(next);
            setFeedback({
              type: 'success',
              text: 'Photo recadrée, téléversée et enregistrée. Elle est déjà visible sur le site.',
            });
            setCropping(null);
          }}
        />
      )}

    </div>
  );
}
