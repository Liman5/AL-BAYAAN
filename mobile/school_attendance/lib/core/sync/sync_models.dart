import 'dart:convert';

/// États de synchronisation affichés à l'opérateur.
enum SyncState { notConfigured, idle, running, success, failure }

/// Résultat d'une tentative de synchronisation.
class SyncResult {
  const SyncResult({
    required this.state,
    required this.message,
    this.pushed = 0,
    this.pulled = 0,
  });

  const SyncResult.notConfigured()
      : state = SyncState.notConfigured,
        message =
            'Synchronisation non configurée : aucune donnée n’est envoyée et '
                'les présences restent enregistrées localement.',
        pushed = 0,
        pulled = 0;

  final SyncState state;
  final String message;
  final int pushed;
  final int pulled;

  bool get isSuccess => state == SyncState.success;
  bool get isNotConfigured => state == SyncState.notConfigured;
}

/// Calcul du délai de reprise (backoff exponentiel plafonné).
class SyncBackoff {
  const SyncBackoff._();

  static const int baseSeconds = 5;
  static const int maxSeconds = 3600;

  /// `attempt` commence à 0 pour la première reprise.
  static Duration delayFor(int attempt) {
    if (attempt <= 0) return const Duration(seconds: baseSeconds);
    var seconds = baseSeconds;
    for (var i = 0; i < attempt && seconds < maxSeconds; i++) {
      seconds *= 2;
    }
    return Duration(seconds: seconds.clamp(baseSeconds, maxSeconds).toInt());
  }

  /// Un élément ne doit pas être retenté avant la fin de son délai.
  static bool canAttempt({
    required DateTime now,
    DateTime? lastAttemptAt,
    required int retryCount,
  }) {
    if (lastAttemptAt == null || retryCount <= 0) return true;
    final next = lastAttemptAt.add(delayFor(retryCount));
    return !now.isBefore(next);
  }
}

/// Événement de présence envoyé au serveur (contrat documenté).
class AttendanceSyncDto {
  const AttendanceSyncDto({
    required this.eventId,
    required this.studentUuid,
    required this.studentCode,
    required this.scannedAtUtc,
    required this.localDate,
    required this.attendanceStatus,
    required this.terminalId,
    required this.source,
    required this.session,
    this.classId,
    this.className,
    this.personType = 'student',
  });

  factory AttendanceSyncDto.fromQueuePayload(String payloadJson) {
    final map = jsonDecode(payloadJson) as Map<String, dynamic>;
    return AttendanceSyncDto(
      eventId: '${map['id']}',
      studentUuid: map['studentUuid'] as String?,
      studentCode: '${map['studentCode'] ?? ''}',
      scannedAtUtc: '${map['scannedAtUtc'] ?? ''}',
      localDate: '${map['localDate'] ?? ''}',
      attendanceStatus: '${map['attendanceStatus'] ?? 'present'}',
      terminalId: '${map['terminalId'] ?? ''}',
      source: '${map['source'] ?? 'qr'}',
      session: '${map['session'] ?? 'morning'}',
      classId: map['classId'] as String?,
      className: map['className'] as String?,
      personType: '${map['personType'] ?? 'student'}',
    );
  }

  final String eventId;
  final String? studentUuid;
  final String studentCode;
  final String scannedAtUtc;
  final String localDate;
  final String attendanceStatus;
  final String terminalId;
  final String source;
  final String session;
  final String? classId;
  final String? className;

  /// `student` ou `staff`.
  final String personType;

  /// Identifiant d'idempotence : le serveur doit ignorer un doublon.
  String get idempotencyKey => 'attendance:$eventId';

  Map<String, dynamic> toJson() => <String, dynamic>{
        'eventId': eventId,
        'studentUuid': studentUuid,
        'studentCode': studentCode,
        'scannedAtUtc': scannedAtUtc,
        'localDate': localDate,
        'attendanceStatus': attendanceStatus,
        'terminalId': terminalId,
        'source': source,
        'session': session,
        'classId': classId,
        'className': className,
        'personType': personType,
      };
}

/// Élève reçu du serveur (synchronisation descendante).
class StudentSyncDto {
  const StudentSyncDto({
    required this.studentCode,
    required this.qrToken,
    this.studentUuid,
    this.firstName = '',
    this.lastName = '',
    this.classId,
    this.className = '',
    this.photoRemoteUrl,
    this.isActive = true,
    this.badgeRevoked = false,
  });

