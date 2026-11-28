import '../../../app/config/app_config.dart';
import '../../../core/database/app_database.dart';
import '../../../core/scanner/qr_payload_parser.dart';
import '../../../core/utils/app_time.dart';
import '../../staff/data/staff_repository.dart';
import '../../students/data/student_repository.dart';
import '../../sync/data/log_repository.dart';
import '../../terminal_settings/data/settings_repository.dart';
import '../data/attendance_repository.dart';
import 'attendance_rules.dart';
import 'scan_outcome.dart';

/// Cœur métier du terminal : transformer un contenu QR en présence locale.
///
/// Aucune requête réseau n'est effectuée ici. L'enregistrement est atomique :
/// présence + file de synchronisation, ou rien.
class ScanService {
  ScanService({
    required AppDatabase database,
    required StudentRepository students,
    required StaffRepository staff,
    required AttendanceRepository attendance,
    required SettingsRepository settings,
    required LogRepository logs,
    QrPayloadParser parser = const QrPayloadParser(),
    Clock clock = const SystemClock(),
  })  : _db = database,
        _students = students,
        _staff = staff,
        _attendance = attendance,
        _settings = settings,
        _logs = logs,
        _parser = parser,
        _clock = clock;

  final AppDatabase _db;
  final StudentRepository _students;
  final StaffRepository _staff;
  final AttendanceRepository _attendance;
  final SettingsRepository _settings;
  final LogRepository _logs;
  final QrPayloadParser _parser;
  final Clock _clock;

  Future<ScanOutcome> handleRawQr(String raw) async {
    final parsed = _parser.parse(raw);
    if (!parsed.isValid) {
      await _logs.warn('scan.invalid_qr', details: parsed.error);
      return ScanOutcome.invalidQr(parsed.error);
    }

    final token = parsed.token!;
    try {
      final settings = await _settings.current();
      final rules = AttendanceRules.fromSettings(settings);

      return await _db.transaction(() async {
        final student = await _students.findByQrToken(token);

        if (student == null) {
          // ---------- Personnel (enseignants + administration) ----------
          final member = await _staff.findByQrToken(token);

          if (member == null) {
            await _logs.warn('scan.unknown_badge');
            return const ScanOutcome.studentNotFound();
          }
          if (!member.isActive) {
            await _logs.warn('scan.inactive_staff', details: member.staffCode);
            return ScanOutcome.inactiveStudent(staff: member);
          }
          if (member.badgeRevoked) {
            await _logs.warn('scan.staff_badge_revoked', details: member.staffCode);
            return ScanOutcome.badgeRevoked(staff: member);
          }

          final now = _clock.now();
          if (!AppTime.isPlausibleDeviceDate(now)) {
            await _logs.error('scan.invalid_device_date');
            return const ScanOutcome.databaseError(
              'La date du terminal est incorrecte. Vérifiez les réglages Android.',
            );
          }

          final personId = member.staffUuid ?? member.id;
          final existing = await _attendance.findForSession(
            studentId: personId,
            localDate: AppTime.dateKey(now),
            session: AppConfig.defaultSession,
          );

          if (existing != null) {
            await _logs.info('scan.duplicate_staff', details: member.staffCode);
            return ScanOutcome(
              ScanResultType.alreadyRegistered,
              staff: member,
              existingRecord: existing,
            );
          }

          final status = rules.statusFor(now);
          final record = await _attendance.createStaffRecord(
            personId: personId,
            personCode: member.staffCode,
            personUuid: member.staffUuid,
            roleLabel: member.roleLabel,
            nowLocal: now,
            attendanceStatus: status.value,
            terminalId: settings.terminalId,
            session: AppConfig.defaultSession,
          );

          await _logs.info(
            'scan.staff_registered',
            details:
                '${member.staffCode} • ${status.value} • ${AppTime.timeWithSeconds(now)}',
          );

          return ScanOutcome(
            ScanResultType.success,
            staff: member,
            record: record,
          );
        }

        if (!student.isActive) {
          await _logs.warn(
            'scan.inactive_student',
            details: student.studentCode,
          );
          return ScanOutcome.inactiveStudent(student: student);
        }
        if (student.badgeRevoked) {
          await _logs.warn('scan.badge_revoked', details: student.studentCode);
          return ScanOutcome.badgeRevoked(student: student);
        }

        final now = _clock.now();
        if (!AppTime.isPlausibleDeviceDate(now)) {
          await _logs.error('scan.invalid_device_date');
          return const ScanOutcome.databaseError(
            'La date du terminal est incorrecte. Vérifiez les réglages Android.',
          );
        }

        final localDate = AppTime.dateKey(now);
        final existing = await _attendance.findForSession(
          studentId: student.id,
          localDate: localDate,
          session: AppConfig.defaultSession,
        );

        if (existing != null) {
          await _logs.info(
            'scan.duplicate',
            details: '${student.studentCode} à ${AppTime.timeWithSeconds(now)}',
          );
          return ScanOutcome(
            ScanResultType.alreadyRegistered,
            student: student,
            existingRecord: existing,
          );
        }

        final status = rules.statusFor(now);
        final record = await _attendance.createRecord(
          student: student,
          nowLocal: now,
          attendanceStatus: status.value,
          terminalId: settings.terminalId,
          session: AppConfig.defaultSession,
        );

        await _logs.info(
          'scan.registered',
          details:
              '${student.studentCode} • ${status.value} • ${AppTime.timeWithSeconds(now)}',
        );

        return ScanOutcome(
          ScanResultType.success,
          student: student,
          record: record,
        );
      });
    } catch (error) {
      final message = error.toString();
      final isUniqueViolation = message.contains('UNIQUE constraint failed') ||
          message.contains('2067') ||
          message.contains('1555');

      // Violation d'unicité : le même élève a scanné deux fois très vite.
      if (isUniqueViolation) {
        try {
          final settings = await _settings.current();
          final now = _clock.now();
          final student = await _students.findByQrToken(token);
          if (student != null) {
            final existing = await _attendance.findForSession(
              studentId: student.id,
              localDate: AppTime.dateKey(now),
              session: AppConfig.defaultSession,
            );
            if (existing != null) {
              return ScanOutcome(
                ScanResultType.alreadyRegistered,
                student: student,
                existingRecord: existing,
              );
            }
          }
          await _logs.info('scan.duplicate_race', details: settings.terminalId);
        } catch (_) {
          // Le refus reste valable même si la relecture échoue.
        }
        return const ScanOutcome(ScanResultType.alreadyRegistered);
      }

      await _logs.error('scan.db_error', details: message);
      return const ScanOutcome.databaseError();
    }
  }
}

