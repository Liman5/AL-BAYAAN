import '../../../core/database/app_database.dart';
import '../../../core/utils/app_time.dart';

/// Statut de présence calculé localement.
enum AttendanceStatus {
  present('present'),
  late('late');

  const AttendanceStatus(this.value);

  final String value;

  static AttendanceStatus fromValue(String value) {
    return value == late.value ? late : present;
  }
}

/// Règles de présence — entièrement configurables, jamais codées en dur.
class AttendanceRules {
  const AttendanceRules({required this.lateAfterMinutes});

  /// Construit les règles à partir des paramètres du terminal.
  factory AttendanceRules.fromSettings(TerminalSettings settings) {
    final minutes = AppTime.parseHhMm(settings.lateAfterTime) ?? 7 * 60 + 30;
    return AttendanceRules(lateAfterMinutes: minutes);
  }

  /// Heure limite en minutes depuis minuit (ex. 07:30 → 450).
  final int lateAfterMinutes;

  /// Avant l'heure limite : présent. À partir de l'heure limite : en retard.
  AttendanceStatus statusFor(DateTime localNow) {
    final minutes = AppTime.minutesOfDay(localNow);
    return minutes >= lateAfterMinutes
        ? AttendanceStatus.late
        : AttendanceStatus.present;
  }
}
