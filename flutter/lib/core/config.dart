import 'dart:convert';

import 'package:flutter/foundation.dart';

class AppConfig {
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const publishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
  );
  static const apiUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://www.barlabs.my.id',
  );
  static void validate() {
    final supabase = Uri.tryParse(supabaseUrl), api = Uri.tryParse(apiUrl);
    var publicKey = publishableKey.startsWith('sb_publishable_');
    if (!publicKey && publishableKey.split('.').length == 3) {
      try {
        final claims = jsonDecode(
          utf8.decode(
            base64Url.decode(base64Url.normalize(publishableKey.split('.')[1])),
          ),
        );
        publicKey = claims is Map && claims['role'] == 'anon';
      } catch (_) {
        /* Reject malformed or privileged keys. */
      }
    }
    final local =
        api != null &&
        !kReleaseMode &&
        ['10.0.2.2', 'localhost', '127.0.0.1'].contains(api.host) &&
        api.scheme == 'http';
    if (supabase?.scheme != 'https' ||
        supabase!.host.isEmpty ||
        api == null ||
        api.host.isEmpty ||
        !(api.scheme == 'https' || local) ||
        !publicKey) {
      throw const FormatException(
        'This build has invalid public connection settings.',
      );
    }
  }
}
