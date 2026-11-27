import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../../../core/sync/sync_models.dart';

/// Accès local aux élèves et aux classes (aucune dépendance réseau).
class StudentRepository {
  StudentRepository(this._db);

  final AppDatabase _db;

  Future<Student?> findByQrToken(String token) {
    return (_db.select(_db.students)..where((t) => t.qrToken.equals(token)))
        .getSingleOrNull();
  }

  Future<Student?> findByCode(String studentCode) {
    return (_db.select(_db.students)
          ..where((t) => t.studentCode.equals(studentCode)))
        .getSingleOrNull();
  }

  Future<Student?> findById(String id) {
    return (_db.select(_db.students)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
  }

  Future<int> countStudents({bool includeDemo = true}) async {
    final count = _db.students.id.count();
    final query = _db.selectOnly(_db.students)..addColumns([count]);
    if (!includeDemo) {
      query.where(_db.students.isDemo.equals(false));
    }
    final row = await query.getSingle();
    return row.read(count) ?? 0;
  }

  Stream<int> watchStudentCount() {
    final count = _db.students.id.count();
    final query = _db.selectOnly(_db.students)..addColumns([count]);
    return query.map((row) => row.read(count) ?? 0).watchSingle();
  }

  Future<List<Student>> listStudents({
    String? query,
    String? classId,
    int limit = 300,
  }) {
    final statement = _db.select(_db.students)
      ..orderBy([
        (t) => OrderingTerm(expression: t.lastName),
        (t) => OrderingTerm(expression: t.firstName),
      ])
      ..limit(limit);

    final trimmed = query?.trim().toLowerCase();
    if (trimmed != null && trimmed.isNotEmpty) {
      statement.where(
        (t) =>
            t.studentCode.lower().contains(trimmed) |
            t.firstName.lower().contains(trimmed) |
            t.lastName.lower().contains(trimmed) |
            t.className.lower().contains(trimmed),
      );
    }
    if (classId != null && classId.isNotEmpty) {
      statement.where((t) => t.classId.equals(classId));
    }
    return statement.get();
  }

  Future<List<SchoolClass>> listClasses() {
    return (_db.select(_db.schoolClasses)
          ..orderBy([(t) => OrderingTerm(expression: t.name)]))
        .get();
  }

  Stream<List<SchoolClass>> watchClasses() {
    return (_db.select(_db.schoolClasses)
          ..orderBy([(t) => OrderingTerm(expression: t.name)]))
        .watch();
  }

  Future<void> upsertStudents(List<StudentsCompanion> rows) async {
    if (rows.isEmpty) return;
    await _db.batch((batch) {
      batch.insertAllOnConflictUpdate(_db.students, rows);
    });
  }

  /// Applique la liste d'élèves reçue d'AL-BAYAAN.
  ///
  /// Règles de sécurité :
  ///  - l'identifiant local existant est conservé (aucun doublon) ;
  ///  - la photo locale déjà téléchargée n'est jamais écrasée ;
  ///  - un élève sans badge actif est marqué `badgeRevoked` plutôt que
  ///    supprimé : l'historique de présence reste intact ;
  ///  - aucune présence n'est supprimée.
  ///
  /// Retourne le nombre d'élèves insérés ou mis à jour.
  Future<int> applyServerStudents(
    List<StudentSyncDto> students, {
    required DateTime syncedAt,
  }) async {
    final rows = <StudentsCompanion>[];
    final revokedCodes = <String>[];

    for (final dto in students) {
      if (dto.studentCode.isEmpty) continue;

      final existing = await findByCode(dto.studentCode);

      if (dto.qrToken.isEmpty) {
        // Badge révoqué : on désactive le scan sans perdre l'élève.
        revokedCodes.add(dto.studentCode);
        continue;
      }

      rows.add(
        StudentsCompanion.insert(
          id: existing?.id ?? 'stu-${dto.studentCode}',
          studentUuid: Value(dto.studentUuid),
          studentCode: dto.studentCode,
          firstName: Value(dto.firstName),
          lastName: Value(dto.lastName),
          classId: Value(dto.classId),
          className: Value(dto.className),
          photoRemoteUrl: Value(dto.photoRemoteUrl),
          qrToken: dto.qrToken,
          isActive: Value(dto.isActive),
          badgeRevoked: Value(dto.badgeRevoked),
          updatedAt: syncedAt,
          lastSyncedAt: Value(syncedAt),
        ),
      );
    }

    await upsertStudents(rows);
    if (revokedCodes.isNotEmpty) {
      await deactivateStudentsByCodes(revokedCodes, badgeRevoked: true);
    }
    return rows.length;
  }

  /// Désactive des élèves (transférés, radiés, badge révoqué).
  Future<int> deactivateStudentsByCodes(
    List<String> codes, {
    bool badgeRevoked = false,
  }) async {
    if (codes.isEmpty) return 0;
    var updated = 0;
    for (final code in codes) {
      final statement = _db.update(_db.students)
        ..where((t) => t.studentCode.equals(code));
      updated += await statement.write(
        StudentsCompanion(
          isActive: const Value(false),
          badgeRevoked: Value(badgeRevoked),
          updatedAt: Value(DateTime.now().toUtc()),
        ),
      );
    }
    return updated;
  }

  Future<void> upsertClasses(List<SchoolClassesCompanion> rows) async {
    if (rows.isEmpty) return;
    await _db.batch((batch) {
      batch.insertAllOnConflictUpdate(_db.schoolClasses, rows);
    });
  }

  Future<int> setPhotoPath(String studentId, String? path) {
    return (_db.update(_db.students)..where((t) => t.id.equals(studentId)))
        .write(StudentsCompanion(photoLocalPath: Value(path)));
  }

  Future<int> deleteDemoStudents() {
    return (_db.delete(_db.students)..where((t) => t.isDemo.equals(true))).go();
  }

  Future<int> deleteAllStudents() => _db.delete(_db.students).go();
}
