import 'package:flutter_tts/flutter_tts.dart';

import '../../features/attendance_scanner/domain/attendance_rules.dart';
import '../../features/attendance_scanner/domain/scan_outcome.dart';
import '../database/app_database.dart';

/// Retour vocal du scanner (synthèse vocale Android, 100 % hors ligne).
///
/// L'administrateur définit lui-même les phrases prononcées dans les
/// paramètres du terminal :
///   - « Présence enregistrée » (défaut) → scan accepté à l'heure ;
///   - « En retard » → scan accepté en retard ;
///   - « Déjà enregistré » → l'élève a déjà scanné aujourd'hui ;
///   - « Accès refusé » → badge inconnu/révoqué/élève inactif/QR invalide.
///
/// Le service est **silencieux** si le retour vocal est désactivé ou si le
/// moteur TTS de l'appareil est indisponible : il ne bloque jamais le scan.
class VoiceFeedback {
  VoiceFeedback({FlutterTts? tts}) : _tts = tts ?? FlutterTts();

  final FlutterTts _tts;

  bool _configured = false;
  bool _unavailable = false;

  Future<void> _ensureConfigured() async {
    if (_configured || _unavailable) return;
    try {
      await _tts.setLanguage('fr-FR');
      await _tts.setSpeechRate(0.52);
      await _tts.setVolume(1.0);
      await _tts.setPitch(1.0);
      _configured = true;
    } catch (_) {
      // Aucun moteur TTS installé : le terminal reste pleinement utilisable.
      _unavailable = true;
    }
  }

  /// Phrase à prononcer pour un résultat donné (null = silence).
  static String? phraseFor(ScanOutcome outcome, TerminalSettings settings) {
    if (!settings.voiceEnabled) return null;

    final isLate = outcome.status == AttendanceStatus.late;

    switch (outcome.type) {
      case ScanResultType.success:
        return isLate ? settings.voiceLate : settings.voiceSuccess;
      case ScanResultType.alreadyRegistered:
        return settings.voiceDuplicate;
      case ScanResultType.studentNotFound:
      case ScanResultType.inactiveStudent:
      case ScanResultType.badgeRevoked:
      case ScanResultType.invalidQr:
      case ScanResultType.databaseError:
      case ScanResultType.cameraError:
        return settings.voiceRefused;
    }
  }

  /// Prononce le message associé au résultat. N'échoue jamais.
  Future<void> announce(ScanOutcome outcome, TerminalSettings settings) async {
    final phrase = phraseFor(outcome, settings);
    if (phrase == null || phrase.trim().isEmpty) return;

    await _ensureConfigured();
    if (_unavailable) return;

    try {
      await _tts.stop();
      await _tts.speak(phrase.trim());
    } catch (_) {
      // Ignoré : le retour visuel reste la source d'information principale.
    }
  }

  /// Prononce un texte libre (bouton « Tester la voix »).
  Future<void> speakText(String text) async {
    if (text.trim().isEmpty) return;
    await _ensureConfigured();
    if (_unavailable) return;
    try {
      await _tts.stop();
      await _tts.speak(text.trim());
    } catch (_) {
      // Ignoré.
    }
  }

  Future<void> stop() async {
    try {
      await _tts.stop();
    } catch (_) {
      // Ignoré.
    }
  }
}
