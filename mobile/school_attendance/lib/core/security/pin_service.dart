import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Protection de l'espace administration par code PIN.
///
/// Le PIN n'est jamais stocké en clair : seul un condensé SHA-256 salé est
/// conservé dans le stockage sécurisé Android (Keystore).
class PinService {
  PinService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _hashKey = 'admin_pin_hash';
  static const String _saltKey = 'admin_pin_salt';

  final FlutterSecureStorage _storage;

  Future<bool> isConfigured() async {
    final hash = await _storage.read(key: _hashKey);
    return hash != null && hash.isNotEmpty;
  }

  Future<void> setPin(String pin) async {
    if (!isValidFormat(pin)) {
      throw const FormatException('Le PIN doit contenir 4 à 8 chiffres.');
    }
    final salt = _generateSalt();
    final hash = _digest(salt, pin);
    await _storage.write(key: _saltKey, value: salt);
    await _storage.write(key: _hashKey, value: hash);
  }

  Future<bool> verify(String pin) async {
    final salt = await _storage.read(key: _saltKey);
    final hash = await _storage.read(key: _hashKey);
    if (salt == null || hash == null) return false;
    final candidate = _digest(salt, pin);
    return _constantTimeEquals(candidate, hash);
  }

  Future<void> clear() async {
    await _storage.delete(key: _hashKey);
    await _storage.delete(key: _saltKey);
  }

  static bool isValidFormat(String pin) =>
      RegExp(r'^\d{4,8}$').hasMatch(pin);

  static String _digest(String salt, String pin) {
    return sha256.convert(utf8.encode('$salt::$pin')).toString();
  }

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
