import 'package:drift/drift.dart' as drift;
import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/config/app_config.dart';
import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/database/app_database.dart';
import '../../../core/utils/app_time.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../core/widgets/list_tiles.dart';
import '../../sync/presentation/terminal_connection_card.dart';

/// Paramètres du terminal (réservés à l'administrateur).
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final TextEditingController _schoolName = TextEditingController();
  final TextEditingController _terminalName = TextEditingController();
  final TextEditingController _apiBaseUrl = TextEditingController();

  TerminalSettings? _draft;
  bool _controllersReady = false;
  bool _saving = false;

  @override
  void dispose() {
    _schoolName.dispose();
    _terminalName.dispose();
    _apiBaseUrl.dispose();
    super.dispose();
  }

  void _ensureControllers(TerminalSettings settings) {
    if (_controllersReady) return;
    _controllersReady = true;
    _schoolName.text = settings.schoolName;
    _terminalName.text = settings.terminalDisplayName;
    _apiBaseUrl.text = settings.apiBaseUrl ?? '';
  }

  @override
  Widget build(BuildContext context) {
    final streamed = ref.watch(settingsProvider).valueOrNull;
    final settings = _draft ?? streamed;

    if (settings == null) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => context.pop(),
          ),
          title: const Text('Paramètres'),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    _ensureControllers(settings);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Paramètres du terminal'),
        actions: [
          TextButton(
            onPressed: _saving ? null : () => _save(settings),
            child: const Text('Enregistrer'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(title: 'Établissement'),
                const SizedBox(height: 12),
                TextField(
                  controller: _schoolName,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    labelText: 'Nom de l’établissement',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _terminalName,
                  decoration: const InputDecoration(
                    labelText: 'Nom du terminal',
                    helperText: 'Ex. « Entrée principale »',
                  ),
                ),
                const SizedBox(height: 10),
                InfoLine(
                  label: 'Identifiant terminal',
                  value: settings.terminalId,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: 'Horaires de présence',
                  subtitle: 'Le statut « en retard » est calculé localement',
                ),
                const SizedBox(height: 8),
                TimeField(
                  label: 'Ouverture',
                  value: settings.attendanceStartTime,
                  onChanged: (value) => _update(
                    settings.copyWith(attendanceStartTime: value),
                  ),
                ),
                TimeField(
                  label: 'Heure limite (retard après)',
                  value: settings.lateAfterTime,
                  onChanged: (value) => _update(
                    settings.copyWith(lateAfterTime: value),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Fuseau horaire appliqué : ${settings.timezone}. '
                  'L’appareil doit être réglé sur l’heure locale de l’école.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: 'Scanner & feedback',
                  subtitle: 'Confort d’utilisation du terminal',
                ),
                const SizedBox(height: 8),
                Text(
                  'Durée de confirmation : '
                  '${(settings.autoResetMillis / 1000).toStringAsFixed(1)} s',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                Slider(
                  value: settings.autoResetMillis
                      .toDouble()
                      .clamp(
                        AppConfig.minAutoResetMillis.toDouble(),
                        AppConfig.maxAutoResetMillis.toDouble(),
                      )
                      .toDouble(),
                  min: AppConfig.minAutoResetMillis.toDouble(),
                  max: AppConfig.maxAutoResetMillis.toDouble(),
                  divisions: 14,
                  label:
                      '${(settings.autoResetMillis / 1000).toStringAsFixed(1)} s',
                  onChanged: (value) => _update(
                    settings.copyWith(autoResetMillis: value.round()),
                  ),
                ),
                SwitchRow(
                  label: 'Son de validation',
                  value: settings.soundEnabled,
                  onChanged: (value) =>
                      _update(settings.copyWith(soundEnabled: value)),
                ),
                SwitchRow(
                  label: 'Vibration',
                  value: settings.hapticsEnabled,
                  onChanged: (value) =>
                      _update(settings.copyWith(hapticsEnabled: value)),
                ),
                SwitchRow(
                  label: 'Animations',
                  value: settings.animationsEnabled,
                  onChanged: (value) =>
                      _update(settings.copyWith(animationsEnabled: value)),
                ),
                SwitchRow(
                  label: 'Garder l’écran allumé',
                  value: settings.keepScreenOn,
                  onChanged: (value) =>
                      _update(settings.copyWith(keepScreenOn: value)),
                ),
                SwitchRow(
                  label: 'Mode hors ligne volontaire',
                  value: settings.offlineMode,
                  onChanged: (value) =>
                      _update(settings.copyWith(offlineMode: value)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: 'Retour vocal',
                  subtitle:
                      'Phrases prononcées par le terminal (synthèse vocale, hors ligne)',
                ),
                const SizedBox(height: 8),
                SwitchRow(
                  label: 'Activer la voix',
                  value: settings.voiceEnabled,
                  onChanged: (value) =>
                      _update(settings.copyWith(voiceEnabled: value)),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  key: const ValueKey('voice-success'),
                  enabled: settings.voiceEnabled,
                  decoration: const InputDecoration(
                    labelText: 'Scan accepté (à l’heure)',
                    helperText: 'Ex. « Présence enregistrée »',
                  ),
                  initialValue: settings.voiceSuccess,
                  onChanged: (value) =>
                      _update(settings.copyWith(voiceSuccess: value)),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  key: const ValueKey('voice-late'),
                  enabled: settings.voiceEnabled,
                  decoration: const InputDecoration(
                    labelText: 'Scan accepté en retard',
                    helperText: 'Ex. « En retard »',
                  ),
                  initialValue: settings.voiceLate,
                  onChanged: (value) =>
                      _update(settings.copyWith(voiceLate: value)),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  key: const ValueKey('voice-duplicate'),
                  enabled: settings.voiceEnabled,
                  decoration: const InputDecoration(
                    labelText: 'Déjà scanné aujourd’hui',
                    helperText: 'Ex. « Déjà enregistré »',
                  ),
                  initialValue: settings.voiceDuplicate,
                  onChanged: (value) =>
                      _update(settings.copyWith(voiceDuplicate: value)),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  key: const ValueKey('voice-refused'),
                  enabled: settings.voiceEnabled,
                  decoration: const InputDecoration(
                    labelText: 'Scan refusé',
                    helperText: 'Ex. « Accès refusé »',
                  ),
                  initialValue: settings.voiceRefused,
                  onChanged: (value) =>
                      _update(settings.copyWith(voiceRefused: value)),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.volume_up_rounded, size: 18),
                    label: const Text('Tester la voix'),
                    onPressed: () => ref
                        .read(voiceFeedbackProvider)
                        .speakText(settings.voiceSuccess),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: 'Données & rétention',
                  subtitle: 'Les scans non synchronisés ne sont jamais purgés',
                ),
                const SizedBox(height: 8),
                InfoLine(
                  label: 'Conservation des journaux',
                  value: '${settings.retentionDays} jours',
                ),
                Slider(
                  value: settings.retentionDays.toDouble().clamp(30, 730).toDouble(),
                  min: 30,
                  max: 730,
                  divisions: 14,
                  label: '${settings.retentionDays} j',
                  onChanged: (value) => _update(
                    settings.copyWith(retentionDays: value.round()),
                  ),
                ),
                const SizedBox(height: 4),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.download_rounded, size: 18),
                    label: const Text('Exporter tout l’historique (CSV)'),
                    onPressed: _exportAll,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextButton.icon(
                    icon: const Icon(Icons.cleaning_services_rounded, size: 18),
                    label: const Text('Purger les journaux et scans anciens'),
                    onPressed: () => _purge(context, settings),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const TerminalConnectionCard(),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: 'Sécurité',
                  subtitle: 'Code PIN de l’espace administration',
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.lock_reset_rounded, size: 18),
                    label: const Text('Modifier le code administrateur'),
                    onPressed: () => _changePin(context),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionTitle(title: 'À propos'),
                SizedBox(height: 8),
                InfoLine(
                  label: 'Version',
                  value: '${AppConfig.appName} ${AppConfig.appVersion}',
                ),
                InfoLine(
                  label: 'Fuseau',
                  value: AppConfig.defaultTimezone,
                ),
                InfoLine(
                  label: 'Stockage',
                  value: 'SQLite local (Drift)',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _update(TerminalSettings value) {
    setState(() => _draft = value);
  }

  Future<void> _save(TerminalSettings settings) async {
    setState(() => _saving = true);
    final messenger = ScaffoldMessenger.of(context);
    final schoolName = _schoolName.text.trim();
    final terminalName = _terminalName.text.trim();
    final baseUrl = _apiBaseUrl.text.trim();

    final updated = settings.copyWith(
      schoolName: schoolName.isEmpty ? settings.schoolName : schoolName,
      terminalDisplayName:
          terminalName.isEmpty ? settings.terminalDisplayName : terminalName,
      apiBaseUrl: baseUrl.isEmpty ? const drift.Value<String?>(null) : drift.Value(baseUrl),
    );

    try {
      await ref.read(settingsRepositoryProvider).save(updated);
      if (!mounted) return;
      setState(() {
        _draft = null;
        _saving = false;
      });
      messenger.showSnackBar(
        const SnackBar(content: Text('Paramètres enregistrés.')),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => _saving = false);
      messenger.showSnackBar(
        SnackBar(content: Text('Enregistrement impossible : $error')),
      );
    }
  }

  Future<void> _exportAll() async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final file = await ref.read(historyExporterProvider).exportAll();
      messenger.showSnackBar(
        SnackBar(content: Text('Export CSV : ${file.path}')),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text('Export impossible : $error')),
      );
    }
  }

  Future<void> _purge(BuildContext context, TerminalSettings settings) async {
    final messenger = ScaffoldMessenger.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Purger les données anciennes ?'),
        content: const Text(
          'Les journaux techniques plus anciens que la durée de rétention '
          'seront supprimés, ainsi que les présences déjà synchronisées. '
          'Les scans en attente de synchronisation sont conservés.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Purger'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    final limit = DateTime.now()
        .toUtc()
        .subtract(Duration(days: settings.retentionDays));
    final logs = await ref
        .read(logRepositoryProvider)
        .purgeOlderThan(settings.retentionDays);
    final records = await ref
        .read(attendanceRepositoryProvider)
        .deleteSyncedOlderThan(limit);

    messenger.showSnackBar(
      SnackBar(
        content: Text('$logs journal(aux) et $records présence(s) purgés.'),
      ),
    );
  }

  Future<void> _changePin(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Modifier le code administrateur ?'),
        content: const Text(
          'Le code actuel sera supprimé. Vous serez invité à en définir un '
          'nouveau en revenant sur l’espace administration.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Continuer'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await ref.read(pinServiceProvider).clear();
    if (!context.mounted) return;
    context.go('/admin');
  }
}

/// Ligne de réglage booléen (libellé + interrupteur).
class SwitchRow extends StatelessWidget {
  const SwitchRow({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return SwitchListTile.adaptive(
      contentPadding: EdgeInsets.zero,
      dense: true,
      title: Text(label, style: Theme.of(context).textTheme.bodyLarge),
      value: value,
      onChanged: onChanged,
    );
  }
}

/// Champ d'heure `HH:mm` avec sélecteur natif.
class TimeField extends StatelessWidget {
  const TimeField({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.bodyLarge),
          ),
          OutlinedButton(
            onPressed: () async {
              final minutes = AppTime.parseHhMm(value) ?? 7 * 60;
              final picked = await showTimePicker(
                context: context,
                initialTime: TimeOfDay(
                  hour: minutes ~/ 60,
                  minute: minutes % 60,
                ),
                helpText: label,
              );
              if (picked == null) return;
              onChanged(AppTime.formatMinutes(picked.hour * 60 + picked.minute));
            },
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}


