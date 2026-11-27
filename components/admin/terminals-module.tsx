'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Ban,
  CheckCircle2,
  Clock,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  Smartphone,
  X,
} from 'lucide-react';

// ============================================================
// AL-BAYAAN — Module « Terminaux & Présence »
//
// Enregistrement des appareils scanners, suivi réel de leur
// activité (jamais un état « en ligne » inventé), révocation,
// et consultation des présences remontées par les terminaux.
// ============================================================

interface TerminalRow {
  id: string;
  name: string;
  schoolId: string | null;
  schoolName: string | null;
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  appVersion: string | null;
  deviceModel: string | null;
  pendingEvents: number;
  lastSeenAt: string | null;
  lastSyncAt: string | null;
  pairedAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
  createdAt: string;
  online: boolean;
  awaitingPairing: boolean;
}

interface PresenceEvent {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  className: string;
  scannedAt: string;
  session: string;
  status: 'present' | 'late';
}

interface PresenceData {
  date: string;
  events: PresenceEvent[];
  counts: { total: number; present: number; late: number };
  notifications: { pending: number; sent: number; failed: number; skipped: number };
  message?: string;
}

const STATUS_LABELS: Record<TerminalRow['status'], string> = {
  pending: 'En attente d’appairage',
  active: 'Autorisé',
  suspended: 'Suspendu',
  revoked: 'Révoqué',
};

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatTime(value: string): string {
  try {
    return new Date(value).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function TerminalsModule() {
  const [terminals, setTerminals] = useState<TerminalRow[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    online: 0,
    pending: 0,
    pendingEvents: 0,
  });
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [createName, setCreateName] = useState('');
  const [pairingInfo, setPairingInfo] = useState<{
    name: string;
    code: string;
    expiresAt: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [terminalsResponse, presenceResponse] = await Promise.all([
        fetch('/api/admin/terminals', { cache: 'no-store' }),
        fetch('/api/admin/presence', { cache: 'no-store' }),
      ]);

      const terminalsPayload = await terminalsResponse.json();
      if (terminalsResponse.ok && terminalsPayload?.success) {
        setTerminals(terminalsPayload.data.terminals);
        setStats(terminalsPayload.data.stats);
      } else if (terminalsPayload?.message) {
        setNotice({ type: 'error', text: terminalsPayload.message });
      }

      const presencePayload = await presenceResponse.json();
      if (presenceResponse.ok && presencePayload?.success) {
        setPresence(presencePayload.data as PresenceData);
      }
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

  const handleCreate = useCallback(async () => {
    if (busy || createName.trim().length < 2) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/terminals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName.trim() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setNotice({ type: 'error', text: payload?.message || 'Création impossible.' });
        return;
      }
      setPairingInfo({
        name: payload.data.name,
        code: payload.data.pairingCode,
        expiresAt: payload.data.pairingExpiresAt,
      });
      setCreateName('');
      await load();
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur réseau.',
      });
    } finally {
      setBusy(false);
    }
  }, [busy, createName, load]);

  const runAction = useCallback(
    async (terminalId: string, action: string, extra?: Record<string, unknown>) => {
      if (busy) return;
      setBusy(true);
      setNotice(null);
      try {
        const response = await fetch('/api/admin/terminals', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ terminalId, action, ...extra }),
        });
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          setNotice({ type: 'error', text: payload?.message || 'Action impossible.' });
          return;
        }

        if (action === 're-pair' && payload.data?.pairingCode) {
          const target = terminals.find((terminal) => terminal.id === terminalId);
          setPairingInfo({
            name: target?.name || 'Terminal',
            code: payload.data.pairingCode,
            expiresAt: payload.data.pairingExpiresAt,
          });
        }

        setNotice({ type: 'success', text: payload.message || 'Action terminée.' });
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
    [busy, load, terminals],
  );

  const copyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setNotice({ type: 'success', text: 'Code copié.' });
    } catch {
      setNotice({ type: 'info', text: `Code : ${code}` });
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
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

      {/* Statistiques */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Terminaux', value: stats.total, icon: Smartphone },
          { label: 'Autorisés', value: stats.active, icon: CheckCircle2 },
          { label: 'En ligne', value: stats.online, icon: Activity },
          { label: 'Scans en attente', value: stats.pendingEvents, icon: Clock },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </p>
                <Icon className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Création d'un terminal */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-sm font-bold text-slate-900">Enregistrer un nouveau terminal</h3>
        <p className="mt-1 text-xs text-slate-500">
          Un code d’appairage à usage unique (valable 15 minutes) sera généré. Il devra être saisi
          dans l’application Android, écran « Connexion à AL-BAYAAN ».
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder="Nom du terminal (ex. Entrée principale)"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={busy || createName.trim().length < 2}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Créer le terminal
          </button>
        </div>
      </div>

      {/* Code d'appairage */}
      {pairingInfo && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <KeyRound className="h-4 w-4" /> Code d’appairage — {pairingInfo.name}
              </p>
              <p className="mt-2 font-mono text-3xl font-bold tracking-[0.3em] text-amber-950">
                {pairingInfo.code}
              </p>
              <p className="mt-2 text-xs text-amber-800">
                Valable jusqu’à {formatDateTime(pairingInfo.expiresAt)}. Il n’est affiché qu’une
                seule fois.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyCode(pairingInfo.code)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              <Copy className="h-3.5 w-3.5" /> Copier
            </button>
          </div>
        </div>
      )}


      {/* Liste des terminaux */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Terminaux enregistrés</h3>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>

        {loading && (
          <div className="px-4 py-10 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && terminals.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            <Smartphone className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            Aucun terminal enregistré pour le moment.
          </div>
        )}

        {!loading && terminals.length > 0 && (
          <div className="divide-y divide-slate-100">
            {terminals.map((terminal) => (
              <TerminalRowCard
                key={terminal.id}
                terminal={terminal}
                busy={busy}
                onAction={runAction}
              />
            ))}
          </div>
        )}
      </div>


      {/* Présences du jour */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-slate-900">Présences du jour</h3>
          <p className="text-xs text-slate-500">
            {presence
              ? `${presence.counts.total} présence(s) — ${presence.counts.present} à l’heure, ${presence.counts.late} en retard`
              : 'Chargement…'}
          </p>
        </div>

        {presence?.message && (
          <p className="px-4 py-3 text-xs text-amber-700">{presence.message}</p>
        )}

        {presence && presence.counts.total > 0 && (
          <div className="grid grid-cols-2 gap-3 border-b border-slate-100 px-4 py-3 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Notifications planifiées
              </p>
              <p className="text-lg font-bold text-emerald-900">{presence.notifications.pending}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Envoyées
              </p>
              <p className="text-lg font-bold text-slate-800">{presence.notifications.sent}</p>
            </div>
            <div className="rounded-xl bg-rose-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Échecs</p>
              <p className="text-lg font-bold text-rose-800">{presence.notifications.failed}</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Ignorées
              </p>
              <p className="text-lg font-bold text-amber-900">{presence.notifications.skipped}</p>
            </div>
          </div>
        )}

        {presence && presence.counts.total === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            Aucune présence enregistrée par un terminal aujourd’hui.
          </div>
        )}

        {presence && presence.counts.total > 0 && (
          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
            {presence.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {event.firstName} {event.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {event.matricule}
                    {event.className ? ` · ${event.className}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-600">
                    {formatTime(event.scannedAt)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      event.status === 'late'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {event.status === 'late' ? 'Retard' : 'Présent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-slate-400">
        Les notifications parentales sont <strong>planifiées côté serveur</strong> lorsqu’un
        événement de présence est validé. Aucun fournisseur d’envoi (SMS, WhatsApp, push) n’étant
        configuré à ce stade, elles restent en attente : rien n’est prétendu « envoyé ».
      </p>
    </div>
  );
}


function TerminalRowCard({
  terminal,
  busy,
  onAction,
}: {
  terminal: TerminalRow;
  busy: boolean;
  onAction: (terminalId: string, action: string) => void;
}) {
  return (
    <div className="px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{terminal.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                terminal.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : terminal.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : terminal.status === 'suspended'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-rose-100 text-rose-700'
              }`}
            >
              {STATUS_LABELS[terminal.status]}
            </span>
            {terminal.status === 'active' && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  terminal.online
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    terminal.online ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                {terminal.online ? 'En ligne' : 'Hors ligne'}
              </span>
            )}
          </div>

          <div className="mt-1.5 grid gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-2">
            <p>Dernière activité : {formatDateTime(terminal.lastSeenAt)}</p>
            <p>Dernière synchronisation : {formatDateTime(terminal.lastSyncAt)}</p>
            <p>Version app : {terminal.appVersion || '—'}</p>
            <p>
              Scans en attente :{' '}
              <span
                className={
                  terminal.pendingEvents > 0 ? 'font-semibold text-amber-600' : 'text-slate-500'
                }
              >
                {terminal.pendingEvents}
              </span>
            </p>
            {terminal.deviceModel && <p>Appareil : {terminal.deviceModel}</p>}
            {terminal.revokedReason && <p>Motif : {terminal.revokedReason}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {terminal.status !== 'revoked' && (
            <button
              type="button"
              onClick={() => onAction(terminal.id, 're-pair')}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <KeyRound className="h-3.5 w-3.5" /> Réappairer
            </button>
          )}

          {terminal.status === 'active' && (
            <button
              type="button"
              onClick={() => onAction(terminal.id, 'suspend')}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-800 hover:bg-orange-100 disabled:opacity-40"
            >
              <Power className="h-3.5 w-3.5" /> Suspendre
            </button>
          )}

          {terminal.status === 'suspended' && (
            <button
              type="button"
              onClick={() => onAction(terminal.id, 'resume')}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Réactiver
            </button>
          )}

          {terminal.status !== 'revoked' && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Révoquer « ${terminal.name} » ?\n\n` +
                      'Le terminal perdra immédiatement son accès : il ne pourra plus ' +
                      'synchroniser les présences ni télécharger de données. ' +
                      'Un nouvel appairage sera nécessaire.',
                  )
                ) {
                  onAction(terminal.id, 'revoke');
                }
              }}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-40"
            >
              <Ban className="h-3.5 w-3.5" /> Révoquer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

