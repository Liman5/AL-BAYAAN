import 'package:drift/drift.dart';

import '../../features/students/data/student_repository.dart';
import '../../features/sync/data/log_repository.dart';
import '../../features/sync/data/sync_repository.dart';
import '../../features/terminal_settings/data/settings_repository.dart';
import '../database/app_database.dart';
import '../utils/app_time.dart';
import 'sync_api.dart';
import 'sync_models.dart';

/// Orchestrateur de synchronisation.
///
/// Comportement garanti :
///  - ne s'exécute que si l'admin a activé l'API **et** fourni une URL ;
///  - ne supprime jamais une présence locale ;
///  - marque chaque événement (`syncing` → `synced` / `failed`) ;
///  - respecte un backoff exponentiel entre deux tentatives ;
///  - ne bloque jamais le scanner (appelée hors du chemin de validation).
class SyncService {
  SyncService({
    required SyncApi api,
    required SyncRepository syncRepository,
    required SettingsRepository settingsRepository,
    required StudentRepository studentRepository,
    required LogRepository logs,
    Clock clock = const SystemClock(),
  })  : _api = api,
        _sync = syncRepository,
        _settings = settingsRepository,
        _students = studentRepository,
        _logs = logs,
        _clock = clock;

  static const int batchSize = 25;

  final SyncApi _api;
  final SyncRepository _sync;
  final SettingsRepository _settings;
  final StudentRepository _students;
  final LogRepository _logs;
  final Clock _clock;

  bool get isConfigured => _api.isConfigured;

  Future<SyncResult> run() async {
    final settings = await _settings.current();

    if (!settings.apiEnabled || !_api.isConfigured) {
      return const SyncResult.notConfigured();
    }
    if (settings.offlineMode) {
      return const SyncResult(
        state: SyncState.notConfigured,
        message:
            'Le terminal est en mode hors ligne volontaire : la '
            'synchronisation est ignorée.',
      );
    }

    var pushed = 0;

    try {
      final now = _clock.now().toUtc();
      final queueItems = await _sync.pendingItems(limit: batchSize);
      final allowed = queueItems.where((item) {
        return SyncBackoff.canAttempt(
          now: now,
          lastAttemptAt: item.lastAttemptAt,
          retryCount: item.retryCount,
        );
      }).toList();

      if (allowed.isNotEmpty) {
        final dtos = <AttendanceSyncDto>[];
        for (final item in allowed) {
          try {
            dtos.add(AttendanceSyncDto.fromQueuePayload(item.payloadJson));
          } catch (_) {
            await _sync.markQueueStatus(
              item.id,
              'failed',
              error: 'Payload illisible',
              incrementRetry: true,
            );
          }
        }

        if (dtos.isNotEmpty) {
          final results = await _api.pushAttendance(dtos);
          for (var i = 0; i < dtos.length && i < results.length; i++) {
            final dto = dtos[i];
            final result = results[i];
            final item = allowed.firstWhere(
              (e) => e.entityId == dto.eventId,
              orElse: () => allowed.first,
            );
            if (result.success) {
              await _sync.markRecordSynced(
                dto.eventId,
                serverRecordId: result.serverRecordId,
              );
              await _sync.markQueueStatus(item.id, 'synced');
              pushed++;
            } else {
              await _sync.markRecordFailed(
                dto.eventId,
                result.error ?? 'Erreur',
              );
              await _sync.markQueueStatus(
                item.id,
                'failed',
                error: result.error,
                incrementRetry: result.retryable,
              );
            }
          }
        }
      }
    } catch (error) {
      await _logs.error('sync.push_error', details: error.toString());
      return SyncResult(
        state: SyncState.failure,
        message: 'Synchronisation impossible : $error',
        pushed: pushed,
      );
    }

    return _pullAndFinish(pushed);
  }

  Future<SyncResult> _pullAndFinish(int pushed) async {
    var pulled = 0;
    try {
      final settings = await _settings.current();

      // Curseur incrémental : on reprend 2 minutes avant la dernière
      // synchronisation réussie pour absorber un éventuel décalage
      // d'horloge entre le terminal et le serveur. Un rejeu est sans
      // danger (upsert idempotent côté terminal).
      final since = settings.lastStudentSync
          ?.toUtc()
          .subtract(const Duration(minutes: 2))
          .toIso8601String();

      final pull = await _api.pullChanges(cursor: since);
      final now = _clock.now().toUtc();

      if (pull.classes.isNotEmpty) {
        await _students.upsertClasses(
          pull.classes
              .where((row) => row.id.isNotEmpty)
              .map(
                (row) => SchoolClassesCompanion.insert(
                  id: row.id,
                  remoteId: Value(row.id),
                  name: row.name,
                  updatedAt: now,
                ),
              )
              .toList(),
        );
      }

      if (pull.students.isNotEmpty) {
        pulled = await _students.applyServerStudents(
          pull.students,
          syncedAt: now,
        );
      }

      if (pull.removedStudentCodes.isNotEmpty) {
        await _students.deactivateStudentsByCodes(pull.removedStudentCodes);
      }

      if (pull.config != null) {
        await _settings.applyServerConfig(
          pull.config!,
          schoolName: pull.schoolName,
        );
      }

      // Le curseur serveur fait foi ; à défaut, on utilise l'heure locale.
      final cursor =
          DateTime.tryParse(pull.cursor ?? '')?.toUtc() ?? now;
      await _settings.markStudentSync(cursor);

      if (pushed > 0) {
        await _settings.markAttendanceSync(now);
      }

      await _logs.info('sync.run', details: 'pushed=$pushed pulled=$pulled');

      return SyncResult(
        state: SyncState.success,
        message: 'Synchronisation terminée.',
        pushed: pushed,
        pulled: pulled,
      );
    } catch (error) {
      await _logs.error('sync.error', details: error.toString());
      return SyncResult(
        state: SyncState.failure,
        message: 'Synchronisation impossible : $error',
        pushed: pushed,
      );
    }
  }

  String describeLastSync(DateTime? value) {
    if (value == null) return 'Jamais';
    return AppTime.shortDateTime(value.toLocal());
  }
}

