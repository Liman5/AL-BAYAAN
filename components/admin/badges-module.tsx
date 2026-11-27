'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Eye,
  Loader2,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  buildBadgesPdf,
  qrPreviewDataUrl,
  type BadgePdfEntry,
} from '@/components/admin/badge-pdf';

// ============================================================
// AL-BAYAAN — Module « Badges QR & Présence »
//
// Génération, révocation, renouvellement et impression des
// badges QR des élèves. Aucun badge n'est créé automatiquement :
// l'administrateur choisit explicitement les élèves concernés.
// ============================================================

export interface BadgeStudentRow {
  studentId: string;
  matricule: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  status: string;
  classId: string | null;
  className: string;
  classLevel: string | null;
  badge: {
    id: string;
    status: 'active' | 'revoked' | 'replaced';
    issuedAt: string | null;
    revokedAt: string | null;
    revokedReason: string | null;
    printedCount: number;
    lastPrintedAt: string | null;
    tokenPrefix: string;
    token: string | null;
  } | null;
}

interface BadgesResponse {
  students: BadgeStudentRow[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  stats: { total: number; withActiveBadge: number; withRevokedBadge: number; withoutBadge: number };
  academicYearId: string | null;
  academicYearName: string | null;
  schoolName: string;
}

interface ClassOption {
  id: string;
  name: string;
}

type Notice = { type: 'success' | 'error' | 'info'; text: string } | null;

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tous les élèves' },
  { value: 'active', label: 'Badge actif' },
  { value: 'revoked', label: 'Badge révoqué' },
  { value: 'none', label: 'Sans badge' },
];

