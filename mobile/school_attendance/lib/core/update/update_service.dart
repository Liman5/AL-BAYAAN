import 'package:dio/dio.dart';

import '../network/terminal_credentials.dart';
import '../sync/api_client.dart';

/// Informations de mise à jour publiées par la plateforme.
class UpdateInfo {
  const UpdateInfo({
    required this.version,
    required this.apkUrl,
    this.notes = '',
  });

  final String version;
  final String apkUrl;
  final String notes;
}

/// Vérification des mises à jour de l'application (« OTA »).
///
/// L'application interroge `GET /api/terminal/app-version`. Si une version
/// plus récente est publiée **et** qu'une URL d'APK est configurée, un
/// bandeau propose le téléchargement. Sinon, rien n'est affiché : aucune
/// mise à jour n'est inventée.
///
/// Une mise à jour conserve les données locales (SQLite n'est jamais
/// effacée par une réinstallation par-dessus).
class UpdateService {
  UpdateService({Dio? dio}) : _dio = dio;

  final Dio? _dio;

  Future<UpdateInfo?> check({
    required String baseUrl,
    required String currentVersion,
  }) async {
    final normalized = TerminalCredentialsStore.normalizeBaseUrl(baseUrl);
    if (normalized.isEmpty) return null;

    try {
      final client = ApiClient(baseUrl: normalized, dio: _dio);
      final response = await client.getJson('/api/terminal/app-version');

      final body = response.data;
      final map = body is Map ? body : const {};
      final payload = map['data'];
      if (payload is! Map) return null;

      final version = '${payload['version'] ?? ''}'.trim();
      final apkUrl = '${payload['apkUrl'] ?? ''}'.trim();
      if (version.isEmpty || apkUrl.isEmpty) return null;

      if (compareVersions(version, currentVersion) <= 0) return null;

      return UpdateInfo(
        version: version,
        apkUrl: apkUrl,
        notes: '${payload['notes'] ?? ''}'.trim(),
      );
    } catch (_) {
      // Serveur injoignable ou réponse inattendue : on ne bloque rien.
      return null;
    }
  }

  /// Comparaison de versions simples `x.y.z` (retourne >0 si [a] > [b]).
  static int compareVersions(String a, String b) {
    List<int> parse(String value) {
      final cleaned = value.split('+').first.trim();
      return cleaned
          .split('.')
          .map((part) => int.tryParse(part.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0)
          .toList();
    }

    final left = parse(a);
    final right = parse(b);
    final length = left.length > right.length ? left.length : right.length;

    for (var i = 0; i < length; i++) {
      final l = i < left.length ? left[i] : 0;
      final r = i < right.length ? right[i] : 0;
      if (l != r) return l.compareTo(r);
    }
    return 0;
  }
}
