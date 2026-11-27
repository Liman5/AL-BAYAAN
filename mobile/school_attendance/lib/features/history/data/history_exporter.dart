import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../../app/config/app_config.dart';
import '../../../core/utils/app_time.dart';
import '../../../core/utils/csv_utils.dart';
import '../../../shared/models/view_models.dart';
import '../../attendance_scanner/data/attendance_repository.dart';

/// Export CSV local de l'historique (aucune connexion requise).
class HistoryExporter {
  HistoryExporter(this._attendance);

  final AttendanceRepository _attendance;

  Future<File> exportDay(DateTime day) async {
    final entries = await _attendance.dayEntries(day);
    return _write(entries, 'presences_${AppTime.dateKey(day)}');
  }

  Future<File> exportAll({int limit = 5000}) async {
    final entries = await _attendance.history(limit: limit);
    return _write(entries, 'presences_export_${AppTime.dateKey(DateTime.now())}');
  }

  Future<File> _write(List<AttendanceHistoryEntry> entries, String baseName) async {
    final rows = <List<String>>[
      <String>[
        'evenement_id',
        'date_locale',
        'heure_arrivee',
        'horodatage_utc',
        'statut',
        'matricule',
        'nom_complet',
        'classe',
        'terminal',
        'source',
        'sync_status',
        'serveur_id',
      ],
      for (final entry in entries)
        <String>[
          entry.record.id,
          entry.record.localDate,
          AppTime.formatMinutes(entry.record.localMinutes),
          AppTime.isoUtc(entry.record.scannedAtUtc.toLocal()),
          entry.record.attendanceStatus,
          entry.record.studentCode,
          entry.studentName,
          entry.record.className,
          entry.record.terminalId,
          entry.record.source,
          entry.record.syncStatus,
          entry.record.serverRecordId ?? '',
        ],
    ];

    final csv = CsvUtils.encode(rows);
    final directory = await _exportDirectory();
    final stamp = DateTime.now().millisecondsSinceEpoch;
    final file = File(p.join(directory.path, '${baseName}_$stamp.csv'));
    // BOM UTF-8 pour une ouverture correcte dans Excel.
    await file.writeAsString('\uFEFF$csv', flush: true);
    return file;
  }

  Future<Directory> _exportDirectory() async {
    Directory? base;
    try {
      base = await getExternalStorageDirectory();
    } catch (_) {
      base = null;
    }
    base ??= await getApplicationDocumentsDirectory();
    final directory = Directory(p.join(base.path, AppConfig.exportFolder));
    if (!await directory.exists()) {
      await directory.create(recursive: true);
    }
    return directory;
  }
}
