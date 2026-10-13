import 'dart:async';
import 'dart:convert';

import 'error_text.dart';

import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message, code;
  final int status;
  const ApiException(
    this.message, {
    this.code = 'unavailable',
    this.status = 503,
  });
  @override
  String toString() => message;
}

class LearningApi {
  final Uri base;
  final Future<String?> Function() token;
  final String Function() locale;
  final http.Client client;
  LearningApi({
    required String baseUrl,
    required this.token,
    required this.locale,
    http.Client? client,
  }) : base = Uri.parse(baseUrl),
       client = client ?? http.Client();
  Future<Map<String, dynamic>> request(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final accessToken = await token();
    if (accessToken == null) {
      throw const ApiException(
        'Sign in to continue.',
        code: 'unauthorized',
        status: 401,
      );
    }
    final request = http.Request(
      body == null ? 'GET' : 'POST',
      base.resolve('/api/mobile/v1/$path'),
    );
    request.headers.addAll({
      'authorization': 'Bearer $accessToken',
      'x-quethink-locale': locale(),
      'accept': 'application/json',
    });
    if (body != null) {
      request.headers['content-type'] = 'application/json';
      request.body = jsonEncode(body);
    }
    try {
      final response = await client
          .send(request)
          .timeout(const Duration(seconds: 20));
      final bytes = <int>[];
      await for (final chunk in response.stream.timeout(
        const Duration(seconds: 20),
      )) {
        if (bytes.length + chunk.length > 512 * 1024) {
          throw const ApiException(
            'This response is too large. Please try again.',
          );
        }
        bytes.addAll(chunk);
      }
      final decoded = jsonDecode(utf8.decode(bytes));
      if (decoded is! Map<String, dynamic>) {
        throw const ApiException('The server response could not be read.');
      }
      if (response.statusCode != 200) {
        final code = decoded['code'] is String
            ? decoded['code'] as String
            : 'unavailable';
        throw ApiException(
          apiErrorText(
            code,
            decoded['error'] is String ? decoded['error'] : 'Please try again.',
            locale(),
          ),
          code: decoded['code'] is String ? decoded['code'] : 'unavailable',
          status: response.statusCode,
        );
      }
      return decoded;
    } on ApiException {
      rethrow;
    } on TimeoutException {
      throw ApiException(
        apiErrorText(
          'unavailable',
          'The connection took too long. Please try again.',
          locale(),
        ),
      );
    } catch (_) {
      throw ApiException(
        apiErrorText(
          'unavailable',
          'Could not connect. Check your internet connection and try again.',
          locale(),
        ),
      );
    }
  }

  void close() => client.close();
}
