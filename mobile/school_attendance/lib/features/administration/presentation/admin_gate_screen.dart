import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers/app_providers.dart';
import '../../../app/theme/app_colors.dart';

/// Accès protégé à l'espace administration (code PIN, stockage sécurisé).
class AdminGateScreen extends ConsumerStatefulWidget {
  const AdminGateScreen({super.key});

  @override
  ConsumerState<AdminGateScreen> createState() => _AdminGateScreenState();
}

class _AdminGateScreenState extends ConsumerState<AdminGateScreen> {
  static const int pinLength = 4;

  String _pin = '';
  String? _firstPin;
  bool _isSetup = false;
  bool _loading = true;
  bool _busy = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _loadState();
  }

  Future<void> _loadState() async {
    final configured = await ref.read(pinServiceProvider).isConfigured();
    if (!mounted) return;
    setState(() {
      _isSetup = !configured;
      _loading = false;
      _message = configured
          ? 'Saisissez le code administrateur.'
          : 'Première configuration : choisissez un code à 4 chiffres.';
    });
  }

  void _onDigit(String digit) {
    if (_busy || _pin.length >= pinLength) return;
    setState(() {
      _pin += digit;
      _message = null;
    });
    if (_pin.length == pinLength) {
      _submit();
    }
  }

  void _onBackspace() {
    if (_busy || _pin.isEmpty) return;
    setState(() => _pin = _pin.substring(0, _pin.length - 1));
  }

  Future<void> _submit() async {
    final pin = _pin;
    setState(() => _busy = true);

    if (_isSetup) {
      if (_firstPin == null) {
        setState(() {
          _firstPin = pin;
          _pin = '';
          _busy = false;
          _message = 'Confirmez le code une seconde fois.';
        });
        return;
      }
      if (_firstPin != pin) {
        setState(() {
          _firstPin = null;
          _pin = '';
          _busy = false;
          _message = 'Les deux codes ne correspondent pas. Recommencez.';
        });
        return;
      }
      await ref.read(pinServiceProvider).setPin(pin);
      if (!mounted) return;
      context.pushReplacement('/admin/home');
      return;
    }

    final valid = await ref.read(pinServiceProvider).verify(pin);
    if (!mounted) return;
    if (valid) {
      context.pushReplacement('/admin/home');
      return;
    }
    setState(() {
      _pin = '';
      _busy = false;
      _message = 'Code incorrect. Réessayez.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/'),
        ),
        title: const Text('Administration'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 380),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: AppColors.navy,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.shield_rounded,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _isSetup
                            ? 'Créer le code administrateur'
                            : 'Espace protégé',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _message ?? '',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(height: 22),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          for (var i = 0; i < pinLength; i++)
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 7),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 140),
                                width: 16,
                                height: 16,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: i < _pin.length
                                      ? theme.colorScheme.primary
                                      : theme.colorScheme.outline,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 26),
                      _keypad(theme),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _keypad(ThemeData theme) {
    Widget key(String label, {VoidCallback? onTap, IconData? icon}) {
      return Padding(
        padding: const EdgeInsets.all(6),
        child: Material(
          color: theme.colorScheme.secondaryContainer.withValues(alpha: 0.55),
          borderRadius: BorderRadius.circular(18),
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: _busy ? null : onTap,
            child: SizedBox(
              height: 64,
              child: Center(
                child: icon == null
                    ? Text(
                        label,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      )
                    : Icon(icon, size: 22),
              ),
            ),
          ),
        ),
      );
    }

    return Column(
      children: [
        for (final row in const [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
        ])
          Row(
            children: [
              for (final digit in row)
                Expanded(
                  child: key(digit, onTap: () => _onDigit(digit)),
                ),
            ],
          ),
        Row(
          children: [
            const Expanded(child: SizedBox()),
            Expanded(child: key('0', onTap: () => _onDigit('0'))),
            Expanded(
              child: key(
                '',
                icon: Icons.backspace_outlined,
                onTap: _onBackspace,
              ),
            ),
          ],
        ),
        if (_busy)
          const Padding(
            padding: EdgeInsets.only(top: 12),
            child: LinearProgressIndicator(minHeight: 3),
          ),
      ],
    );
  }
}

