import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// App appearance is independent of Android night mode and wallpaper colors.
const quethinkThemeMode = ThemeMode.light;
const quethinkBackground = Color(0xFFF8F7FC);
const quethinkSystemUiStyle = SystemUiOverlayStyle(
  statusBarColor: Colors.transparent,
  statusBarIconBrightness: Brightness.dark,
  statusBarBrightness: Brightness.light,
  systemStatusBarContrastEnforced: false,
  systemNavigationBarColor: Colors.transparent,
  systemNavigationBarIconBrightness: Brightness.dark,
  systemNavigationBarContrastEnforced: false,
);

Widget quethinkSystemChrome(BuildContext context, Widget? child) =>
    AnnotatedRegion<SystemUiOverlayStyle>(
      value: quethinkSystemUiStyle,
      child: child ?? const SizedBox.shrink(),
    );

ThemeData quethinkTheme(Brightness brightness) {
  final scheme =
      ColorScheme.fromSeed(
        seedColor: const Color(0xFF4F46E5),
        brightness: brightness,
      ).copyWith(
        secondaryContainer: brightness == Brightness.light
            ? const Color(0xFFFFE9D5)
            : const Color(0xFF4B3225),
        onSecondaryContainer: brightness == Brightness.light
            ? const Color(0xFF53300F)
            : const Color(0xFFFFDFC0),
      );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: brightness == Brightness.light
        ? quethinkBackground
        : scheme.surface,
    appBarTheme: AppBarTheme(
      backgroundColor: brightness == Brightness.light
          ? quethinkBackground
          : scheme.surface,
      scrolledUnderElevation: 0,
      systemOverlayStyle: quethinkSystemUiStyle,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: scheme.surfaceContainerLowest,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      contentPadding: const EdgeInsets.all(16),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(48, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(48, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(minimumSize: const Size(48, 48)),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: scheme.surfaceContainerLowest,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: scheme.outlineVariant),
      ),
    ),
  );
}
