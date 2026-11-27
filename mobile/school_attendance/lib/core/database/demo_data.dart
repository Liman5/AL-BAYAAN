import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import 'app_database.dart';
import '../../features/students/data/student_repository.dart';

/// Données de démonstration **explicitement identifiables** (`isDemo = true`).
///
/// Elles ne sont jamais créées automatiquement : l'administrateur doit
/// déclencher le chargement depuis l'écran Administration, et peut les
/// supprimer en un geste. La production n'en contient donc aucune.
class DemoDataSeeder {
  DemoDataSeeder(
    this._students, {
    Uuid? uuid,
  }) : _uuid = uuid ?? const Uuid();

  final StudentRepository _students;
  final Uuid _uuid;

  /// [code, token de badge, prénom, nom, classe]
  static const List<List<String>> demoStudents = [
    ['DEMO-0001', 'DEMO-BADGE-0001', 'Adjovi', 'Kodjo', '3e A'],
    ['DEMO-0002', 'DEMO-BADGE-0002', 'Youssef', 'Ait', '3e A'],
    ['DEMO-0003', 'DEMO-BADGE-0003', 'Imane', 'Mahmoud', '4e B'],
    ['DEMO-0004', 'DEMO-BADGE-0004', 'Karim', 'El Amrani', '4e B'],
    ['DEMO-0005', 'DEMO-BADGE-0005', 'Aminata', 'Diallo', '5e A'],
    ['DEMO-0006', 'DEMO-BADGE-0006', 'Sara', 'Bensalem', '5e A'],
  ];

  Future<int> seed() async {
    final now = DateTime.now().toUtc();
    final companions = demoStudents.map((row) {
      return StudentsCompanion.insert(
        id: _uuid.v4(),
        studentCode: row[0],
        qrToken: row[1],
        firstName: Value(row[2]),
        lastName: Value(row[3]),
        className: Value(row[4]),
        isDemo: const Value(true),
        updatedAt: now,
      );
    }).toList();

    await _students.upsertStudents(companions);
    return companions.length;
  }

  Future<int> clear() => _students.deleteDemoStudents();

  Future<int> countDemo() async {
    final all = await _students.listStudents(limit: 20000);
    return all.where((student) => student.isDemo).length;
  }
}
