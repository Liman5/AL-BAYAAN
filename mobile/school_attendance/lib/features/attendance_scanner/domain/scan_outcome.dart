import '../../../core/database/app_database.dart';
import 'attendance_rules.dart';

/// États explicites du scanner. Chaque état a un visuel et un retour au scan.
enum ScanResultType {
  success,
  alreadyRegistered,
  studentNotFound,
  inactiveStudent,
  badgeRevoked,
  invalidQr,
  databaseError,
  cameraError,
}

class ScanOutcome {
  const ScanOutcome(
    this.type, {
    this.student,
    this.record,
    this.existingRecord,
    this.message,
  });

  const ScanOutcome.invalidQr([String? message])
      : this(ScanResultType.invalidQr, message: message);

  const ScanOutcome.studentNotFound()
      : this(ScanResultType.studentNotFound);

  const ScanOutcome.inactiveStudent({Student? student})
      : this(ScanResultType.inactiveStudent, student: student);

  const ScanOutcome.badgeRevoked({Student? student})
      : this(ScanResultType.badgeRevoked, student: student);

  const ScanOutcome.databaseError([String? message])
      : this(ScanResultType.databaseError, message: message);

  final ScanResultType type;
  final Student? student;

  /// Présence créée (uniquement pour [ScanResultType.success]).
  final AttendanceRecord? record;

  /// Première présence déjà enregistrée (pour les doublons).
  final AttendanceRecord? existingRecord;

  final String? message;

  bool get isSuccess => type == ScanResultType.success;

  bool get isDuplicate => type == ScanResultType.alreadyRegistered;

  bool get isFailure => !isSuccess && !isDuplicate;

  AttendanceStatus? get status {
    final value = record?.attendanceStatus ?? existingRecord?.attendanceStatus;
    if (value == null) return null;
    return AttendanceStatus.fromValue(value);
  }

  DateTime? get arrivalTime {
    final source = record ?? existingRecord;
    return source?.scannedAtUtc.toLocal();
  }
}
