import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';

/// Journal technique local (diagnostic terrain, jamais envoyé sans accord).
class LogRepository {
  LogRepository(this._db);

  final AppDatabase _db;

  Future<void> write(
    String level,
    String event, {
    String? details,
  }) async {
    try {
      await _db.into(_db.terminalLogs).insert(
            TerminalLogsCompanion.insert(
              level: level,
              event: event,
              details: Value(details),
              createdAt: DateTime.now().toUtc(),
            ),
          );
    } catch (_) {
      // Un journal ne doit jamais faire échouer un scan.
    }
  }

  Future<void> info(String event, {String? details}) =>
      write('info', event, details: details);

  Future<void> warn(String event, {String? details}) =>
      write('warn', event, details: details);

  Future<void> error(String event, {String? details}) =>
      write('error', event, details: details);

  Future<int> count() async {
    final total = _db.terminalLogs.id.count();
    final query = _db.selectOnly(_db.terminalLogs)..addColumns([total]);
    final row = await query.getSingle();
    return row.read(total) ?? 0;
  }

  Future<List<TerminalLog>> recent({int limit = 100}) {
    return (_db.select(_db.terminalLogs)
          ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.desc)])
          ..limit(limit))
        .get();
  }

  /// Politique de rétention : les journaux plus anciens sont purgés.
  Future<int> purgeOlderThan(int retentionDays) {
    final limit = DateTime.now().toUtc().subtract(Duration(days: retentionDays));
    return (_db.delete(_db.terminalLogs)
          ..where((t) => t.createdAt.isSmallerThanValue(limit)))
        .go();
  }

  Future<int> clearAll() => _db.delete(_db.terminalLogs).go();
}
