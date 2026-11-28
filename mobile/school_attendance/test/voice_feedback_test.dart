import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/voice/voice_feedback.dart';
import 'package:school_attendance/features/attendance_scanner/domain/scan_outcome.dart';
import 'package:school_attendance/features/terminal_settings/data/settings_repository.dart';

/// Vérifie la logique du retour vocal (aucun moteur TTS n'est sollicité) :

void main() {
  late AppDatabase db;
  late SettingsRepository settings;

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    settings = SettingsRepository(db);
    await settings.ensureSettings();
  });

  tearDown(() async {
    await db.close();
  });

  Future<TerminalSettings> configured({
    bool enabled = true,
    String success = 'Présence enregistrée',
    String late = 'En retard',
    String duplicate = 'Déjà enregistré',
    String refused = 'Accès refusé',
  }) async {
    final current = await settings.current();
    final updated = current.copyWith(
      voiceEnabled: enabled,
      voiceSuccess: success,
      voiceLate: late,
      voiceDuplicate: duplicate,
      voiceRefused: refused,
    );
    await settings.save(updated);
    return updated;
  }

  AttendanceRecord record({String status = 'present'}) => AttendanceRecord(
        id: 'evt-1',
        studentId: 'stu-1',
        personType: 'student',
        studentCode: 'ALB-0001',
        className: '3e A',
        scannedAtUtc: DateTime.utc(2026, 11, 27, 7, 14),
        localDate: '2026-11-27',
        localMinutes: 434,
        session: 'morning',
        attendanceStatus: status,
        terminalId: 'term-1',
        source: 'qr',
        syncStatus: 'pending',
        retryCount: 0,
        createdAt: DateTime.utc(2026, 11, 27, 7, 14),
      );

  test('voix désactivée : aucune phrase', () async {
    final config = await configured(enabled: false);
    final outcome = ScanOutcome(ScanResultType.success, record: record());
    expect(VoiceFeedback.phraseFor(outcome, config), isNull);
  });

  test('scan accepté à l’heure : phrase de succès', () async {
    final config = await configured(success: 'Bienvenue');
    final outcome = ScanOutcome(ScanResultType.success, record: record());
    expect(VoiceFeedback.phraseFor(outcome, config), 'Bienvenue');
  });

  test('scan accepté en retard : phrase de retard', () async {
    final config = await configured(late: 'Vous êtes en retard');
    final outcome = ScanOutcome(
      ScanResultType.success,
      record: record(status: 'late'),
    );
    expect(VoiceFeedback.phraseFor(outcome, config), 'Vous êtes en retard');
  });

  test('doublon : phrase dédiée', () async {
    final config = await configured(duplicate: 'Déjà pointé');
    final outcome = ScanOutcome(
      ScanResultType.alreadyRegistered,
      existingRecord: record(),
    );
    expect(VoiceFeedback.phraseFor(outcome, config), 'Déjà pointé');
  });

  test('refus (badge inconnu, révoqué, inactif, QR invalide) : phrase refus', () async {
    final config = await configured(refused: 'Refusé');

    for (final outcome in <ScanOutcome>[
      const ScanOutcome.studentNotFound(),
      const ScanOutcome.badgeRevoked(),
      const ScanOutcome.inactiveStudent(),
      const ScanOutcome.invalidQr(),
      const ScanOutcome.databaseError(),
    ]) {
      expect(VoiceFeedback.phraseFor(outcome, config), 'Refusé');
    }
  });
}
