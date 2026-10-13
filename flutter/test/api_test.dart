import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:quethink_mobile/core/api.dart';

void main() {
  test('sends only bearer identity and selected language', () async {
    final api = LearningApi(
      baseUrl: 'https://example.test',
      token: () async => 'token',
      locale: () => 'id',
      client: MockClient((request) async {
        expect(request.url.path, '/api/mobile/v1/course');
        expect(request.headers['authorization'], 'Bearer token');
        expect(request.headers['x-quethink-locale'], 'id');
        expect(request.headers.containsKey('cookie'), isFalse);
        return http.Response('{"ok":true}', 200);
      }),
    );
    expect((await api.request('course'))['ok'], isTrue);
    api.close();
  });
  test('missing identity never makes an HTTP request', () async {
    final api = LearningApi(
      baseUrl: 'https://example.test',
      token: () async => null,
      locale: () => 'en',
      client: MockClient((_) async => throw StateError('must not call')),
    );
    await expectLater(
      api.request('course'),
      throwsA(isA<ApiException>().having((e) => e.status, 'status', 401)),
    );
  });
  test('safe server error and invalid JSON', () async {
    for (final response in [
      http.Response(
        jsonEncode({'error': 'Sign in again.', 'code': 'unauthorized'}),
        401,
      ),
      http.Response('<html>Unavailable</html>', 502),
    ]) {
      final api = LearningApi(
        baseUrl: 'https://example.test',
        token: () async => 'token',
        locale: () => 'en',
        client: MockClient((_) async => response),
      );
      await expectLater(api.request('course'), throwsA(isA<ApiException>()));
    }
  });
  test('response size is bounded', () async {
    final api = LearningApi(
      baseUrl: 'https://example.test',
      token: () async => 'token',
      locale: () => 'en',
      client: MockClient((_) async => http.Response('x' * (513 * 1024), 200)),
    );
    await expectLater(
      api.request('course'),
      throwsA(
        isA<ApiException>().having(
          (e) => e.message,
          'message',
          contains('too large'),
        ),
      ),
    );
  });
}
