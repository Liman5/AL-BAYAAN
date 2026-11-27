import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { safeHashEquals, sha256Hex } from '@/lib/badges';

// ============================================================
// AL-BAYAAN — Socle serveur commun aux routes « terminal »
//
// ⚠️ Ces routes sont les SEULES à utiliser la clé service role
//    pour le compte des terminaux. Elles ne sont jamais appelées
//    par le navigateur : seul le terminal Android authentifié
//    (Bearer token) peut les atteindre.
//
// Règles appliquées :
//  - le token d'appareil n'est jamais stocké en clair (SHA-256) ;
//  - le terminal n'apprend jamais son propre school_id depuis le
//    client : il est TOUJOURS lu en base ;
//  - un terminal révoqué/suspendu est refusé immédiatement ;
//  - aucune donnée parentale n'est exposée au terminal.
// ============================================================

export const terminalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const terminalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(terminalSupabaseUrl && terminalServiceRoleKey);
}

/** Client service role (contourne RLS) — usage strictement serveur. */
export function getAdminClient(): SupabaseClient {
  return createClient(terminalSupabaseUrl, terminalServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface AuthenticatedTerminal {
  id: string;
  name: string;
  school_id: string | null;
  status: string;
  app_version: string | null;
  pending_events: number | null;
  last_sync_at: string | null;
}

export type TerminalAuthResult =
  | { ok: true; terminal: AuthenticatedTerminal; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

function unauthorized(message: string, status = 401) {
  return NextResponse.json({ success: false, message }, { status });
}

/**
 * Authentifie le terminal appelant à partir de l'en-tête
 * `Authorization: Bearer <token>`.
 */
export async function authenticateTerminal(request: Request): Promise<TerminalAuthResult> {
  if (!hasSupabaseAdminConfig()) {
    return { ok: false, response: unauthorized('Configuration serveur incomplète.', 500) };
  }

  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  if (!token || token.length < 32) {
    return { ok: false, response: unauthorized('Terminal non authentifié.') };
  }

  const supabase = getAdminClient();
  const tokenHash = sha256Hex(token);

  const { data, error } = await supabase
    .from('scanner_terminals')
    .select('id, name, school_id, status, app_version, pending_events, last_sync_at, token_hash')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) {
    return { ok: false, response: unauthorized('Vérification du terminal impossible.', 500) };
  }
  if (!data) {
    return { ok: false, response: unauthorized('Terminal inconnu.') };
  }
  if (!safeHashEquals(data.token_hash, tokenHash)) {
    return { ok: false, response: unauthorized('Terminal inconnu.') };
  }
  if (data.status === 'revoked') {
    return {
      ok: false,
      response: unauthorized('Terminal révoqué : contactez l’administration.', 403),
    };
  }
  if (data.status === 'suspended') {
    return {
      ok: false,
      response: unauthorized('Terminal suspendu : contactez l’administration.', 403),
    };
  }
  if (data.status !== 'active') {
    return {
      ok: false,
      response: unauthorized('Terminal non autorisé (appairage incomplet).', 403),
    };
  }

  const terminal: AuthenticatedTerminal = {
    id: data.id,
    name: data.name,
    school_id: data.school_id,
    status: data.status,
    app_version: data.app_version,
    pending_events: data.pending_events,
    last_sync_at: data.last_sync_at,
  };

  return { ok: true, terminal, supabase };
}

/**
 * Limiteur de débit en mémoire, suffisant pour un déploiement
 * mono-instance (Vercel : best effort par instance). Il ne
 * remplace pas une protection WAF mais empêche le brute force
 * basique des codes d'appairage.
 */
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Identifiant réseau approximatif de l'appelant (proxy Vercel inclus). */
export function clientFingerprint(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function serverError(message = 'Erreur serveur.') {
  return NextResponse.json({ success: false, message }, { status: 500 });
}
