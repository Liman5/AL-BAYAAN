import 'dart:io';

import 'package:drift/drift.dart' hide isNotNull, isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:path/path.dart' as p;
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/utils/app_time.dart';
import 'package:school_attendance/features/attendance_scanner/data/attendance_repository.dart';
import 'package:school_attendance/features/attendance_scanner/domain/camera_preference.dart';
import 'package:school_attendance/features/students/data/student_repository.dart';
import 'package:school_attendance/features/terminal_settings/data/settings_repository.dart';

/// Tests de persistance locale (SQLite réel).
///
/// La bibliothèque native `sqlite3` doit être disponible sur la machine de
/// test (sous Windows : `sqlite3.dll` accessible via le PATH).

Future<Student> _seedStudent(AppDatabase db, {String code = 'EL-0248'}) async {
  final students = StudentRepository(db);
  await students.upsertStudents([
    StudentsCompanion.insert(
      id: 'student-1',
      studentCode: code,
      firstName: const Value('Adjovi'),
      lastName: const Value('Kodjo'),
      className: const Value('3e A'),
      qrToken: 'BADGE-0248-KD',
      updatedAt: DateTime.utc(2026, 11, 26),
    ),
  ]);
  final student = await students.findByQrToken('BADGE-0248-KD');
  expect(student, isNotNull);
  return student!;
}

