import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/config/app_config.dart';
import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/sync/sync_models.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../core/widgets/list_tiles.dart';

/// Sommaire de l'espace administration (accès protégé par PIN).
class AdminHomeScreen extends ConsumerWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          tooltip: 'Quitter l’administration',
          onPressed: () => context.go('/'),
        ),
        title: const Text('Administration'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          AppCard(
            background: AppColors.navy,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.shield_rounded, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'SESSION ADMINISTRATEUR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  'Toutes les opérations restent locales. Aucune donnée '
                  'n’est envoyée sans configuration explicite.',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.75),
                    fontSize: 12.5,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.navy,
                    ),
                    onPressed: () => context.go('/'),
                    icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
                    label: const Text('Retour au scanner'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          AdminActionTile(
            icon: Icons.insights_rounded,
            title: 'Journée en cours',
            subtitle: 'Présences, retards, classes et état du terminal',
            onTap: () => context.push('/dashboard'),
          ),
          AdminActionTile(
            icon: Icons.history_rounded,
            title: 'Historique & export',
            subtitle: 'Rechercher, filtrer et exporter en CSV',
            onTap: () => context.push('/history'),
          ),
          AdminActionTile(
            icon: Icons.file_upload_rounded,
            title: 'Importer les élèves',
            subtitle: 'CSV ou JSON + photos, sans Internet',
            onTap: () => context.push('/admin/import'),
          ),
          AdminActionTile(
            icon: Icons.settings_rounded,
            title: 'Paramètres du terminal',
            subtitle: 'Horaires, feedback, PIN, rétention, API',
            onTap: () => context.push('/admin/settings'),
          ),
          AdminActionTile(
            icon: Icons.sync_rounded,
            title: 'Synchronisation',
            subtitle: 'État de la file d’attente locale',
            onTap: () => _showSyncInfo(context, ref),
          ),
          const SizedBox(height: 6),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: 'Données de démonstration',
                  subtitle:
                      'Élèves fictifs marqués « démo », supprimables en un geste',
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.playlist_add_rounded, size: 18),
                        label: const Text('Charger'),
                        onPressed: () => _seedDemo(context, ref),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextButton.icon(
                        icon: const Icon(Icons.delete_outline_rounded, size: 18),
                        label: const Text('Supprimer'),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.danger,
                        ),
                        onPressed: () => _clearDemo(context, ref),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionTitle(title: 'À propos'),
                SizedBox(height: 8),
                InfoLine(
                  label: 'Application',
                  value: '${AppConfig.appName} ${AppConfig.appVersion}',
                ),
                InfoLine(
                  label: 'Identifiant Android',
                  value: AppConfig.androidApplicationId,
                ),
                InfoLine(
                  label: 'Mode de fonctionnement',
                  value: 'Hors ligne (source de vérité : SQLite)',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _seedDemo(BuildContext context, WidgetRef ref) async {
    final messenger = ScaffoldMessenger.of(context);
    final count = await ref.read(demoSeederProvider).seed();
    messenger.showSnackBar(
      SnackBar(content: Text('$count élève(s) de démonstration chargé(s).')),
    );
  }

  Future<void> _clearDemo(BuildContext context, WidgetRef ref) async {
    final messenger = ScaffoldMessenger.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Supprimer les données de démonstration ?'),
        content: const Text(
          'Seuls les élèves marqués « démo » seront supprimés. '
          'Les élèves importés et les présences sont conservés.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    final removed = await ref.read(demoSeederProvider).clear();
    messenger.showSnackBar(
      SnackBar(content: Text('$removed élève(s) de démonstration supprimé(s).')),
    );
  }

  Future<void> _showSyncInfo(BuildContext context, WidgetRef ref) async {
    final result = await ref.read(syncServiceProvider).run();
    if (!context.mounted) return;
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Synchronisation'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(result.message),
            const SizedBox(height: 10),
            if (result.state == SyncState.success)
              Text('Envoyés : ${result.pushed} · Reçus : ${result.pulled}'),
            const SizedBox(height: 10),
            Text(
              'La synchronisation reste désactivée tant que l’URL et les '
              'points d’accès de la plateforme ne sont pas renseignés. '
              'Aucune donnée n’est perdue : tout reste dans la file locale.',
              style: Theme.of(dialogContext).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Fermer'),
          ),
        ],
      ),
    );
  }
}

