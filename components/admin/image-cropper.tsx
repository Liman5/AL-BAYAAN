'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Crop, Loader2, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { getSlotAspect, getSlotAspectLabel } from '@/lib/siteImages';

interface ImageCropperProps {
  slotKey: string;
  title: string;
  imageSrc: string;
  onClose: () => void;
  onCropped: (path: string) => void | Promise<void>;
}

type Offset = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ImageCropper({
  slotKey,
  title,
  imageSrc,
  onClose,
  onCropped,
}: ImageCropperProps) {
  const aspect = getSlotAspect(slotKey);
  const aspectLabel = getSlotAspectLabel(slotKey);
  const editableSrc = /^https?:\/\//i.test(imageSrc)
    ? `/api/site-images/proxy?url=${encodeURIComponent(imageSrc)}`
    : imageSrc;
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [box, setBox] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const update = () =>
      setBox({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [busy, onClose]);

  const baseSize = useMemo(() => {
    if (!box.width || !box.height || !natural.width || !natural.height) return null;
    const cover = Math.max(box.width / natural.width, box.height / natural.height);
    return { width: natural.width * cover, height: natural.height * cover };
  }, [box, natural]);

  const displaySize = baseSize
    ? { width: baseSize.width * zoom, height: baseSize.height * zoom }
    : null;

  const maxOffsetX = displaySize ? Math.max(0, (displaySize.width - box.width) / 2) : 0;
  const maxOffsetY = displaySize ? Math.max(0, (displaySize.height - box.height) / 2) : 0;

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!displaySize || busy) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      };
    },
    [busy, displaySize, offset.x, offset.y],
  );

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    setOffset({
      x: clamp(dragRef.current.offsetX + deltaX, -maxOffsetX, maxOffsetX),
      y: clamp(dragRef.current.offsetY + deltaY, -maxOffsetY, maxOffsetY),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleZoom(next: number) {
    const value = clamp(next, 1, 3);
    setZoom(value);
    if (!baseSize) return;
    const width = baseSize.width * value;
    const height = baseSize.height * value;
    setOffset((previous) => ({
      x: clamp(previous.x, -(width - box.width) / 2, (width - box.width) / 2),
      y: clamp(previous.y, -(height - box.height) / 2, (height - box.height) / 2),
    }));
  }

  function resetCrop() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setError(null);
  }

  async function handleCrop() {
    if (!displaySize || !box.width || !box.height || busy) return;
    setBusy(true);
    setError(null);

    try {
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error('Impossible de charger cette image. Vérifiez son chemin ou son URL.'));
        image.src = editableSrc;
      });

      const scale = image.naturalWidth / displaySize.width;
      const left = (box.width - displaySize.width) / 2 + offset.x;
      const top = (box.height - displaySize.height) / 2 + offset.y;
      const sourceX = clamp(-left * scale, 0, image.naturalWidth);
      const sourceY = clamp(-top * scale, 0, image.naturalHeight);
      const sourceWidth = clamp(box.width * scale, 1, image.naturalWidth - sourceX);
      const sourceHeight = clamp(box.height * scale, 1, image.naturalHeight - sourceY);

      const outputWidth = Math.min(1600, Math.max(320, Math.round(sourceWidth)));
      const outputHeight = Math.max(1, Math.round(outputWidth / aspect));

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Le navigateur ne peut pas recadrer cette image.');

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, outputWidth, outputHeight);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      let blob: Blob | null = null;
      try {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.9),
        );
      } catch {
        throw new Error(
          'Cette image distante ne permet pas le recadrage. Téléversez-la d’abord dans public/image.',
        );
      }
      if (!blob) {
        throw new Error(
          'Recadrage impossible. Téléversez l’image dans public/image puis réessayez.',
        );
      }

      const form = new FormData();
      form.append('file', new File([blob], `${slotKey}.jpg`, { type: 'image/jpeg' }));
      form.append('slot', slotKey);

      const response = await fetch('/api/site-images/upload', {
        method: 'POST',
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Impossible d’enregistrer l’image recadrée.');
      }

      await onCropped(data.path as string);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue pendant le recadrage.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Recadrer ${title}`}
    >
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Crop size={20} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Recadrer — {title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Format cible {aspectLabel} · faites glisser la photo, puis ajustez le zoom.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fermer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mx-auto w-full max-w-xl">
            <div
              ref={boxRef}
              style={{ aspectRatio: `${aspect}` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 active:cursor-grabbing"
            >
              <img
                src={editableSrc}
                alt=""
                draggable={false}
                onLoad={(event) =>
                  setNatural({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={
                  displaySize
                    ? {
                        width: displaySize.width,
                        height: displaySize.height,
                        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                      }
                    : { opacity: 0 }
                }
              />

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
                <span className="absolute left-2 top-2 rounded bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Zone visible sur le site
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-4 flex max-w-xl items-center gap-2">
            <button
              type="button"
              onClick={() => handleZoom(zoom - 0.2)}
              disabled={busy || zoom <= 1}
              aria-label="Réduire le zoom"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => handleZoom(Number(event.target.value))}
              aria-label="Zoom de l’image"
              className="h-1.5 flex-1 cursor-pointer accent-emerald-700"
            />
            <button
              type="button"
              onClick={() => handleZoom(zoom + 0.2)}
              disabled={busy || zoom >= 3}
              aria-label="Augmenter le zoom"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              onClick={resetCrop}
              disabled={busy}
              title="Réinitialiser le cadrage"
              aria-label="Réinitialiser le cadrage"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <p className="mx-auto mt-2 max-w-xl text-center text-[11px] text-slate-400">
            Faites glisser la photo dans le cadre pour choisir la partie visible. L’image recadrée
            sera enregistrée dans <code className="rounded bg-slate-100 px-1">data/site-uploads/</code>.
          </p>

          {error && (
            <p className="mx-auto mt-3 max-w-xl rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
              {error}
            </p>
          )}

          <div className="mx-auto mt-5 flex max-w-xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleCrop}
              disabled={busy || !displaySize}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Crop size={16} />}
              {busy ? 'Recadrage…' : 'Recadrer et utiliser'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
