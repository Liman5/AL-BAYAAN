import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:drift/drift.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

import '../database/app_database.dart';

/// Protection de l'espace administration par code PIN.
///
/// Le code n'est **jamais** stocké en clair : seul un sel aléatoire et une
/// empreinte SHA-256 **itérée** sont conservés dans la base SQLite locale
/// (fiable et persistante, contrairement au stockage sécurisé qui pouvait
/// perdre la valeur entre deux ouvertures sur certains appareils Android).
///
/// Un ancien code enregistré dans le Keystore par une version précédente est
/// migré automatiquement à la première vérification : l'administrateur n'a
/// donc pas besoin de le redéfinir.
class PinService {
  PinService(this._db, {FlutterSecureStorage? legacyStorage})
      : _legacyStorage = legacyStorage ?? const FlutterSecureStorage(),
        _uuid = const Uuid();

  /// Nombre d'itérations de hachage (ralentit une attaque par force brute).
  static const int iterations = 1200;

  static const String _legacyHashKey = 'admin_pin_hash';
  static const String _legacySaltKey = 'admin_pin_salt';

  final AppDatabase _db;
  final FlutterSecureStorage _legacyStorage;
  final Uuid _uuid;

  Future<TerminalSettings?> _settings() =>
      _db.select(_db.settings).getSingleOrNull();

  /// Un code existe-t-il déjà (base locale, ou ancien emplacement) ?
  Future<bool> isConfigured() async {
    final current = await _settings();
    if (current?.adminPinHash != null && current!.adminPinHash!.isNotEmpty) {
      return true;
    }
    return (await _legacyPin()) != null;
  }

  /// Enregistre (ou remplace) le code administrateur.
  Future<void> setPin(String pin) async {
    if (!isValidFormat(pin)) {
      throw const FormatException('Le PIN doit contenir 4 à 8 chiffres.');
    }

    final salt = _generateSalt();
    final hash = _digest(salt, pin, iterations);

    await _ensureSettingsRow();
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      SettingsCompanion(
        adminPinSalt: Value(salt),
        adminPinHash: Value(hash),
        adminPinIterations: const Value(iterations),
      ),
    );

    // L'ancien stockage n'a plus de raison d'être.
    await _clearLegacy();
  }

  /// Vérifie un code saisi.
  Future<bool> verify(String pin) async {
    final current = await _settings();

    if (current?.adminPinHash != null &&
        current!.adminPinHash!.isNotEmpty &&
        current.adminPinSalt != null) {
      final rounds =
          current.adminPinIterations > 0 ? current.adminPinIterations : iterations;
      final candidate = _digest(current.adminPinSalt!, pin, rounds);
      return _constantTimeEquals(candidate, current.adminPinHash!);
    }

    // Migration silencieuse d'un ancien code (Keystore).
    final legacy = await _legacyPin();
    if (legacy == null) return false;

    final candidate = _legacyDigest(legacy.salt, pin);
    if (!_constantTimeEquals(candidate, legacy.hash)) return false;

    // Code correct : on le réenregistre au nouveau format.
    await setPin(pin);
    return true;
  }

  Future<void> clear() async {
    await (_db.update(_db.settings)..where((t) => t.id.equals(1))).write(
      const SettingsCompanion(
        adminPinSalt: Value(null),
        adminPinHash: Value(null),
        adminPinIterations: Value(0),
      ),
    );
    await _clearLegacy();
  }

  static bool isValidFormat(String pin) => RegExp(r'^\d{4,8}$').hasMatch(pin);

  // ---------- interne ----------

  Future<void> _ensureSettingsRow() async {
    final current = await _settings();
    if (current != null) return;
    await _db.into(_db.settings).insert(
          SettingsCompanion.insert(terminalId: _uuid.v4()),
        );
  }

  Future<({String hash, String salt})?> _legacyPin() async {
    try {
      final hash = await _legacyStorage.read(key: _legacyHashKey);
      final salt = await _legacyStorage.read(key: _legacySaltKey);
      if (hash == null || hash.isEmpty || salt == null || salt.isEmpty) {
        return null;
      }
      return (hash: hash, salt: salt);
    } catch (_) {
      return null;
    }
  }

  Future<void> _clearLegacy() async {
    try {
      await _legacyStorage.delete(key: _legacyHashKey);
      await _legacyStorage.delete(key: _legacySaltKey);
    } catch (_) {
      // Ignoré : l'absence d'ancien code n'est pas une erreur.
    }
  }

  static String _digest(String salt, String pin, int rounds) {
    List<int> bytes = utf8.encode('$salt::$pin');
    final safeRounds = rounds < 1 ? iterations : rounds;
    for (var i = 0; i < safeRounds; i++) {
      bytes = sha256.convert(bytes).bytes;
    }
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }

  /// Ancien format (une seule passe SHA-256) — uniquement pour la migration.
  static String _legacyDigest(String salt, String pin) =>
      sha256.convert(utf8.encode('$salt::$pin')).toString();

  static String _generateSalt() {
    final random = Random.secure();
    final bytes = List<int>.generate(16, (_) => random.nextInt(256));
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }

  static bool _constantTimeEquals(String a, String b) {
    if (a.length != b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) {
      diff |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    }
    return diff == 0;
  }
}
