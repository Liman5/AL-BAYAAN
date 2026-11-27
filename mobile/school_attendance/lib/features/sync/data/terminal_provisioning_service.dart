import 'package:dio/dio.dart';

import '../../../core/network/terminal_credentials.dart';
import '../../../core/sync/api_client.dart';

/// Résultat d'une tentative d'appairage.
class PairingResult {
  const PairingResult.success(this.credentials, {this.message}) : ok = true;

  const PairingResult.failure(this.message) : ok = false, credentials = null;

  final bool ok;
  final String? message;
  final TerminalCredentials? credentials;
}

/// Appairage du terminal auprès d'AL-BAYAAN.
///
/// Le code d'appairage (usage unique, 15 minutes) est saisi par
/// l'administrateur depuis AL-BAYAAN → « Terminaux scanners ».
/// En échange, le serveur délivre un token d'appareil, stocké
/// immédiatement dans le Keystore Android.
class TerminalProvisioningService {
  TerminalProvisioningService({
    TerminalCredentialsStore? store,
    Dio? dio,
    this.appVersion,
  })  : _store = store ?? TerminalCredentialsStore(),
        _dio = dio;

  final TerminalCredentialsStore _store;
  final Dio? _dio;
  final String? appVersion;

  Future<PairingResult> pair({
    required String baseUrl,
    required String pairingCode,
    String? deviceModel,
  }) async {
    final normalized = TerminalCredentialsStore.normalizeBaseUrl(baseUrl);
    if (normalized.isEmpty) {
      return const PairingResult.failure('Adresse du serveur manquante.');
    }

    final code = pairingCode.replaceAll(RegExp(r'[\s-]'), '').toUpperCase();
    if (code.length < 6) {
      return const PairingResult.failure('Code d’appairage invalide.');
    }

    final client = ApiClient(baseUrl: normalized, dio: _dio);

    try {
      final response = await client.postJson('/api/terminal/pair', {
        'pairingCode': code,
        'deviceModel': deviceModel,
        'appVersion': appVersion,
      });

      final body = response.data;
      final map = body is Map ? body : const {};
      final payload = map['data'];
      if (payload is! Map) {
        return const PairingResult.failure(
          'Réponse du serveur inattendue. Vérifiez l’adresse.',
        );
      }

      final token = payload['token'];
      final terminalId = payload['terminalId'];
      if (token is! String || terminalId is! String) {
        return const PairingResult.failure(
          'Réponse du serveur incomplète : aucun identifiant reçu.',
        );
      }

      final credentials = TerminalCredentials(
        baseUrl: normalized,
        terminalId: terminalId,
        token: token,
        schoolId: payload['schoolId'] as String?,
        schoolName: payload['schoolName'] as String?,
        terminalName: payload['terminalName'] as String?,
      );

      await _store.save(credentials);
      return PairingResult.success(credentials, message: 'Terminal appairé.');
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      final data = error.response?.data;
      final serverMessage = data is Map ? data['message'] : null;
      final message = serverMessage is String && serverMessage.isNotEmpty
          ? serverMessage
          : status == null
              ? 'Serveur injoignable. Vérifiez la connexion et l’adresse.'
              : 'Appairage refusé (code $status).';
      return PairingResult.failure(message);
    } catch (error) {
      return PairingResult.failure('Appairage impossible : $error');
    }
  }

  Future<TerminalCredentials?> readCredentials() => _store.read();

  Future<void> signOut() => _store.clear();
}
