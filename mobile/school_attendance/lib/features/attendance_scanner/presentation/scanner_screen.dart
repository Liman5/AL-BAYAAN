import 'dart:async';

import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/database/app_database.dart';
import '../../../shared/models/view_models.dart';
import '../domain/camera_preference.dart';
import 'scanner_controller.dart';
import 'widgets/scan_window.dart';
import 'widgets/scanner_controls.dart';
import 'widgets/scanner_header.dart';
import 'widgets/validation_overlay.dart';

/// Écran principal du terminal : scanner QR permanent, 100 % local.
///
/// La caméra **avant** est utilisée par défaut ; l'objectif choisi par le
/// personnel est mémorisé dans les paramètres du terminal.
class ScannerScreen extends ConsumerStatefulWidget {
  const ScannerScreen({super.key});

  @override
  ConsumerState<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends ConsumerState<ScannerScreen>
    with WidgetsBindingObserver {
  MobileScannerController? _camera;
  bool _switchingCamera = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    unawaited(_camera?.dispose());
    super.dispose();
  }

  /// Crée le contrôleur une seule fois, avec l'objectif demandé.
  /// L'objectif est explicite (jamais un ordre par défaut non documenté).
  MobileScannerController _ensureCamera(CameraMode mode) {
    final existing = _camera;
    if (existing != null) return existing;

    final controller = MobileScannerController(
      formats: const [BarcodeFormat.qrCode],
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: mode == CameraMode.back ? CameraFacing.back : CameraFacing.front,
      autoStart: true,
    );
    _camera = controller;
    return controller;
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final camera = _camera;
    if (camera == null || !camera.value.isInitialized) return;
    try {
      switch (state) {
        case AppLifecycleState.resumed:
          unawaited(camera.start());
          break;
        case AppLifecycleState.inactive:
        case AppLifecycleState.paused:
        case AppLifecycleState.hidden:
        case AppLifecycleState.detached:
          unawaited(camera.stop());
          break;
      }
    } catch (_) {
      // La caméra reprendra au prochain retour au premier plan.
    }
  }

  Future<void> _toggleTorch() async {
    final camera = _camera;
    if (camera == null) return;
    try {
      await camera.toggleTorch();
      final current = ref.read(scannerControllerProvider).torchOn;
      ref.read(scannerControllerProvider.notifier).setTorch(!current);
    } catch (_) {
      _showMessage('Flash indisponible sur cet appareil.');
    }
  }

  /// Bascule avant ⇄ arrière, sans quitter le scanner et sans créer de présence.
  Future<void> _switchCamera() async {
    final camera = _camera;
    if (camera == null || _switchingCamera || !camera.value.isInitialized) {
      return;
    }

    final availableCameras = camera.value.availableCameras;
    if (availableCameras != null && availableCameras < 2) {
      _showMessage('Une seule caméra disponible sur cet appareil.');
      return;
    }

    setState(() => _switchingCamera = true);
    // Aucune détection traitée pendant la transition d'objectif.
    ref.read(scannerControllerProvider.notifier).setCameraSwitching(true);

    try {
      // Le flash doit être éteint avant tout changement d'objectif.
      if (camera.value.torchState == TorchState.on) {
        await camera.toggleTorch();
      }
      ref.read(scannerControllerProvider.notifier).setTorch(false);

      final previous = camera.value.cameraDirection;
      await camera.switchCamera();
      final current = camera.value.cameraDirection;

      if (current == previous) {
        _showMessage('Changement de caméra impossible sur cet appareil.');
        return;
      }

      final mode = current == CameraFacing.back
          ? CameraMode.back
          : CameraMode.front;
      await ref
          .read(settingsRepositoryProvider)
          .setCameraFacing(CameraMode.serialize(mode));
      _showMessage('${mode.label} activée');
    } catch (_) {
      _showMessage('Changement de caméra impossible. Réessayez.');
    } finally {
      // Le contrôleur de scan survit à l'écran : il doit toujours être
      // débloqué, même si l'utilisateur a quitté le scanner entre-temps.
      try {
        ref.read(scannerControllerProvider.notifier).setCameraSwitching(false);
      } catch (_) {
        // Widget déjà détruit : rien à réinitialiser côté UI.
      }
      if (mounted) {
        setState(() => _switchingCamera = false);
      }
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(content: Text(message), duration: const Duration(seconds: 2)),
      );
  }

