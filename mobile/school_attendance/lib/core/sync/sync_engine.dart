import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

import '../../features/sync/data/sync_repository.dart';
import '../../features/terminal_settings/data/settings_repository.dart';
import 'sync_models.dart';
import 'sync_service.dart';

/// Moteur de synchronisation **automatique**.
///
/// Sans lui, la synchronisation n'était déclenchée que manuellement : les
/// présences restaient dans la file locale alors que le terminal était
/// connecté. Ce moteur ajoute trois déclencheurs, sans jamais bloquer le scan :
///
///  1. **au démarrage** de l'application ;
///  2. **au retour du réseau** (`connectivity_plus`) ;
///  3. **périodiquement** : envoi toutes les 45 s s'il reste des présences en
///     attente, et récupération complète (élèves/config) toutes les 10 min.
///
/// Garanties :
///  - une seule exécution à la fois (`_running`) ;
///  - espacement minimal entre deux tentatives automatiques ;
///  - aucun envoi si le terminal n'est pas appairé ou si le mode
///    « hors ligne volontaire » est activé ;
///  - toute erreur est persistée (`settings.lastSyncError`) et visible
///    dans l'écran de connexion.
class SyncEngine {
  SyncEngine({
    required SyncService service,
    required SettingsRepository settings,
    required SyncRepository queue,
  })  : _service = service,
        _settings = settings,
        _queue = queue;

  /// Fréquence d'envoi lorsqu'il reste des présences en attente.
  static const Duration pushInterval = Duration(seconds: 45);

  /// Fréquence de la récupération complète (élèves, classes, configuration).
  static const Duration fullPullInterval = Duration(minutes: 10);

  /// Espacement minimal entre deux tentatives automatiques.
  static const Duration minGap = Duration(seconds: 20);

  final SyncService _service;
  final SettingsRepository _settings;
  final SyncRepository _queue;

  Timer? _timer;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  bool _running = false;
  DateTime? _lastRunAt;
  DateTime? _lastFullPullAt;

  /// Dernier résultat connu (affiché par l'écran de connexion).
  SyncResult? lastResult;

  bool get isRunning => _running;

  /// Démarre les déclencheurs. Idempotent : un second appel est sans effet.
  void start() {
    _timer ??= Timer.periodic(pushInterval, (_) => unawaited(tick()));

    _connectivitySub ??= Connectivity().onConnectivityChanged.listen((results) {
      final online = results.any((result) => result != ConnectivityResult.none);
      if (online) {
        // Retour du réseau : on n'attend pas le prochain cycle.
        unawaited(tick(force: true));
      }
    });

    unawaited(tick(force: true));
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _connectivitySub?.cancel();
    _connectivitySub = null;
  }

  /// Exécute un cycle si les conditions sont réunies.
  Future<void> tick({bool force = false}) async {
    if (_running) return;

    try {
      final settings = await _settings.current();

      // Terminal non appairé ou hors ligne volontaire : rien à faire.
      if (!settings.apiEnabled || settings.offlineMode) return;

      final now = DateTime.now();
      final pending = await _queue.pendingCount();
      final fullPullDue =
          _lastFullPullAt == null || now.difference(_lastFullPullAt!) >= fullPullInterval;

      // Rien à envoyer et pas de rafraîchissement dû → on économise la batterie.
      if (!force && pending == 0 && !fullPullDue) return;

      if (!force &&
          _lastRunAt != null &&
          now.difference(_lastRunAt!) < minGap) {
        return;
      }

      _running = true;
      _lastRunAt = now;

      final result = await _service.run();
      lastResult = result;

      if (fullPullDue) {
        _lastFullPullAt = now;
      }
    } catch (_) {
      // `SyncService` journalise déjà ; le moteur ne doit jamais lever.
    } finally {
      _running = false;
    }
  }

  /// Synchronisation déclenchée par l'utilisateur (bouton explicite).
  Future<SyncResult> syncNow() async {
    lastResult = await _service.run();
    _lastRunAt = DateTime.now();
    _lastFullPullAt = _lastRunAt;
    return lastResult!;
  }
}
