import 'dart:convert';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../core/widgets/list_tiles.dart';
import '../data/student_import_service.dart';

/// Import local des élèves (CSV / JSON) + photos, sans Internet.
class ImportScreen extends ConsumerStatefulWidget {
  const ImportScreen({super.key});

  @override
  ConsumerState<ImportScreen> createState() => _ImportScreenState();
}

class _ImportScreenState extends ConsumerState<ImportScreen> {
  ImportPreview _preview = ImportPreview.empty;
  ImportResult? _result;
  String? _fileName;
  bool _busy = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Importer les élèves'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: '1. Choisir le fichier',
                  subtitle: 'CSV ou JSON — aucun envoi vers Internet',
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    icon: const Icon(Icons.attach_file_rounded, size: 18),
                    label: Text(_fileName ?? 'Choisir un fichier'),
                    onPressed: _busy ? null : _pickFile,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Colonnes minimales : student_code (matricule) et '
                  'qr_token (badge). Voir docs/IMPORT_FORMAT.md.',
                  style: theme.textTheme.bodySmall,
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.photo_library_rounded, size: 18),
                    label: const Text('Associer un dossier de photos'),
                    onPressed: _busy ? null : _pickPhotoFolder,
                  ),
                ),
              ],
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            AppCard(
              background: AppColors.dangerSoft,
              child: Text(
                _error!,
                style: const TextStyle(
                  color: AppColors.danger,
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5,
                ),
              ),
            ),
          ],
          if (_result != null) ...[
            const SizedBox(height: 12),
            AppCard(
              background: AppColors.successSoft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'IMPORT TERMINÉ',
                    style: TextStyle(
                      color: AppColors.success,
                      fontWeight: FontWeight.w900,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  InfoLine(label: 'Nouveaux élèves', value: '${_result!.inserted}'),
                  InfoLine(label: 'Mis à jour', value: '${_result!.updated}'),
                  InfoLine(label: 'Lignes rejetées', value: '${_result!.rejected}'),
                ],
              ),
            ),
          ],
          if (_preview.totalRows > 0) ...[
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SectionTitle(
                    title: '2. Aperçu',
                    subtitle: '${_preview.rows.length} ligne(s) valide(s) sur '
                        '${_preview.totalRows}',
                  ),
                  const SizedBox(height: 8),
                  InfoLine(
                    label: 'Lignes valides',
                    value: '${_preview.rows.length}',
                  ),
                  InfoLine(
                    label: 'Lignes rejetées',
                    value: '${_preview.issues.length}',
                  ),
                  if (_preview.issues.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      constraints: const BoxConstraints(maxHeight: 140),
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            for (final issue in _preview.issues.take(40))
                              Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Text(
                                  '• Ligne ${issue.line} : ${issue.message}',
                                  style: const TextStyle(
                                    fontSize: 11.5,
                                    color: AppColors.danger,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  if (_preview.rows.isNotEmpty) ...[
                    const Divider(height: 20),
                    Container(
                      constraints: const BoxConstraints(maxHeight: 170),
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            for (final row in _preview.rows.take(30))
                              Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        row.displayName,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      '${row.studentCode} · ${row.className}',
                                      style: theme.textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _busy || _preview.rows.isEmpty ? null : _apply,
              icon: _busy
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.download_done_rounded, size: 18),
              label: const Text('Importer maintenant'),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _pickFile() async {
    setState(() {
      _error = null;
      _result = null;
    });

    try {
      final picked = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: const ['csv', 'json'],
        withData: true,
      );
      if (picked == null || picked.files.isEmpty) return;

      final file = picked.files.single;
      final content = file.bytes != null
          ? utf8.decode(file.bytes!, allowMalformed: true)
          : await File(file.path!).readAsString();

      final preview = ref
          .read(importServiceProvider)
          .preview(content, fileName: file.name);

      if (!mounted) return;
      setState(() {
        _fileName = file.name;
        _preview = preview;
        _result = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = 'Lecture du fichier impossible : $error');
    }
  }

  Future<void> _apply() async {
    setState(() => _busy = true);
    final result = await ref.read(importServiceProvider).apply(_preview);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _result = result;
      _preview = ImportPreview.empty;
      _fileName = null;
    });
  }

  Future<void> _pickPhotoFolder() async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final path = await FilePicker.getDirectoryPath();
      if (path == null) return;
      final count = await ref
          .read(studentPhotoServiceProvider)
          .importFolder(Directory(path));
      messenger.showSnackBar(
        SnackBar(content: Text('$count photo(s) associée(s) aux élèves.')),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text('Import des photos impossible : $error')),
      );
    }
  }
}


