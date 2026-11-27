import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// AL-BAYAAN — Notifications parentales (outbox serveur)
//
// Le terminal Android n'envoie JAMAIS de notification : il se
// contente de synchroniser un événement de présence. C'est le
// serveur qui décide d'informer les responsables, selon :
//   - le réglage `scanner_settings.notify_parents` ;
//   - l'existence d'un responsable rattaché à l'élève ;
//   - la présence d'un canal exploitable (compte in-app,
//     numéro de téléphone pour SMS/WhatsApp).
//
// ⚠️ AUCUN fournisseur externe n'est configuré à ce stade.
//    Les lignes créées restent donc en statut `pending` avec
//    `provider = 'none'` : rien n'est prétendu « envoyé ».
//    Brancher plus tard un fournisseur (WhatsApp Business,
//    SMS, push) consiste à traiter ces lignes et à passer
//    leur statut à `sent` / `failed` avec le provider réel.
// ============================================================

export type NotificationChannel = 'inapp' | 'push' | 'sms' | 'whatsapp';

export interface NotificationOutboxInput {
  eventId: string;
  studentId: string;
  studentFirstName: string;
  localDate: string;
  localTime: string;
  status: 'present' | 'late';
  className: string;
  schoolName: string;
}

export interface NotificationOutboxResult {
  created: number;
  skipped: number;
  reason?: string;
}

/**
 * Crée les intentions de notification pour un événement de présence.
 * Ne lève jamais d'exception : un échec de notification ne doit
 * jamais remettre en cause la présence déjà enregistrée.
 */
export async function enqueueParentNotifications(
  supabase: SupabaseClient,
  input: NotificationOutboxInput,
): Promise<NotificationOutboxResult> {
  try {
    const { data: student } = await supabase
      .from('students')
      .select('id, parent_id')
      .eq('id', input.studentId)
      .maybeSingle();

    if (!student?.parent_id) {
      return { created: 0, skipped: 1, reason: 'Aucun responsable rattaché à l’élève.' };
    }

    const { data: parent } = await supabase
      .from('parents')
      .select('id, full_name, phone, email, user_id')
      .eq('id', student.parent_id)
      .maybeSingle();

    if (!parent) {
      return { created: 0, skipped: 1, reason: 'Responsable introuvable.' };
    }

    const channels: NotificationChannel[] = [];
    if (parent.user_id) channels.push('inapp');
    if (parent.phone) {
      channels.push('sms');
      channels.push('whatsapp');
    }

    if (channels.length === 0) {
      return { created: 0, skipped: 1, reason: 'Aucun canal de notification disponible.' };
    }

    // Message sans donnée sensible superflue : prénom + heure + statut.
    const message =
      input.status === 'late'
        ? `Bonjour, ${input.studentFirstName} est arrivé(e) à l'école à ${input.localTime} (retard enregistré).`
        : `Bonjour, ${input.studentFirstName} est arrivé(e) à l'école à ${input.localTime}. Sa présence a été enregistrée.`;

    const rows = channels.map((channel) => ({
      id: `notif-${randomUUID()}`,
      event_id: input.eventId,
      student_id: input.studentId,
      parent_id: parent.id,
      channel,
      status: 'pending',
      provider: 'none',
      attempts: 0,
      payload: {
        message,
        studentFirstName: input.studentFirstName,
        className: input.className,
        schoolName: input.schoolName,
        localDate: input.localDate,
        localTime: input.localTime,
        status: input.status,
        // Aucun numéro ni email n'est dupliqué ici : la résolution du
        // destinataire reste côté serveur.
      },
    }));

    const { error } = await supabase.from('parent_notifications').insert(rows);
    if (error) {
      // Doublon (event_id, parent_id, channel) → déjà planifié, pas une erreur.
      if (error.code === '23505' || /duplicate/i.test(error.message)) {
        return { created: 0, skipped: rows.length, reason: 'Notification déjà planifiée.' };
      }
      return { created: 0, skipped: rows.length, reason: error.message };
    }

    return { created: rows.length, skipped: 0 };
  } catch (error: any) {
    return { created: 0, skipped: 0, reason: error?.message || 'Erreur notification.' };
  }
}
