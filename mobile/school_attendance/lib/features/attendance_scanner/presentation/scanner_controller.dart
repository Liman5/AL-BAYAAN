import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/config/app_config.dart';
import '../../../core/database/app_database.dart';
import '../../../core/utils/app_time.dart';
import '../../terminal_settings/data/settings_repository.dart';
import '../domain/scan_outcome.dart';
import '../domain/scan_service.dart';

class ScannerState {
  const ScannerState({
    this.isProcessing = false,
    this.outcome,
    this.torchOn = false,
    this.cameraError,
    this.queued = 0,
    this.feedbackVisible = false,
  });

  final bool isProcessing;
  final ScanOutcome? outcome;
  final bool torchOn;
  final String? cameraError;
  final int queued;
  final bool feedbackVisible;

  bool get isBusy => isProcessing || feedbackVisible;

  ScannerState copyWith({
    bool? isProcessing,
    ScanOutcome? outcome,
    bool? clearOutcome = false,
    bool? torchOn,
    String? cameraError,
    bool? clearCameraError = false,
    int? queued,
    bool? feedbackVisible,
  }) {
    return ScannerState(
      isProcessing: isProcessing ?? this.isProcessing,
      outcome: clearOutcome == true ? null : (outcome ?? this.outcome),
      torchOn: torchOn ?? this.torchOn,
      cameraError:
          clearCameraError == true ? null : (cameraError ?? this.cameraError),
      queued: queued ?? this.queued,
      feedbackVisible: feedbackVisible ?? this.feedbackVisible,
    );
  }
}

/// Pilote l'écran scanner : anti-rebond, file d'attente, feedback temporisé.
///
/// Le flux caméra n'est jamais interrompu : seules la détection et
/// l'affichage changent d'état.
class ScannerController extends StateNotifier<ScannerState> {
  ScannerController({
    required ScanService scanService,
    required SettingsRepository settingsRepository,
  })  : _scanService = scanService,
        _settingsRepository = settingsRepository,
        super(const ScannerState());

  final ScanService _scanService;
  final SettingsRepository _settingsRepository;

  final List<String> _queue = <String>[];
  Timer? _resetTimer;
  String? _lastRaw;
  DateTime? _lastRawAt;
  bool _processing = false;
  bool _cameraSwitching = false;

  /// Bloque temporairement la détection pendant une bascule d'objectif :
  /// une image de transition ne doit jamais créer de présence.
  void setCameraSwitching(bool value) {
    _cameraSwitching = value;
  }

  Future<void> handleDetection(String raw) async {
    final trimmed = raw.trim();
    if (trimmed.isEmpty || _cameraSwitching) return;

    final now = DateTime.now();
    if (_lastRaw == trimmed &&
        _lastRawAt != null &&
        now.difference(_lastRawAt!) < AppConfig.sameTokenCooldown) {
      return;
    }
    _lastRaw = trimmed;
    _lastRawAt = now;

    if (_processing || _resetTimer != null) {
      if (_queue.length < AppConfig.scanQueueLimit && !_queue.contains(trimmed)) {
        _queue.add(trimmed);
        state = state.copyWith(queued: _queue.length);
      }
      return;
    }

    await _process(trimmed);
  }

  Future<void> _process(String raw) async {
    _processing = true;
    state = state.copyWith(
      isProcessing: true,
      clearOutcome: true,
      feedbackVisible: false,
    );

    ScanOutcome outcome;
    try {
      outcome = await _scanService.handleRawQr(raw);
    } catch (error) {
      outcome = const ScanOutcome.databaseError();
    }

    _processing = false;

    // Les paramètres ne doivent jamais empêcher l'affichage du résultat.
    TerminalSettings? settings;
    try {
      settings = await _settingsRepository.current();
    } catch (_) {
      settings = null;
    }

    if (settings != null) {
      if (outcome.isSuccess) {
        await _playFeedback(settings);
      } else if (outcome.isDuplicate) {
        await _playDuplicateFeedback(settings);
      }
    }

    state = state.copyWith(
      isProcessing: false,
      outcome: outcome,
      feedbackVisible: true,
      queued: _queue.length,
    );

    final autoReset = settings?.autoResetMillis ?? AppConfig.defaultAutoResetMillis;
    final delay = Duration(
      milliseconds: autoReset
          .clamp(
            AppConfig.minAutoResetMillis,
            AppConfig.maxAutoResetMillis,
          )
          .toInt(),
    );
    _resetTimer?.cancel();
    _resetTimer = Timer(delay, _resetToScanning);
  }

  Future<void> _playFeedback(TerminalSettings settings) async {
    if (settings.hapticsEnabled) {
      await HapticFeedback.mediumImpact();
    }
    if (settings.soundEnabled) {
      await SystemSound.play(SystemSoundType.click);
    }
  }

  Future<void> _playDuplicateFeedback(TerminalSettings settings) async {
    if (settings.hapticsEnabled) {
      await HapticFeedback.selectionClick();
    }
    if (settings.soundEnabled) {
      await SystemSound.play(SystemSoundType.alert);
    }
  }

  void _resetToScanning() {
    _resetTimer?.cancel();
    _resetTimer = null;

    if (_queue.isNotEmpty) {
      final next = _queue.removeAt(0);
      state = state.copyWith(
        clearOutcome: true,
        feedbackVisible: false,
        queued: _queue.length,
      );
      // Le prochain élève est traité immédiatement : aucune perte de scan.
      unawaited(_process(next));
      return;
    }

    state = state.copyWith(
      clearOutcome: true,
      feedbackVisible: false,
      queued: 0,
    );
  }

  /// Fermeture manuelle du feedback (l'opérateur veut enchaîner tout de suite).
  void dismissFeedback() => _resetToScanning();

  void setTorch(bool enabled) => state = state.copyWith(torchOn: enabled);

  void setCameraError(String? message) {
    state = state.copyWith(
      cameraError: message,
      clearCameraError: message == null,
    );
  }

  String get clockLabel => AppTime.time(DateTime.now());

  @override
  void dispose() {
    _resetTimer?.cancel();
    super.dispose();
  }
}
