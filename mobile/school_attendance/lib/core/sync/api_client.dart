import 'package:dio/dio.dart';

/// Client HTTP minimal, réservé à la future synchronisation.
///
/// Il n'est instancié que lorsqu'une URL de base est explicitement fournie
/// par l'administrateur. Aucun secret n'est codé en dur : un éventuel jeton
/// est fourni à l'exécution.
class ApiClient {
  ApiClient({
    required String baseUrl,
    String? bearerToken,
    Dio? dio,
  })  : baseUrl = baseUrl.trim(),
        _dio = dio ??
            Dio(
              BaseOptions(
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 25),
                sendTimeout: const Duration(seconds: 25),
                headers: <String, dynamic>{
                  'Accept': 'application/json',
                  if (bearerToken != null && bearerToken.isNotEmpty)
                    'Authorization': 'Bearer $bearerToken',
                },
              ),
            ) {
    if (this.baseUrl.isNotEmpty) {
      _dio.options.baseUrl = this.baseUrl;
    }
  }

  final String baseUrl;
  final Dio _dio;

  bool get isConfigured => baseUrl.isNotEmpty;

  Dio get dio => _dio;

  /// Exemple d'appel — le chemin réel sera fourni par la plateforme.
  Future<Response<dynamic>> postJson(
    String path,
    Map<String, dynamic> body,
  ) {
    return _dio.post<dynamic>(path, data: body);
  }

  Future<Response<dynamic>> getJson(
    String path, {
    Map<String, dynamic>? query,
  }) {
    return _dio.get<dynamic>(path, queryParameters: query);
  }
}
