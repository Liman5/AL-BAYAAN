import 'package:go_router/go_router.dart';

import '../../features/administration/presentation/admin_gate_screen.dart';
import '../../features/administration/presentation/admin_home_screen.dart';
import '../../features/attendance_scanner/presentation/scanner_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/history/presentation/history_screen.dart';
import '../../features/import_students/presentation/import_screen.dart';
import '../../features/terminal_settings/presentation/settings_screen.dart';

/// Navigation de l'application.
///
/// L'écran racine est toujours le scanner : un terminal doit être
/// immédiatement opérationnel au démarrage.
final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      name: 'scanner',
      builder: (context, state) => const ScannerScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      name: 'dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/history',
      name: 'history',
      builder: (context, state) => const HistoryScreen(),
    ),
    GoRoute(
      path: '/admin',
      name: 'adminGate',
      builder: (context, state) => const AdminGateScreen(),
      routes: [
        GoRoute(
          path: 'home',
          name: 'adminHome',
          builder: (context, state) => const AdminHomeScreen(),
        ),
        GoRoute(
          path: 'settings',
          name: 'adminSettings',
          builder: (context, state) => const SettingsScreen(),
        ),
        GoRoute(
          path: 'import',
          name: 'adminImport',
          builder: (context, state) => const ImportScreen(),
        ),
      ],
    ),
  ],
);
