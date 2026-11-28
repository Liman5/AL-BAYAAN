import { NextResponse } from 'next/server';
import {
  authenticateTerminal,
  badRequest,
  hasSupabaseAdminConfig,
  serverError,
} from '@/lib/terminalAuth';
import { getScannerSettings, resolveTerminalSchoolId } from '@/lib/scannerConfig';
import { enqueueParentNotifications } from '@/lib/parentNotifications';

// ============================================================
// POST /api/terminal/attendance
//
// Synchronisation MONTANTE (terminal → serveur) des présences.
//
// Garanties :
//  - authentification du terminal et rattachement à SON école
//    (jamais celle annoncée par le client) ;
//  - validation systématique de l'élève, de la date, de la session ;
//  - idempotence par `eventId` (UUID du terminal) et par
//    (élève, jour, session) : un rejeu ne crée jamais de doublon ;
//  - réponse PAR ÉVÉNEMENT : accepted / duplicate / rejected ;
//  - la présence n'est jamais perdue côté terminal tant que le
//    serveur n'a pas répondu « accepted » ou « duplicate » ;
//  - les notifications parentales sont planifiées côté serveur,
//    jamais envoyées par le terminal.
// ============================================================

export const runtime = 'nodejs';

const MAX_EVENTS = 50;

type ItemStatus = 'accepted' | 'duplicate' | 'rejected';

interface ItemResult {
  eventId: string;
  status: ItemStatus;
  reason?: string;
  serverRecordId?: string;
}

