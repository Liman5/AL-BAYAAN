import { NextResponse } from 'next/server';
import {
  authenticateTerminal,
  hasSupabaseAdminConfig,
  serverError,
} from '@/lib/terminalAuth';
import {
  getScannerSettings,
  loadStaffForTerminal,
  loadStudentsForTerminal,
  resolveTerminalSchoolId,
} from '@/lib/scannerConfig';

// ============================================================
// GET /api/terminal/bootstrap?since=ISO
//
// Synchronisation DESCENDANTE (serveur → terminal) :
//   - paramètres du scanner (mode confidentialité, horaires) ;
//   - établissement ;
//   - classes dérivées des inscriptions des élèves ;
//   - élèves actifs + token de badge actif ;
//   - élèves à désactiver localement.
//
// Sans `since` : synchronisation complète.
// Avec `since`  : synchronisation incrémentale (élèves modifiés,
//                 badges modifiés, inscriptions modifiées).
//
// Aucune donnée personnelle inutile n'est transmise.
// ============================================================

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    if (!hasSupabaseAdminConfig()) {
      return serverError('Configuration Supabase manquante.');
    }

    const auth = await authenticateTerminal(request);
    if (!auth.ok) return auth.response;

    const { terminal, supabase } = auth;
    const url = new URL(request.url);
    const sinceParam = url.searchParams.get('since');
    const since = sinceParam && sinceParam.length > 10 ? sinceParam : null;

    const schoolId = await resolveTerminalSchoolId(supabase, terminal.school_id);
    if (!schoolId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Terminal non rattaché à un établissement. Demandez à l’administration de l’associer.',
        },
        { status: 409 },
      );
    }

    const settings = await getScannerSettings(supabase, schoolId);
    const { data: school } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', schoolId)
      .maybeSingle();

    const { students, removedStudentCodes, truncated } = await loadStudentsForTerminal(
      supabase,
      schoolId,
      { since },
    );

    // Personnel (enseignants + administration) disposant d'un badge actif.
    const { staff, removedStaffCodes } = await loadStaffForTerminal(supabase, schoolId);

    // Classes dérivées des élèves synchronisés (aucune classe d'une
    // autre école ne peut donc apparaître sur le terminal).
    const classMap = new Map<string, string>();
    for (const student of students) {
      if (student.classId && student.className) {
        classMap.set(student.classId, student.className);
      }
    }
    const classes = Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));

    await supabase
      .from('scanner_terminals')
      .update({
        last_sync_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        school_id: terminal.school_id || schoolId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', terminal.id);

    return NextResponse.json({
      success: true,
      data: {
        serverTime: new Date().toISOString(),
        cursor: new Date().toISOString(),
        school: { id: schoolId, name: school?.name || 'AL-BAYAAN' },
        settings,
        classes,
        students,
        staff,
        removedStudentCodes,
        removedStaffCodes,
        truncated,
        delta: Boolean(since),
      },
    });
  } catch (err: any) {
    return serverError(err?.message || 'Erreur serveur.');
  }
}
