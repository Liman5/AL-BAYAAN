import 'package:drift/drift.dart' show Value;
import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/sync/sync_models.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../core/widgets/list_tiles.dart';

/// Carte de connexion du terminal à AL-BAYAAN.
///
/// - Non appairé : saisie de l'adresse du serveur et du code
///   d'appairage fourni par l'administrateur.
/// - Appairé : identité du terminal, dernière synchronisation,
///   synchronisation manuelle et dissociation.
///
/// Le token d'appareil reste dans le Keystore Android : il n'est
/// jamais affiché, ni journalisé, ni exporté.
class TerminalConnectionCard extends ConsumerStatefulWidget {
  const TerminalConnectionCard({super.key});

  @override
  ConsumerState<TerminalConnectionCard> createState() =>
      _TerminalConnectionCardState();
}

class _TerminalConnectionCardState
    extends ConsumerState<TerminalConnectionCard> {
  late final TextEditingController _baseUrl = TextEditingController();
  final TextEditingController _pairingCode = TextEditingController();

  bool _prefilled = false;
  bool _pairing = false;
  bool _syncing = false;
  String? _message;
  bool _messageIsError = false;

  @override
  void dispose() {
    _baseUrl.dispose();
    _pairingCode.dispose();
    super.dispose();
  }

  void _notify(String message, {bool isError = false}) {
    if (!mounted) return;
    setState(() {
      _message = message;
      _messageIsError = isError;
    });
  }

  Future<void> _pair() async {
    if (_pairing) return;
    setState(() {
      _pairing = true;
      _message = null;
    });

    try {
      final service = ref.read(provisioningServiceProvider);
      final result = await service.pair(
        baseUrl: _baseUrl.text,
        pairingCode: _pairingCode.text,
        deviceModel: 'Android',
      );

      if (!result.ok || result.credentials == null) {
        _notify(result.message ?? 'Appairage impossible.', isError: true);
        return;
      }

      final credentials = result.credentials!;
      final settingsRepository = ref.read(settingsRepositoryProvider);
      final current = await settingsRepository.current();

      // Le terminal appairé autorise la synchronisation ; le scan reste
      // évidemment possible sans réseau.
      await settingsRepository.save(
        current.copyWith(
          apiEnabled: true,
          offlineMode: false,
          apiBaseUrl: Value(credentials.baseUrl),
          schoolName: credentials.schoolName ?? current.schoolName,
          schoolId: Value(credentials.schoolId),
          terminalDisplayName:
              credentials.terminalName ?? current.terminalDisplayName,
        ),
      );

      ref.read(terminalCredentialsProvider.notifier).state = credentials;
      _pairingCode.clear();
      _notify('Terminal appairé. Chargement des élèves…');

      await _runSync();
    } catch (error) {
      _notify('Appairage impossible : $error', isError: true);
    } finally {
      if (mounted) setState(() => _pairing = false);
    }
  }

  Future<void> _runSync() async {
    if (_syncing) return;
    setState(() {
      _syncing = true;
      _message = null;
    });

    try {
      final service = ref.read(syncServiceProvider);
      final result = await service.run();
      _notify(
        result.message,
        isError: result.state == SyncState.failure,
      );
    } catch (error) {
      _notify('Synchronisation impossible : $error', isError: true);
    } finally {
      if (mounted) setState(() => _syncing = false);
    }
  }

  Future<void> _unlink() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Dissocier ce terminal ?'),
        content: const Text(
          'Le terminal ne pourra plus synchroniser les présences. '
          'Les présences déjà enregistrées localement sont conservées. '
          'Pour le réappairer, un nouveau code sera nécessaire dans AL-BAYAAN.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Dissocier'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    await ref.read(provisioningServiceProvider).signOut();
    final settingsRepository = ref.read(settingsRepositoryProvider);
    final current = await settingsRepository.current();
    await settingsRepository.save(
      current.copyWith(apiEnabled: false, offlineMode: true),
    );
    ref.read(terminalCredentialsProvider.notifier).state = null;
    _notify('Terminal dissocié. Le scan continue de fonctionner hors ligne.');
  }

  @override
  Widget build(BuildContext context) {
    final credentials = ref.watch(terminalCredentialsProvider);
    final settings = ref.watch(settingsProvider).valueOrNull;
    final pending = ref.watch(pendingSyncProvider).valueOrNull ?? 0;
    final studentCount = ref.watch(studentCountProvider).valueOrNull ?? 0;

    if (!_prefilled && settings != null) {
      _prefilled = true;
      final stored = settings.apiBaseUrl;
      if (stored != null && stored.isNotEmpty) {
        _baseUrl.text = stored;
      }
    }

    final paired = credentials != null && credentials.isComplete;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: paired
                      ? AppColors.success.withValues(alpha: 0.12)
                      : AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  paired ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
                  size: 19,
                  color: paired ? AppColors.success : AppColors.textMuted,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Connexion à AL-BAYAAN',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      paired
                          ? 'Terminal autorisé par la plateforme'
                          : 'Le scan fonctionne sans connexion',
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),


          if (paired) ...[
            InfoLine(
              label: 'Terminal',
              value: credentials.terminalName ?? settings?.terminalDisplayName ?? '—',
            ),
            InfoLine(
              label: 'Établissement',
              value: credentials.schoolName ?? settings?.schoolName ?? '—',
            ),
            InfoLine(label: 'Élèves disponibles hors ligne', value: '$studentCount'),
            InfoLine(label: 'Présences en attente', value: '$pending'),
            InfoLine(
              label: 'Dernière synchronisation',
              value: settings?.lastStudentSync == null
                  ? 'Jamais'
                  : _formatDateTime(settings!.lastStudentSync!),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _syncing ? null : _runSync,
                icon: _syncing
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.sync_rounded, size: 18),
                label: Text(
                  _syncing ? 'Synchronisation…' : 'Synchroniser maintenant',
                ),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _syncing ? null : _unlink,
                icon: const Icon(Icons.link_off_rounded, size: 18),
                label: const Text('Dissocier ce terminal'),
              ),
            ),
          ] else ...[
            TextField(
              controller: _baseUrl,
              keyboardType: TextInputType.url,
              decoration: const InputDecoration(
                labelText: 'Adresse de la plateforme',
                hintText: 'https://votre-plateforme.com',
                helperText: 'Adresse fournie par l’administrateur AL-BAYAAN.',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _pairingCode,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(
                labelText: 'Code d’appairage',
                hintText: 'XXXXXXXX',
                helperText: 'Généré dans AL-BAYAAN → Terminaux scanners.',
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _pairing ? null : _pair,
                icon: _pairing
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.link_rounded, size: 18),
                label: Text(_pairing ? 'Appairage…' : 'Appairer le terminal'),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Sans appairage, le terminal reste pleinement utilisable : '
              'les présences sont enregistrées localement et pourront être '
              'synchronisées plus tard.',
              style: TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],

          if (_message != null) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: (_messageIsError ? AppColors.danger : AppColors.success)
                    .withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                _message!,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: _messageIsError ? AppColors.danger : AppColors.success,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDateTime(DateTime value) {
    final local = value.toLocal();
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(local.day)}/${two(local.month)}/${local.year} '
        '${two(local.hour)}:${two(local.minute)}';
  }
}

