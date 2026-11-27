import 'dart:convert';

/// Résultat de l'analyse d'un contenu QR.
class QrParseResult {
  const QrParseResult._({this.token, this.error});

  const QrParseResult.valid(String token) : this._(token: token);

  const QrParseResult.invalid(String error) : this._(error: error);

  final String? token;
  final String? error;

  bool get isValid => token != null;
}

/// Analyse défensive du contenu d'un QR code.
///
/// Le QR ne doit contenir qu'un **token opaque** de badge (aucune donnée
/// personnelle). Formats acceptés :
///   - `TOKEN` (8 à 128 caractères : lettres, chiffres, `.`, `_`, `-`)
///   - préfixé : `ALB:TOKEN`, `ALB|TOKEN`, `BADGE:TOKEN`, `STUDENT:TOKEN`
///   - JSON minimal : `{"t":"TOKEN"}` ou `{"token":"TOKEN"}`
/// Tout le reste est rejeté : le scanner n'invente jamais d'identité.
class QrPayloadParser {
  const QrPayloadParser();

  static const List<String> prefixes = <String>[
    'ALB:',
    'ALB|',
    'BADGE:',
    'STUDENT:',
  ];

  static const int minTokenLength = 8;
  static const int maxTokenLength = 128;
  static const int maxPayloadLength = 512;

  static final RegExp _tokenPattern =
      RegExp(r'^[A-Za-z0-9._\-]+$');

  QrParseResult parse(String? raw) {
    if (raw == null) return const QrParseResult.invalid('QR vide');

    var value = raw.trim();
    if (value.isEmpty) return const QrParseResult.invalid('QR vide');
    if (value.length > maxPayloadLength) {
      return const QrParseResult.invalid('QR trop long');
    }

    if (value.startsWith('{')) {
      value = _extractFromJson(value) ?? '';
      if (value.isEmpty) {
        return const QrParseResult.invalid('QR JSON non reconnu');
      }
    } else {
      for (final prefix in prefixes) {
        if (value.toUpperCase().startsWith(prefix)) {
          value = value.substring(prefix.length).trim();
          break;
        }
      }
    }

    if (value.isEmpty) return const QrParseResult.invalid('QR vide');
    if (!_tokenPattern.hasMatch(value)) {
      return const QrParseResult.invalid('QR non reconnu');
    }
    if (value.length < minTokenLength || value.length > maxTokenLength) {
      return const QrParseResult.invalid('QR non reconnu');
    }
    return QrParseResult.valid(value);
  }

  String? _extractFromJson(String raw) {
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map<String, dynamic>) {
        final candidate = decoded['t'] ?? decoded['token'];
        if (candidate is String) return candidate.trim();
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
