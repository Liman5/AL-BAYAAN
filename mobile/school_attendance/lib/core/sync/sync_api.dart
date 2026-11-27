import 'sync_models.dart';

/// Résultat d'un envoi unitaire.
class PushItemResult {
  const PushItemResult.ok({this.serverRecordId})
      : success = true,
        error = null,
        retryable = false;

  const PushItemResult.failure({required this.error, this.retryable = true})
      : success = false,
        serverRecordId = null;

  final bool success;
  final String? error;
  final String? serverRecordId;
  final bool retryable;
}

/// Contrat de synchronisation avec la plateforme scolaire.
///
/// ⚠️ Aucune URL ni aucun endpoint réel n'est fourni dans cette version :
/// la synchronisation est **désactivée** tant que l'établissement n'a pas
/// confirmé les points d'accès de sa plateforme.
/// Voir `docs/SYNC.md` pour le contrat attendu et l'implémentation à fournir.
abstract class SyncApi {
  bool get isConfigured;

  /// Envoie un lot de présences. L'API doit être idempotente
  /// (`AttendanceSyncDto.idempotencyKey`).
  Future<List<PushItemResult>> pushAttendance(List<AttendanceSyncDto> items);

  /// Récupère les changements élèves/classes depuis `cursor`.
  Future<PullResult> pullChanges({String? cursor});
}

class PullResult {
  const PullResult({
    this.students = const <StudentSyncDto>[],
    this.classes = const <ClassSyncDto>[],
    this.removedStudentCodes = const <String>[],
    this.config,
    this.schoolName,
    this.cursor,
    this.notModified = false,
  });

  final List<StudentSyncDto> students;
  final List<ClassSyncDto> classes;

  /// Matricules qui ne doivent plus être scannés (élève transféré/radié).
  final List<String> removedStudentCodes;

  /// Configuration scanner imposée par la plateforme (prime sur le local).
  final ScannerConfigDto? config;

  final String? schoolName;
  final String? cursor;
  final bool notModified;
}

/// Implémentation par défaut : ne contacte jamais le réseau.
class UnconfiguredSyncApi implements SyncApi {
  const UnconfiguredSyncApi();

  @override
  bool get isConfigured => false;

  @override
  Future<List<PushItemResult>> pushAttendance(
    List<AttendanceSyncDto> items,
  ) async {
    return items
        .map(
          (_) => const PushItemResult.failure(
            error: 'Synchronisation non configurée.',
            retryable: false,
          ),
        )
        .toList();
  }

  @override
  Future<PullResult> pullChanges({String? cursor}) async {
    return const PullResult(notModified: true);
  }
}
