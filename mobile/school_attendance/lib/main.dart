import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import 'app/app.dart';
import 'app/providers/app_providers.dart';
import 'app/theme/app_colors.dart';
import 'core/database/app_database.dart';
import 'core/network/terminal_credentials.dart';
import 'core/utils/app_time.dart';
import 'features/sync/data/log_repository.dart';
import 'features/sync/data/sync_repository.dart';
import 'features/terminal_settings/data/settings_repository.dart';

/// Point d'entrée du terminal de présence.
///
/// Séquence de démarrage (aucune dépendance réseau) :
///  1. ouverture de la base SQLite locale ;
///  2. création de la ligne de paramètres si nécessaire ;
///  3. récupération des envois interrompus (`syncing` → `pending`) ;
///  4. purge des journaux au-delà de la rétention ;
///  5. lecture des identifiants d'appairage (Keystore Android) ;
///  6. activation éventuelle du maintien d'écran allumé ;
///  7. lancement de l'interface sur l'écran scanner.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final database = AppDatabase.openDefault();
  TerminalCredentials? credentials;

  try {
    await AppTime.ensureLocale();

    final settingsRepository = SettingsRepository(database);
    final settings = await settingsRepository.ensureSettings();

    await SyncRepository(database).resetStuckItems();
    await LogRepository(database).purgeOlderThan(settings.retentionDays);

    // Un échec de lecture du Keystore ne doit jamais empêcher le scan :
    // le terminal fonctionne alors simplement sans synchronisation.
    try {
      credentials = await TerminalCredentialsStore().read();
    } catch (error) {
      debugPrint('Identifiants d’appairage illisibles : $error');
      credentials = null;
    }

    if (settings.keepScreenOn) {
      await WakelockPlus.enable();
    }
  } catch (error, stackTrace) {
    debugPrint('Initialisation du terminal impossible : $error');
    debugPrint('$stackTrace');
    runApp(_StartupErrorApp(message: error.toString()));
    return;
  }

  runApp(
    ProviderScope(
      overrides: [
        databaseProvider.overrideWithValue(database),
        terminalCredentialsProvider.overrideWith((ref) => credentials),
      ],
      child: const SchoolAttendanceApp(),
    ),
  );
}

/// Écran de secours si la base locale ne peut pas être ouverte.
class _StartupErrorApp extends StatelessWidget {
  const _StartupErrorApp({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.error_outline_rounded,
                  size: 46,
                  color: AppColors.danger,
                ),
                const SizedBox(height: 14),
                const Text(
                  'Le terminal n’a pas pu démarrer',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Vérifiez l’espace de stockage disponible puis relancez '
                  'l’application.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
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
