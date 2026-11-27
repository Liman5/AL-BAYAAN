import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'config/app_config.dart';
import 'providers/app_providers.dart';
import 'router/app_router.dart';
import 'theme/app_theme.dart';

/// Racine de l'application.
///
/// Démarre le moteur de synchronisation automatique dès l'ouverture :
/// les présences en attente partent au démarrage, au retour du réseau et
/// périodiquement — sans aucune action de l'opérateur.
class SchoolAttendanceApp extends ConsumerStatefulWidget {
  const SchoolAttendanceApp({super.key});

  @override
  ConsumerState<SchoolAttendanceApp> createState() => _SchoolAttendanceAppState();
}

class _SchoolAttendanceAppState extends ConsumerState<SchoolAttendanceApp> {
  @override
  void initState() {
    super.initState();
    // Après le premier frame : le moteur n'a besoin d'aucun widget.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ref.read(syncEngineProvider).start();
    });
  }

  @override
  void dispose() {
    ref.read(syncEngineProvider).stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      // Terminal dédié : thème clair stable pour la lisibilité à distance.
      themeMode: ThemeMode.light,
      routerConfig: appRouter,
    );
  }
}
