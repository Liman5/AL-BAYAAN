import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/database/app_database.dart';
import 'package:school_attendance/core/security/pin_service.dart';
import 'package:school_attendance/features/terminal_settings/data/settings_repository.dart';

/// Non-régression : le code administrateur doit **persister** entre deux
/// ouvertures de l'application (bug signalé : il était redemandé à chaque fois).
void main() {
  late AppDatabase db;

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    await SettingsRepository(db).ensureSettings();
  });

  tearDown(() async {
    await db.close();
  });

  test('aucun code au premier démarrage', () async {
    final pin = PinService(db);
    expect(await pin.isConfigured(), isFalse);
  });

  test('le code reste configuré après redémarrage (nouvelle instance)', () async {
    await PinService(db).setPin('1234');

    // Nouvelle instance + nouvelle lecture en base = redémarrage simulé.
    final afterRestart = PinService(db);
    expect(await afterRestart.isConfigured(), isTrue);
    expect(await afterRestart.verify('1234'), isTrue);
    expect(await afterRestart.verify('9999'), isFalse);
  });

  test('le code n’est jamais stocké en clair', () async {
    await PinService(db).setPin('1234');
    final settings = await SettingsRepository(db).current();
    expect(settings.adminPinHash, isNotNull);
    expect(settings.adminPinHash, isNot(contains('1234')));
    expect(settings.adminPinSalt, isNotNull);
    expect(settings.adminPinIterations, greaterThan(0));
  });

  test('changer le code invalide l’ancien', () async {
    final pin = PinService(db);
    await pin.setPin('1234');
    await pin.setPin('5678');

    expect(await pin.verify('1234'), isFalse);
    expect(await pin.verify('5678'), isTrue);
  });

  test('format refusé', () async {
    final pin = PinService(db);
    expect(() => pin.setPin('12'), throwsA(isA<FormatException>()));
    expect(() => pin.setPin('abcd'), throwsA(isA<FormatException>()));
    expect(PinService.isValidFormat('0000'), isTrue);
    expect(PinService.isValidFormat('12345678'), isTrue);
    expect(PinService.isValidFormat('123456789'), isFalse);
  });
}
