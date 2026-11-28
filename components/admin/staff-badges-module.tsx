'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  RefreshCw,
  Loader2,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  X,
  Eye,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import {
  buildBadgesPdf,
  qrPreviewDataUrl,
  type BadgePdfEntry,
} from '@/components/admin/badge-pdf';

// ============================================================
// AL-BAYAAN — Module « Badges personnel »
//
// Enseignants et administration : mêmes règles que les élèves
// (token opaque, génération idempotente, révocation, renouvellement,
// impression PDF). Aucun badge n'est créé automatiquement.
// ============================================================

interface StaffBadgeRow {
  userId: string;
  staffType: 'teacher' | 'admin';
  staffProfileId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  roleLabel: string;
  status: string;
  badge: {
    id: string;
    status: 'active' | 'revoked' | 'replaced';
    issuedAt: string | null;
    printedCount: number;
    tokenPrefix: string;
    token: string | null;
  } | null;
}

interface StaffBadgesResponse {
  staff: StaffBadgeRow[];
  stats: {
    total: number;
    teachers: number;
    admins: number;
    withActiveBadge: number;
    withoutBadge: number;
  };
  academicYearName: string | null;
  schoolName: string;
}

type Notice = { type: 'success' | 'error' | 'info'; text: string } | null;

export default function StaffBadgesModule() {
  const [rows, setRows] = useState<StaffBadgeRow[]>([]);
  const [stats, setStats] = useState<StaffBadgesResponse['stats']>({
    total: 0,
    teachers: 0,
    admins: 0,
    withActiveBadge: 0,
    withoutBadge: 0,
  });
  const [schoolName, setSchoolName] = useState('AL-BAYAAN');
  const [academicYearName, setAcademicYearName] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [preview, setPreview] = useState<{ dataUrl: string; entry: BadgePdfEntry } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ staffType: typeFilter, status: statusFilter });
      if (search.trim()) params.set('search', search.trim());

      const response = await fetch(`/api/admin/staff-badges?${params.toString()}`, {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setNotice({ type: 'error', text: payload?.message || 'Chargement impossible.' });
        setRows([]);
        return;
      }

      const data = payload.data as StaffBadgesResponse;
      setRows(data.staff);
      setStats(data.stats);
      setSchoolName(data.schoolName || 'AL-BAYAAN');
      setAcademicYearName(data.academicYearName);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur réseau.',
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const printableRows = useMemo(
    () => rows.filter((row) => row.badge?.status === 'active' && row.badge.token),
    [rows],
  );

  const toggleRow = (userId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleGenerate = useCallback(async () => {
    if (busy || selected.size === 0) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/staff-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selected) }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setNotice({ type: 'error', text: payload?.message || 'Génération impossible.' });
        return;
      }
      setSelected(new Set());
      setNotice({ type: 'success', text: payload.message || 'Badges générés.' });
      await load();
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur réseau.',
      });
    } finally {
      setBusy(false);
    }
  }, [busy, load, selected]);

  const handleRevoke = useCallback(
    async (row: StaffBadgeRow) => {
      if (!row.badge || busy) return;
      if (
        !window.confirm(
          `Révoquer le badge de ${row.firstName} ${row.lastName} ?\n\n` +
            'Le QR ne sera plus accepté par les terminaux après leur prochaine synchronisation.',
        )
      ) {
        return;
      }
      setBusy(true);
      try {
        const response = await fetch('/api/admin/staff-badges', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'revoke', badgeId: row.badge.id }),
        });
        const payload = await response.json();
        setNotice({
          type: payload?.success ? 'success' : 'error',
          text: payload?.message || 'Action terminée.',
        });
        await load();
      } finally {
        setBusy(false);
      }
    },
    [busy, load],
  );

  const handleRenew = useCallback(
    async (row: StaffBadgeRow) => {
      if (busy) return;
      if (
        !window.confirm(
          `Générer un NOUVEAU badge pour ${row.firstName} ${row.lastName} ?\n\n` +
            'L’ancien badge sera remplacé et ne fonctionnera plus.',
        )
      ) {
        return;
      }
      setBusy(true);
      try {
        const response = await fetch('/api/admin/staff-badges', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'renew', userId: row.userId }),
        });
        const payload = await response.json();
        setNotice({
          type: payload?.success ? 'success' : 'error',
          text: payload?.message || 'Action terminée.',
        });
        await load();
      } finally {
        setBusy(false);
      }
    },
    [busy, load],
  );

  const handleExportPdf = useCallback(async () => {
    if (busy) return;
    const source = rows.filter(
      (row) =>
        row.badge?.status === 'active' &&
        Boolean(row.badge.token) &&
        (selected.size === 0 || selected.has(row.userId)),
    );
    if (source.length === 0) {
      setNotice({ type: 'info', text: 'Aucun badge actif à imprimer.' });
      return;
    }

    setBusy(true);
    try {
      const entries: BadgePdfEntry[] = source.map((row) => ({
        token: row.badge?.token || '',
        firstName: row.firstName,
        lastName: row.lastName,
        matricule: row.matricule,
        className: row.roleLabel,
        photoUrl: null,
      }));

      const { pdf, printed, skipped } = await buildBadgesPdf(entries, {
        schoolName,
        academicYearName,
        includePhotos: false,
      });

      if (printed === 0) {
        setNotice({ type: 'error', text: 'Aucun badge valide à imprimer.' });
        return;
      }

      pdf.save(`badges-personnel-${new Date().toISOString().slice(0, 10)}.pdf`);
      setNotice({
        type: 'success',
        text: `${printed} badge(s) du personnel exporté(s)${skipped > 0 ? `, ${skipped} ignoré(s)` : ''}.`,
      });

      await fetch('/api/admin/staff-badges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark-printed',
          badgeIds: source.map((row) => row.badge?.id).filter(Boolean),
        }),
      }).catch(() => undefined);
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Export PDF impossible.',
      });
    } finally {
      setBusy(false);
    }
  }, [academicYearName, busy, rows, schoolName, selected]);

  const openPreview = useCallback(async (row: StaffBadgeRow) => {
    const token = row.badge?.token;
    if (!token) return;
    try {
      const dataUrl = await qrPreviewDataUrl(token);
      setPreview({
        dataUrl,
        entry: {
          token,
          firstName: row.firstName,
          lastName: row.lastName,
          matricule: row.matricule,
          className: row.roleLabel,
        },
      });
    } catch {
      setNotice({ type: 'error', text: 'Aperçu impossible.' });
    }
  }, []);


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div className="text-sm text-emerald-950">
            <p className="font-semibold">Badges du personnel</p>
            <p className="mt-1 text-emerald-900/80">
              Enseignants et administration : le QR ne contient <strong>aucune donnée
              personnelle</strong> (token opaque uniquement). Aucun badge n’est créé
              automatiquement : vous choisissez qui en reçoit un.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Enseignants', value: stats.teachers, tone: 'bg-blue-100 text-blue-700' },
          { label: 'Administration', value: stats.admins, tone: 'bg-slate-100 text-slate-700' },
          { label: 'Badges actifs', value: stats.withActiveBadge, tone: 'bg-emerald-100 text-emerald-700' },
          { label: 'Sans badge', value: stats.withoutBadge, tone: 'bg-amber-100 text-amber-700' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`inline-flex rounded-xl px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${card.tone}`}>
              {card.label}
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom, matricule, matière…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tout le personnel</option>
            <option value="teacher">Enseignants</option>
            <option value="admin">Administration</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Badge actif</option>
            <option value="revoked">Badge révoqué</option>
            <option value="none">Sans badge</option>
          </select>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : notice.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-slate-200 bg-slate-50 text-slate-800'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={busy || selected.size === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
          Générer pour la sélection ({selected.size})
        </button>
        <button
          type="button"
          onClick={() => void handleExportPdf()}
          disabled={busy || printableRows.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
        >
          <Printer className="h-4 w-4" />
          Imprimer {selected.size > 0 ? 'la sélection' : 'tout'} ({selected.size > 0 ? selected.size : printableRows.length})
        </button>
      </div>


      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div className="px-4 py-10 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-slate-500">
            <GraduationCap className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            Aucun membre du personnel ne correspond aux filtres.
          </div>
        )}

        {!loading &&
          rows.map((row) => {
            const active = row.badge?.status === 'active';
            return (
              <div
                key={row.userId}
                className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(row.userId)}
                    onChange={() => toggleRow(row.userId)}
                    aria-label={`Sélectionner ${row.firstName} ${row.lastName}`}
                    className="mt-1.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    {row.staffType === 'teacher' ? <GraduationCap size={16} /> : <Briefcase size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {row.firstName} {row.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {row.matricule} · {row.roleLabel}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {row.badge?.status === 'active' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Badge actif
                        </span>
                      )}
                      {row.badge?.status === 'revoked' && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          Révoqué
                        </span>
                      )}
                      {row.badge?.status === 'replaced' && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Remplacé
                        </span>
                      )}
                      {!row.badge && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          Aucun badge
                        </span>
                      )}
                      {row.badge?.tokenPrefix && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {row.badge.tokenPrefix}…
                        </span>
                      )}
                      {row.badge?.printedCount ? (
                        <span className="text-[10px] text-slate-400">
                          imprimé {row.badge.printedCount}×
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pl-7 sm:pl-0">
                  {active && (
                    <>
                      <button
                        type="button"
                        onClick={() => void openPreview(row)}
                        title="Prévisualiser le QR"
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRevoke(row)}
                        disabled={busy}
                        title="Révoquer le badge"
                        className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleRenew(row)}
                    disabled={busy}
                    title="Générer un nouveau badge"
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>


      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Aperçu du badge
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {preview.entry.firstName} {preview.entry.lastName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Fermer l’aperçu"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-slate-200 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.dataUrl} alt="QR code du badge" className="h-52 w-52" />
              <p className="mt-3 font-mono text-xs text-slate-500">{preview.entry.matricule}</p>
              <p className="text-xs text-slate-500">{preview.entry.className}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

