import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';

/// Accès à la file d'attente de synchronisation.
///
/// La file est alimentée localement lors de chaque présence. Tant qu'aucun
/// backend n'est configuré, les éléments restent en `pending` : aucune
/// donnée n'est perdue et rien n'est envoyé.
class SyncRepository {
  SyncRepository(this._db);

  final AppDatabase _db;

  Future<int> pendingCount() async {
    final count = _db.syncQueue.id.count();
    final query = _db.selectOnly(_db.syncQueue)
      ..addColumns([count])
      ..where(_db.syncQueue.status.isIn(const ['pending', 'failed']));
    final row = await query.getSingle();
    return row.read(count) ?? 0;
  }

  Stream<int> watchPendingCount() {
    final count = _db.syncQueue.id.count();
    final query = _db.selectOnly(_db.syncQueue)
      ..addColumns([count])
      ..where(_db.syncQueue.status.isIn(const ['pending', 'failed']));
    return query.map((row) => row.read(count) ?? 0).watchSingle();
  }

  Future<List<SyncQueueItem>> pendingItems({int limit = 50}) {
    return (_db.select(_db.syncQueue)
          ..where((t) => t.status.isIn(const ['pending', 'failed']))
          ..orderBy([(t) => OrderingTerm(expression: t.createdAt)])
          ..limit(limit))
        .get();
  }

  Future<List<AttendanceRecord>> pendingRecords({int limit = 50}) {
    return (_db.select(_db.attendanceRecords)
          ..where((t) => t.syncStatus.isIn(const ['pending', 'failed']))
          ..orderBy([(t) => OrderingTerm(expression: t.scannedAtUtc)])
          ..limit(limit))
        .get();
  }

  Future<void> markQueueStatus(
    String id,
    String status, {
    String? error,
    bool incrementRetry = false,
  }) async {
    final item = await (_db.select(_db.syncQueue)
          ..where((t) => t.id.equals(id)))
        .getSingleOrNull();
    if (item == null) return;
    await (_db.update(_db.syncQueue)..where((t) => t.id.equals(id))).write(
      SyncQueueCompanion(
        status: Value(status),
        lastAttemptAt: Value(DateTime.now().toUtc()),
        lastError: Value(error),
        retryCount: Value(
          incrementRetry ? item.retryCount + 1 : item.retryCount,
        ),
      ),
    );
  }

  Future<void> markRecordSyncing(String id) async {
    await (_db.update(_db.attendanceRecords)..where((t) => t.id.equals(id)))
        .write(const AttendanceRecordsCompanion(syncStatus: Value('syncing')));
  }

  Future<void> markRecordSynced(
    String id, {
    String? serverRecordId,
  }) async {
    await (_db.update(_db.attendanceRecords)..where((t) => t.id.equals(id)))
        .write(
      AttendanceRecordsCompanion(
        syncStatus: const Value('synced'),
        syncedAt: Value(DateTime.now().toUtc()),
        serverRecordId: Value(serverRecordId),
        lastSyncError: const Value<String?>(null),
      ),
    );
  }

  Future<void> markRecordFailed(String id, String error) async {
    final record = await (_db.select(_db.attendanceRecords)
          ..where((t) => t.id.equals(id)))
        .getSingleOrNull();
    if (record == null) return;
    await (_db.update(_db.attendanceRecords)..where((t) => t.id.equals(id)))
        .write(
      AttendanceRecordsCompanion(
        syncStatus: const Value('failed'),
        lastSyncError: Value(error),
        retryCount: Value(record.retryCount + 1),
      ),
    );
  }

  /// À appeler au démarrage : un envoi interrompu (crash, batterie) ne doit
  /// pas laisser un événement bloqué en `syncing`.
  Future<void> resetStuckItems() async {
    await (_db.update(_db.attendanceRecords)
          ..where((t) => t.syncStatus.equals('syncing')))
        .write(const AttendanceRecordsCompanion(syncStatus: Value('pending')));
    await (_db.update(_db.syncQueue)..where((t) => t.status.equals('syncing')))
        .write(const SyncQueueCompanion(status: Value('pending')));
  }
}
