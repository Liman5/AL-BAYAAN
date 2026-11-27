import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/scanner/qr_payload_parser.dart';

void main() {
  const parser = QrPayloadParser();

  group('QrPayloadParser', () {
    test('accepte un token opaque simple', () {
      final result = parser.parse('DEMO-BADGE-0001');
      expect(result.isValid, isTrue);
      expect(result.token, 'DEMO-BADGE-0001');
    });

    test('retire les préfixes connus', () {
      expect(parser.parse('ALB:BADGE-2026-AAA').token, 'BADGE-2026-AAA');
      expect(parser.parse('ALB|BADGE-2026-AAA').token, 'BADGE-2026-AAA');
      expect(parser.parse('BADGE:BADGE-2026-AAA').token, 'BADGE-2026-AAA');
      expect(parser.parse('STUDENT:BADGE-2026-AAA').token, 'BADGE-2026-AAA');
    });

    test('accepte un JSON minimal contenant uniquement le token', () {
      expect(parser.parse('{"t":"TOKEN-12345"}').token, 'TOKEN-12345');
      expect(parser.parse('{"token":"TOKEN-12345"}').token, 'TOKEN-12345');
    });

    test('rejette les contenus vides', () {
      expect(parser.parse('').isValid, isFalse);
      expect(parser.parse('   ').isValid, isFalse);
      expect(parser.parse(null).isValid, isFalse);
    });

    test('rejette les tokens trop courts ou trop longs', () {
      expect(parser.parse('ABC').isValid, isFalse);
      expect(parser.parse(List.filled(200, 'A').join()).isValid, isFalse);
    });

    test('rejette les caractères non autorisés', () {
      expect(parser.parse('TOKEN 12345678').isValid, isFalse);
      expect(parser.parse('TOKEN|12345678').isValid, isFalse);
      expect(parser.parse('TOKEN;12345678').isValid, isFalse);
    });

    test('rejette un JSON contenant des données personnelles', () {
      expect(
        parser.parse('{"nom":"ADJOVI","classe":"3e A"}').isValid,
        isFalse,
      );
    });

    test('nettoie les espaces autour du token', () {
      expect(parser.parse('  BADGE-2026-AAA  ').token, 'BADGE-2026-AAA');
    });
  });
}
