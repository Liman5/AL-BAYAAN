import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/sync/sync_models.dart';
import 'package:school_attendance/features/students/data/student_repository.dart';
import 'package:school_attendance/features/terminal_settings/data/settings_repository.dart';

/// Tests d'application des données reçues d'AL-BAYAAN (SQLite réel).
///
/// Vérifient qu'une synchronisation descendante ne crée jamais de doublon,
/// ne perd aucune présence et respecte la politique d'affichage du serveur.

StudentSyncDto _dto({
  String code = 'ALB-2026-0001',
  String token = 'TOKEN-ABCDEFGHIJKLMNOPQRSTUVWX',
  String firstName = 'Adjovi',
  String lastName = 'Kodjo',
  String className = '3e A',
  bool isActive = true,
  bool revoked = false,
}) {
  return StudentSyncDto(
    studentCode: code,
    qrToken: revoked ? '' : token,
    studentUuid: 'uuid-$code',
    firstName: firstName,
    lastName: lastName,
    classId: 'class-1',
    className: className,
    isActive: isActive,
    badgeRevoked: revoked,
  );
}

void main() {
  late AppDatabase db;
  late StudentRepository students;
  late SettingsRepository settings;

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    students = StudentRepository(db);
    settings = SettingsRepository(db);
    await settings.ensureSettings();
  });

  tearDown(() async {
    await db.close();
  });

  test('un élève synchronisé est scannable par son token', () async {
    await students.applyServerStudents(
      [_dto()],
      syncedAt: DateTime.utc(2026, 11, 26, 7),
    );

    final found = await students.findByQrToken('TOKEN-ABCDEFGHIJKLMNOPQRSTUVWX');
    expect(found, isNotNull);
    expect(found!.studentCode, 'ALB-2026-0001');
    expect(found.className, '3e A');
  });

  test('une seconde synchronisation ne crée pas de doublon', () async {
    await students.applyServerStudents(
      [_dto()],
      syncedAt: DateTime.utc(2026, 11, 26, 7),
    );
    final first = await students.findByCode('ALB-2026-0001');

    await students.applyServerStudents(
      [_dto(firstName: 'Adjovi-Marie')],
      syncedAt: DateTime.utc(2026, 11, 26, 8),
    );

    expect(await students.countStudents(), 1);
    final second = await students.findByCode('ALB-2026-0001');
    expect(second!.id, first!.id, reason: 'identifiant local conservé');
    expect(second.firstName, 'Adjovi-Marie');
  });

  test('un badge révoqué désactive le scan sans supprimer l’élève', () async {
    await students.applyServerStudents(
      [_dto()],
      syncedAt: DateTime.utc(2026, 11, 26, 7),
    );

    await students.applyServerStudents(
      [_dto(revoked: true)],
      syncedAt: DateTime.utc(2026, 11, 26, 8),
    );

    final student = await students.findByCode('ALB-2026-0001');
    expect(student, isNotNull);
    expect(student!.badgeRevoked, isTrue);
    expect(student.isActive, isFalse);
    expect(await students.countStudents(), 1);
  });

  test('un élève retiré du serveur est désactivé localement', () async {
    await students.applyServerStudents(
      [_dto()],
      syncedAt: DateTime.utc(2026, 11, 26, 7),
    );

    final updated = await students.deactivateStudentsByCodes(['ALB-2026-0001']);
    expect(updated, 1);

    final student = await students.findByCode('ALB-2026-0001');
    expect(student!.isActive, isFalse);
  });

  test('la configuration serveur écrase les horaires locaux', () async {
    await settings.applyServerConfig(
      const ScannerConfigDto(
        lateAfterTime: '08:00',
        attendanceStartTime: '07:15',
        timezone: 'Africa/Accra',
        showPhoto: false,
        showMatricule: false,
        showClassName: true,
        showTime: false,
        configVersion: 3,
      ),
      schoolName: 'Institut AL-BAYAAN',
    );

    final current = await settings.current();
    expect(current.lateAfterTime, '08:00');
    expect(current.attendanceStartTime, '07:15');
    expect(current.timezone, 'Africa/Accra');
    expect(current.schoolName, 'Institut AL-BAYAAN');
    expect(current.showPhoto, isFalse);
    expect(current.showMatricule, isFalse);
    expect(current.showClassName, isTrue);
    expect(current.showTime, isFalse);
  });

  test('une configuration partielle ne détruit pas les réglages locaux', () async {
    await settings.applyServerConfig(
      const ScannerConfigDto(lateAfterTime: '07:45'),
    );

    final current = await settings.current();
    expect(current.lateAfterTime, '07:45');
    // Les autres valeurs restent celles par défaut du terminal.
    expect(current.attendanceStartTime, '07:00');
    expect(current.timezone, 'Africa/Lome');
    expect(current.showPhoto, isTrue);
  });
}
