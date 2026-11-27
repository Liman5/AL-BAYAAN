import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/sync/sync_api.dart';
import 'package:school_attendance/core/sync/sync_models.dart';
import 'package:school_attendance/core/sync/sync_service.dart';
import 'package:school_attendance/features/students/data/student_repository.dart';
import 'package:school_attendance/features/sync/data/log_repository.dart';
import 'package:school_attendance/features/sync/data/sync_repository.dart';
import 'package:school_attendance/features/terminal_settings/data/settings_repository.dart';

/// Contrat de synchronisation factice : aucune requête réseau.
class _FakeApi implements SyncApi {
  _FakeApi({required this.configured});

  final bool configured;

  @override
  bool get isConfigured => configured;

  @override
  Future<List<PushItemResult>> pushAttendance(List<AttendanceSyncDto> items) async {
    return items.map((_) => const PushItemResult.ok()).toList();
  }

  @override
  Future<PullResult> pullChanges({String? cursor}) async {
    return const PullResult(notModified: true);
  }
}

void main() {
  late AppDatabase db;
  late SettingsRepository settings;
  late SyncRepository queue;

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    settings = SettingsRepository(db);
    queue = SyncRepository(db);
    await settings.ensureSettings();
  });

  tearDown(() async {
    await db.close();
  });

  SyncService buildService(SyncApi api) {
    return SyncService(
      api: api,
      syncRepository: queue,
      settingsRepository: settings,
      studentRepository: StudentRepository(db),
      logs: LogRepository(db),
    );
  }

  test('terminal non appairé : message explicite et erreur persistée', () async {
    final service = buildService(const UnconfiguredSyncApi());
    final result = await service.run();

    expect(result.state, SyncState.notConfigured);
    expect(result.message, contains('non appairé'));

    final current = await settings.current();
    expect(current.lastSyncError, contains('non appairé'));
    expect(current.lastSyncAttempt, isNotNull);
  });

  test('synchronisation désactivée dans les paramètres', () async {
    final service = buildService(_FakeApi(configured: true));
    final result = await service.run();

    expect(result.state, SyncState.notConfigured);
    expect(result.message, contains('désactivée'));
  });

  test('mode hors ligne volontaire : envoi ignoré', () async {
    await settings.setSyncEnabled(true);
    await settings.save((await settings.current()).copyWith(offlineMode: true));

    final service = buildService(_FakeApi(configured: true));
    final result = await service.run();

    expect(result.state, SyncState.notConfigured);
    expect(result.message, contains('hors ligne'));
  });

  test('terminal appairé et synchronisation activée : cycle réussi', () async {
    await settings.setSyncEnabled(true);

    final service = buildService(_FakeApi(configured: true));
    final result = await service.run();

    expect(result.state, SyncState.success);
    final current = await settings.current();
    expect(current.lastSyncError, isNull);
    expect(current.lastSyncAttempt, isNotNull);
  });
}
