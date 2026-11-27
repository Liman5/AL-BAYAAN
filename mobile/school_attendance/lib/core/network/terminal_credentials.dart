import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Identifiants d'appairage d'un terminal avec AL-BAYAAN.
///
/// Le **token d'appareil** est un secret : il est conservé dans le
/// stockage sécurisé Android (Keystore), jamais dans SQLite, jamais
/// dans les journaux, jamais dans un fichier d'export.
class TerminalCredentials {
  const TerminalCredentials({
    required this.baseUrl,
    required this.terminalId,
    required this.token,
    this.schoolId,
    this.schoolName,
    this.terminalName,
  });

  final String baseUrl;
  final String terminalId;
  final String token;
  final String? schoolId;
  final String? schoolName;
  final String? terminalName;

  bool get isComplete =>
      baseUrl.trim().isNotEmpty && terminalId.isNotEmpty && token.isNotEmpty;

  TerminalCredentials copyWith({
    String? baseUrl,
    String? terminalId,
    String? token,
    String? schoolId,
    String? schoolName,
    String? terminalName,
  }) {
    return TerminalCredentials(
      baseUrl: baseUrl ?? this.baseUrl,
      terminalId: terminalId ?? this.terminalId,
      token: token ?? this.token,
      schoolId: schoolId ?? this.schoolId,
      schoolName: schoolName ?? this.schoolName,
      terminalName: terminalName ?? this.terminalName,
    );
  }
}

/// Persistance des identifiants dans le stockage sécurisé Android.
class TerminalCredentialsStore {
  TerminalCredentialsStore({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  static const String _keyBaseUrl = 'albayan_terminal_base_url';
  static const String _keyTerminalId = 'albayan_terminal_id';
  static const String _keyToken = 'albayan_terminal_token';
  static const String _keySchoolId = 'albayan_terminal_school_id';
  static const String _keySchoolName = 'albayan_terminal_school_name';
  static const String _keyTerminalName = 'albayan_terminal_name';

  final FlutterSecureStorage _storage;

  /// Lit les identifiants ; renvoie `null` si le terminal n'est pas appairé.
  Future<TerminalCredentials?> read() async {
    try {
      final baseUrl = await _storage.read(key: _keyBaseUrl);
      final terminalId = await _storage.read(key: _keyTerminalId);
      final token = await _storage.read(key: _keyToken);

      if (baseUrl == null || terminalId == null || token == null) return null;
      if (baseUrl.isEmpty || terminalId.isEmpty || token.isEmpty) return null;

      return TerminalCredentials(
        baseUrl: baseUrl,
        terminalId: terminalId,
        token: token,
        schoolId: await _storage.read(key: _keySchoolId),
        schoolName: await _storage.read(key: _keySchoolName),
        terminalName: await _storage.read(key: _keyTerminalName),
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> save(TerminalCredentials credentials) async {
    await _storage.write(key: _keyBaseUrl, value: credentials.baseUrl);
    await _storage.write(key: _keyTerminalId, value: credentials.terminalId);
    await _storage.write(key: _keyToken, value: credentials.token);
    if (credentials.schoolId != null) {
      await _storage.write(key: _keySchoolId, value: credentials.schoolId);
    }
    if (credentials.schoolName != null) {
      await _storage.write(key: _keySchoolName, value: credentials.schoolName);
    }
    if (credentials.terminalName != null) {
      await _storage.write(key: _keyTerminalName, value: credentials.terminalName);
    }
  }

  /// Supprime l'appairage (révocation côté serveur ou changement d'école).
  Future<void> clear() async {
    await _storage.delete(key: _keyBaseUrl);
    await _storage.delete(key: _keyTerminalId);
    await _storage.delete(key: _keyToken);
    await _storage.delete(key: _keySchoolId);
    await _storage.delete(key: _keySchoolName);
    await _storage.delete(key: _keyTerminalName);
  }

  /// Normalise une URL de serveur saisie par l'administrateur.
  static String normalizeBaseUrl(String input) {
    var value = input.trim();
    if (value.isEmpty) return '';
    if (!value.toLowerCase().startsWith('http')) {
      value = 'https://$value';
    }
    while (value.endsWith('/')) {
      value = value.substring(0, value.length - 1);
    }
    return value;
  }
}
