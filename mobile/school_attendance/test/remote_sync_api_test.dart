import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:school_attendance/core/network/terminal_credentials.dart';
import 'package:school_attendance/core/sync/remote_sync_api.dart';
import 'package:school_attendance/core/sync/sync_models.dart';

/// Adaptateur HTTP factice : aucune requête réseau réelle.
class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter({required this.handler});

  final Future<ResponseBody> Function(RequestOptions options) handler;
  final List<RequestOptions> requests = <RequestOptions>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) {
    requests.add(options);
    return handler(options);
  }

  @override
  void close({bool force = false}) {}
}

ResponseBody _json(Map<String, dynamic> body, {int status = 200}) {
  return ResponseBody.fromString(
    jsonEncode(body),
    status,
    headers: {
      Headers.contentTypeHeader: [Headers.jsonContentType],
    },
  );
}

Dio _dioWith(_FakeAdapter adapter) {
  final dio = Dio(BaseOptions(baseUrl: 'https://ecole.test'));
  dio.httpClientAdapter = adapter;
  return dio;
}

TerminalCredentials _credentials() => const TerminalCredentials(
      baseUrl: 'https://ecole.test',
      terminalId: 'term-1',
      token: 'jeton-de-test-0123456789abcdef',
    );

AttendanceSyncDto _dto(String id) => AttendanceSyncDto(
      eventId: id,
      studentUuid: 'stu-1',
      studentCode: 'ALB-0001',
      scannedAtUtc: '2026-11-26T07:14:32.000Z',
      localDate: '2026-11-26',
      attendanceStatus: 'present',
      terminalId: 'term-1',
      source: 'qr',
      session: 'morning',
      classId: 'class-1',
      className: '3e A',
    );


