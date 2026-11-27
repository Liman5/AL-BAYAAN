import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { getAdminClient } from '@/lib/terminalAuth';

// ============================================================
// API — Présences enregistrées par les terminaux (lecture)
//
// GET ?date=YYYY-MM-DD
//   → présence du jour (ou d'une date choisie) : compteurs,
//     dernières arrivées, état des notifications parentales.
//
// Lecture seule : aucune écriture, aucune suppression.
// ============================================================

export const runtime = 'nodejs';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getAdminClient();
    const url = new URL(request.url);
    const requestedDate = url.searchParams.get('date') || '';
    const date = DATE_PATTERN.test(requestedDate)
      ? requestedDate
      : new Date().toISOString().slice(0, 10);

    const schoolId = guard.admin.schoolId;
    if (!schoolId) {
      // Administrateur non rattaché à une école (déploiement mono-site) :
      // on affiche toutes les présences remontées par les terminaux.
      const { data: allEvents, error: allError } = await supabase
        .from('terminal_attendance_events')
        .select(
          'id, student_id, student_code, class_id, terminal_id, local_date, scanned_at, session, status, ' +
            'students (id, users (first_name, last_name)), classes (id, name)',
        )
        .eq('local_date', date)
        .order('scanned_at', { ascending: false })
        .limit(300);

      if (allError) {
        return NextResponse.json({ success: false, message: allError.message }, { status: 400 });
      }

      return buildPresenceResponse(supabase, date, allEvents || []);
    }

    const { data: events, error } = await supabase
      .from('terminal_attendance_events')
      .select(
        'id, student_id, student_code, class_id, terminal_id, local_date, scanned_at, session, status, ' +
          'students (id, users (first_name, last_name)), classes (id, name)',
      )
      .eq('school_id', schoolId)
      .eq('local_date', date)
      .order('scanned_at', { ascending: false })
      .limit(300);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return buildPresenceResponse(supabase, date, events || []);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Erreur serveur.' },
      { status: 500 },
    );
  }
}

/**
 * Construit la réponse de présence (compteurs + notifications) à partir
 * des événements déjà chargés. Aucune donnée sensible n'est exposée.
 */
async function buildPresenceResponse(
  supabase: ReturnType<typeof getAdminClient>,
  date: string,
  events: any[],
) {
  const eventIds = events.map((row) => row.id);
  const notificationCounts = { pending: 0, sent: 0, failed: 0, skipped: 0 };

  if (eventIds.length > 0) {
    const { data: notifications } = await supabase
      .from('parent_notifications')
      .select('id, status')
      .in('event_id', eventIds);
    for (const row of notifications || []) {
      if (row.status === 'pending' || row.status === 'queued') notificationCounts.pending++;
      else if (row.status === 'sent') notificationCounts.sent++;
      else if (row.status === 'failed') notificationCounts.failed++;
      else notificationCounts.skipped++;
    }
  }

  const rows = events.map((row: any) => ({
    id: row.id,
    studentId: row.student_id,
    matricule: row.student_code,
    firstName: row.students?.users?.first_name || '',
    lastName: row.students?.users?.last_name || '',
    className: row.classes?.name || '',
    terminalId: row.terminal_id,
    scannedAt: row.scanned_at,
    session: row.session,
    status: row.status,
  }));

  return NextResponse.json({
    success: true,
    data: {
      date,
      events: rows,
      counts: {
        total: rows.length,
        present: rows.filter((row) => row.status === 'present').length,
        late: rows.filter((row) => row.status === 'late').length,
      },
      notifications: notificationCounts,
    },
  });
}
