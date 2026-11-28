import 'package:dio/dio.dart';

import '../network/terminal_credentials.dart';
import 'api_client.dart';
import 'sync_api.dart';
import 'sync_models.dart';

/// Erreur lisible remontée à l'opérateur / à l'écran de synchronisation.
class SyncApiException implements Exception {
  SyncApiException(this.message, {this.statusCode, this.unauthorized = false});

  final String message;
  final int? statusCode;
  final bool unauthorized;

  @override
  String toString() => message;
}

/// Implémentation réelle du contrat de synchronisation, branchée sur
/// les routes serveur d'AL-BAYAAN :
///
///   GET  /api/terminal/bootstrap   → élèves, classes, configuration
///   POST /api/terminal/attendance  → envoi idempotent des présences
///
/// ⚠️ Le terminal ne peut atteindre que ces routes : aucune route
///    d'administration n'est appelée, et aucun secret de la plateforme
///    n'est présent dans l'application.
class RemoteSyncApi implements SyncApi {
  RemoteSyncApi({
    required TerminalCredentials credentials,
    Dio? dio,
    this.appVersion,
    this.onPendingChanged,
  }) : _credentials = credentials {
    _client = ApiClient(
      baseUrl: TerminalCredentialsStore.normalizeBaseUrl(credentials.baseUrl),
      bearerToken: credentials.token,
      dio: dio,
    );
  }

  final TerminalCredentials _credentials;
  final String? appVersion;

  /// Remonte le nombre d'événements restant en attente après un envoi.
  final void Function(int pending)? onPendingChanged;

  late final ApiClient _client;

  @override
  bool get isConfigured => _credentials.isComplete && _client.isConfigured;

  String get terminalId => _credentials.terminalId;

  /// Envoie un lot de présences. Le serveur répond **par événement** :
  /// `accepted`, `duplicate` ou `rejected`.
  @override
  Future<List<PushItemResult>> pushAttendance(List<AttendanceSyncDto> items) async {
    if (items.isEmpty) return const <PushItemResult>[];

    try {
      final response = await _client.postJson('/api/terminal/attendance', {
        'events': items.map((item) => item.toJson()).toList(),
        'appVersion': appVersion,
      });

      final data = response.data;
      final map = data is Map ? data : const {};
      final payload = map['data'];
      final results = (payload is Map ? payload['results'] : null) as List?;

      if (results == null) {
        return items
            .map(
              (_) => const PushItemResult.failure(
                error: 'Réponse serveur inattendue.',
              ),
            )
            .toList();
      }

      final byId = <String, Map>{
        for (final row in results.whereType<Map>())
          '${row['eventId'] ?? ''}': row,
      };

      return items.map((item) {
        final row = byId[item.eventId];
        if (row == null) {
          return const PushItemResult.failure(
            error: 'Événement non traité par le serveur.',
          );
        }
        final status = '${row['status'] ?? ''}';
        if (status == 'accepted' || status == 'duplicate') {
          return PushItemResult.ok(
            serverRecordId: row['serverRecordId'] as String?,
          );
        }
        final reason = row['reason'];
        return PushItemResult.failure(
          error: reason is String && reason.isNotEmpty
              ? reason
              : 'Événement rejeté par le serveur.',
          retryable: false,
        );
      }).toList();
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      final message = _readServerMessage(error.response?.data) ??
          'Synchronisation impossible (${status ?? 'réseau'}).';
      final notRetryable = status == 401 || status == 403;
      return items
          .map(
            (_) => PushItemResult.failure(
              error: message,
              retryable: !notRetryable,
            ),
          )
          .toList();
    } catch (error) {
      return items
          .map(
            (_) => PushItemResult.failure(
              error: 'Synchronisation impossible : $error',
            ),
          )
          .toList();
    }
  }

  /// Récupère les changements depuis `cursor` (synchronisation descendante).
  @override
  Future<PullResult> pullChanges({String? cursor}) async {
    try {
      final response = await _client.getJson(
        '/api/terminal/bootstrap',
        query: cursor != null && cursor.isNotEmpty ? {'since': cursor} : null,
      );

      final body = response.data;
      final map = body is Map ? body : const {};
      final data = map['data'];
      final payload = data is Map ? data : const {};

      final students = (payload['students'] as List? ?? const [])
          .whereType<Map>()
          .map((row) => StudentSyncDto.fromJson(Map<String, dynamic>.from(row)))
          .toList();

      final classes = (payload['classes'] as List? ?? const [])
          .whereType<Map>()
          .map((row) => ClassSyncDto.fromJson(Map<String, dynamic>.from(row)))
          .toList();

      final removed = (payload['removedStudentCodes'] as List? ?? const [])
          .whereType<String>()
          .toList();

      final staff = (payload['staff'] as List? ?? const [])
          .whereType<Map>()
          .map((row) => StaffSyncDto.fromJson(Map<String, dynamic>.from(row)))
          .toList();

      final removedStaff =
          (payload['removedStaffCodes'] as List? ?? const [])
              .whereType<String>()
              .toList();

      final rawConfig = payload['settings'];
      final config = rawConfig is Map
          ? ScannerConfigDto.fromJson(Map<String, dynamic>.from(rawConfig))
          : null;

      final school = payload['school'];
      final schoolName = school is Map ? school['name'] as String? : null;

      return PullResult(
        students: students,
        staff: staff,
        classes: classes,
        removedStudentCodes: removed,
        removedStaffCodes: removedStaff,
        config: config,
        schoolName: schoolName,
        cursor: payload['cursor'] as String? ?? cursor,
        notModified:
            students.isEmpty &&
            classes.isEmpty &&
            staff.isEmpty &&
            removed.isEmpty &&
            removedStaff.isEmpty,
      );
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      throw SyncApiException(
        _readServerMessage(error.response?.data) ??
            'Téléchargement impossible (${status ?? 'réseau'}).',
        statusCode: status,
        unauthorized: status == 401 || status == 403,
      );
    } catch (error) {
      throw SyncApiException('Téléchargement impossible : $error');
    }
  }

  /// Signal de vie (facultatif) : ne bloque jamais le scanner.
  Future<bool> heartbeat({required int pendingEvents}) async {
    try {
      await _client.postJson('/api/terminal/heartbeat', {
        'pendingEvents': pendingEvents < 0 ? 0 : pendingEvents,
        'appVersion': appVersion,
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  String? _readServerMessage(dynamic data) {
    if (data is Map) {
      final message = data['message'];
      if (message is String && message.isNotEmpty) return message;
    }
    return null;
  }
}

