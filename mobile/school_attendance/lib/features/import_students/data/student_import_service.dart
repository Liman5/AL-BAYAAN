import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../../core/database/app_database.dart';
import '../../../core/scanner/qr_payload_parser.dart';
import '../../../core/utils/app_time.dart';
import '../../../core/utils/csv_utils.dart';
import '../../students/data/student_repository.dart';

enum ImportFormat { auto, csv, json }

class StudentImportRow {
  const StudentImportRow({
    required this.line,
    required this.studentCode,
    required this.qrToken,
    this.studentUuid,
    this.firstName = '',
    this.lastName = '',
    this.classId,
    this.className = '',
    this.isActive = true,
    this.badgeRevoked = false,
    this.photoFile,
  });

  final int line;
  final String studentCode;
  final String qrToken;
  final String? studentUuid;
  final String firstName;
  final String lastName;
  final String? classId;
  final String className;
  final bool isActive;
  final bool badgeRevoked;
  final String? photoFile;

  String get displayName {
    final full = '$firstName $lastName'.trim();
    return full.isEmpty ? studentCode : full;
  }
}

class ImportIssue {
  const ImportIssue({required this.line, required this.message});

  final int line;
  final String message;

  @override
  String toString() => 'Ligne $line : $message';
}

class ImportPreview {
  const ImportPreview({
    required this.rows,
    required this.issues,
    required this.totalRows,
  });

  static const ImportPreview empty =
      ImportPreview(rows: [], issues: [], totalRows: 0);

  final List<StudentImportRow> rows;
  final List<ImportIssue> issues;

  /// Nombre de lignes de données lues (hors en-tête).
  final int totalRows;

  bool get hasRows => rows.isNotEmpty;
  bool get hasIssues => issues.isNotEmpty;
}

class ImportResult {
  const ImportResult({
    required this.inserted,
    required this.updated,
    required this.rejected,
    this.issues = const [],
  });

  final int inserted;
  final int updated;
  final int rejected;
  final List<ImportIssue> issues;
}

/// Import local d'élèves (CSV ou JSON) — fonctionne intégralement hors ligne.
///
/// Sécurité :
///  - aucune donnée existante n'est supprimée ;
///  - les lignes invalides sont rejetées individuellement ;
///  - l'import est atomique (une seule transaction SQLite).
class StudentImportService {
  StudentImportService(
    this._students,
    this._db, {
    Uuid? uuid,
    Clock clock = const SystemClock(),
  })  : _uuid = uuid ?? const Uuid(),
        _clock = clock;

  static const int _maxAccepted = 20000;

  final StudentRepository _students;
  final AppDatabase _db;
  final Uuid _uuid;
  final Clock _clock;

  ImportPreview preview(
    String content, {
    ImportFormat format = ImportFormat.auto,
    String? fileName,
  }) {
    final resolved = _resolveFormat(format, content, fileName);
    try {
      return resolved == ImportFormat.json
          ? _previewFromJson(content)
          : _previewFromCsv(content);
    } catch (error) {
      return ImportPreview(
        rows: const [],
        issues: [ImportIssue(line: 0, message: 'Fichier illisible : $error')],
        totalRows: 0,
      );
    }
  }

