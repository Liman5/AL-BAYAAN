import 'package:drift/drift.dart' hide isNotNull, isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/sync/sync_models.dart';
import 'package:school_attendance/features/attendance_scanner/data/attendance_repository.dart';
import 'package:school_attendance/features/attendance_scanner/domain/scan_outcome.dart';
import 'package:school_attendance/features/attendance_scanner/domain/scan_service.dart';
import 'package:school_attendance/features/staff/data/staff_repository.dart';
import 'package:school_attendance/features/students/data/student_repository.dart';
import 'package:school_attendance/features/sync/data/log_repository.dart';
import 'package:school_attendance/features/terminal_settings/data/settings_repository.dart';

/// Pointage des **enseignants et de l'administration** (badge QR).
void main() {
  late AppDatabase db;
  late StaffRepository staff;
  late ScanService service;

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    staff = StaffRepository(db);
    final settings = SettingsRepository(db);
    await settings.ensureSettings();

    service = ScanService(
      database: db,
      students: StudentRepository(db),
      staff: staff,
      attendance: AttendanceRepository(db),
      settings: settings,
      logs: LogRepository(db),
    );
  });

  tearDown(() async {
    await db.close();
  });

  Future<void> addStaff({
    String code = 'ENS-0001',
    String token = 'STAFF-TOKEN-0001-ABCDEF',
    bool isActive = true,
    bool revoked = false,
  }) async {
    await staff.applyServerStaff(
      [
        StaffSyncDto(
          staffCode: code,
          qrToken: token,
          staffUuid: 'user-$code',
          firstName: 'Mariam',
          lastName: 'Diallo',
          staffType: 'teacher',
          roleLabel: 'Enseignant · Mathématiques',
          isActive: isActive,
          badgeRevoked: revoked,
        ),
      ],
      syncedAt: DateTime.utc(2026, 11, 27),
    );
  }

  test('un enseignant est identifié par son badge', () async {
    await addStaff();

    final outcome = await service.handleRawQr('STAFF-TOKEN-0001-ABCDEF');

    expect(outcome.type, ScanResultType.success);
    expect(outcome.staff, isNotNull);
    expect(outcome.staff!.firstName, 'Mariam');
    expect(outcome.staff!.roleLabel, contains('Mathématiques'));
    expect(outcome.record, isNotNull);
    expect(outcome.record!.personType, 'staff');
    expect(outcome.record!.studentCode, 'ENS-0001');
  });

  test('un second scan le même jour est un doublon', () async {
    await addStaff();

    await service.handleRawQr('STAFF-TOKEN-0001-ABCDEF');
    final second = await service.handleRawQr('STAFF-TOKEN-0001-ABCDEF');

    expect(second.type, ScanResultType.alreadyRegistered);
    expect(second.staff, isNotNull);
    expect(await db.select(db.attendanceRecords).get(), hasLength(1));
  });

  test('un badge du personnel révoqué est refusé', () async {
    await addStaff(revoked: true);

    final outcome = await service.handleRawQr('STAFF-TOKEN-0001-ABCDEF');
    expect(outcome.type, ScanResultType.badgeRevoked);
    expect(await db.select(db.attendanceRecords).get(), isEmpty);
  });

  test('un membre du personnel désactivé est refusé', () async {
    await addStaff(isActive: false);

    final outcome = await service.handleRawQr('STAFF-TOKEN-0001-ABCDEF');
    expect(outcome.type, ScanResultType.inactiveStudent);
    expect(await db.select(db.attendanceRecords).get(), isEmpty);
  });

  test('le pointage du personnel est mis en file de synchronisation', () async {
    await addStaff();
    await service.handleRawQr('STAFF-TOKEN-0001-ABCDEF');

    final queue = await db.select(db.syncQueue).get();
    expect(queue, hasLength(1));
    expect(queue.single.payloadJson, contains('"personType":"staff"'));
    expect(queue.single.payloadJson, contains('ENS-0001'));
  });

  test('un token inconnu reste refusé', () async {
    final outcome = await service.handleRawQr('TOTALLY-UNKNOWN-TOKEN');
    expect(outcome.type, ScanResultType.studentNotFound);
  });
}
