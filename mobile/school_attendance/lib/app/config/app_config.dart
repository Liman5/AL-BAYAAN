/// Configuration statique de l'application.
///
/// Aucun secret, aucune URL de backend réelle n'est stockée ici.
/// Les paramètres modifiables par l'administrateur vivent dans SQLite
/// (table `settings_table`) et sont édités depuis l'espace administration.
class AppConfig {
  const AppConfig._();

  /// Nom technique de l'application (affiché dans l'espace admin).
  static const String appName = 'School Attendance';

  /// Version affichée dans l'écran « À propos ».
  /// À incrémenter à chaque publication (pilote aussi la mise à jour OTA).
  static const String appVersion = '1.1.0';

  /// Identifiant d'application Android (doit rester identique au build.gradle).
  static const String androidApplicationId = 'com.albayaan.schoolattendance';

  /// Session de présence par défaut de la première version.
  /// Prévu pour évoluer vers plusieurs sessions (matin / après-midi).
  static const String defaultSession = 'morning';

  /// Fuseau horaire par défaut de l'établissement (Togo).
  static const String defaultTimezone = 'Africa/Lome';

  /// Durée de feedback par défaut après une validation (millisecondes).
  static const int defaultAutoResetMillis = 2200;
  static const int minAutoResetMillis = 1500;
  static const int maxAutoResetMillis = 5000;

  /// Nombre maximal de QR mis en file d'attente pendant un feedback.
  /// Évite de perdre un élève qui scanne pendant l'affichage précédent.
  static const int scanQueueLimit = 8;

  /// Anti-rebond sur un même badge (évite le double enregistrement
  /// provoqué par les détections multiples du scanner).
  static const Duration sameTokenCooldown = Duration(seconds: 3);

  /// Durée de conservation des journaux techniques par défaut (jours).
  static const int defaultRetentionDays = 365;

  /// Limite de sécurité pour l'import d'élèves (une seule transaction).
  static const int maxImportRows = 20000;

  /// Dossier local (dans les documents de l'application) des photos élèves.
  static const String studentPhotosFolder = 'student_photos';

  /// Dossier local des exports CSV.
  static const String exportFolder = 'exports';
}
