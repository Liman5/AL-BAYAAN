import 'package:drift/drift.dart' hide isNotNull, isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/utils/app_time.dart';
import 'package:school_attendance/features/attendance_scanner/data/attendance_repository.dart';
import 'package:school_attendance/features/attendance_scanner/domain/scan_outcome.dart';
import 'package:school_attendance/features/attendance_scanner/domain/scan_service.dart';
import 'package:school_attendance/features/attendance_scanner/presentation/scanner_controller.dart';
import 'package:school_attendance/features/students/data/student_repository.dart';
import 'package:school_attendance/features/sync/data/log_repository.dart';
import 'package:school_attendance/features/terminal_settings/data/settings_repository.dart';

/// Horloge figée : rend les statuts présent/retard déterministes.
class _FixedClock implements Clock {
  _FixedClock(this.value);

  DateTime value;

  @override
  DateTime now() => value;
}

void main() {
  late AppDatabase db;
  late StudentRepository students;
  late AttendanceRepository attendance;
  late SettingsRepository settings;
  late ScanService service;
  final _FixedClock clock = _FixedClock(DateTime(2026, 11, 26, 7, 15));

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    students = StudentRepository(db);
    attendance = AttendanceRepository(db);
    settings = SettingsRepository(db);
    await settings.ensureSettings();
    final current = await settings.current();
    await settings.save(current.copyWith(lateAfterTime: '07:30'));

    service = ScanService(
      database: db,
      students: students,
      attendance: attendance,
      settings: settings,
      logs: LogRepository(db),
      clock: clock,
    );

    await students.upsertStudents([
      StudentsCompanion.insert(
        id: 'student-active',
        studentCode: 'DEMO-0001',
        firstName: const Value('Adjovi'),
        lastName: const Value('Kodjo'),
        className: const Value('3e A'),
        qrToken: 'DEMO-BADGE-0001',
        updatedAt: DateTime.utc(2026, 11, 26),
      ),
      StudentsCompanion.insert(
        id: 'student-inactive',
        studentCode: 'DEMO-0002',
        firstName: const Value('Youssef'),
        lastName: const Value('Ait'),
        className: const Value('3e A'),
        qrToken: 'DEMO-BADGE-0002',
        isActive: const Value(false),
        updatedAt: DateTime.utc(2026, 11, 26),
      ),
      StudentsCompanion.insert(
        id: 'student-revoked',
        studentCode: 'DEMO-0003',
        firstName: const Value('Imane'),
        lastName: const Value('Mahmoud'),
        className: const Value('4e B'),
        qrToken: 'DEMO-BADGE-0003',
        badgeRevoked: const Value(true),
        updatedAt: DateTime.utc(2026, 11, 26),
      ),
    ]);
  });

  tearDown(() async {
    await db.close();
  });

  test('scénario 1 — badge valide : présence enregistrée (présent)', () async {
    clock.value = DateTime(2026, 11, 26, 7, 15);

    final outcome = await service.handleRawQr('DEMO-BADGE-0001');

    expect(outcome.type, ScanResultType.success);
    expect(outcome.student?.studentCode, 'DEMO-0001');
    expect(outcome.record?.attendanceStatus, 'present');
    expect(outcome.record?.localDate, '2026-11-26');
    expect(outcome.record?.localMinutes, 435);
    expect(outcome.record?.syncStatus, 'pending');

    final queue = await db.select(db.syncQueue).get();
    expect(queue.length, 1);
    expect(queue.first.entityId, outcome.record!.id);

    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.total, 1);
    expect(counts.present, 1);
  });

  test('badge préfixé (ALB|) accepté et retard calculé', () async {
    clock.value = DateTime(2026, 11, 26, 8, 5);

    final outcome = await service.handleRawQr('ALB|DEMO-BADGE-0001');

    expect(outcome.type, ScanResultType.success);
    expect(outcome.record?.attendanceStatus, 'late');
    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.late, 1);
    expect(counts.present, 0);
  });

  test('scénario 2 — second scan : doublon refusé, 1er horaire conservé',
      () async {
    clock.value = DateTime(2026, 11, 26, 7, 10);
    final first = await service.handleRawQr('DEMO-BADGE-0001');
    expect(first.type, ScanResultType.success);

    clock.value = DateTime(2026, 11, 26, 7, 40);
    final second = await service.handleRawQr('DEMO-BADGE-0001');

    expect(second.type, ScanResultType.alreadyRegistered);
    expect(second.existingRecord?.id, first.record!.id);
    expect(second.existingRecord?.localMinutes, 430);

    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.total, 1, reason: 'un seul événement en base');
    final queue = await db.select(db.syncQueue).get();
    expect(queue.length, 1, reason: 'un seul événement à synchroniser');
  });

  test('scénario 3 — badge inconnu : refusé, aucune présence', () async {
    final outcome = await service.handleRawQr('DEMO-BADGE-9999');

    expect(outcome.type, ScanResultType.studentNotFound);
    expect(outcome.record, isNull);
    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.total, 0);
  });

  test('élève inactif refusé', () async {
    final outcome = await service.handleRawQr('DEMO-BADGE-0002');
    expect(outcome.type, ScanResultType.inactiveStudent);
    expect(await attendance.countAll(), 0);
  });

  test('badge révoqué refusé', () async {
    final outcome = await service.handleRawQr('DEMO-BADGE-0003');
    expect(outcome.type, ScanResultType.badgeRevoked);
    expect(await attendance.countAll(), 0);
  });

  test('QR malformé refusé sans écrire en base', () async {
    expect((await service.handleRawQr('ABC')).type, ScanResultType.invalidQr);
    expect(
      (await service.handleRawQr('{"nom":"ADJOVI","classe":"3e A"}')).type,
      ScanResultType.invalidQr,
    );
    expect(await attendance.countAll(), 0);
  });

  test('scénario 6 — scans successifs de badges différents', () async {
    await students.upsertStudents([
      StudentsCompanion.insert(
        id: 'student-4',
        studentCode: 'DEMO-0004',
        firstName: const Value('Karim'),
        lastName: const Value('El Amrani'),
        className: const Value('4e B'),
        qrToken: 'DEMO-BADGE-0004',
        updatedAt: DateTime.utc(2026, 11, 26),
      ),
    ]);

    clock.value = DateTime(2026, 11, 26, 7, 20);
    final a = await service.handleRawQr('DEMO-BADGE-0001');
    final b = await service.handleRawQr('DEMO-BADGE-0004');

    expect(a.type, ScanResultType.success);
    expect(b.type, ScanResultType.success);
    expect(a.student?.studentCode, 'DEMO-0001');
    expect(b.student?.studentCode, 'DEMO-0004');

    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.total, 2);
    final queue = await db.select(db.syncQueue).get();
    expect(queue.length, 2);
  });

  test('une bascule de caméra bloque toute détection (aucune présence)',
      () async {
    // Feedback silencieux : aucun canal natif sollicité dans les tests.
    final current = await settings.current();
    await settings.save(
      current.copyWith(soundEnabled: false, hapticsEnabled: false),
    );

    final controller = ScannerController(
      scanService: service,
      settingsRepository: settings,
    );
    addTearDown(controller.dispose);

    controller.setCameraSwitching(true);
    await controller.handleDetection('DEMO-BADGE-0001');
    expect(
      await attendance.countAll(),
      0,
      reason: 'aucune présence ne doit être créée pendant la bascule',
    );

    controller.setCameraSwitching(false);
    await controller.handleDetection('DEMO-BADGE-0001');
    expect(await attendance.countAll(), 1);
  });
}


