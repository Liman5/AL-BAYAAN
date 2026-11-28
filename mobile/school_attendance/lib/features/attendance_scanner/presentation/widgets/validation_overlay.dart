import 'dart:io';

import 'package:material_ui/material_ui.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/database/app_database.dart';
import '../../../../core/utils/app_time.dart';
import '../../../../core/widgets/app_widgets.dart';
import '../../domain/scan_outcome.dart';
import 'feedback_visual.dart';

/// Overlay de validation : lisible à plusieurs mètres, sans ambiguïté.
class ValidationOverlay extends StatelessWidget {
  const ValidationOverlay({
    super.key,
    required this.outcome,
    required this.onDismiss,
    this.autoResetMillis = 2200,
    this.animationsEnabled = true,
    this.showPhoto = true,
    this.showMatricule = true,
    this.showClassName = true,
    this.showTime = true,
  });

  final ScanOutcome outcome;
  final VoidCallback onDismiss;
  final int autoResetMillis;
  final bool animationsEnabled;

  /// Politique d'affichage imposée par la plateforme (mode confidentialité).
  final bool showPhoto;
  final bool showMatricule;
  final bool showClassName;
  final bool showTime;

  @override
  Widget build(BuildContext context) {
    final visual = FeedbackVisual.fromOutcome(outcome);
    final card = _buildCard(visual);

    final animated = animationsEnabled
        ? TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0.92, end: 1),
            duration: const Duration(milliseconds: 240),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) => Transform.scale(
              scale: value,
              child: Opacity(opacity: value.clamp(0.0, 1.0).toDouble(), child: child),
            ),
            child: card,
          )
        : card;

    return Positioned.fill(
      child: Material(
        color: Colors.transparent,
        child: Container(
          color: AppColors.navyDeep.withValues(alpha: 0.94),
          padding: const EdgeInsets.all(18),
          child: Center(child: animated),
        ),
      ),
    );
  }

  Widget _buildCard(FeedbackVisual visual) {
    final student = outcome.student;
    final staff = outcome.staff;
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(26),
          boxShadow: const [
            BoxShadow(
              color: Color(0x66000000),
              blurRadius: 40,
              offset: Offset(0, 18),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _header(visual),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (student != null) ...[
                    _studentRow(student, visual),
                    const SizedBox(height: 14),
                  ],
                  if (student == null && staff != null) ...[
                    _staffRow(staff, visual),
                    const SizedBox(height: 14),
                  ],
                  _timeBlock(visual),
                  const SizedBox(height: 14),
                  Text(
                    visual.title,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.6,
                      color: visual.color,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    visual.subtitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 13,
                      height: 1.35,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: onDismiss,
                      style: FilledButton.styleFrom(
                        backgroundColor: visual.color,
                      ),
                      child: const Text('Continuer le scan'),
                    ),
                  ),
                ],
              ),
            ),
            _progress(visual),
          ],
        ),
      ),
    );
  }

  Widget _header(FeedbackVisual visual) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 18),
      color: visual.softColor,
      child: Column(
        children: [
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0.6, end: 1),
            duration: const Duration(milliseconds: 320),
            curve: Curves.elasticOut,
            builder: (context, value, child) =>
                Transform.scale(scale: value, child: child),
            child: Container(
              width: 62,
              height: 62,
              decoration: BoxDecoration(
                color: visual.color,
                shape: BoxShape.circle,
              ),
              child: Icon(visual.icon, color: Colors.white, size: 34),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            visual.headerLabel,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.6,
              color: visual.color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _studentRow(Student student, FeedbackVisual visual) {
    final fullName = '${student.firstName} ${student.lastName}'.trim();
    return Row(
      children: [
        if (showPhoto) ...[
          _avatar(student, visual),
          const SizedBox(width: 14),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                fullName.isEmpty ? student.studentCode : fullName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 20,
                  height: 1.15,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              if (showMatricule) ...[
                const SizedBox(height: 4),
                Text(
                  'Matricule : ${student.studentCode}',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
              if (showClassName) ...[
                const SizedBox(height: 2),
                Text(
                  'Classe : ${student.className.isEmpty ? '—' : student.className}',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _staffRow(StaffMember staff, FeedbackVisual visual) {
    final fullName = '${staff.firstName} ${staff.lastName}'.trim();
    final initials =
        '${staff.firstName.isNotEmpty ? staff.firstName[0] : ''}'
                '${staff.lastName.isNotEmpty ? staff.lastName[0] : ''}'
            .toUpperCase();

    return Row(
      children: [
        if (showPhoto) ...[
          Container(
            width: 78,
            height: 78,
            decoration: BoxDecoration(
              color: visual.softColor,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: visual.color.withValues(alpha: 0.25)),
            ),
            alignment: Alignment.center,
            child: Text(
              initials.isEmpty ? '?' : initials,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: visual.color,
              ),
            ),
          ),
          const SizedBox(width: 14),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                fullName.isEmpty ? staff.staffCode : fullName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 20,
                  height: 1.15,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              if (showMatricule) ...[
                const SizedBox(height: 4),
                Text(
                  'Matricule : ${staff.staffCode}',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
              if (showClassName) ...[
                const SizedBox(height: 2),
                Text(
                  staff.roleLabel,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _avatar(Student student, FeedbackVisual visual) {
    final path = student.photoLocalPath;
    if (path != null && path.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Image.file(
          File(path),
          width: 78,
          height: 78,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _initialsAvatar(student, visual),
        ),
      );
    }
    return _initialsAvatar(student, visual);
  }

  Widget _initialsAvatar(Student student, FeedbackVisual visual) {
    final initials =
        '${student.firstName.isNotEmpty ? student.firstName[0] : ''}'
                '${student.lastName.isNotEmpty ? student.lastName[0] : ''}'
            .toUpperCase();
    return Container(
      width: 78,
      height: 78,
      decoration: BoxDecoration(
        color: visual.softColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: visual.color.withValues(alpha: 0.25)),
      ),
      alignment: Alignment.center,
      child: Text(
        initials.isEmpty ? '?' : initials,
        style: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w900,
          color: visual.color,
        ),
      ),
    );
  }

  Widget _timeBlock(FeedbackVisual visual) {
    final arrival = outcome.arrivalTime;
    final now = DateTime.now();
    return Column(
      children: [
        if (showTime)
          Text(
            arrival != null ? AppTime.timeWithSeconds(arrival) : '--:--:--',
            style: const TextStyle(
              fontSize: 34,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
              color: AppColors.textPrimary,
            ),
          ),
        if (showTime) const SizedBox(height: 2),
        Text(
          AppTime.longDate(arrival ?? now).toUpperCase(),
          style: const TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.1,
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(height: 10),
        StatusBadge(
          label: visual.statusLabel,
          tone: visual.tone,
          icon: visual.icon,
        ),
      ],
    );
  }

  Widget _progress(FeedbackVisual visual) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 1, end: 0),
      duration: Duration(milliseconds: autoResetMillis),
      builder: (context, value, _) {
        return LinearProgressIndicator(
          value: value,
          minHeight: 4,
          backgroundColor: visual.softColor,
          valueColor: AlwaysStoppedAnimation<Color>(visual.color),
        );
      },
    );
  }
}

