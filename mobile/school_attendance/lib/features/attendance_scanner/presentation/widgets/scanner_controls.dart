import 'package:material_ui/material_ui.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../../app/theme/app_colors.dart';
import '../../domain/camera_preference.dart';

/// Bouton flash discret, superposé à la caméra.
class TorchButton extends StatelessWidget {
  const TorchButton({
    super.key,
    required this.enabled,
    required this.onPressed,
  });

  final bool enabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.45),
      shape: const CircleBorder(),
      child: IconButton(
        onPressed: onPressed,
        tooltip: enabled ? 'Désactiver le flash' : 'Activer le flash',
        icon: Icon(
          enabled ? Icons.flash_on_rounded : Icons.flash_off_rounded,
          color: enabled ? AppColors.warning : Colors.white,
        ),
      ),
    );
  }
}

/// Barre d'actions basse du terminal (accès rapides, sans surcharger l'écran).
class ScannerActionBar extends StatelessWidget {
  const ScannerActionBar({
    super.key,
    required this.queued,
    required this.onDashboard,
    required this.onHistory,
    required this.onAdmin,
  });

  final int queued;
  final VoidCallback onDashboard;
  final VoidCallback onHistory;
  final VoidCallback onAdmin;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(top: BorderSide(color: theme.colorScheme.outline)),
      ),
      child: Row(
        children: [
          if (queued > 0)
            Padding(
              padding: const EdgeInsets.only(left: 6, right: 4),
              child: Text(
                '+$queued',
                style: const TextStyle(
                  color: AppColors.warning,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ),
          _BarAction(
            icon: Icons.insights_rounded,
            label: 'Journée',
            onTap: onDashboard,
          ),
          _BarAction(
            icon: Icons.history_rounded,
            label: 'Historique',
            onTap: onHistory,
          ),
          _BarAction(
            icon: Icons.shield_outlined,
            label: 'Admin',
            onTap: onAdmin,
          ),
        ],
      ),
    );
  }
}

class _BarAction extends StatelessWidget {
  const _BarAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 21, color: theme.colorScheme.primary),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Panneau affiché lorsque la caméra est refusée ou indisponible.
class CameraErrorPanel extends StatelessWidget {
  const CameraErrorPanel({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.scannerBackdrop,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 380),
          child: Container(
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.darkBorder),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.videocam_off_rounded,
                  size: 40,
                  color: AppColors.warning,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Caméra indisponible',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 12.5,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: onRetry,
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    label: const Text('Réessayer'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Bouton de bascule avant ⇄ arrière (cible tactile 48×48).
class CameraSwitchButton extends StatelessWidget {
  const CameraSwitchButton({
    super.key,
    required this.onPressed,
    this.busy = false,
    this.targetLabel,
  });

  final VoidCallback onPressed;
  final bool busy;
  final String? targetLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      enabled: !busy,
      label:
          targetLabel == null ? 'Changer de caméra' : 'Passer à la $targetLabel',
      child: Material(
        color: Colors.black.withValues(alpha: 0.45),
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: busy ? null : onPressed,
          child: SizedBox(
            width: 48,
            height: 48,
            child: Center(
              child: busy
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(
                      Icons.cameraswitch_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Colonne des contrôles caméra (flash si disponible + bascule d'objectif).
///
/// Le flash n'apparaît que sur l'objectif arrière **et** si le matériel
/// l'annonce : aucune action impossible n'est proposée au personnel.
class CameraControlsOverlay extends StatelessWidget {
  const CameraControlsOverlay({
    super.key,
    required this.camera,
    required this.torchOn,
    required this.switching,
    required this.onToggleTorch,
    required this.onSwitchCamera,
  });

  final MobileScannerController camera;
  final bool torchOn;
  final bool switching;
  final VoidCallback onToggleTorch;
  final VoidCallback onSwitchCamera;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<MobileScannerState>(
      valueListenable: camera,
      builder: (context, state, _) {
        final mode = state.cameraDirection == CameraFacing.back
            ? CameraMode.back
            : CameraMode.front;
        final torchAllowed = CameraMode.isTorchAvailable(
          mode: mode,
          hardwareSupportsTorch: state.torchState != TorchState.unavailable,
        );

        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (torchAllowed) ...[
              TorchButton(enabled: torchOn, onPressed: onToggleTorch),
              const SizedBox(height: 10),
            ],
            CameraSwitchButton(
              busy: switching || !state.isInitialized,
              targetLabel: mode.opposite.label,
              onPressed: onSwitchCamera,
            ),
          ],
        );
      },
    );
  }
}


