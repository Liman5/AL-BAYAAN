import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../../core/database/app_database.dart';
import '../../../core/sync/sync_models.dart';

/// Paramètres du terminal (ligne unique).
class SettingsRepository {
  SettingsRepository(this._db, {Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  final AppDatabase _db;
  final Uuid _uuid;

  /// Crée la ligne de paramètres par défaut si elle n'existe pas encore.
  /// Le `terminalId` est généré une seule fois et reste stable.
  Future<TerminalSettings> ensureSettings() async {
    final existing = await _db.select(_db.settings).getSingleOrNull();
    if (existing != null) return existing;

    await _db.into(_db.settings).insert(
          SettingsCompanion.insert(terminalId: _uuid.v4()),
        );
    return _db.select(_db.settings).getSingle();
  }

  Stream<TerminalSettings> watchSettings() {
    return _db.select(_db.settings).watchSingle();
  }

  Future<TerminalSettings> current() async {
    final existing = await _db.select(_db.settings).getSingleOrNull();
    if (existing != null) return existing;
    return ensureSettings();
  }

  Future<void> save(TerminalSettings settings) async {
    await _db.update(_db.settings).replace(settings);
  }

  /// Enregistre l'objectif de caméra choisi (`front` / `back`).
  /// Écriture isolée : ne touche ni aux présences ni à la file de synchro.
  Future<void> setCameraFacing(String value) async {
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      SettingsCompanion(cameraFacing: Value(value)),
    );
  }

  /// Applique la configuration imposée par la plateforme.
  ///
  /// Les valeurs locales ne sont écrasées que si le serveur en fournit
  /// une : un champ absent du serveur ne détruit jamais un réglage local.
  Future<void> applyServerConfig(
    ScannerConfigDto config, {
    String? schoolName,
  }) async {
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      SettingsCompanion(
        attendanceStartTime: config.attendanceStartTime != null
            ? Value(config.attendanceStartTime!)
            : const Value<String>.absent(),
        lateAfterTime: config.lateAfterTime != null
            ? Value(config.lateAfterTime!)
            : const Value<String>.absent(),
        timezone: config.timezone != null
            ? Value(config.timezone!)
            : const Value<String>.absent(),
        schoolName: schoolName != null && schoolName.isNotEmpty
            ? Value(schoolName)
            : const Value<String>.absent(),
        showPhoto: Value(config.showPhoto),
        showMatricule: Value(config.showMatricule),
        showClassName: Value(config.showClassName),
        showTime: Value(config.showTime),
      ),
    );
  }

  Future<void> markStudentSync(DateTime? at) async {
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      SettingsCompanion(lastStudentSync: Value(at)),
    );
  }

  Future<void> markAttendanceSync(DateTime? at) async {
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      SettingsCompanion(lastAttendanceSync: Value(at)),
    );
  }

  /// Trace la dernière tentative de synchronisation (diagnostic terrain).
  /// `error == null` signifie « tentative réussie ».
  Future<void> markSyncAttempt({String? error}) async {
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      SettingsCompanion(
        lastSyncAttempt: Value(DateTime.now().toUtc()),
        lastSyncError: Value(error),
      ),
    );
  }

  /// Active/désactive la synchronisation automatique après appairage.
  Future<void> setSyncEnabled(bool enabled) async {
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      SettingsCompanion(
        apiEnabled: Value(enabled),
        offlineMode: Value(!enabled),
      ),
    );
  }
}
