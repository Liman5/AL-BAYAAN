import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';

/// Abstraction de l'horloge : facilite les tests déterministes
/// (statut présent / en retard, détection de doublons, etc.).
abstract class Clock {
  DateTime now();
}

class SystemClock implements Clock {
  const SystemClock();

  @override
  DateTime now() => DateTime.now();
}

/// Utilitaires de date/heure — aucune dépendance réseau.
class AppTime {
  const AppTime._();

  static bool _localeReady = false;

  /// Charge les noms de jours/mois français (une seule fois).
  /// À appeler au démarrage de l'application (et dans les tests).
  static Future<void> ensureLocale() async {
    if (_localeReady) return;
    await initializeDateFormatting('fr_FR');
    _localeReady = true;
  }

  static final DateFormat _dateKeyFormat = DateFormat('yyyy-MM-dd');
  static final DateFormat _timeFormat = DateFormat('HH:mm');
  static final DateFormat _timeSecondsFormat = DateFormat('HH:mm:ss');
  static final DateFormat _longDateFormat =
      DateFormat('EEEE d MMMM yyyy', 'fr_FR');
  static final DateFormat _shortDateTimeFormat = DateFormat('dd/MM/yyyy HH:mm');

  /// Clé de journée locale `yyyy-MM-dd` utilisée pour regrouper les scans.
  static String dateKey(DateTime dateTime) => _dateKeyFormat.format(dateTime);

  /// Nombre de minutes écoulées depuis minuit (heure locale).
  static int minutesOfDay(DateTime dateTime) =>
      dateTime.hour * 60 + dateTime.minute;

  /// Convertit `HH:mm` en minutes depuis minuit. Retourne `null` si invalide.
  static int? parseHhMm(String? value) {
    if (value == null) return null;
    final match = RegExp(r'^(\d{1,2}):(\d{2})$').firstMatch(value.trim());
    if (match == null) return null;
    final hours = int.tryParse(match.group(1)!);
    final minutes = int.tryParse(match.group(2)!);
    if (hours == null || minutes == null) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  /// Formate des minutes depuis minuit en `HH:mm`.
  static String formatMinutes(int minutes) {
    final normalized = minutes.clamp(0, 24 * 60).toInt();
    final hours = (normalized ~/ 60).toString().padLeft(2, '0');
    final mins = (normalized % 60).toString().padLeft(2, '0');
    return '$hours:$mins';
  }

  static String time(DateTime dateTime) => _timeFormat.format(dateTime);

  static String timeWithSeconds(DateTime dateTime) =>
      _timeSecondsFormat.format(dateTime);

  static String longDate(DateTime dateTime) => _longDateFormat.format(dateTime);

  static String shortDateTime(DateTime dateTime) =>
      _shortDateTimeFormat.format(dateTime);

  /// Horodatage UTC au format ISO-8601 (échanges futurs avec le serveur).
  static String isoUtc(DateTime dateTime) =>
      dateTime.toUtc().toIso8601String();

  /// Début et fin de journée locale, utiles aux filtres d'historique.
  static DateTime startOfDay(DateTime dateTime) =>
      DateTime(dateTime.year, dateTime.month, dateTime.day);

  static DateTime endOfDay(DateTime dateTime) =>
      DateTime(dateTime.year, dateTime.month, dateTime.day, 23, 59, 59, 999);

  /// Vérifie que l'appareil a une date plausible (protection contre une
  /// horloge système mal réglée, qui fausserait les présences).
  static bool isPlausibleDeviceDate(DateTime dateTime) {
    return dateTime.year >= 2020 && dateTime.year <= 2100;
  }
}
