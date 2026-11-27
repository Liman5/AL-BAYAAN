import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/utils/app_time.dart';
import '../../../core/widgets/app_widgets.dart';
import '../../../features/history/domain/history_filter.dart';
import '../../../shared/models/view_models.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _initialised = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialised) {
      _initialised = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ref.read(historyFilterProvider.notifier).state =
            HistoryFilter(day: DateTime.now());
      });
    }

    final filter = ref.watch(historyFilterProvider);
    final classes = ref.watch(classesProvider).valueOrNull ?? const [];
    final entries = ref.watch(historyProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        title: const Text('Historique des présences'),
        actions: [
          IconButton(
            tooltip: 'Exporter en CSV',
            icon: const Icon(Icons.download_rounded),
            onPressed: () => _export(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 8),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  textInputAction: TextInputAction.search,
                  decoration: InputDecoration(
                    hintText: 'Nom ou matricule',
                    prefixIcon: const Icon(Icons.search_rounded, size: 20),
                    suffixIcon: _searchController.text.isEmpty
                        ? null
                        : IconButton(
                            icon: const Icon(Icons.close_rounded, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              _setFilter(filter.copyWith(search: ''));
                            },
                          ),
                  ),
                  onChanged: (value) =>
                      _setFilter(filter.copyWith(search: value)),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ActionChip(
                        avatar: const Icon(Icons.event_rounded, size: 16),
                        label: Text(
                          filter.day == null
                              ? 'Choisir une date'
                              : AppTime.dateKey(filter.day!),
                        ),
                        onPressed: () => _pickDate(filter),
                      ),
                      const SizedBox(width: 8),
                      _statusChip(filter, '', 'Tous'),
                      const SizedBox(width: 6),
                      _statusChip(filter, 'present', 'Présents'),
                      const SizedBox(width: 6),
                      _statusChip(filter, 'late', 'Retards'),
                      if (classes.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        PopupMenuButton<String?>(
                          child: Chip(
                            avatar: const Icon(Icons.class_rounded, size: 16),
                            label: Text(
                              filter.classId == null
                                  ? 'Toutes classes'
                                  : classes
                                      .firstWhere(
                                        (c) => c.id == filter.classId,
                                        orElse: () => classes.first,
                                      )
                                      .name,
                            ),
                          ),
                          onSelected: (value) => _setFilter(
                            value == null
                                ? filter.copyWith(clearClass: true)
                                : filter.copyWith(classId: value),
                          ),
                          itemBuilder: (context) => [
                            const PopupMenuItem<String?>(
                              value: null,
                              child: Text('Toutes les classes'),
                            ),
                            for (final schoolClass in classes)
                              PopupMenuItem<String?>(
                                value: schoolClass.id,
                                child: Text(schoolClass.name),
                              ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(child: _buildList(filter, entries)),
        ],
      ),
    );
  }

  Widget _buildList(
    HistoryFilter filter,
    AsyncValue<List<AttendanceHistoryEntry>> entries,
  ) {
    if (filter.day == null) {
      return const Center(
        child: EmptyState(
          icon: Icons.event_available_rounded,
          title: 'Choisissez une date',
          message: 'L’historique affiche les présences d’une journée.',
        ),
      );
    }

    return entries.when(
      data: (items) {
        if (items.isEmpty) {
          return const Center(
            child: EmptyState(
              icon: Icons.search_off_rounded,
              title: 'Aucune présence trouvée',
              message: 'Modifiez les filtres ou choisissez une autre date.',
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, index) => HistoryTile(entry: items[index]),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Center(
        child: Text('Lecture de l’historique impossible.'),
      ),
    );
  }

  Future<void> _pickDate(HistoryFilter filter) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: filter.day ?? now,
      firstDate: DateTime(now.year - 3),
      lastDate: now,
      helpText: 'Journée à consulter',
    );
    if (picked != null) {
      _setFilter(filter.copyWith(day: picked));
    }
  }

  Future<void> _export(BuildContext context) async {
    final filter = ref.read(historyFilterProvider);
    final messenger = ScaffoldMessenger.of(context);
    try {
      final file = await ref
          .read(historyExporterProvider)
          .exportDay(filter.day ?? DateTime.now());
      messenger.showSnackBar(
        SnackBar(content: Text('Export CSV enregistré : ${file.path}')),
      );
    } catch (error) {
      messenger.showSnackBar(
        SnackBar(content: Text('Export impossible : $error')),
      );
    }
  }

  Widget _statusChip(HistoryFilter filter, String value, String label) {
    return ChoiceChip(
      label: Text(label),
      selected: filter.status == value,
      onSelected: (_) => _setFilter(filter.copyWith(status: value)),
    );
  }

  void _setFilter(HistoryFilter filter) {
    ref.read(historyFilterProvider.notifier).state = filter;
  }
}

/// Ligne d'historique : heure, élève, classe, statut et état de synchro.
class HistoryTile extends StatelessWidget {
  const HistoryTile({super.key, required this.entry});

  final AttendanceHistoryEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.outline),
      ),
      child: Row(
        children: [
          Container(
            width: 54,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: entry.isLate ? AppColors.warningSoft : AppColors.successSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Text(
                  AppTime.formatMinutes(entry.record.localMinutes),
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w900,
                    color: entry.isLate ? AppColors.warning : AppColors.success,
                  ),
                ),
                Text(
                  entry.record.localDate.substring(5),
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.studentName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${entry.record.studentCode} · ${entry.record.className}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          StatusBadge(
            label: entry.isLate ? 'RETARD' : 'PRÉSENT',
            tone: entry.isLate ? StatusTone.warning : StatusTone.success,
            dense: true,
          ),
          const SizedBox(width: 6),
          Icon(
            entry.isSynced ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
            size: 17,
            color: entry.isSynced ? AppColors.success : AppColors.textMuted,
          ),
        ],
      ),
    );
  }
}

