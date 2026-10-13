import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:quethink_mobile/core/locale.dart';
import 'package:quethink_mobile/core/theme.dart';
import 'package:quethink_mobile/features/auth/login_page.dart';
import 'package:quethink_mobile/main.dart';

void main() {
  testWidgets(
    'Android night mode cannot change app appearance; text scaling remains available',
    (tester) async {
      SharedPreferences.setMockInitialValues({});
      final preferences = await SharedPreferences.getInstance();
      final locale = AppLocale(preferences);
      final client = (await tester.runAsync(
        () async => SupabaseClient(
          'https://example.supabase.co',
          'sb_publishable_test',
          authOptions: const AuthClientOptions(autoRefreshToken: false),
        ),
      ))!;
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
      tester.platformDispatcher.textScaleFactorTestValue = 1.3;
      addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
      await tester.pumpWidget(QuethinkApp(locale: locale, client: client));
      await tester.pumpAndSettle();
      final context = tester.element(find.byType(LoginPage));
      final colors = Theme.of(context).colorScheme;
      expect(Theme.of(context).brightness, Brightness.light);
      expect(MediaQuery.platformBrightnessOf(context), Brightness.dark);
      expect(MediaQuery.textScalerOf(context).scale(16), greaterThan(16));
      expect(Theme.of(context).scaffoldBackgroundColor, quethinkBackground);
      final overlay = tester.widgetList<AnnotatedRegion<SystemUiOverlayStyle>>(
        find.byType(AnnotatedRegion<SystemUiOverlayStyle>),
      );
      expect(
        overlay.any((region) => region.value == quethinkSystemUiStyle),
        isTrue,
      );
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.light;
      await tester.pumpAndSettle();
      expect(Theme.of(context).colorScheme, colors);
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox.shrink());
      locale.dispose();
      await tester.runAsync(client.dispose);
    },
  );
  test(
    'Android day/night launch resources explicitly preserve light appearance',
    () {
      final day = File('android/app/src/main/res/values/styles.xml')
          .readAsStringSync();
      final night = File('android/app/src/main/res/values-night/styles.xml')
          .readAsStringSync();
      expect(night, day);
      expect(night, contains('Theme.Light.NoTitleBar'));
      expect(night, contains('name="android:forceDarkAllowed">false'));
      expect(night, contains('name="android:windowLightStatusBar">true'));
      expect(
        night,
        contains('name="android:windowSplashScreenBackground">#F8F7FC'),
      );
    },
  );
}
