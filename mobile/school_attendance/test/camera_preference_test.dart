import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/features/attendance_scanner/domain/camera_preference.dart';

void main() {
  group('CameraMode — préférence persistée', () {
    test('la caméra avant est la valeur par défaut', () {
      expect(CameraMode.defaultValue, CameraMode.front);
      expect(CameraMode.front.storageValue, 'front');
      expect(CameraMode.back.storageValue, 'back');
    });

    test('une préférence « back » est restaurée', () {
      expect(CameraMode.parse('back'), CameraMode.back);
      expect(CameraMode.parse(' BACK '), CameraMode.back);
    });

    test('une préférence « front » est restaurée', () {
      expect(CameraMode.parse('front'), CameraMode.front);
    });

    test('une préférence absente retombe sur la caméra avant', () {
      expect(CameraMode.parse(null), CameraMode.front);
      expect(CameraMode.parse(''), CameraMode.front);
      expect(CameraMode.parse('   '), CameraMode.front);
    });

    test('une préférence invalide retombe sur la caméra avant', () {
      expect(CameraMode.parse('external'), CameraMode.front);
      expect(CameraMode.parse('1'), CameraMode.front);
      expect(CameraMode.parse('rear'), CameraMode.front);
    });

    test('sérialisation stable aller-retour', () {
      for (final mode in CameraMode.values) {
        expect(CameraMode.parse(CameraMode.serialize(mode)), mode);
      }
    });

    test('bascule vers l’objectif opposé', () {
      expect(CameraMode.front.opposite, CameraMode.back);
      expect(CameraMode.back.opposite, CameraMode.front);
    });

    test('libellés lisibles par le personnel', () {
      expect(CameraMode.front.label, 'Caméra avant');
      expect(CameraMode.back.label, 'Caméra arrière');
    });
  });

  group('CameraMode.isTorchAvailable — cohérence flash / objectif', () {
    test('flash indisponible sur la caméra avant, même si le matériel existe',
        () {
      expect(
        CameraMode.isTorchAvailable(
          mode: CameraMode.front,
          hardwareSupportsTorch: true,
        ),
        isFalse,
      );
    });

    test('flash disponible sur la caméra arrière si le matériel le permet', () {
      expect(
        CameraMode.isTorchAvailable(
          mode: CameraMode.back,
          hardwareSupportsTorch: true,
        ),
        isTrue,
      );
    });

    test('flash indisponible sur la caméra arrière sans torche matérielle', () {
      expect(
        CameraMode.isTorchAvailable(
          mode: CameraMode.back,
          hardwareSupportsTorch: false,
        ),
        isFalse,
      );
    });
  });
}
