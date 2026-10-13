import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:quethink_mobile/core/secure_session_store.dart';
import 'package:quethink_mobile/core/locale.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('secure sessions are scoped and removable', () async {
    FlutterSecureStorage.setMockInitialValues({});
    const store = SecureSessionStore('project-one'),
        other = SecureSessionStore('project-two');
    expect(await store.hasAccessToken(), false);
    await store.persistSession('synthetic-session');
    expect(await store.accessToken(), 'synthetic-session');
    expect(await other.accessToken(), null);
    await store.removePersistedSession();
    expect(await store.hasAccessToken(), false);
  });
  test('English default and saved Indonesian choice', () async {
    SharedPreferences.setMockInitialValues({});
    final preferences = await SharedPreferences.getInstance(),
        locale = AppLocale(preferences);
    expect(locale.value, 'en');
    await locale.change('id');
    expect(AppLocale(preferences).value, 'id');
    await locale.change('unsupported');
    expect(locale.value, 'id');
    locale.dispose();
  });
}
