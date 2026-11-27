import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/utils/csv_utils.dart';

void main() {
  group('CsvUtils.parse', () {
    test('lit un CSV simple avec en-tête', () {
      final rows = CsvUtils.parse(
        'student_code,first_name,last_name\nEL-1,Adjovi,Kodjo\nEL-2,Youssef,Ait',
      );
      expect(rows.length, 3);
      expect(rows[0], ['student_code', 'first_name', 'last_name']);
      expect(rows[1], ['EL-1', 'Adjovi', 'Kodjo']);
      expect(rows[2][0], 'EL-2');
    });

    test('gère les guillemets et les virgules échappées', () {
      final rows = CsvUtils.parse(
        'code,name\nEL-1,"Kodjo, Adjovi"\nEL-2,"Il a dit ""bonjour"""',
      );
      expect(rows[1][1], 'Kodjo, Adjovi');
      expect(rows[2][1], 'Il a dit "bonjour"');
    });

    test('gère les fins de ligne Windows et le BOM', () {
      final rows = CsvUtils.parse('\uFEFFcode,name\r\nEL-1,Test\r\n');
      expect(rows.length, 2);
      expect(rows[0][0], 'code');
    });

    test('détecte le point-virgule', () {
      final rows = CsvUtils.parse('code;name\nEL-1;Test');
      expect(rows[1], ['EL-1', 'Test']);
      expect(CsvUtils.detectDelimiter('code;name\nEL-1;Test'), ';');
    });

    test('ignore les lignes vides', () {
      final rows = CsvUtils.parse('code\n\nEL-1\n\n');
      expect(rows.length, 2);
    });
  });

  group('CsvUtils.encode', () {
    test('échappe les cellules contenant le séparateur', () {
      final csv = CsvUtils.encode([
        ['code', 'name'],
        ['EL-1', 'Kodjo, Adjovi'],
        ['EL-2', 'Il a dit "oui"'],
      ]);
      expect(csv.contains('"Kodjo, Adjovi"'), isTrue);
      expect(csv.contains('"Il a dit ""oui"""'), isTrue);
    });

    test('aller-retour stable', () {
      final rows = [
        ['a', 'b'],
        ['1', 'x,y'],
      ];
      final decoded = CsvUtils.parse(CsvUtils.encode(rows));
      expect(decoded, rows);
    });
  });

  group('CsvUtils.normalizeHeader', () {
    test('normalise accents, majuscules et espaces', () {
      expect(CsvUtils.normalizeHeader('Prénom'), 'prenom');
      expect(CsvUtils.normalizeHeader('  Nom de famille '), 'nom_de_famille');
      expect(CsvUtils.normalizeHeader('QR-TOKEN'), 'qr_token');
    });
  });
}
