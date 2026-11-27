import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../../core/database/app_database.dart';
import '../../../core/utils/app_time.dart';
import '../../../shared/models/view_models.dart';

/// Enregistrement et lecture des présences locales.
///
/// Toute écriture se fait dans une transaction appelée par le service de scan :
/// la présence et l'élément de file de synchronisation sont créés ensemble,
/// ou pas du tout.
class AttendanceRepository {
  AttendanceRepository(this._db, {Uuid? uuid, Clock? clock})
      : _uuid = uuid ?? const Uuid(),
        _clock = clock ?? const SystemClock();

  final AppDatabase _db;
  final Uuid _uuid;
  final Clock _clock;

  Future<AttendanceRecord?> findForSession({
    required String studentId,
    required String localDate,
    required String session,
  }) {
    return (_db.select(_db.attendanceRecords)
          ..where(
            (t) =>
                t.studentId.equals(studentId) &
                t.localDate.equals(localDate) &
                t.session.equals(session),
          ))
        .getSingleOrNull();
  }

  /// Crée l'événement de présence + l'élément de synchronisation.
  ///
  /// Le statut (`present` / `late`) est décidé par l'appelant à partir des
  /// paramètres du terminal — il n'est jamais codé en dur ici.
  Future<AttendanceRecord> createRecord({
    required Student student,
    required DateTime nowLocal,
    required String attendanceStatus,
    required String terminalId,
    required String session,
  }) async {
    final recordId = _uuid.v4();
    final localDate = AppTime.dateKey(nowLocal);
    final scannedAtUtc = nowLocal.toUtc();

    await _db.into(_db.attendanceRecords).insert(
          AttendanceRecordsCompanion.insert(
            id: recordId,
            studentId: student.id,
            studentUuid: Value(student.studentUuid),
            studentCode: student.studentCode,
            classId: Value(student.classId),
            className: Value(student.className),
            scannedAtUtc: scannedAtUtc,
            localDate: localDate,
            localMinutes: AppTime.minutesOfDay(nowLocal),
            session: Value(session),
            attendanceStatus: attendanceStatus,
            terminalId: terminalId,
            createdAt: _clock.now().toUtc(),
          ),
        );

    final payload = <String, dynamic>{
      'id': recordId,
      'studentUuid': student.studentUuid,
      'studentCode': student.studentCode,
      'classId': student.classId,
      'className': student.className,
      'scannedAtUtc': AppTime.isoUtc(nowLocal),
      'localDate': localDate,
      'localMinutes': AppTime.minutesOfDay(nowLocal),
      'session': session,
      'attendanceStatus': attendanceStatus,
      'terminalId': terminalId,
      'source': 'qr',
    };

    await _db.into(_db.syncQueue).insert(
          SyncQueueCompanion.insert(
            id: _uuid.v4(),
            eventType: 'attendance.created',
            entityId: recordId,
            payloadJson: jsonEncode(payload),
            createdAt: _clock.now().toUtc(),
          ),
        );

    return (_db.select(_db.attendanceRecords)
          ..where((t) => t.id.equals(recordId)))
        .getSingle();
  }

  Future<DayAttendanceCounts> countsForDay(String localDate) async {
    final rows = await (_db.select(_db.attendanceRecords)
          ..where((t) => t.localDate.equals(localDate)))
        .get();
    final late = rows.where((r) => r.attendanceStatus == 'late').length;
    return DayAttendanceCounts(
      total: rows.length,
      present: rows.length - late,
      late: late,
    );
  }

  /// Flux temps réel des compteurs du jour (scanner + dashboard).
  Stream<DayAttendanceCounts> watchCountsForDay(String localDate) {
    return (_db.select(_db.attendanceRecords)
          ..where((t) => t.localDate.equals(localDate)))
        .watch()
        .map((rows) {
      final late = rows.where((r) => r.attendanceStatus == 'late').length;
      return DayAttendanceCounts(
        total: rows.length,
        present: rows.length - late,
        late: late,
      );
    });
  }

