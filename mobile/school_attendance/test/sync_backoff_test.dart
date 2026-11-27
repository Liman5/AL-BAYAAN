import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/sync/sync_models.dart';

void main() {
  group('SyncBackoff.delayFor', () {
    test('aucune reprise : délai de base', () {
      expect(SyncBackoff.delayFor(0), const Duration(seconds: 5));
    });

    test('double à chaque tentative', () {
      expect(SyncBackoff.delayFor(1), const Duration(seconds: 10));
      expect(SyncBackoff.delayFor(2), const Duration(seconds: 20));
      expect(SyncBackoff.delayFor(3), const Duration(seconds: 40));
      expect(SyncBackoff.delayFor(4), const Duration(seconds: 80));
    });

    test('plafonne à une heure', () {
      expect(
        SyncBackoff.delayFor(30),
        const Duration(seconds: SyncBackoff.maxSeconds),
      );
    });
  });

  group('SyncBackoff.canAttempt', () {
    final now = DateTime.utc(2026, 11, 26, 8, 0, 0);

    test('autorise une première tentative', () {
      expect(SyncBackoff.canAttempt(now: now, retryCount: 0), isTrue);
    });

    test('bloque avant la fin du délai', () {
      expect(
        SyncBackoff.canAttempt(
          now: now,
          lastAttemptAt: now.subtract(const Duration(seconds: 2)),
          retryCount: 3, // délai 40 s
        ),
        isFalse,
      );
    });

    test('autorise après le délai', () {
      expect(
        SyncBackoff.canAttempt(
          now: now,
          lastAttemptAt: now.subtract(const Duration(seconds: 60)),
          retryCount: 3,
        ),
        isTrue,
      );
    });
  });

  group('AttendanceSyncDto', () {
    test('produit une clé d’idempotence stable', () {
      const dto = AttendanceSyncDto(
        eventId: 'evt-1',
        studentUuid: 'stu-9',
        studentCode: 'EL-0248',
        scannedAtUtc: '2026-11-26T07:14:32.000Z',
        localDate: '2026-11-26',
        attendanceStatus: 'present',
        terminalId: 'terminal-1',
        source: 'qr',
        session: 'morning',
      );
      expect(dto.idempotencyKey, 'attendance:evt-1');
      expect(dto.toJson()['attendanceStatus'], 'present');
    });

    test('relit un payload de file d’attente', () {
      final dto = AttendanceSyncDto.fromQueuePayload(
        '{"id":"evt-2","studentCode":"EL-1","scannedAtUtc":"2026-11-26T08:00:00.000Z",'
        '"localDate":"2026-11-26","attendanceStatus":"late","terminalId":"t1"}',
      );
      expect(dto.eventId, 'evt-2');
      expect(dto.attendanceStatus, 'late');
      expect(dto.source, 'qr');
    });
  });

  group('SyncResult', () {
    test('l’état non configuré est explicite', () {
      const result = SyncResult.notConfigured();
      expect(result.isNotConfigured, isTrue);
      expect(result.isSuccess, isFalse);
      expect(result.message, contains('non configurée'));
    });
  });
}
