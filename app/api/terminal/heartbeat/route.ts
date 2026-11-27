import { NextResponse } from 'next/server';
import {
  authenticateTerminal,
  hasSupabaseAdminConfig,
  serverError,
} from '@/lib/terminalAuth';

// ============================================================
// POST /api/terminal/heartbeat
//
// Signal de vie du terminal : met à jour la dernière activité,
// la version de l'application et le nombre d'événements en
// attente. Aucune donnée d'élève n'est transmise ici.
//
// L'administration calcule l'état « en ligne » à partir de
// `last_seen_at` (jamais depuis une valeur envoyée par le client).
// ============================================================

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!hasSupabaseAdminConfig()) {
      return serverError('Configuration Supabase manquante.');
    }

    const auth = await authenticateTerminal(request);
    if (!auth.ok) return auth.response;

    const { terminal, supabase } = auth;
    const body = await request.json().catch(() => ({}));
    const pendingEvents =
      typeof body?.pendingEvents === 'number' && body.pendingEvents >= 0
        ? Math.min(body.pendingEvents, 100000)
        : terminal.pending_events ?? 0;

    await supabase
      .from('scanner_terminals')
      .update({
        last_seen_at: new Date().toISOString(),
        pending_events: pendingEvents,
        app_version:
          typeof body?.appVersion === 'string'
            ? body.appVersion.slice(0, 40)
            : terminal.app_version,
        updated_at: new Date().toISOString(),
      })
      .eq('id', terminal.id);

    return NextResponse.json({
      success: true,
      data: {
        terminalId: terminal.id,
        status: terminal.status,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return serverError(err?.message || 'Erreur serveur.');
  }
}
