import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'tables.dart';

part 'app_database.g.dart';

/// Base SQLite locale du terminal (Drift).
///
/// - Fichier stocké dans les documents privés de l'application.
/// - WAL activé pour des écritures rapides et sûres.
/// - Migrations versionnées (`schemaVersion`).
/// - Aucune écriture réseau : la base est utilisée en local uniquement.
@DriftDatabase(
  tables: [
    Students,
    StaffMembers,
    SchoolClasses,
    AttendanceRecords,
    Settings,
    SyncQueue,
    TerminalLogs,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  @override
  int get schemaVersion => 6;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        // v2 : préférence d'objectif caméra (front par défaut).
        if (from < 2) {
          await m.addColumn(settings, settings.cameraFacing);
        }
        // v3 : politique d'affichage synchronisée depuis AL-BAYAAN.
        if (from < 3) {
          await m.addColumn(settings, settings.showPhoto);
          await m.addColumn(settings, settings.showMatricule);
          await m.addColumn(settings, settings.showClassName);
          await m.addColumn(settings, settings.showTime);
        }
        // v4 : diagnostic de synchronisation + retour vocal (TTS).
        if (from < 4) {
          await m.addColumn(settings, settings.lastSyncAttempt);
          await m.addColumn(settings, settings.lastSyncError);
          await m.addColumn(settings, settings.voiceEnabled);
          await m.addColumn(settings, settings.voiceSuccess);
          await m.addColumn(settings, settings.voiceLate);
          await m.addColumn(settings, settings.voiceDuplicate);
          await m.addColumn(settings, settings.voiceRefused);
        }
        // v5 : code administrateur persistant (sel + empreinte en base locale).
        if (from < 5) {
          await m.addColumn(settings, settings.adminPinSalt);
          await m.addColumn(settings, settings.adminPinHash);
          await m.addColumn(settings, settings.adminPinIterations);
        }
        // v6 : personnel (enseignants + administration) et type de personne.
        if (from < 6) {
          await m.createTable(staffMembers);
          await m.addColumn(attendanceRecords, attendanceRecords.personType);
        }
      },
      beforeOpen: (OpeningDetails details) async {
        await customStatement('PRAGMA foreign_keys = ON');
        await customStatement('PRAGMA journal_mode = WAL');
        await customStatement('PRAGMA synchronous = NORMAL');
        await customStatement('PRAGMA busy_timeout = 5000');
      },
    );
  }

  /// Ouvre la base persistante du terminal.
  static AppDatabase openDefault() {
    return AppDatabase(
      LazyDatabase(() async {
        final directory = await getApplicationDocumentsDirectory();
        final file = File(p.join(directory.path, 'school_attendance.sqlite'));
        if (!await file.parent.exists()) {
          await file.parent.create(recursive: true);
        }
        return NativeDatabase.createInBackground(file);
      }),
    );
  }

  /// Base en mémoire — utilisée par les tests.
  static AppDatabase memory() => AppDatabase(NativeDatabase.memory());

  /// Taille du fichier de base (octets), pour l'écran administration.
  Future<int> databaseSizeBytes() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, 'school_attendance.sqlite'));
      if (!await file.exists()) return 0;
      return await file.length();
    } catch (_) {
      return 0;
    }
  }
}