  ImportFormat _resolveFormat(
    ImportFormat format,
    String content,
    String? fileName,
  ) {
    if (format != ImportFormat.auto) return format;
    final name = (fileName ?? '').toLowerCase();
    if (name.endsWith('.json')) return ImportFormat.json;
    if (name.endsWith('.csv')) return ImportFormat.csv;
    final trimmed = content.trimLeft();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return ImportFormat.json;
    }
    return ImportFormat.csv;
  }

  static const Map<String, List<String>> _aliases = {
    'code': ['student_code', 'matricule', 'code', 'code_eleve', 'matricule_scolaire'],
    'token': ['qr_token', 'token', 'badge', 'badge_token', 'qr'],
    'uuid': ['student_uuid', 'uuid', 'id_eleve'],
    'first': ['first_name', 'firstname', 'prenom'],
    'last': ['last_name', 'lastname', 'nom', 'nom_de_famille'],
    'class_id': ['class_id', 'classe_id', 'id_classe'],
    'class_name': ['class_name', 'classname', 'classe', 'nom_classe'],
    'active': ['is_active', 'actif', 'active'],
    'revoked': ['badge_revoked', 'badge_revoque', 'badge_revoquee'],
    'photo': ['photo', 'photo_file', 'photo_path', 'fichier_photo'],
  };

  ImportPreview _previewFromCsv(String content) {
    final rows = CsvUtils.parse(content);
    if (rows.isEmpty) {
      return const ImportPreview(
        rows: [],
        issues: [ImportIssue(line: 0, message: 'Fichier vide.')],
        totalRows: 0,
      );
    }

    final header = rows.first.map(CsvUtils.normalizeHeader).toList();
    final index = <String, int>{};
    for (final entry in _aliases.entries) {
      for (final alias in entry.value) {
        final position = header.indexOf(alias);
        if (position >= 0) {
          index[entry.key] = position;
          break;
        }
      }
    }

    if (index['code'] == null || index['token'] == null) {
      return ImportPreview(
        rows: const [],
        issues: const [
          ImportIssue(
            line: 1,
            message:
                'Colonnes obligatoires manquantes : student_code (ou matricule) '
                'et qr_token (ou token / badge).',
          ),
        ],
        totalRows: rows.length - 1,
      );
    }

    return _buildPreview(
      rows.skip(1).toList(),
      (cells) => <String, String>{
        for (final entry in index.entries)
          if (entry.value < cells.length) entry.key: cells[entry.value],
      },
    );
  }

  ImportPreview _previewFromJson(String content) {
    final decoded = jsonDecode(content);
    List<dynamic> items;
    if (decoded is List) {
      items = decoded;
    } else if (decoded is Map<String, dynamic> && decoded['students'] is List) {
      items = decoded['students'] as List<dynamic>;
    } else {
      return const ImportPreview(
        rows: [],
        issues: [
          ImportIssue(
            line: 0,
            message: 'JSON attendu : une liste d’élèves ou {"students": [...]}.',
          ),
        ],
        totalRows: 0,
      );
    }

    final asMaps = items.whereType<Map<String, dynamic>>().toList();
    return _buildPreview(
      asMaps,
      (item) => <String, String>{
        for (final entry in _aliases.entries)
          for (final alias in entry.value)
            if (item[alias] != null) entry.key: '${item[alias]}',
      },
      firstLine: 1,
    );
  }

  ImportPreview _buildPreview<T>(
    List<T> source,
    Map<String, String> Function(T item) toMap, {
    int firstLine = 2,
  }) {
    final rows = <StudentImportRow>[];
    final issues = <ImportIssue>[];
    final seenCodes = <String>{};
    final seenTokens = <String>{};

    if (source.length > _maxAccepted) {
      issues.add(
        const ImportIssue(
          line: 0,
          message:
              'Fichier trop volumineux (> $_maxAccepted lignes). Découpez-le.',
        ),
      );
    }

    for (var i = 0; i < source.length && i < _maxAccepted; i++) {
      final line = firstLine + i;
      final values = toMap(source[i]);
      final code = (values['code'] ?? '').trim();
      final rawToken = (values['token'] ?? '').trim();

      if (code.isEmpty) {
        issues.add(ImportIssue(line: line, message: 'Matricule manquant.'));
        continue;
      }

      final parsedToken = const QrPayloadParser().parse(rawToken);
      if (!parsedToken.isValid) {
        issues.add(
          ImportIssue(
            line: line,
            message: 'Token de badge absent ou invalide pour $code.',
          ),
        );
        continue;
      }
      final token = parsedToken.token!;

      if (!seenCodes.add(code.toLowerCase())) {
        issues.add(
          ImportIssue(line: line, message: 'Matricule en double : $code.'),
        );
        continue;
      }
      if (!seenTokens.add(token)) {
        issues.add(
          ImportIssue(
            line: line,
            message: 'Badge en double : ce token est déjà utilisé.',
          ),
        );
        continue;
      }

      rows.add(
        StudentImportRow(
          line: line,
          studentCode: code,
          qrToken: token,
          studentUuid: _nullIfEmpty(values['uuid']),
          firstName: (values['first'] ?? '').trim(),
          lastName: (values['last'] ?? '').trim(),
          classId: _nullIfEmpty(values['class_id']),
          className: (values['class_name'] ?? '').trim(),
          isActive: _parseBool(values['active'], fallback: true),
          badgeRevoked: _parseBool(values['revoked'], fallback: false),
          photoFile: _nullIfEmpty(values['photo']),
        ),
      );
    }

    return ImportPreview(
      rows: rows,
      issues: issues,
      totalRows: source.length,
    );
  }

  /// Applique l'aperçu dans une transaction unique.
  Future<ImportResult> apply(ImportPreview preview) async {
    if (preview.rows.isEmpty) {
      return ImportResult(
        inserted: 0,
        updated: 0,
        rejected: preview.issues.length,
        issues: preview.issues,
      );
    }

    var inserted = 0;
    var updated = 0;
    final issues = <ImportIssue>[...preview.issues];

    try {
      await _db.transaction(() async {
        final existing = await _students.listStudents(limit: _maxAccepted);
        final byCode = <String, Student>{
          for (final student in existing)
            student.studentCode.toLowerCase().trim(): student,
        };
        final byToken = <String, Student>{
          for (final student in existing) student.qrToken: student,
        };
        final now = _clock.now().toUtc();
        final companions = <StudentsCompanion>[];

        for (final row in preview.rows) {
          final match =
              byCode[row.studentCode.toLowerCase()] ?? byToken[row.qrToken];

          if (match != null) {
            updated++;
            companions.add(
              StudentsCompanion(
                id: Value(match.id),
                studentUuid: Value(row.studentUuid ?? match.studentUuid),
                studentCode: Value(row.studentCode),
                firstName: Value(
                  row.firstName.isEmpty ? match.firstName : row.firstName,
                ),
                lastName: Value(
                  row.lastName.isEmpty ? match.lastName : row.lastName,
                ),
                classId: Value(row.classId ?? match.classId),
                className: Value(
                  row.className.isEmpty ? match.className : row.className,
                ),
                qrToken: Value(row.qrToken),
                isActive: Value(row.isActive),
                badgeRevoked: Value(row.badgeRevoked),
                updatedAt: Value(now),
              ),
            );
          } else {
            inserted++;
            companions.add(
              StudentsCompanion.insert(
                id: _uuid.v4(),
                studentUuid: Value(row.studentUuid),
                studentCode: row.studentCode,
                firstName: Value(row.firstName),
                lastName: Value(row.lastName),
                classId: Value(row.classId),
                className: Value(row.className),
                qrToken: row.qrToken,
                isActive: Value(row.isActive),
                badgeRevoked: Value(row.badgeRevoked),
                updatedAt: now,
              ),
            );
          }
        }

        await _students.upsertStudents(companions);
      });
    } catch (error) {
      // Aucune écriture partielle : la transaction a été annulée.
      return ImportResult(
        inserted: 0,
        updated: 0,
        rejected: preview.rows.length + preview.issues.length,
        issues: [
          ...issues,
          ImportIssue(
            line: 0,
            message: 'Import annulé (aucune donnée modifiée) : $error',
          ),
        ],
      );
    }

    return ImportResult(
      inserted: inserted,
      updated: updated,
      rejected: issues.length,
      issues: issues,
    );
  }

  static String? _nullIfEmpty(String? value) {
    final trimmed = value?.trim();
    return (trimmed == null || trimmed.isEmpty) ? null : trimmed;
  }

  static bool _parseBool(String? value, {required bool fallback}) {
    if (value == null) return fallback;
    final normalized = value.trim().toLowerCase();
    if (['1', 'true', 'oui', 'yes', 'actif', 'active'].contains(normalized)) {
      return true;
    }
    if (['0', 'false', 'non', 'no', 'inactif', 'inactive'].contains(normalized)) {
      return false;
    }
    return fallback;
  }
}
