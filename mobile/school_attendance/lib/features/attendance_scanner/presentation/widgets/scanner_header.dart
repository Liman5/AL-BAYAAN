import 'dart:async';

import 'package:material_ui/material_ui.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/database/app_database.dart';
import '../../../../core/utils/app_time.dart';
import '../../../../core/widgets/app_widgets.dart';
import '../../../../shared/models/view_models.dart';

/// En-tête du terminal : identité, horloge, état réseau et compteurs du jour.
class ScannerHeader extends StatelessWidget {
  const ScannerHeader({
    super.key,
    required this.settings,
    required this.counts,
    required this.pendingSync,
    required this.isOnline,
    required this.isProcessing,
  });

  final TerminalSettings? settings;
  final DayAttendanceCounts counts;
  final int pendingSync;
  final bool isOnline;
  final bool isProcessing;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.navyDeep, AppColors.navy],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: SchoolIdentity(
                  schoolName: settings?.schoolName ?? 'Établissement',
                  subtitle: (settings?.terminalDisplayName ?? 'Terminal')
                      .toUpperCase(),
                  logoPath: settings?.schoolLogoLocalPath,
                  light: true,
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  StatusBadge(
                    label: isOnline ? 'CONNECTÉ' : 'HORS LIGNE',
                    tone: isOnline ? StatusTone.info : StatusTone.neutral,
                    icon: isOnline ? Icons.wifi_rounded : Icons.wifi_off_rounded,
                    dense: true,
                  ),
                  const SizedBox(height: 6),
                  StatusBadge(
                    label: pendingSync > 0
                        ? '$pendingSync EN ATTENTE'
                        : 'LOCAL À JOUR',
                    tone:
                        pendingSync > 0 ? StatusTone.warning : StatusTone.success,
                    icon: pendingSync > 0
                        ? Icons.sync_problem_rounded
                        : Icons.check_circle_outline_rounded,
                    dense: true,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppTime.longDate(DateTime.now()).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            color: isProcessing
                                ? AppColors.warning
                                : AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          isProcessing ? 'Traitement…' : 'Scanner actif',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const LiveClock(),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              CounterChip(
                label: 'Présents',
                value: counts.present,
                color: AppColors.success,
                icon: Icons.how_to_reg_rounded,
              ),
              const SizedBox(width: 8),
              CounterChip(
                label: 'Retards',
                value: counts.late,
                color: AppColors.warning,
                icon: Icons.schedule_rounded,
              ),
              const SizedBox(width: 8),
              CounterChip(
                label: 'Total',
                value: counts.total,
                color: AppColors.blueLight,
                icon: Icons.groups_rounded,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Horloge locale actualisée chaque seconde.
class LiveClock extends StatefulWidget {
  const LiveClock({super.key});

  @override
  State<LiveClock> createState() => _LiveClockState();
}

class _LiveClockState extends State<LiveClock> {
  Timer? _timer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      AppTime.timeWithSeconds(_now),
      style: const TextStyle(
        color: Colors.white,
        fontSize: 26,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.5,
      ),
    );
  }
}

class CounterChip extends StatelessWidget {
  const CounterChip({
    super.key,
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  final String label;
  final int value;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 6),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$value',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      height: 1.1,
                    ),
                  ),
                  Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 9.5,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
