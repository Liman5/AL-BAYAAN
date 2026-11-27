import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/adminGuard';
import { getAdminClient } from '@/lib/terminalAuth';
import { generatePairingCode, sha256Hex } from '@/lib/badges';

// ============================================================
// API — Terminaux scanners (administration)
//
// GET   → liste des terminaux + état réel (dernière activité)
// POST  → création + code d'appairage à usage unique (15 min)
// PATCH → renommer / suspendre / réactiver / révoquer / réappairer
//
// ⚠️ Le token d'appareil n'est JAMAIS lisible ni réaffiché.
//    Seul le code d'appairage (à usage unique) est communiqué
//    une fois, et uniquement en clair au moment de sa création.
// ============================================================

export const runtime = 'nodejs';

const PAIRING_TTL_MINUTES = 15;
/** Un terminal est « en ligne » s'il a donné signe de vie récemment. */
const ONLINE_WINDOW_MINUTES = 10;

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('scanner_terminals')
      .select(
        'id, name, school_id, status, app_version, device_model, pending_events, ' +
          'last_seen_at, last_sync_at, paired_at, revoked_at, revoked_reason, created_at, ' +
          'pairing_expires_at',
      )
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    const schoolIds = Array.from(
      new Set((data || []).map((row: any) => row.school_id).filter(Boolean)),
    );
    const schoolNames = new Map<string, string>();
    if (schoolIds.length > 0) {
      const { data: schools } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIds);
      (schools || []).forEach((school: any) => schoolNames.set(school.id, school.name));
    }

    const now = Date.now();
    const terminals = (data || []).map((row: any) => {
      const lastSeen = row.last_seen_at ? new Date(row.last_seen_at).getTime() : null;
      const online =
        row.status === 'active' &&
        lastSeen !== null &&
        now - lastSeen < ONLINE_WINDOW_MINUTES * 60 * 1000;

      const pairingActive =
        row.pairing_expires_at && new Date(row.pairing_expires_at).getTime() > now;

      return {
        id: row.id,
        name: row.name,
        schoolId: row.school_id,
        schoolName: row.school_id ? schoolNames.get(row.school_id) || null : null,
        status: row.status,
        appVersion: row.app_version,
        deviceModel: row.device_model,
        pendingEvents: row.pending_events || 0,
        lastSeenAt: row.last_seen_at,
        lastSyncAt: row.last_sync_at,
        pairedAt: row.paired_at,
        revokedAt: row.revoked_at,
        revokedReason: row.revoked_reason,
        createdAt: row.created_at,
        online,
        awaitingPairing: Boolean(pairingActive),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        terminals,
        stats: {
          total: terminals.length,
          active: terminals.filter((t) => t.status === 'active').length,
          online: terminals.filter((t) => t.online).length,
          pending: terminals.filter((t) => t.awaitingPairing).length,
          pendingEvents: terminals.reduce((sum, t) => sum + (t.pendingEvents || 0), 0),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : '';

    if (name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Nom du terminal requis (2 caractères minimum).' },
        { status: 400 },
      );
    }

    let schoolId: string | null = guard.admin.schoolId || null;
    if (typeof body?.schoolId === 'string' && body.schoolId) {
      if (guard.admin.schoolId && body.schoolId !== guard.admin.schoolId) {
        return NextResponse.json(
          { success: false, message: 'Établissement non autorisé.' },
          { status: 403 },
        );
      }
      schoolId = body.schoolId;
    }
    if (!schoolId) {
      const { data: schools } = await supabase.from('schools').select('id').limit(2);
      if (schools && schools.length === 1) schoolId = schools[0].id;
    }

    const pairingCode = generatePairingCode();
    const expiresAt = new Date(Date.now() + PAIRING_TTL_MINUTES * 60 * 1000).toISOString();
    const terminalId = `term-${randomUUID()}`;

    // `token_hash` est NOT NULL : on stocke l'empreinte d'un secret
    // aléatoire jamais communiqué, remplacée lors de l'appairage.
    const placeholderHash = sha256Hex(`pending-${randomUUID()}`);

    const { error } = await supabase.from('scanner_terminals').insert({
      id: terminalId,
      school_id: schoolId,
      name,
      token_hash: placeholderHash,
      pairing_code_hash: sha256Hex(pairingCode),
      pairing_expires_at: expiresAt,
      status: 'pending',
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Terminal créé. Saisissez le code d’appairage dans l’application.',
      data: { terminalId, name, schoolId, pairingCode, pairingExpiresAt: expiresAt },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const body = await request.json().catch(() => ({}));
    const action = typeof body?.action === 'string' ? body.action : '';
    const terminalId = typeof body?.terminalId === 'string' ? body.terminalId : '';

    if (!terminalId) {
      return NextResponse.json(
        { success: false, message: 'Terminal introuvable.' },
        { status: 400 },
      );
    }

    if (action === 'rename') {
      const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : '';
      if (name.length < 2) {
        return NextResponse.json(
          { success: false, message: 'Nom invalide (2 caractères minimum).' },
          { status: 400 },
        );
      }
      const { error } = await supabase
        .from('scanner_terminals')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', terminalId);
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Terminal renommé.' });
    }

    if (action === 'suspend' || action === 'resume') {
      const nextStatus = action === 'suspend' ? 'suspended' : 'active';
      const { error } = await supabase
        .from('scanner_terminals')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', terminalId);
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: action === 'suspend' ? 'Terminal suspendu.' : 'Terminal réactivé.',
      });
    }

    if (action === 'revoke') {
      const reason =
        typeof body?.reason === 'string' && body.reason.trim().length > 0
          ? body.reason.trim().slice(0, 200)
          : 'Révocation administrative';

      // Le token est invalidé immédiatement : l'appareil ne peut plus
      // ni synchroniser ni télécharger quoi que ce soit.
      const { error } = await supabase
        .from('scanner_terminals')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_reason: reason,
          token_hash: sha256Hex(`revoked-${randomUUID()}`),
          pairing_code_hash: null,
          pairing_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', terminalId);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Terminal révoqué. Un nouvel appairage sera nécessaire.',
      });
    }

    if (action === 're-pair') {
      const pairingCode = generatePairingCode();
      const expiresAt = new Date(Date.now() + PAIRING_TTL_MINUTES * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('scanner_terminals')
        .update({
          pairing_code_hash: sha256Hex(pairingCode),
          pairing_expires_at: expiresAt,
          status: 'pending',
          revoked_at: null,
          revoked_reason: null,
          token_hash: sha256Hex(`pending-${randomUUID()}`),
          updated_at: new Date().toISOString(),
        })
        .eq('id', terminalId);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Nouveau code d’appairage généré.',
        data: { pairingCode, pairingExpiresAt: expiresAt },
      });
    }

    return NextResponse.json({ success: false, message: 'Action inconnue.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}
