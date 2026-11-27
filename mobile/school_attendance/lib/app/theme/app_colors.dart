import 'package:material_ui/material_ui.dart';

/// Design tokens — palette de l'application.
///
/// Identité : bleu nuit profond, bleu d'action, vert de validation,
/// orange de retard, rouge réservé aux erreurs.
class AppColors {
  const AppColors._();

  // Marque
  static const Color navy = Color(0xFF0B1F3A);
  static const Color navyDeep = Color(0xFF071427);
  static const Color navySurface = Color(0xFF10294A);

  // Actions
  static const Color blue = Color(0xFF1D4ED8);
  static const Color blueLight = Color(0xFF3B82F6);
  static const Color blueSoft = Color(0xFFE8F0FF);

  // Statuts
  static const Color success = Color(0xFF0F9D6B);
  static const Color successSoft = Color(0xFFE6F7F0);
  static const Color warning = Color(0xFFE08700);
  static const Color warningSoft = Color(0xFFFFF4E0);
  static const Color danger = Color(0xFFD92D20);
  static const Color dangerSoft = Color(0xFFFDECEA);

  // Neutres
  static const Color background = Color(0xFFF5F7FB);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF0F3F9);
  static const Color border = Color(0xFFE1E6EF);
  static const Color textPrimary = Color(0xFF111C2E);
  static const Color textSecondary = Color(0xFF5A6B85);
  static const Color textMuted = Color(0xFF8B99AE);
  static const Color disabled = Color(0xFFAEB9C9);

  // Thème sombre
  static const Color darkBackground = Color(0xFF07111F);
  static const Color darkSurface = Color(0xFF0E1B2D);
  static const Color darkSurfaceMuted = Color(0xFF152538);
  static const Color darkBorder = Color(0xFF22354E);
  static const Color darkTextPrimary = Color(0xFFF1F5FB);
  static const Color darkTextSecondary = Color(0xFF9FB0C7);

  // Caméra / scanner
  static const Color scannerBackdrop = Color(0xFF040B14);
  static const Color scanFrame = Color(0xFF5CA8FF);
  static const Color scanGlow = Color(0x665CA8FF);
}

/// Échelle d'espacement (multiples de 4).
class AppSpacing {
  const AppSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;
}

/// Rayons de bordure.
class AppRadius {
  const AppRadius._();

  static const double sm = 10;
  static const double md = 16;
  static const double lg = 22;
  static const double xl = 28;
  static const double pill = 999;
}

/// Durées d'animation cohérentes.
class AppDurations {
  const AppDurations._();

  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 260);
  static const Duration slow = Duration(milliseconds: 420);
}