  Future<List<ClassAttendanceStat>> classStatsForDay(String localDate) async {
    final rows = await (_db.select(_db.attendanceRecords)
          ..where((t) => t.localDate.equals(localDate)))
        .get();
    final Map<String, List<AttendanceRecord>> grouped = {};
    for (final row in rows) {
      final key = row.className.trim().isEmpty ? 'Non affecté' : row.className;
      grouped.putIfAbsent(key, () => <AttendanceRecord>[]).add(row);
    }
    final stats = grouped.entries
        .map(
          (entry) => ClassAttendanceStat(
            className: entry.key,
            total: entry.value.length,
            late: entry.value.where((r) => r.attendanceStatus == 'late').length,
          ),
        )
        .toList();
    stats.sort((a, b) => b.total.compareTo(a.total));
    return stats;
  }

  Future<List<AttendanceHistoryEntry>> history({
    DateTime? day,
    String? classId,
    String? status,
    String? search,
    int limit = 200,
  }) async {
    final joined = _db.select(_db.attendanceRecords).join([
      leftOuterJoin(
        _db.students,
        _db.students.id.equalsExp(_db.attendanceRecords.studentId),
      ),
    ]);

    if (day != null) {
      joined.where(_db.attendanceRecords.localDate.equals(AppTime.dateKey(day)));
    }
    if (classId != null && classId.isNotEmpty) {
      joined.where(_db.attendanceRecords.classId.equals(classId));
    }
    if (status != null && status.isNotEmpty) {
      joined.where(_db.attendanceRecords.attendanceStatus.equals(status));
    }

    final term = search?.trim().toLowerCase();
    if (term != null && term.isNotEmpty) {
      joined.where(
        _db.attendanceRecords.studentCode.lower().contains(term) |
            _db.students.firstName.lower().contains(term) |
            _db.students.lastName.lower().contains(term),
      );
    }

    joined
      ..orderBy([
        OrderingTerm(
          expression: _db.attendanceRecords.scannedAtUtc,
          mode: OrderingMode.desc,
        ),
      ])
      ..limit(limit);

    final rows = await joined.get();
    return rows.map((row) {
      final record = row.readTable(_db.attendanceRecords);
      final student = row.readTableOrNull(_db.students);
      final fullName =
          '${student?.firstName ?? ''} ${student?.lastName ?? ''}'.trim();
      return AttendanceHistoryEntry(
        record: record,
        studentName: fullName.isEmpty ? record.studentCode : fullName,
      );
    }).toList();
  }

  Future<List<AttendanceHistoryEntry>> recent({int limit = 8}) {
    return history(limit: limit);
  }

  Future<int> countPendingSync() async {
    final count = _db.attendanceRecords.id.count();
    final query = _db.selectOnly(_db.attendanceRecords)
      ..addColumns([count])
      ..where(
        _db.attendanceRecords.syncStatus.isIn(
          const ['pending', 'syncing', 'failed'],
        ),
      );
    final row = await query.getSingle();
    return row.read(count) ?? 0;
  }

  Stream<int> watchPendingSyncCount() {
    final count = _db.attendanceRecords.id.count();
    final query = _db.selectOnly(_db.attendanceRecords)
      ..addColumns([count])
      ..where(
        _db.attendanceRecords.syncStatus.isIn(
          const ['pending', 'syncing', 'failed'],
        ),
      );
    return query.map((row) => row.read(count) ?? 0).watchSingle();
  }

  Future<int> countAll() async {
    final count = _db.attendanceRecords.id.count();
    final query = _db.selectOnly(_db.attendanceRecords)..addColumns([count]);
    final row = await query.getSingle();
    return row.read(count) ?? 0;
  }

  /// Purge des événements anciens **déjà synchronisés** uniquement.
  /// Un scan non synchronisé n'est jamais supprimé.
  Future<int> deleteSyncedOlderThan(DateTime limit) {
    return (_db.delete(_db.attendanceRecords)..where(
          (t) =>
              t.scannedAtUtc.isSmallerThanValue(limit) &
              t.syncStatus.equals('synced'),
        ))
        .go();
  }

  /// Toutes les présences d'une journée (export CSV).
  Future<List<AttendanceHistoryEntry>> dayEntries(DateTime day) {
    return history(day: day, limit: 5000);
  }
}


