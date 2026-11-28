import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/utils/app_time.dart';
import 'package:school_attendance/features/attendance_scanner/domain/scan_outcome.dart';
import 'package:school_attendance/features/attendance_scanner/presentation/widgets/validation_overlay.dart';

Student buildStudent() {
  return Student(
    id: 'student-1',
    studentCode: 'EL-0248',
    firstName: 'Adjovi',
    lastName: 'Kodjo',
    className: '3e A',
    qrToken: 'BADGE-0248',
    isActive: true,
    badgeRevoked: false,
    isDemo: false,
    updatedAt: DateTime.utc(2026, 11, 26),
  );
}

AttendanceRecord buildRecord({String status = 'present'}) {
  return AttendanceRecord(
    id: 'event-1',
    studentId: 'student-1',
    personType: 'student',
    studentCode: 'EL-0248',
    className: '3e A',
    scannedAtUtc: DateTime.utc(2026, 11, 26, 7, 14, 32),
    localDate: '2026-11-26',
    localMinutes: 434,
    session: 'morning',
    attendanceStatus: status,
    terminalId: 'terminal-1',
    source: 'qr',
    syncStatus: 'pending',
    retryCount: 0,
    createdAt: DateTime.utc(2026, 11, 26, 7, 14, 32),
  );
}

Future<void> pumpOverlay(
  WidgetTester tester,
  ScanOutcome outcome, {
  bool showPhoto = true,
  bool showMatricule = true,
  bool showClassName = true,
  bool showTime = true,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: Stack(
          children: [
            ValidationOverlay(
              outcome: outcome,
              onDismiss: () {},
              animationsEnabled: false,
              showPhoto: showPhoto,
              showMatricule: showMatricule,
              showClassName: showClassName,
              showTime: showTime,
            ),
          ],
        ),
      ),
    ),
  );
  await tester.pump(const Duration(milliseconds: 350));
}

void main() {
  setUpAll(() async {
    await AppTime.ensureLocale();
  });

  testWidgets('affiche la validation complète d’un élève', (tester) async {
    await pumpOverlay(
      tester,
      ScanOutcome(
        ScanResultType.success,
        student: buildStudent(),
        record: buildRecord(),
      ),
    );

    expect(find.text('VÉRIFICATION ACCEPTÉE'), findsOneWidget);
    expect(find.text('PRÉSENCE ENREGISTRÉE'), findsOneWidget);
    expect(find.text('Adjovi Kodjo'), findsOneWidget);
    expect(find.text('Matricule : EL-0248'), findsOneWidget);
    expect(find.text('Classe : 3e A'), findsOneWidget);
    expect(find.text('PRÉSENT'), findsOneWidget);
    expect(find.text('Continuer le scan'), findsOneWidget);
  });

  testWidgets('affiche le statut en retard', (tester) async {
    await pumpOverlay(
      tester,
      ScanOutcome(
        ScanResultType.success,
        student: buildStudent(),
        record: buildRecord(status: 'late'),
      ),
    );

    expect(find.text('EN RETARD'), findsOneWidget);
    expect(find.text('ARRIVÉE TARDIVE'), findsOneWidget);
  });

  testWidgets('affiche un doublon sans nouvelle présence', (tester) async {
    await pumpOverlay(
      tester,
      ScanOutcome(
        ScanResultType.alreadyRegistered,
        student: buildStudent(),
        existingRecord: buildRecord(),
      ),
    );

    expect(find.text('PRÉSENCE DÉJÀ ENREGISTRÉE'), findsOneWidget);
    expect(find.text('DÉJÀ PRÉSENT'), findsOneWidget);
    expect(find.textContaining('Première arrivée'), findsOneWidget);
  });

  testWidgets('affiche un badge inconnu', (tester) async {
    await pumpOverlay(tester, const ScanOutcome.studentNotFound());

    expect(find.text('BADGE INCONNU'), findsOneWidget);
    expect(find.text('NON ENREGISTRÉ'), findsOneWidget);
  });

  testWidgets('affiche une erreur d’enregistrement', (tester) async {
    await pumpOverlay(tester, const ScanOutcome.databaseError());

    expect(find.text('PRÉSENCE NON ENREGISTRÉE'), findsOneWidget);
    expect(find.text('À REFAIRE'), findsOneWidget);
  });

  testWidgets('le mode confidentialité masque matricule et classe', (tester) async {
    await pumpOverlay(
      tester,
      ScanOutcome(
        ScanResultType.success,
        student: buildStudent(),
        record: buildRecord(),
      ),
      showPhoto: false,
      showMatricule: false,
      showClassName: false,
      showTime: false,
    );

    // L'identité et la confirmation restent visibles…
    expect(find.text('Adjovi Kodjo'), findsOneWidget);
    expect(find.text('VÉRIFICATION ACCEPTÉE'), findsOneWidget);
    // …mais les informations désactivées par l'administrateur sont masquées.
    expect(find.text('Matricule : EL-0248'), findsNothing);
    expect(find.text('Classe : 3e A'), findsNothing);
  });
}