void main() {
  group('RemoteSyncApi.pushAttendance', () {
    test('interprète les réponses par événement', () async {
      final adapter = _FakeAdapter(
        handler: (options) async => _json({
          'success': true,
          'data': {
            'results': [
              {'eventId': 'evt-1', 'status': 'accepted', 'serverRecordId': 'evt-1'},
              {'eventId': 'evt-2', 'status': 'duplicate', 'serverRecordId': 'evt-2'},
              {'eventId': 'evt-3', 'status': 'rejected', 'reason': 'élève non actif'},
            ],
            'summary': {'accepted': 1, 'duplicates': 1, 'rejected': 1},
          },
        }),
      );

      final api = RemoteSyncApi(
        credentials: _credentials(),
        dio: _dioWith(adapter),
        appVersion: '1.0.0',
      );

      final results = await api.pushAttendance([
        _dto('evt-1'),
        _dto('evt-2'),
        _dto('evt-3'),
      ]);

      expect(results, hasLength(3));
      expect(results[0].success, isTrue);
      expect(results[1].success, isTrue, reason: 'un doublon est un succès');
      expect(results[2].success, isFalse);
      expect(results[2].retryable, isFalse);
      expect(results[2].error, 'élève non actif');

      expect(adapter.requests, hasLength(1));
      expect(adapter.requests.first.path, '/api/terminal/attendance');

      final payload = adapter.requests.first.data as Map<String, dynamic>;
      final events = payload['events'] as List;
      expect(events, hasLength(3));
      expect(events.first['eventId'], 'evt-1');
      // Aucune donnée personnelle superflue n'est transmise.
      expect(events.first.containsKey('firstName'), isFalse);
      expect(events.first.containsKey('phone'), isFalse);
    });

    test('un terminal révoqué n’est jamais retenté en boucle', () async {
      final adapter = _FakeAdapter(
        handler: (options) async => _json(
          {'success': false, 'message': 'Terminal révoqué.'},
          status: 403,
        ),
      );

      final api = RemoteSyncApi(
        credentials: _credentials(),
        dio: _dioWith(adapter),
      );

      final results = await api.pushAttendance([_dto('evt-9')]);

      expect(results.single.success, isFalse);
      expect(results.single.retryable, isFalse);
      expect(results.single.error, contains('révoqué'));
    });

    test('une erreur réseau reste réessayable', () async {
      final adapter = _FakeAdapter(
        handler: (options) async => throw DioException(
          requestOptions: options,
          type: DioExceptionType.connectionError,
        ),
      );

      final api = RemoteSyncApi(
        credentials: _credentials(),
        dio: _dioWith(adapter),
      );

      final results = await api.pushAttendance([_dto('evt-1')]);
      expect(results.single.success, isFalse);
      expect(results.single.retryable, isTrue);
    });
  });

  group('RemoteSyncApi.pullChanges', () {
    test('analyse élèves, classes, révocations et configuration', () async {
      final adapter = _FakeAdapter(
        handler: (options) async => _json({
          'success': true,
          'data': {
            'serverTime': '2026-11-26T07:00:00.000Z',
            'cursor': '2026-11-26T07:00:00.000Z',
            'school': {'id': 'school-1', 'name': 'Institut AL-BAYAAN'},
            'settings': {
              'show_photo': false,
              'show_matricule': true,
              'late_after_time': '07:45',
              'timezone': 'Africa/Lome',
              'config_version': 4,
            },
            'classes': [
              {'id': 'class-1', 'name': '3e A'},
            ],
            'students': [
              {
                'studentCode': 'ALB-0001',
                'studentUuid': 'stu-1',
                'firstName': 'Adjovi',
                'lastName': 'Kodjo',
                'classId': 'class-1',
                'className': '3e A',
                'qrToken': 'TOKENABCDEFGHIJKLMNOP',
                'isActive': true,
                'badgeRevoked': false,
              },
              {
                'studentCode': 'ALB-0002',
                'studentUuid': 'stu-2',
                'qrToken': '',
                'isActive': false,
                'badgeRevoked': true,
              },
            ],
            'removedStudentCodes': ['ALB-0003'],
          },
        }),
      );

      final api = RemoteSyncApi(
        credentials: _credentials(),
        dio: _dioWith(adapter),
      );

      final pull = await api.pullChanges(cursor: '2026-11-25T07:00:00.000Z');

      expect(pull.students, hasLength(2));
      expect(pull.students.first.qrToken, 'TOKENABCDEFGHIJKLMNOP');
      expect(pull.students.last.badgeRevoked, isTrue);
      expect(pull.classes.single.name, '3e A');
      expect(pull.removedStudentCodes, ['ALB-0003']);
      expect(pull.schoolName, 'Institut AL-BAYAAN');
      expect(pull.config?.lateAfterTime, '07:45');
      expect(pull.config?.showPhoto, isFalse);
      expect(pull.config?.configVersion, 4);

      final query = adapter.requests.single.queryParameters;
      expect(query['since'], '2026-11-25T07:00:00.000Z');
    });

    test('une erreur d’authentification est signalée sans planter', () async {
      final adapter = _FakeAdapter(
        handler: (options) async => _json(
          {'success': false, 'message': 'Terminal inconnu.'},
          status: 401,
        ),
      );

      final api = RemoteSyncApi(
        credentials: _credentials(),
        dio: _dioWith(adapter),
      );

      await expectLater(
        api.pullChanges(),
        throwsA(
          isA<SyncApiException>()
              .having((e) => e.unauthorized, 'unauthorized', isTrue)
              .having((e) => e.message, 'message', contains('Terminal inconnu')),
        ),
      );
    });
  });

  group('ScannerConfigDto', () {
    test('valeurs restrictives par défaut', () {
      const config = ScannerConfigDto();
      expect(config.showPhoto, isTrue);
      expect(config.lateAfterTime, isNull);
      expect(config.notifyParents, isFalse);
      expect(config.configVersion, 0);
    });

    test('les champs absents conservent la valeur par défaut', () {
      final config = ScannerConfigDto.fromJson({'late_after_time': '08:00'});
      expect(config.lateAfterTime, '08:00');
      expect(config.showClassName, isTrue);
      expect(config.showTime, isTrue);
    });
  });
}

