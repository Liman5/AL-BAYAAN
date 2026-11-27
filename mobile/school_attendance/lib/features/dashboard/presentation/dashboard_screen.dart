import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/utils/app_time.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../shared/models/view_models.dart';

/// Mini-dashboard local : toutes les données proviennent de SQLite.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final counts =
        ref.watch(todayCountsProvider).valueOrNull ?? DayAttendanceCounts.empty;
    final students = ref.watch(studentCountProvider).valueOrNull ?? 0;
    final pending = ref.watch(pendingSyncProvider).valueOrNull ?? 0;
    final settings = ref.watch(settingsProvider).valueOrNull;
    final classStats = ref.watch(classStatsProvider);
    final recent = ref.watch(recentAttendanceProvider);
    final storage = ref.watch(storageSnapshotProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Journée en cours'),
        actions: [
          IconButton(
            tooltip: 'Actualiser',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => _refresh(ref),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _refresh(ref),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Text(
              AppTime.longDate(DateTime.now()),
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.5,
              children: [
                StatTile(
                  label: 'Élèves sur le terminal',
                  value: '$students',
                  icon: Icons.groups_rounded,
                  color: AppColors.blue,
                ),
                StatTile(
                  label: 'Présents aujourd’hui',
                  value: '${counts.present}',
                  icon: Icons.how_to_reg_rounded,
                  color: AppColors.success,
                ),
                StatTile(
                  label: 'Retards',
                  value: '${counts.late}',
                  icon: Icons.schedule_rounded,
                  color: AppColors.warning,
                ),
                StatTile(
                  label: 'En attente de synchro',
                  value: '$pending',
                  icon: Icons.cloud_sync_rounded,
                  color: AppColors.textSecondary,
                ),
              ],
            ),
            const SizedBox(height: 16),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    title: 'État du terminal',
                    subtitle: 'Fonctionnement local, sans Internet',
                  ),
                  const SizedBox(height: 12),
                  InfoRow(
                    label: 'Terminal',
                    value: settings?.terminalDisplayName ?? '—',
                  ),
                  InfoRow(
                    label: 'Identifiant',
                    value: _shortId(settings?.terminalId),
                  ),
                  InfoRow(
                    label: 'Mode hors ligne',
                    value: (settings?.offlineMode ?? true)
                        ? 'Activé'
                        : 'Désactivé',
                  ),
                  InfoRow(
                    label: 'Synchro élèves',
                    value: settings?.lastStudentSync == null
                        ? 'Jamais (import local)'
                        : AppTime.shortDateTime(
                            settings!.lastStudentSync!.toLocal(),
                          ),
                  ),
                  InfoRow(
                    label: 'Synchro présences',
                    value: settings?.lastAttendanceSync == null
                        ? 'Jamais'
                        : AppTime.shortDateTime(
                            settings!.lastAttendanceSync!.toLocal(),
                          ),
                  ),
                  storage.when(
                    data: (snapshot) => InfoRow(
                      label: 'Base locale',
                      value: '${formatBytes(snapshot.databaseBytes)} · '
                          '${snapshot.attendanceCount} présence(s)',
                    ),
                    loading: () => const InfoRow(
                      label: 'Base locale',
                      value: 'Calcul…',
                    ),
                    error: (_, __) =>
                        const InfoRow(label: 'Base locale', value: '—'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle(
                    title: 'Répartition par classe',
                    subtitle: 'Présences enregistrées aujourd’hui',
                  ),
                  const SizedBox(height: 10),
                  classStats.when(
                    data: (stats) {
                      if (stats.isEmpty) {
                        return const EmptyState(
                          icon: Icons.class_rounded,
                          title: 'Aucune présence aujourd’hui',
                        );
                      }
                      return Column(
                        children: [
                          for (final stat in stats) ...[
                            ClassRow(stat: stat),
                            const SizedBox(height: 8),
                          ],
                        ],
                      );
                    },
                    loading: () => const Padding(
                      padding: EdgeInsets.all(12),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    error: (_, __) =>
                        const Text('Statistiques indisponibles.'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SectionTitle(
                    title: 'Dernières présences',
                    subtitle: 'Les 8 événements les plus récents',
                    trailing: TextButton(
                      onPressed: () => context.push('/history'),
                      child: const Text('Historique'),
                    ),
                  ),
                  recent.when(
                    data: (entries) {
                      if (entries.isEmpty) {
                        return const EmptyState(
                          icon: Icons.history_rounded,
                          title: 'Aucune présence enregistrée',
                          message: 'Les scans apparaîtront ici.',
                        );
                      }
                      return Column(
                        children: [
                          for (final entry in entries)
                            ListTile(
                              dense: true,
                              contentPadding: EdgeInsets.zero,
                              leading: StatusBadge(
                                label: entry.isLate ? 'RETARD' : 'PRÉSENT',
                                tone: entry.isLate
                                    ? StatusTone.warning
                                    : StatusTone.success,
                                dense: true,
                              ),
                              title: Text(
                                entry.studentName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              subtitle: Text(
                                '${entry.record.className} · '
                                '${AppTime.formatMinutes(entry.record.localMinutes)}',
                              ),
                              trailing: Icon(
                                entry.isSynced
                                    ? Icons.cloud_done_rounded
                                    : Icons.cloud_off_rounded,
                                size: 18,
                                color: entry.isSynced
                                    ? AppColors.success
                                    : AppColors.textMuted,
                              ),
                            ),
                        ],
                      );
                    },
                    loading: () => const Padding(
                      padding: EdgeInsets.all(12),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    error: (_, __) => const Text('Historique indisponible.'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _refresh(WidgetRef ref) {
    ref.invalidate(classStatsProvider);
    ref.invalidate(recentAttendanceProvider);
    ref.invalidate(storageSnapshotProvider);
  }

  static String _shortId(String? value) {
    if (value == null || value.isEmpty) return '—';
    return value.length <= 12 ? value : '${value.substring(0, 8)}…';
  }
}

String formatBytes(int bytes) {
  if (bytes <= 0) return '0 Ko';
  if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(0)} Ko';
  return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} Mo';
}

class StatTile extends StatelessWidget {
  const StatTile({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.colorScheme.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
          Text(label, maxLines: 2, style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}

class InfoRow extends StatelessWidget {
  const InfoRow({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.bodySmall),
          ),
          const SizedBox(width: 10),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ClassRow extends StatelessWidget {
  const ClassRow({super.key, required this.stat});

  final ClassAttendanceStat stat;

  @override
  Widget build(BuildContext context) {
    final total = stat.total == 0 ? 1 : stat.total;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                stat.className,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Text(
              '${stat.total} · ${stat.late} retard(s)',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        const SizedBox(height: 5),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: stat.present / total,
            minHeight: 6,
            backgroundColor: AppColors.warningSoft,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.success),
          ),
        ),
      ],
    );
  }
}

