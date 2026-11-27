import 'dart:io';

import 'package:image/image.dart' as img;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../../app/config/app_config.dart';
import 'student_repository.dart';

/// Gestion locale des photos élèves (aucune URL au moment du scan).
class StudentPhotoService {
  StudentPhotoService(this._students);

  static const int maxWidth = 480;
  static const int jpegQuality = 82;

  final StudentRepository _students;

  Future<Directory> photosDirectory() async {
    final documents = await getApplicationDocumentsDirectory();
    final directory = Directory(
      p.join(documents.path, AppConfig.studentPhotosFolder),
    );
    if (!await directory.exists()) {
      await directory.create(recursive: true);
    }
    return directory;
  }

  /// Copie + compresse une photo et associe son chemin à l'élève.
  Future<String?> importPhoto({
    required File source,
    required String studentId,
  }) async {
    try {
      final bytes = await source.readAsBytes();
      final decoded = img.decodeImage(bytes);
      if (decoded == null) return null;

      final resized = decoded.width > maxWidth
          ? img.copyResize(decoded, width: maxWidth)
          : decoded;
      final encoded = img.encodeJpg(resized, quality: jpegQuality);

      final directory = await photosDirectory();
      final file = File(p.join(directory.path, '$studentId.jpg'));
      await file.writeAsBytes(encoded, flush: true);
      await _students.setPhotoPath(studentId, file.path);
      return file.path;
    } catch (_) {
      return null;
    }
  }

  /// Importe un dossier de photos nommées `<matricule>.jpg|jpeg|png`.
  /// Retourne le nombre de photos associées.
  Future<int> importFolder(Directory folder) async {
    if (!await folder.exists()) return 0;

    final students = await _students.listStudents(limit: 20000);
    final byCode = <String, String>{
      for (final student in students)
        student.studentCode.toLowerCase().trim(): student.id,
    };

    var imported = 0;
    await for (final entity in folder.list()) {
      if (entity is! File) continue;
      final extension = p.extension(entity.path).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].contains(extension)) continue;

      final code = p.basenameWithoutExtension(entity.path).toLowerCase().trim();
      final studentId = byCode[code];
      if (studentId == null) continue;

      final path = await importPhoto(source: entity, studentId: studentId);
      if (path != null) imported++;
    }
    return imported;
  }

  Future<void> deletePhoto(String? path) async {
    if (path == null || path.isEmpty) return;
    try {
      final file = File(path);
      if (await file.exists()) await file.delete();
    } catch (_) {
      // ignore
    }
  }

  /// Taille totale des photos locales (octets) — affichée dans l'admin.
  Future<int> storageBytes() async {
    try {
      final directory = await photosDirectory();
      var total = 0;
      await for (final entity in directory.list()) {
        if (entity is File) {
          total += await entity.length();
        }
      }
      return total;
    } catch (_) {
      return 0;
    }
  }
}
