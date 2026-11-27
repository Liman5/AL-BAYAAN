import 'package:material_ui/material_ui.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/utils/app_time.dart';
import '../../../../core/widgets/app_widgets.dart';
import '../../domain/scan_outcome.dart';

/// Traduction d'un [ScanOutcome] en visuel de feedback (libellés français).
class FeedbackVisual {
  const FeedbackVisual({
    required this.headerLabel,
    required this.title,
    required this.subtitle,
    required this.statusLabel,
    required this.icon,
    required this.tone,
  });

  final String headerLabel;
  final String title;
  final String subtitle;
  final String statusLabel;
  final IconData icon;
  final StatusTone tone;

  Color get color {
    switch (tone) {
      case StatusTone.success:
        return AppColors.success;
      case StatusTone.warning:
        return AppColors.warning;
      case StatusTone.danger:
        return AppColors.danger;
      case StatusTone.info:
        return AppColors.blue;
      case StatusTone.neutral:
        return AppColors.textSecondary;
    }
  }

  Color get softColor {
    switch (tone) {
      case StatusTone.success:
        return AppColors.successSoft;
      case StatusTone.warning:
        return AppColors.warningSoft;
      case StatusTone.danger:
        return AppColors.dangerSoft;
      case StatusTone.info:
        return AppColors.blueSoft;
      case StatusTone.neutral:
        return AppColors.surfaceMuted;
    }
  }

  static FeedbackVisual fromOutcome(ScanOutcome outcome) {
    switch (outcome.type) {
      case ScanResultType.success:
        final late = outcome.status?.value == 'late';
        return FeedbackVisual(
          headerLabel: late ? 'ARRIVÉE TARDIVE' : 'VALIDATION',
          title: 'VÉRIFICATION ACCEPTÉE',
          subtitle: 'PRÉSENCE ENREGISTRÉE',
          statusLabel: late ? 'EN RETARD' : 'PRÉSENT',
          icon: late ? Icons.schedule_rounded : Icons.check_rounded,
          tone: late ? StatusTone.warning : StatusTone.success,
        );
      case ScanResultType.alreadyRegistered:
        final arrival = outcome.arrivalTime;
        return FeedbackVisual(
          headerLabel: 'DÉJÀ SCANNÉ',
          title: 'PRÉSENCE DÉJÀ ENREGISTRÉE',
          subtitle: arrival == null
              ? 'Aucun nouvel enregistrement créé.'
              : 'Première arrivée : ${AppTime.timeWithSeconds(arrival)}',
          statusLabel: 'DÉJÀ PRÉSENT',
          icon: Icons.info_rounded,
          tone: StatusTone.info,
        );
      case ScanResultType.studentNotFound:
        return const FeedbackVisual(
          headerLabel: 'REFUSÉ',
          title: 'BADGE INCONNU',
          subtitle: 'Ce badge ne correspond à aucun élève importé. '
              'Aucune présence enregistrée.',
          statusLabel: 'NON ENREGISTRÉ',
          icon: Icons.help_outline_rounded,
          tone: StatusTone.danger,
        );
      case ScanResultType.inactiveStudent:
        return const FeedbackVisual(
          headerLabel: 'REFUSÉ',
          title: 'ÉLÈVE INACTIF',
          subtitle: 'Cet élève n’est pas actif dans l’établissement.',
          statusLabel: 'NON ENREGISTRÉ',
          icon: Icons.person_off_rounded,
          tone: StatusTone.danger,
        );
      case ScanResultType.badgeRevoked:
        return const FeedbackVisual(
          headerLabel: 'REFUSÉ',
          title: 'BADGE DÉSACTIVÉ',
          subtitle: 'Ce badge a été révoqué (perte ou remplacement).',
          statusLabel: 'NON ENREGISTRÉ',
          icon: Icons.block_rounded,
          tone: StatusTone.danger,
        );
      case ScanResultType.invalidQr:
        return const FeedbackVisual(
          headerLabel: 'REFUSÉ',
          title: 'QR CODE NON RECONNU',
          subtitle: 'Présentez le badge scolaire officiel de l’élève.',
          statusLabel: 'NON ENREGISTRÉ',
          icon: Icons.qr_code_2_rounded,
          tone: StatusTone.warning,
        );
      case ScanResultType.databaseError:
        return FeedbackVisual(
          headerLabel: 'ERREUR',
          title: 'PRÉSENCE NON ENREGISTRÉE',
          subtitle: outcome.message ??
              'L’enregistrement local a échoué. Réessayez le scan ou '
                  'prévenez l’administration.',
          statusLabel: 'À REFAIRE',
          icon: Icons.error_outline_rounded,
          tone: StatusTone.danger,
        );
      case ScanResultType.cameraError:
        return const FeedbackVisual(
          headerLabel: 'CAMÉRA',
          title: 'CAMÉRA INDISPONIBLE',
          subtitle: 'Vérifiez l’autorisation caméra puis réessayez.',
          statusLabel: 'HORS SERVICE',
          icon: Icons.videocam_off_rounded,
          tone: StatusTone.danger,
        );
    }
  }
}
