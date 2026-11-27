import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/features/attendance_scanner/domain/attendance_rules.dart';

void main() {
  group('AttendanceRules', () {
    const rules = AttendanceRules(lateAfterMinutes: 7 * 60 + 30); // 07:30

    test('avant l’heure limite → présent', () {
      expect(
        rules.statusFor(DateTime(2026, 11, 26, 7, 14, 32)),
        AttendanceStatus.present,
      );
      expect(
        rules.statusFor(DateTime(2026, 11, 26, 7, 29, 59)),
        AttendanceStatus.present,
      );
    });

    test('à partir de l’heure limite → en retard', () {
      expect(
        rules.statusFor(DateTime(2026, 11, 26, 7, 30)),
        AttendanceStatus.late,
      );
      expect(
        rules.statusFor(DateTime(2026, 11, 26, 8, 5)),
        AttendanceStatus.late,
      );
    });

    test('l’heure limite est configurable', () {
      const early = AttendanceRules(lateAfterMinutes: 8 * 60); // 08:00
      expect(
        early.statusFor(DateTime(2026, 11, 26, 7, 45)),
        AttendanceStatus.present,
      );
      expect(
        early.statusFor(DateTime(2026, 11, 26, 8, 0)),
        AttendanceStatus.late,
      );
    });

    test('conversion aller-retour du statut', () {
      expect(AttendanceStatus.fromValue('late'), AttendanceStatus.late);
      expect(AttendanceStatus.fromValue('present'), AttendanceStatus.present);
      expect(AttendanceStatus.fromValue('inconnu'), AttendanceStatus.present);
      expect(AttendanceStatus.late.value, 'late');
      expect(AttendanceStatus.present.value, 'present');
    });
  });
}