const ID_PATTERN = /^[A-Za-z0-9._:-]{8,64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidSession(value: string): boolean {
  return value === 'morning' || value === 'afternoon' || value === 'evening';
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseAdminConfig()) {
      return serverError('Configuration Supabase manquante.');
    }

    const auth = await authenticateTerminal(request);
    if (!auth.ok) return auth.response;

    const { terminal, supabase } = auth;
    const schoolId = await resolveTerminalSchoolId(supabase, terminal.school_id);
    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: 'Terminal non rattaché à un établissement.' },
        { status: 409 },
      );
    }

    const body = await request.json().catch(() => null);
    const rawEvents = Array.isArray(body?.events) ? body?.events : null;
    if (!rawEvents || rawEvents.length === 0) {
      return badRequest('Aucun événement à synchroniser.');
    }
    if (rawEvents.length > MAX_EVENTS) {
      return badRequest(`Lot trop volumineux (maximum ${MAX_EVENTS} événements).`);
    }

    const settings = await getScannerSettings(supabase, schoolId);
    const notifyEnabled = Boolean(settings?.notify_parents);
    const now = Date.now();

    const results: ItemResult[] = [];
    let accepted = 0;
    let duplicates = 0;
    let rejected = 0;

    const studentCache = new Map<
      string,
      { id: string; status: string; firstName: string } | null
    >();

    // Cache des membres du personnel (enseignants / administration).
    const staffCache = new Map<
      string,
      { userId: string; status: string; firstName: string } | null
    >();

    for (const raw of rawEvents) {
      const eventId = typeof raw?.eventId === 'string' ? raw.eventId.trim() : '';
      const studentCode = typeof raw?.studentCode === 'string' ? raw.studentCode.trim() : '';

      if (!ID_PATTERN.test(eventId)) {
        rejected++;
        results.push({
          eventId: eventId || '(vide)',
          status: 'rejected',
          reason: 'eventId invalide',
        });
        continue;
      }
      if (!studentCode) {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'matricule manquant' });
        continue;
      }

      const localDate = typeof raw?.localDate === 'string' ? raw.localDate : '';
      const session = typeof raw?.session === 'string' ? raw.session : 'morning';
      const status = typeof raw?.attendanceStatus === 'string' ? raw.attendanceStatus : 'present';
      const personType = raw?.personType === 'staff' ? 'staff' : 'student';
      const scannedAtRaw = typeof raw?.scannedAtUtc === 'string' ? raw.scannedAtUtc : '';

      if (!DATE_PATTERN.test(localDate)) {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'date locale invalide' });
        continue;
      }
      if (!isValidSession(session)) {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'session invalide' });
        continue;
      }
      if (status !== 'present' && status !== 'late') {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'statut invalide' });
        continue;
      }

      const scannedAt = new Date(scannedAtRaw);
      if (Number.isNaN(scannedAt.getTime())) {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'horodatage invalide' });
        continue;
      }

      // Plausibilité temporelle : ni futur lointain, ni archive ancienne.
      const deltaMs = now - scannedAt.getTime();
      if (deltaMs < -2 * 24 * 60 * 60 * 1000) {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'horodatage dans le futur' });
        continue;
      }
      if (deltaMs > 120 * 24 * 60 * 60 * 1000) {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'événement trop ancien' });
        continue;
      }

      // ---------- PERSONNEL (enseignants + administration) ----------
      if (personType === 'staff') {
        let member = staffCache.get(studentCode);
        if (member === undefined) {
          const { data: teacher } = await supabase
            .from('teacher_profiles')
            .select('user_id, status, users (first_name)')
            .eq('matricule', studentCode)
            .or(`school_id.eq.${schoolId},school_id.is.null`)
            .maybeSingle();

          let found: { userId: string; status: string; firstName: string } | null = teacher
            ? {
                userId: (teacher as any).user_id,
                status: (teacher as any).status || 'active',
                firstName: (teacher as any).users?.first_name || '',
              }
            : null;

          if (!found) {
            const { data: adminRow } = await supabase
              .from('admins')
              .select('user_id, users (first_name)')
              .eq('matricule', studentCode)
              .or(`school_id.eq.${schoolId},school_id.is.null`)
              .maybeSingle();
            if (adminRow) {
              found = {
                userId: (adminRow as any).user_id,
                status: 'active',
                firstName: (adminRow as any).users?.first_name || '',
              };
            }
          }

          member = found;
          staffCache.set(studentCode, member);
        }

        if (!member) {
          rejected++;
          results.push({
            eventId,
            status: 'rejected',
            reason: 'personnel introuvable dans cet établissement',
          });
          continue;
        }
        if (member.status !== 'active') {
          rejected++;
          results.push({ eventId, status: 'rejected', reason: 'personnel non actif' });
          continue;
        }

        // Le badge du personnel doit toujours être actif côté serveur.
        const { data: staffBadge } = await supabase
          .from('staff_badges')
          .select('id')
          .eq('user_id', member.userId)
          .eq('status', 'active')
          .maybeSingle();

        if (!staffBadge) {
          rejected++;
          results.push({
            eventId,
            status: 'rejected',
            reason: 'badge du personnel non actif',
          });
          continue;
        }

        // Doublon : même personne, même jour, même session.
        const { data: existingStaffSession } = await supabase
          .from('terminal_attendance_events')
          .select('id')
          .eq('staff_user_id', member.userId)
          .eq('local_date', localDate)
          .eq('session', session)
          .maybeSingle();

        if (existingStaffSession) {
          duplicates++;
          results.push({
            eventId,
            status: 'duplicate',
            reason: 'pointage déjà enregistré pour cette session',
            serverRecordId: existingStaffSession.id,
          });
          continue;
        }

        const { error: staffInsertError } = await supabase
          .from('terminal_attendance_events')
          .insert({
            id: eventId,
            person_type: 'staff',
            staff_user_id: member.userId,
            student_id: null,
            student_code: studentCode,
            school_id: schoolId,
            terminal_id: terminal.id,
            local_date: localDate,
            scanned_at: scannedAt.toISOString(),
            session,
            status,
            source: typeof raw?.source === 'string' ? raw.source.slice(0, 20) : 'qr',
            payload_version: 1,
            idempotency_key: `attendance:${eventId}`,
          });

        if (staffInsertError) {
          if (staffInsertError.code === '23505') {
            duplicates++;
            results.push({
              eventId,
              status: 'duplicate',
              reason: 'événement déjà synchronisé',
              serverRecordId: eventId,
            });
            continue;
          }
          rejected++;
          results.push({ eventId, status: 'rejected', reason: staffInsertError.message });
          continue;
        }

        accepted++;
        results.push({ eventId, status: 'accepted', serverRecordId: eventId });
        // Aucune notification parentale pour un membre du personnel.
        continue;
      }

      // Résolution de l'élève — limitée à l'établissement du terminal.
      let student = studentCache.get(studentCode);
      if (student === undefined) {
        const { data } = await supabase
          .from('students')
          .select('id, status, school_id, users (first_name)')
          .eq('matricule', studentCode)
          .or(`school_id.eq.${schoolId},school_id.is.null`)
          .maybeSingle();

        student = data
          ? {
              id: data.id,
              status: (data as any).status || 'active',
              firstName: (data as any).users?.first_name || '',
            }
          : null;
        studentCache.set(studentCode, student);
      }

      if (!student) {
        rejected++;
        results.push({
          eventId,
          status: 'rejected',
          reason: 'élève introuvable dans cet établissement',
        });
        continue;
      }
      if (student.status !== 'active') {
        rejected++;
        results.push({ eventId, status: 'rejected', reason: 'élève non actif' });
        continue;
      }

      // Doublon logique : même élève, même jour, même session.
      const { data: existingSession } = await supabase
        .from('terminal_attendance_events')
        .select('id')
        .eq('student_id', student.id)
        .eq('local_date', localDate)
        .eq('session', session)
        .maybeSingle();

      if (existingSession) {
        duplicates++;
        results.push({
          eventId,
          status: 'duplicate',
          reason: 'présence déjà enregistrée pour cette session',
          serverRecordId: existingSession.id,
        });
        continue;
      }

      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('class_id, classes (name)')
        .eq('student_id', student.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error: insertError } = await supabase.from('terminal_attendance_events').insert({
        id: eventId,
        student_id: student.id,
        student_code: studentCode,
        class_id: enrollment?.class_id || null,
        school_id: schoolId,
        terminal_id: terminal.id,
        local_date: localDate,
        scanned_at: scannedAt.toISOString(),
        session,
        status,
        source: typeof raw?.source === 'string' ? raw.source.slice(0, 20) : 'qr',
        payload_version: 1,
        idempotency_key: `attendance:${eventId}`,
      });

      if (insertError) {
        // Rejeu du même eventId → l'événement existe déjà : succès idempotent.
        if (insertError.code === '23505') {
          duplicates++;
          results.push({
            eventId,
            status: 'duplicate',
            reason: 'événement déjà synchronisé',
            serverRecordId: eventId,
          });
          continue;
        }
        rejected++;
        results.push({ eventId, status: 'rejected', reason: insertError.message });
        continue;
      }

      accepted++;
      results.push({ eventId, status: 'accepted', serverRecordId: eventId });

      if (notifyEnabled) {
        const localTime = new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: settings?.timezone || 'Africa/Lome',
        }).format(scannedAt);

        await enqueueParentNotifications(supabase, {
          eventId,
          studentId: student.id,
          studentFirstName: student.firstName || 'votre enfant',
          localDate,
          localTime,
          status: status as 'present' | 'late',
          className: (enrollment as any)?.classes?.name || '',
          schoolName: 'AL-BAYAAN',
        });
      }
    }

    await supabase
      .from('scanner_terminals')
      .update({
        last_seen_at: new Date().toISOString(),
        last_sync_at: new Date().toISOString(),
        pending_events: typeof body?.pendingEvents === 'number' ? body.pendingEvents : 0,
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
        results,
        summary: { accepted, duplicates, rejected },
        serverTime: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return serverError(err?.message || 'Erreur serveur.');
  }
}

