import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/database/app_database.dart';
import '../../core/database/demo_data.dart';
import '../../core/network/terminal_credentials.dart';
import '../../core/scanner/qr_payload_parser.dart';
import '../../core/security/pin_service.dart';
import '../../core/sync/remote_sync_api.dart';
import '../../core/sync/sync_api.dart';
import '../../core/sync/sync_engine.dart';
import '../../core/sync/sync_service.dart';
import '../../core/voice/voice_feedback.dart';
import '../../core/utils/app_time.dart';
import '../../features/attendance_scanner/data/attendance_repository.dart';
import '../../features/attendance_scanner/domain/scan_service.dart';
import '../../features/attendance_scanner/presentation/scanner_controller.dart';
import '../../features/history/data/history_exporter.dart';
import '../../features/history/domain/history_filter.dart';
import '../../features/import_students/data/student_import_service.dart';
import '../../features/students/data/student_photo_service.dart';
import '../../features/students/data/student_repository.dart';
import '../../features/sync/data/log_repository.dart';
import '../../features/sync/data/sync_repository.dart';
import '../../features/sync/data/terminal_provisioning_service.dart';
import '../../features/terminal_settings/data/settings_repository.dart';
import '../../shared/models/view_models.dart';
import '../config/app_config.dart';

/// Base de données — fournie par `main()` via un override de ProviderScope.
final databaseProvider = Provider<AppDatabase>((ref) {
  throw UnimplementedError('databaseProvider doit être overridé dans main().');
});

final clockProvider = Provider<Clock>((ref) => const SystemClock());

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.watch(databaseProvider));
});

final studentRepositoryProvider = Provider<StudentRepository>((ref) {
  return StudentRepository(ref.watch(databaseProvider));
});

final attendanceRepositoryProvider = Provider<AttendanceRepository>((ref) {
  return AttendanceRepository(ref.watch(databaseProvider));
});

final syncRepositoryProvider = Provider<SyncRepository>((ref) {
  return SyncRepository(ref.watch(databaseProvider));
});

final logRepositoryProvider = Provider<LogRepository>((ref) {
  return LogRepository(ref.watch(databaseProvider));
});

final studentPhotoServiceProvider = Provider<StudentPhotoService>((ref) {
  return StudentPhotoService(ref.watch(studentRepositoryProvider));
});

final importServiceProvider = Provider<StudentImportService>((ref) {
  return StudentImportService(
    ref.watch(studentRepositoryProvider),
    ref.watch(databaseProvider),
    clock: ref.watch(clockProvider),
  );
});

final demoSeederProvider = Provider<DemoDataSeeder>((ref) {
  return DemoDataSeeder(ref.watch(studentRepositoryProvider));
});

final historyExporterProvider = Provider<HistoryExporter>((ref) {
  return HistoryExporter(ref.watch(attendanceRepositoryProvider));
});

final pinServiceProvider = Provider<PinService>((ref) {
  return PinService(ref.watch(databaseProvider));
});

final scanServiceProvider = Provider<ScanService>((ref) {
  return ScanService(
    database: ref.watch(databaseProvider),
    students: ref.watch(studentRepositoryProvider),
    attendance: ref.watch(attendanceRepositoryProvider),
    settings: ref.watch(settingsRepositoryProvider),
    logs: ref.watch(logRepositoryProvider),
    parser: const QrPayloadParser(),
    clock: ref.watch(clockProvider),
  );
});

final settingsProvider = StreamProvider<TerminalSettings>((ref) {
  return ref.watch(settingsRepositoryProvider).watchSettings();
});


/// Identifiants d'appairage AL-BAYAAN (chargés au démarrage).
///
/// `null` = terminal non appairé : la synchronisation reste inerte et
/// le scanner fonctionne intégralement hors ligne.
final terminalCredentialsProvider =
    StateProvider<TerminalCredentials?>((ref) => null);

final credentialsStoreProvider = Provider<TerminalCredentialsStore>((ref) {
  return TerminalCredentialsStore();
});

final provisioningServiceProvider = Provider<TerminalProvisioningService>((ref) {
  return TerminalProvisioningService(
    store: ref.watch(credentialsStoreProvider),
    appVersion: AppConfig.appVersion,
  );
});

/// API réelle si le terminal est appairé, inerte sinon.
final syncApiProvider = Provider<SyncApi>((ref) {
  final credentials = ref.watch(terminalCredentialsProvider);
  if (credentials == null || !credentials.isComplete) {
    return const UnconfiguredSyncApi();
  }
  return RemoteSyncApi(
    credentials: credentials,
    appVersion: AppConfig.appVersion,
  );
});

