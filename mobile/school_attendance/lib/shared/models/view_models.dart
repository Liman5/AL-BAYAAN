/// Modèles de présentation partagés (immuables, sans dépendance Flutter).
library;

import '../../core/database/app_database.dart';

class DayAttendanceCounts {
  const DayAttendanceCounts({
    this.total = 0,
    this.present = 0,
    this.late = 0,
  });

  final int total;
  final int present;
  final int late;

  static const DayAttendanceCounts empty = DayAttendanceCounts();
}

class ClassAttendanceStat {
  const ClassAttendanceStat({
    required this.className,
    required this.total,
    required this.late,
  });

  final String className;
  final int total;
  final int late;

  int get present => total - late;
}

class AttendanceHistoryEntry {
  const AttendanceHistoryEntry({
    required this.record,
    required this.studentName,
  });

  final AttendanceRecord record;
  final String studentName;

  bool get isLate => record.attendanceStatus == 'late';
  bool get isSynced => record.syncStatus == 'synced';
  bool get isPending =>
      record.syncStatus == 'pending' ||
      record.syncStatus == 'syncing' ||
      record.syncStatus == 'failed';
}

class StorageSnapshot {
  const StorageSnapshot({
    required this.databaseBytes,
    required this.studentCount,
    required this.attendanceCount,
    required this.pendingSyncCount,
    required this.logCount,
  });

  final int databaseBytes;
  final int studentCount;
  final int attendanceCount;
  final int pendingSyncCount;
  final int logCount;

  static const StorageSnapshot empty = StorageSnapshot(
    databaseBytes: 0,
    studentCount: 0,
    attendanceCount: 0,
    pendingSyncCount: 0,
    logCount: 0,
  );
}
