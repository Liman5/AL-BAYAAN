import { NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'crypto';
import { normalizePairingCode, safeHashEquals, sha256Hex } from '@/lib/badges';
import {
  badRequest,
  checkRateLimit,
  clientFingerprint,
  getAdminClient,
  hasSupabaseAdminConfig,
  serverError,
} from '@/lib/terminalAuth';
import { getScannerSettings, resolveTerminalSchoolId } from '@/lib/scannerConfig';

// ============================================================
// POST /api/terminal/pair
//
// Appairage d'un terminal Android avec AL-BAYAAN.
// Le code d'appairage est :
//   - généré par un administrateur (page « Terminaux ») ;
//   - à usage unique ;
//   - valable 15 minutes ;
//   - stocké uniquement sous forme d'empreinte SHA-256.
//
// En cas de succès, le serveur délivre un **token d'appareil**
// (256 bits) que le terminal conserve dans le Keystore Android.
// Le token n'est jamais réémis ensuite : le révoquer oblige à
// un nouvel appairage.
// ============================================================

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!hasSupabaseAdminConfig()) {
      return serverError('Configuration Supabase manquante.');
    }

    const fingerprint = clientFingerprint(request);
    if (!checkRateLimit(`pair:${fingerprint}`, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: 'Trop de tentatives. Réessayez dans quelques minutes.' },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawCode = typeof body?.pairingCode === 'string' ? body.pairingCode : '';
    const pairingCode = normalizePairingCode(rawCode);
    const deviceModel = typeof body?.deviceModel === 'string' ? body.deviceModel.slice(0, 120) : null;
    const appVersion = typeof body?.appVersion === 'string' ? body.appVersion.slice(0, 40) : null;

    if (pairingCode.length < 6) {
      return badRequest('Code d’appairage invalide.');
    }

    const supabase = getAdminClient();
    const codeHash = sha256Hex(pairingCode);

    const { data: candidates, error } = await supabase
      .from('scanner_terminals')
      .select('id, name, school_id, status, pairing_code_hash, pairing_expires_at')
      .not('pairing_code_hash', 'is', null);

    if (error) return serverError(error.message);

    const now = Date.now();
    const terminal = (candidates || []).find(
      (row: any) =>
        safeHashEquals(row.pairing_code_hash, codeHash) &&
        row.pairing_expires_at &&
        new Date(row.pairing_expires_at).getTime() > now,
    );

    if (!terminal) {
      return NextResponse.json(
        { success: false, message: 'Code d’appairage inconnu ou expiré.' },
        { status: 401 },
      );
    }

    if (terminal.status === 'revoked' || terminal.status === 'suspended') {
      return NextResponse.json(
        { success: false, message: 'Ce terminal a été révoqué ou suspendu.' },
        { status: 403 },
      );
    }

    // Token d'appareil : 32 octets → base64url (43 caractères, sans padding).
    const token = randomBytes(32).toString('base64url');
    const tokenHash = sha256Hex(token);

    const { error: updateError } = await supabase
      .from('scanner_terminals')
      .update({
        token_hash: tokenHash,
        pairing_code_hash: null,
        pairing_expires_at: null,
        paired_at: new Date().toISOString(),
        status: 'active',
        device_model: deviceModel,
        app_version: appVersion,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', terminal.id);

    if (updateError) return serverError(updateError.message);

    const schoolId = await resolveTerminalSchoolId(supabase, terminal.school_id);
    const settings = await getScannerSettings(supabase, schoolId);

    let schoolName = 'AL-BAYAAN';
    if (schoolId) {
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .maybeSingle();
      if (school?.name) schoolName = school.name;
    }

    return NextResponse.json({
      success: true,
      data: {
        terminalId: terminal.id,
        terminalName: terminal.name,
        token,
        schoolId,
        schoolName,
        settings,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return serverError(err?.message || 'Erreur serveur.');
  }
}

/** Empreinte d'un terminal inconnu (utile pour les tests/outillage). */
export function pendingTerminalPlaceholderHash(): string {
  return sha256Hex(`unpaired-${randomUUID()}`);
}