final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService(
    api: ref.watch(syncApiProvider),
    syncRepository: ref.watch(syncRepositoryProvider),
    settingsRepository: ref.watch(settingsRepositoryProvider),
    studentRepository: ref.watch(studentRepositoryProvider),
    logs: ref.watch(logRepositoryProvider),
    clock: ref.watch(clockProvider),
  );
});

/// Moteur de synchronisation automatique (démarrage, réseau, périodique).
final syncEngineProvider = Provider<SyncEngine>((ref) {
  final engine = SyncEngine(
    service: ref.watch(syncServiceProvider),
    settings: ref.watch(settingsRepositoryProvider),
    queue: ref.watch(syncRepositoryProvider),
  );
  ref.onDispose(engine.stop);
  return engine;
});

/// Retour vocal configurable (TTS Android, hors ligne).
final voiceFeedbackProvider = Provider<VoiceFeedback>((ref) => VoiceFeedback());

/// Clé de la journée courante, rafraîchie automatiquement (changement de jour).
final todayKeyProvider = StreamProvider<String>((ref) async* {
  final clock = ref.watch(clockProvider);
  var last = '';
  while (true) {
    final key = AppTime.dateKey(clock.now());
    if (key != last) {
      last = key;
      yield key;
    }
    await Future<void>.delayed(const Duration(seconds: 20));
  }
});

final todayCountsProvider = StreamProvider<DayAttendanceCounts>((ref) {
  final key = ref.watch(todayKeyProvider).valueOrNull;
  if (key == null) {
    return Stream<DayAttendanceCounts>.value(DayAttendanceCounts.empty);
  }
  return ref.watch(attendanceRepositoryProvider).watchCountsForDay(key);
});

final studentCountProvider = StreamProvider<int>((ref) {
  return ref.watch(studentRepositoryProvider).watchStudentCount();
});

final pendingSyncProvider = StreamProvider<int>((ref) {
  return ref.watch(attendanceRepositoryProvider).watchPendingSyncCount();
});

final classesProvider = StreamProvider<List<SchoolClass>>((ref) {
  return ref.watch(studentRepositoryProvider).watchClasses();
});

final classStatsProvider =
    FutureProvider<List<ClassAttendanceStat>>((ref) async {
  final key = AppTime.dateKey(ref.watch(clockProvider).now());
  return ref.watch(attendanceRepositoryProvider).classStatsForDay(key);
});

final recentAttendanceProvider =
    FutureProvider<List<AttendanceHistoryEntry>>((ref) async {
  return ref.watch(attendanceRepositoryProvider).recent(limit: 8);
});

final storageSnapshotProvider = FutureProvider<StorageSnapshot>((ref) async {
  final database = ref.watch(databaseProvider);
  final students = ref.watch(studentRepositoryProvider);
  final attendance = ref.watch(attendanceRepositoryProvider);
  final logs = ref.watch(logRepositoryProvider);

  return StorageSnapshot(
    databaseBytes: await database.databaseSizeBytes(),
    studentCount: await students.countStudents(),
    attendanceCount: await attendance.countAll(),
    pendingSyncCount: await attendance.countPendingSync(),
    logCount: await logs.count(),
  );
});

/// Signal réseau **indicatif** : ne conditionne jamais l'enregistrement.
final connectivityProvider = StreamProvider<bool>((ref) async* {
  final connectivity = Connectivity();
  bool hasConnection(List<ConnectivityResult> results) =>
      results.any((result) => result != ConnectivityResult.none);

  try {
    yield hasConnection(await connectivity.checkConnectivity());
    await for (final results in connectivity.onConnectivityChanged) {
      yield hasConnection(results);
    }
  } catch (_) {
    yield false;
  }
});

final historyFilterProvider =
    StateProvider<HistoryFilter>((ref) => const HistoryFilter());

final historyProvider =
    FutureProvider.autoDispose<List<AttendanceHistoryEntry>>((ref) async {
  final filter = ref.watch(historyFilterProvider);
  if (filter.day == null) {
    return const <AttendanceHistoryEntry>[];
  }
  return ref.watch(attendanceRepositoryProvider).history(
        day: filter.day,
        classId: filter.classId,
        status: filter.status,
        search: filter.search,
        limit: 500,
      );
});

final scannerControllerProvider =
    StateNotifierProvider<ScannerController, ScannerState>((ref) {
  return ScannerController(
    scanService: ref.watch(scanServiceProvider),
    settingsRepository: ref.watch(settingsRepositoryProvider),
  );
});