  factory StudentSyncDto.fromJson(Map<String, dynamic> json) {
    return StudentSyncDto(
      studentCode: '${json['studentCode'] ?? json['student_code'] ?? ''}',
      qrToken: '${json['qrToken'] ?? json['qr_token'] ?? ''}',
      studentUuid: json['studentUuid'] as String?,
      firstName: '${json['firstName'] ?? json['first_name'] ?? ''}',
      lastName: '${json['lastName'] ?? json['last_name'] ?? ''}',
      classId: json['classId'] as String?,
      className: '${json['className'] ?? json['class_name'] ?? ''}',
      photoRemoteUrl: json['photoRemoteUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      badgeRevoked: json['badgeRevoked'] as bool? ?? false,
    );
  }

  final String studentCode;
  final String qrToken;
  final String? studentUuid;
  final String firstName;
  final String lastName;
  final String? classId;
  final String className;
  final String? photoRemoteUrl;
  final bool isActive;
  final bool badgeRevoked;
}

/// Membre du personnel reçu du serveur (synchronisation descendante).
class StaffSyncDto {
  const StaffSyncDto({
    required this.staffCode,
    required this.qrToken,
    this.staffUuid,
    this.firstName = '',
    this.lastName = '',
    this.staffType = 'teacher',
    this.roleLabel = 'Personnel',
    this.photoRemoteUrl,
    this.isActive = true,
    this.badgeRevoked = false,
  });

  factory StaffSyncDto.fromJson(Map<String, dynamic> json) {
    return StaffSyncDto(
      staffCode: '${json['staffCode'] ?? json['staff_code'] ?? ''}',
      qrToken: '${json['qrToken'] ?? json['qr_token'] ?? ''}',
      staffUuid: json['staffUuid'] as String?,
      firstName: '${json['firstName'] ?? json['first_name'] ?? ''}',
      lastName: '${json['lastName'] ?? json['last_name'] ?? ''}',
      staffType: '${json['staffType'] ?? 'teacher'}',
      roleLabel: '${json['roleLabel'] ?? 'Personnel'}',
      photoRemoteUrl: json['photoRemoteUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      badgeRevoked: json['badgeRevoked'] as bool? ?? false,
    );
  }

  final String staffCode;
  final String qrToken;
  final String? staffUuid;
  final String firstName;
  final String lastName;
  final String staffType;
  final String roleLabel;
  final String? photoRemoteUrl;
  final bool isActive;
  final bool badgeRevoked;
}

/// Classe reçue du serveur (référentiel léger pour les filtres locaux).
class ClassSyncDto {
  const ClassSyncDto({required this.id, required this.name});

  factory ClassSyncDto.fromJson(Map<String, dynamic> json) {
    return ClassSyncDto(
      id: '${json['id'] ?? ''}',
      name: '${json['name'] ?? ''}',
    );
  }

  final String id;
  final String name;
}

/// Configuration du scanner envoyée par AL-BAYAAN.
///
/// Les valeurs par défaut sont **restrictives** : si le serveur ne
/// fournit rien, aucune information supplémentaire n'est affichée.
class ScannerConfigDto {
  const ScannerConfigDto({
    this.showPhoto = true,
    this.showMatricule = true,
    this.showClassName = true,
    this.showSchoolName = true,
    this.showTime = true,
    this.attendanceStartTime,
    this.lateAfterTime,
    this.timezone,
    this.session,
    this.configVersion = 0,
    this.notifyParents = false,
  });

  factory ScannerConfigDto.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const ScannerConfigDto();
    bool flag(String key, bool fallback) =>
        json[key] is bool ? json[key] as bool : fallback;

    return ScannerConfigDto(
      showPhoto: flag('show_photo', true),
      showMatricule: flag('show_matricule', true),
      showClassName: flag('show_class_name', true),
      showSchoolName: flag('show_school_name', true),
      showTime: flag('show_time', true),
      attendanceStartTime: json['attendance_start_time'] as String?,
      lateAfterTime: json['late_after_time'] as String?,
      timezone: json['timezone'] as String?,
      session: json['session'] as String?,
      configVersion:
          json['config_version'] is int ? json['config_version'] as int : 0,
      notifyParents: flag('notify_parents', false),
    );
  }

  final bool showPhoto;
  final bool showMatricule;
  final bool showClassName;
  final bool showSchoolName;
  final bool showTime;
  final String? attendanceStartTime;
  final String? lateAfterTime;
  final String? timezone;
  final String? session;
  final int configVersion;
  final bool notifyParents;
}