export default function BadgesModule() {
  const [rows, setRows] = useState<BadgeStudentRow[]>([]);
  const [stats, setStats] = useState<BadgesResponse['stats']>({
    total: 0,
    withActiveBadge: 0,
    withRevokedBadge: 0,
    withoutBadge: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1,
  });
  const [schoolName, setSchoolName] = useState('AL-BAYAAN');
  const [academicYearName, setAcademicYearName] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [preview, setPreview] = useState<Array<{ token: string; dataUrl: string; entry: BadgePdfEntry }>>(
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '25',
        status: statusFilter,
      });
      if (search.trim()) params.set('search', search.trim());
      if (classFilter) params.set('classId', classFilter);

      const response = await fetch(`/api/admin/badges?${params.toString()}`, {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setNotice({ type: 'error', text: payload?.message || 'Chargement impossible.' });
        setRows([]);
        return;
      }

      const data = payload.data as BadgesResponse;
      setRows(data.students);
      setStats(data.stats);
      setPagination(data.pagination);
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
  }, [page, search, classFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const classOptions = useMemo<ClassOption[]>(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      if (row.classId && row.className) map.set(row.classId, row.className);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const printableRows = useMemo(
    () => rows.filter((row) => row.badge?.status === 'active' && row.badge.token),
    [rows],
  );

  const allPrintableSelected = useMemo(
    () => printableRows.length > 0 && printableRows.every((row) => selected.has(row.studentId)),
    [printableRows, selected],
  );

  const toggleRow = (studentId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleAllPrintable = () => {
    setSelected((current) => {
      if (allPrintableSelected) {
        const next = new Set(current);
        printableRows.forEach((row) => next.delete(row.studentId));
        return next;
      }
      const next = new Set(current);
      printableRows.forEach((row) => next.add(row.studentId));
      return next;
    });
  };

  /** Récupère TOUS les identifiants élèves correspondant aux filtres courants. */
  const collectStudentIdsForCurrentFilter = useCallback(async (): Promise<string[]> => {
    const ids: string[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: '100',
        status: statusFilter,
      });
      if (search.trim()) params.set('search', search.trim());
      if (classFilter) params.set('classId', classFilter);

      const response = await fetch(`/api/admin/badges?${params.toString()}`, {
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) break;

      const data = payload.data as BadgesResponse;
      totalPages = data.pagination.totalPages;
      for (const row of data.students) {
        if (row.badge?.status !== 'active') ids.push(row.studentId);
      }
      currentPage++;
    } while (currentPage <= totalPages && currentPage <= 30);

    return ids;
  }, [classFilter, search, statusFilter]);

  const handleGenerate = useCallback(
    async (scope: 'selection' | 'filter') => {
      if (busy) return;
      setBusy(true);
      setNotice(null);

      try {
        const studentIds =
          scope === 'selection'
            ? rows
                .filter((row) => selected.has(row.studentId) && row.badge?.status !== 'active')
                .map((row) => row.studentId)
            : await collectStudentIdsForCurrentFilter();

        if (studentIds.length === 0) {
          setNotice({
            type: 'info',
            text: 'Aucun élève à générer : les élèves sélectionnés ont déjà un badge actif.',
          });
          return;
        }

        const response = await fetch('/api/admin/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentIds }),
        });
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          setNotice({ type: 'error', text: payload?.message || 'Génération impossible.' });
          return;
        }

        const { generated, reused } = payload.data as { generated: number; reused: number };
        const requiresRenewal = (payload.data.results as any[]).filter(
          (row) => row.outcome === 'requires_renewal',
        ).length;

        setSelected(new Set());
        setNotice({
          type: 'success',
          text: `${generated} badge(s) généré(s), ${reused} réutilisé(s)${
            requiresRenewal > 0
              ? `, ${requiresRenewal} à renouveler (badge révoqué existant).`
              : '.'
          }`,
        });
        await load();
      } catch (error) {
        setNotice({
          type: 'error',
          text: error instanceof Error ? error.message : 'Erreur réseau.',
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, collectStudentIdsForCurrentFilter, load, rows, selected],
  );

  const handleRevoke = useCallback(
    async (row: BadgeStudentRow) => {
      if (!row.badge || busy) return;
      const confirmed = window.confirm(
        `Révoquer le badge de ${row.firstName} ${row.lastName} ?\n\n` +
          'Le QR ne sera plus accepté par les terminaux après leur prochaine synchronisation.',
      );
      if (!confirmed) return;

      setBusy(true);
      try {
        const response = await fetch('/api/admin/badges', {
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
    async (row: BadgeStudentRow) => {
      if (busy) return;
      const confirmed = window.confirm(
        `Générer un NOUVEAU badge pour ${row.firstName} ${row.lastName} ?\n\n` +
          'L’ancien badge sera remplacé et ne fonctionnera plus.',
      );
      if (!confirmed) return;

      setBusy(true);
      try {
        const response = await fetch('/api/admin/badges', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'renew', studentId: row.studentId }),
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

  const markPrinted = useCallback(async (badgeIds: string[]) => {
    if (badgeIds.length === 0) return;
    try {
      await fetch('/api/admin/badges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-printed', badgeIds }),
      });
    } catch {
      // Le compteur d'impression est informatif : jamais bloquant.
    }
  }, []);

  const handleExportPdf = useCallback(
    async (scope: 'selection' | 'filter') => {
      if (busy) return;
      setBusy(true);
      setNotice(null);

      try {
        const sourceRows: BadgeStudentRow[] =
          scope === 'selection'
            ? rows.filter(
                (row) =>
                  selected.has(row.studentId) &&
                  row.badge?.status === 'active' &&
                  Boolean(row.badge.token),
              )
            : printableRows;

        if (sourceRows.length === 0) {
          setNotice({ type: 'info', text: 'Aucun badge actif à imprimer dans la sélection.' });
          return;
        }

        const entries: BadgePdfEntry[] = sourceRows.map((row) => ({
          token: row.badge?.token || '',
          firstName: row.firstName,
          lastName: row.lastName,
          matricule: row.matricule,
          className: row.className,
          photoUrl: includePhotos ? row.photoUrl : null,
        }));

        const { pdf, printed, skipped } = await buildBadgesPdf(entries, {
          schoolName,
          academicYearName,
          includePhotos,
        });

        if (printed === 0) {
          setNotice({ type: 'error', text: 'Aucun badge valide à imprimer.' });
          return;
        }

        pdf.save(`badges-${new Date().toISOString().slice(0, 10)}.pdf`);

        setNotice({
          type: 'success',
          text: `${printed} badge(s) exporté(s) en PDF${skipped > 0 ? `, ${skipped} ignoré(s)` : ''}.`,
        });

        await markPrinted(
          sourceRows.map((row) => row.badge?.id).filter(Boolean) as string[],
        );
      } catch (error) {
        setNotice({
          type: 'error',
          text: error instanceof Error ? error.message : 'Export PDF impossible.',
        });
      } finally {
        setBusy(false);
      }
    },
    [academicYearName, busy, includePhotos, markPrinted, printableRows, rows, schoolName, selected],
  );

  const openPreview = useCallback(async (row: BadgeStudentRow) => {
    const token = row.badge?.token;
    if (!token) return;
    try {
      const dataUrl = await qrPreviewDataUrl(token);
      setPreview([
        {
          token,
          dataUrl,
          entry: {
            token,
            firstName: row.firstName,
            lastName: row.lastName,
            matricule: row.matricule,
            className: row.className,
          },
        },
      ]);
    } catch {
      setNotice({ type: 'error', text: 'Aperçu impossible.' });
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Bandeau d'information */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div className="text-sm text-emerald-950">
            <p className="font-semibold">Badges QR sécurisés</p>
            <p className="mt-1 text-emerald-900/80">
              Le QR ne contient <strong>aucune donnée personnelle</strong> : uniquement un
              identifiant opaque. Le matricule est imprimé sur la carte pour l’identification
              humaine. Aucun badge n’est créé automatiquement à l’inscription.
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Élèves', value: stats.total, tone: 'bg-slate-100 text-slate-700' },
          { label: 'Badges actifs', value: stats.withActiveBadge, tone: 'bg-emerald-100 text-emerald-700' },
          { label: 'Sans badge', value: stats.withoutBadge, tone: 'bg-amber-100 text-amber-700' },
          { label: 'Badges révoqués', value: stats.withRevokedBadge, tone: 'bg-rose-100 text-rose-700' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={`inline-flex rounded-xl px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${card.tone}`}>
              {card.label}
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Nom ou matricule…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={classFilter}
            onChange={(event) => {
              setClassFilter(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Toutes les classes</option>
            {classOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(event) => setIncludePhotos(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Photos
            </label>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
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

      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleGenerate('selection')}
          disabled={busy || selected.size === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
          Générer pour la sélection ({selected.size})
        </button>

        <button
          type="button"
          onClick={() => void handleGenerate('filter')}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:opacity-40"
        >
          <QrCode className="h-4 w-4" />
          {classFilter ? 'Générer pour la classe / filtre' : 'Générer pour tout le filtre'}
        </button>

        <button
          type="button"
          onClick={() => void handleExportPdf('selection')}
          disabled={busy || selected.size === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <Printer className="h-4 w-4" />
          Imprimer la sélection
        </button>

        <button
          type="button"
          onClick={() => void handleExportPdf('filter')}
          disabled={busy || printableRows.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
        >
          <Printer className="h-4 w-4" />
          PDF de la page ({printableRows.length})
        </button>
      </div>



      {/* Tableau */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allPrintableSelected}
                    onChange={toggleAllPrintable}
                    aria-label="Sélectionner tous les badges imprimables"
                    disabled={printableRows.length === 0}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Élève
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Matricule
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Classe
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Badge
                </th>
                <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Impression
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <QrCode className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    Aucun élève ne correspond aux filtres.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row) => (
                  <BadgeTableRow
                    key={row.studentId}
                    row={row}
                    selected={selected.has(row.studentId)}
                    busy={busy}
                    onToggle={() => toggleRow(row.studentId)}
                    onPreview={() => void openPreview(row)}
                    onRevoke={() => void handleRevoke(row)}
                    onRenew={() => void handleRenew(row)}
                  />
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            {pagination.total} élève(s) — page {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu du QR */}
      {preview.length > 0 && (
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
                  {preview[0].entry.firstName} {preview[0].entry.lastName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreview([])}
                aria-label="Fermer l’aperçu"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center rounded-2xl border border-slate-200 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview[0].dataUrl} alt="QR code du badge" className="h-52 w-52" />
              <p className="mt-3 font-mono text-xs text-slate-500">
                {preview[0].entry.matricule}
              </p>
              <p className="text-xs text-slate-500">{preview[0].entry.className || '—'}</p>
            </div>

            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              Ce QR ne contient aucune donnée personnelle. Imprimez-le et remettez-le à l’élève ;
              en cas de perte, révoquez-le puis renouvelez-le.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


function BadgeTableRow({
  row,
  selected,
  busy,
  onToggle,
  onPreview,
  onRevoke,
  onRenew,
}: {
  row: BadgeStudentRow;
  selected: boolean;
  busy: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onRevoke: () => void;
  onRenew: () => void;
}) {
  const badgeActive = row.badge?.status === 'active';

  return (
    <tr className="hover:bg-slate-50/70">
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          disabled={!badgeActive}
          aria-label={`Sélectionner ${row.firstName} ${row.lastName}`}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-30"
        />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {row.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              `${row.firstName.charAt(0)}${row.lastName.charAt(0)}`.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {row.firstName} {row.lastName}
            </p>
            {row.status !== 'active' && (
              <p className="text-[11px] font-medium text-amber-600">Élève {row.status}</p>
            )}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-600">
        {row.matricule}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-slate-700">{row.className || '—'}</td>
      <td className="px-3 py-3">
        {row.badge?.status === 'active' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Actif
          </span>
        )}
        {row.badge?.status === 'revoked' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700">
            <Ban className="h-3 w-3" /> Révoqué
          </span>
        )}
        {row.badge?.status === 'replaced' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            <RefreshCw className="h-3 w-3" /> Remplacé
          </span>
        )}
        {!row.badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            Aucun
          </span>
        )}
        {row.badge?.tokenPrefix && (
          <p className="mt-1 font-mono text-[10px] text-slate-400">{row.badge.tokenPrefix}…</p>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">
        {row.badge?.printedCount ? `${row.badge.printedCount}×` : '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {badgeActive && (
            <>
              <button
                type="button"
                onClick={onPreview}
                title="Prévisualiser le QR"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onRevoke}
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
            onClick={onRenew}
            disabled={busy}
            title="Générer un nouveau badge"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