  void _onDetect(BarcodeCapture capture) {
    if (_switchingCamera) return;
    for (final barcode in capture.barcodes) {
      final raw = barcode.rawValue;
      if (raw != null && raw.isNotEmpty) {
        unawaited(
          ref.read(scannerControllerProvider.notifier).handleDetection(raw),
        );
        break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider).valueOrNull;

    // Maintien de l'écran allumé : indépendant du chargement initial.
    ref.listen<AsyncValue<TerminalSettings>>(settingsProvider, (_, next) {
      final value = next.valueOrNull;
      if (value == null) return;
      if (value.keepScreenOn) {
        unawaited(WakelockPlus.enable());
      } else {
        unawaited(WakelockPlus.disable());
      }
    });

    // Retour vocal : une phrase par résultat, définie par l'administrateur.
    // Déclenché à chaque nouvel outcome (jamais sur un simple rebuild).
    ref.listen<ScannerState>(scannerControllerProvider, (previous, next) {
      final outcome = next.outcome;
      if (outcome == null) return;
      if (identical(previous?.outcome, outcome)) return;
      final current = ref.read(settingsProvider).valueOrNull;
      if (current == null) return;
      unawaited(ref.read(voiceFeedbackProvider).announce(outcome, current));
    });

    // Les paramètres locaux arrivent en quelques millisecondes (SQLite) :
    // cette attente permet d'ouvrir directement le bon objectif.
    if (settings == null) {
      return const _ScannerLoading();
    }

    final camera = _ensureCamera(
      CameraMode.parse(settings.cameraFacing),
    );

    final counts =
        ref.watch(todayCountsProvider).valueOrNull ?? DayAttendanceCounts.empty;
    final pending = ref.watch(pendingSyncProvider).valueOrNull ?? 0;
    final isOnline = ref.watch(connectivityProvider).valueOrNull ?? false;
    final scannerState = ref.watch(scannerControllerProvider);

    final feedback =
        scannerState.feedbackVisible && scannerState.outcome != null;

    return Scaffold(
      backgroundColor: AppColors.scannerBackdrop,
      body: SafeArea(
        child: Column(
          children: [
            ScannerHeader(
              settings: settings,
              counts: counts,
              pendingSync: pending,
              isOnline: isOnline,
              isProcessing: scannerState.isProcessing,
            ),
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: MobileScanner(
                      controller: camera,
                      fit: BoxFit.cover,
                      onDetect: _onDetect,
                      errorBuilder: (context, error, child) =>
                          CameraErrorPanel(
                        message: _cameraMessage(error.errorCode),
                        onRetry: () async {
                          try {
                            await camera.start();
                          } catch (_) {
                            // Le panneau reste affiché.
                          }
                        },
                      ),
                    ),
                  ),
                  const Positioned.fill(
                    child: ScanWindow(
                      label:
                          'Présentez le badge QR de l’élève devant la caméra',
                    ),
                  ),
                  if (!scannerState.feedbackVisible)
                    Positioned(
                      top: 14,
                      right: 14,
                      child: CameraControlsOverlay(
                        camera: camera,
                        torchOn: scannerState.torchOn,
                        switching: _switchingCamera,
                        onToggleTorch: _toggleTorch,
                        onSwitchCamera: _switchCamera,
                      ),
                    ),
                  if (scannerState.isProcessing && !feedback)
                    const Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: LinearProgressIndicator(
                        minHeight: 3,
                        backgroundColor: Colors.transparent,
                      ),
                    ),
                  if (feedback)
                    ValidationOverlay(
                      outcome: scannerState.outcome!,
                      autoResetMillis: settings.autoResetMillis,
                      animationsEnabled: settings.animationsEnabled,
                      showPhoto: settings.showPhoto,
                      showMatricule: settings.showMatricule,
                      showClassName: settings.showClassName,
                      showTime: settings.showTime,
                      onDismiss: () => ref
                          .read(scannerControllerProvider.notifier)
                          .dismissFeedback(),
                    ),
                ],
              ),
            ),
            ScannerActionBar(
              queued: scannerState.queued,
              onDashboard: () => context.push('/dashboard'),
              onHistory: () => context.push('/history'),
              onAdmin: () => context.push('/admin'),
            ),
          ],
        ),
      ),
    );
  }

  String _cameraMessage(MobileScannerErrorCode code) {
    switch (code) {
      case MobileScannerErrorCode.permissionDenied:
        return 'Autorisation caméra refusée. Ouvrez les réglages Android '
            'pour l’accorder à School Attendance.';
      case MobileScannerErrorCode.unsupported:
        return 'La caméra n’est pas disponible sur cet appareil.';
      default:
        return 'Caméra indisponible pour le moment.';
    }
  }
}

/// Affiché le temps de lire les paramètres locaux (quelques millisecondes).
class _ScannerLoading extends StatelessWidget {
  const _ScannerLoading();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AppColors.scannerBackdrop,
      body: Center(
        child: SizedBox(
          width: 26,
          height: 26,
          child: CircularProgressIndicator(
            strokeWidth: 2.4,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}

