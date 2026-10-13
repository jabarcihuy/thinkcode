import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SecureSessionStore extends LocalStorage {
  final FlutterSecureStorage storage;
  final String key;
  const SecureSessionStore(
    this.key, {
    this.storage = const FlutterSecureStorage(),
  });
  @override
  Future<void> initialize() async {}
  @override
  Future<bool> hasAccessToken() => storage.containsKey(key: key);
  @override
  Future<String?> accessToken() => storage.read(key: key);
  @override
  Future<void> removePersistedSession() => storage.delete(key: key);
  @override
  Future<void> persistSession(String value) =>
      storage.write(key: key, value: value);
}
