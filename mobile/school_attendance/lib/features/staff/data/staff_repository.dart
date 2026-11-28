import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../../../core/sync/sync_models.dart';

/// Accès local au personnel (enseignants + administration).
class StaffRepository {
  StaffRepository(this._db);

  final AppDatabase _db;

  Future<StaffMember?> findByQrToken(String token) {
    return (_db.select(_db.staffMembers)..where((t) => t.qrToken.equals(token)))
        .getSingleOrNull();
  }

  Future<StaffMember?> findByCode(String code) {
    return (_db.select(_db.staffMembers)..where((t) => t.staffCode.equals(code)))
        .getSingleOrNull();
  }

  Future<int> countStaff() async {
    final count = _db.staffMembers.id.count();
    final row = await (_db.selectOnly(_db.staffMembers)..addColumns([count]))
        .getSingle();
    return row.read(count) ?? 0;
  }

  Stream<int> watchStaffCount() {
    final count = _db.staffMembers.id.count();
    return (_db.selectOnly(_db.staffMembers)..addColumns([count]))
        .map((row) => row.read(count) ?? 0)
        .watchSingle();
  }

  /// Applique la liste du personnel reçue d'AL-BAYAAN.
  ///
  /// - identifiant local conservé (aucun doublon) ;
  /// - photo locale jamais écrasée ;
  /// - badge révoqué → `badgeRevoked` (le scan est refusé), sans suppression.
  Future<int> applyServerStaff(
    List<StaffSyncDto> staff, {
    required DateTime syncedAt,
  }) async {
    final rows = <StaffMembersCompanion>[];
    final revokedCodes = <String>[];

    for (final dto in staff) {
      if (dto.staffCode.isEmpty) continue;
      final existing = await findByCode(dto.staffCode);

      if (dto.qrToken.isEmpty) {
        revokedCodes.add(dto.staffCode);
        continue;
      }

      rows.add(
        StaffMembersCompanion.insert(
          id: existing?.id ?? 'staff-${dto.staffCode}',
          staffUuid: Value(dto.staffUuid),
          staffCode: dto.staffCode,
          firstName: Value(dto.firstName),
          lastName: Value(dto.lastName),
          staffType: Value(dto.staffType),
          roleLabel: Value(dto.roleLabel),
          photoRemoteUrl: Value(dto.photoRemoteUrl),
          qrToken: dto.qrToken,
          isActive: Value(dto.isActive),
          badgeRevoked: Value(dto.badgeRevoked),
          updatedAt: syncedAt,
          lastSyncedAt: Value(syncedAt),
        ),
      );
    }

    if (rows.isNotEmpty) {
      await _db.batch((batch) {
        batch.insertAllOnConflictUpdate(_db.staffMembers, rows);
      });
    }

    if (revokedCodes.isNotEmpty) {
      await deactivateStaffByCodes(revokedCodes, badgeRevoked: true);
    }
    return rows.length;
  }

  /// Désactive des membres du personnel (sortie, badge révoqué).
  Future<int> deactivateStaffByCodes(
    List<String> codes, {
    bool badgeRevoked = false,
  }) async {
    if (codes.isEmpty) return 0;
    var updated = 0;
    for (final code in codes) {
      updated += await (_db.update(_db.staffMembers)
            ..where((t) => t.staffCode.equals(code)))
          .write(
        StaffMembersCompanion(
          isActive: const Value(false),
          badgeRevoked: Value(badgeRevoked),
          updatedAt: Value(DateTime.now().toUtc()),
        ),
      );
    }
    return updated;
  }

  Future<int> deleteAllStaff() => _db.delete(_db.staffMembers).go();
}