void main() {
  late AppDatabase db;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
  });

  tearDown(() async {
    await db.close();
  });

  test('un élève importé est retrouvé par son token et son matricule', () async {
    final student = await _seedStudent(db);
    expect(student.firstName, 'Adjovi');
    expect(student.className, '3e A');

    final byCode = await StudentRepository(db).findByCode('EL-0248');
    expect(byCode?.id, student.id);
  });

  test('un token inconnu ne renvoie aucun élève', () async {
    await _seedStudent(db);
    final unknown = await StudentRepository(db).findByQrToken('BADGE-INCONNU');
    expect(unknown, isNull);
  });

  test('la présence est persistée avec son événement de synchronisation',
      () async {
    final student = await _seedStudent(db);
    final attendance = AttendanceRepository(db);

    final now = DateTime(2026, 11, 26, 7, 14, 32);
    final record = await db.transaction(() async {
      return attendance.createRecord(
        student: student,
        nowLocal: now,
        attendanceStatus: 'present',
        terminalId: 'terminal-test',
        session: 'morning',
      );
    });

    expect(record.localDate, '2026-11-26');
    expect(record.localMinutes, 434);
    expect(record.attendanceStatus, 'present');
    expect(record.syncStatus, 'pending');

    final queue = await db.select(db.syncQueue).get();
    expect(queue.length, 1);
    expect(queue.first.entityId, record.id);
    expect(queue.first.eventType, 'attendance.created');

    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.total, 1);
    expect(counts.present, 1);
    expect(counts.late, 0);
  });

  test('la contrainte SQL empêche un doublon le même jour', () async {
    final student = await _seedStudent(db);
    final attendance = AttendanceRepository(db);
    final now = DateTime(2026, 11, 26, 7, 14, 32);

    await attendance.createRecord(
      student: student,
      nowLocal: now,
      attendanceStatus: 'present',
      terminalId: 'terminal-test',
      session: 'morning',
    );

    // Chemin normal : l'écran affiche « déjà enregistré ».
    final existing = await attendance.findForSession(
      studentId: student.id,
      localDate: '2026-11-26',
      session: 'morning',
    );
    expect(existing, isNotNull);

    // Même en forçant l'écriture, la base refuse le doublon.
    await expectLater(
      attendance.createRecord(
        student: student,
        nowLocal: now.add(const Duration(minutes: 3)),
        attendanceStatus: 'present',
        terminalId: 'terminal-test',
        session: 'morning',
      ),
      throwsA(anything),
    );

    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.total, 1, reason: 'aucun doublon ne doit être enregistré');
  });

  test('un retard est comptabilisé séparément', () async {
    final student = await _seedStudent(db);
    final attendance = AttendanceRepository(db);

    await attendance.createRecord(
      student: student,
      nowLocal: DateTime(2026, 11, 26, 8, 5),
      attendanceStatus: 'late',
      terminalId: 'terminal-test',
      session: 'morning',
    );

    final counts = await attendance.countsForDay('2026-11-26');
    expect(counts.late, 1);
    expect(counts.present, 0);
  });

  test('les données survivent à la fermeture et à la réouverture', () async {
    final directory = await Directory.systemTemp.createTemp('sa_test_');
    final file = File(p.join(directory.path, 'terminal.sqlite'));

    var database = AppDatabase(NativeDatabase(file));
    final student = await _seedStudent(database);
    await AttendanceRepository(database).createRecord(
      student: student,
      nowLocal: DateTime(2026, 11, 26, 7, 10),
      attendanceStatus: 'present',
      terminalId: 'terminal-test',
      session: 'morning',
    );
    await database.close();

    database = AppDatabase(NativeDatabase(file));
    final reloaded =
        await StudentRepository(database).findByQrToken('BADGE-0248-KD');
    expect(reloaded, isNotNull);
    final counts =
        await AttendanceRepository(database).countsForDay('2026-11-26');
    expect(counts.total, 1);
    await database.close();

    await directory.delete(recursive: true);
  });

  test('les minutes de la journée sont calculées correctement', () {
    expect(AppTime.minutesOfDay(DateTime(2026, 11, 26, 7, 14)), 434);
    expect(AppTime.minutesOfDay(DateTime(2026, 11, 26)), 0);
    expect(AppTime.parseHhMm('07:30'), 450);
    expect(AppTime.parseHhMm('7:05'), 425);
    expect(AppTime.parseHhMm('25:00'), isNull);
    expect(AppTime.formatMinutes(450), '07:30');
  });

  group('préférence de caméra (paramètres locaux)', () {
    test('une nouvelle installation démarre sur la caméra avant', () async {
      final repository = SettingsRepository(db);
      final settings = await repository.ensureSettings();

      expect(settings.cameraFacing, 'front');
      expect(CameraMode.parse(settings.cameraFacing), CameraMode.front);
    });

    test('le passage à la caméra arrière est enregistré et restauré',
        () async {
      final repository = SettingsRepository(db);
      await repository.ensureSettings();

      await repository.setCameraFacing('back');
      final restored = await repository.current();

      expect(restored.cameraFacing, 'back');
      expect(CameraMode.parse(restored.cameraFacing), CameraMode.back);
    });

    test('le retour à la caméra avant est enregistré', () async {
      final repository = SettingsRepository(db);
      await repository.ensureSettings();

      await repository.setCameraFacing('back');
      await repository.setCameraFacing('front');

      expect((await repository.current()).cameraFacing, 'front');
      expect(
        CameraMode.parse((await repository.current()).cameraFacing),
        CameraMode.front,
      );
    });

    test('une valeur invalide stockée retombe sur la caméra avant', () async {
      final repository = SettingsRepository(db);
      await repository.ensureSettings();

      await repository.setCameraFacing('externe');
      final stored = (await repository.current()).cameraFacing;

      expect(stored, 'externe', reason: 'la base conserve la valeur brute');
      expect(
        CameraMode.parse(stored),
        CameraMode.front,
        reason: 'l’application retombe toujours sur la caméra avant',
      );
    });

    test('changer de caméra ne touche ni présences ni file de synchro',
        () async {
      final repository = SettingsRepository(db);
      await repository.ensureSettings();
      final student = await _seedStudent(db);
      final attendance = AttendanceRepository(db);

      await attendance.createRecord(
        student: student,
        nowLocal: DateTime(2026, 11, 26, 7, 20),
        attendanceStatus: 'present',
        terminalId: 'terminal-test',
        session: 'morning',
      );

      await repository.setCameraFacing('back');
      await repository.setCameraFacing('front');

      expect(await attendance.countAll(), 1);
      final counts = await attendance.countsForDay('2026-11-26');
      expect(counts.total, 1);
      final queue = await db.select(db.syncQueue).get();
      expect(queue.length, 1);
    });
  });
}


