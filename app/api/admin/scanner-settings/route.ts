import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { getAdminClient } from '@/lib/terminalAuth';
import { getScannerSettings, SCANNER_SETTINGS_COLUMNS } from '@/lib/scannerConfig';

// ============================================================
// API — Paramètres centralisés du scanner
//
// GET   → configuration de l'établissement (crée les valeurs
//         restrictives par défaut si nécessaire)
// PATCH → mise à jour validée, avec incrément de `config_version`
//
// Les terminaux récupèrent cette configuration à chaque
// synchronisation : elle prime sur les réglages locaux.
// ============================================================

export const runtime = 'nodejs';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const SESSIONS = ['morning', 'afternoon', 'evening'];

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name')
      .order('created_at', { ascending: true });

    const schoolId =
      guard.admin.schoolId || (schools && schools.length > 0 ? schools[0].id : null);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: 'Aucun établissement configuré.' },
        { status: 409 },
      );
    }

    const settings = await getScannerSettings(supabase, schoolId);
    if (!settings) {
      return NextResponse.json(
        { success: false, message: 'Paramètres indisponibles (migration 30 non appliquée ?).' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { settings, schools: schools || [], schoolId },
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

    const schoolId =
      guard.admin.schoolId ||
      (typeof body?.schoolId === 'string' ? body.schoolId : null);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: 'Établissement introuvable.' },
        { status: 400 },
      );
    }
    if (guard.admin.schoolId && body?.schoolId && body.schoolId !== guard.admin.schoolId) {
      return NextResponse.json(
        { success: false, message: 'Établissement non autorisé.' },
        { status: 403 },
      );
    }

    const update: Record<string, unknown> = {};

    for (const key of [
      'show_photo',
      'show_matricule',
      'show_class_name',
      'show_school_name',
      'show_time',
      'notify_parents',
      'sync_photos',
    ] as const) {
      if (typeof body?.[key] === 'boolean') update[key] = body[key];
    }

    for (const key of ['attendance_start_time', 'late_after_time'] as const) {
      if (typeof body?.[key] === 'string') {
        if (!TIME_PATTERN.test(body[key])) {
          return NextResponse.json(
            { success: false, message: `Heure invalide pour ${key} (format HH:MM attendu).` },
            { status: 400 },
          );
        }
        update[key] = body[key];
      }
    }

    if (typeof body?.session === 'string') {
      if (!SESSIONS.includes(body.session)) {
        return NextResponse.json(
          { success: false, message: 'Session invalide.' },
          { status: 400 },
        );
      }
      update.session = body.session;
    }

    if (typeof body?.timezone === 'string') {
      const tz = body.timezone.trim().slice(0, 64);
      try {
        new Intl.DateTimeFormat('fr-FR', { timeZone: tz });
        update.timezone = tz;
      } catch {
        return NextResponse.json(
          { success: false, message: 'Fuseau horaire invalide.' },
          { status: 400 },
        );
      }
    }

    if (body?.offline_grace_days !== undefined) {
      const days = Number(body.offline_grace_days);
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        return NextResponse.json(
          { success: false, message: 'Tolérance hors ligne invalide (1 à 365 jours).' },
          { status: 400 },
        );
      }
      update.offline_grace_days = days;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: 'Aucune modification.' }, { status: 400 });
    }

    // S'assure que la ligne existe avant la mise à jour.
    await getScannerSettings(supabase, schoolId);

    const { data: current } = await supabase
      .from('scanner_settings')
      .select('config_version')
      .eq('school_id', schoolId)
      .maybeSingle();

    update.config_version = (current?.config_version || 1) + 1;
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('scanner_settings')
      .update(update)
      .eq('school_id', schoolId)
      .select(SCANNER_SETTINGS_COLUMNS)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres enregistrés. Les terminaux les récupéreront à la prochaine synchronisation.',
      data: { settings: data },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}
