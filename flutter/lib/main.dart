import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/api.dart';
import 'core/config.dart';
import 'core/locale.dart';
import 'core/secure_session_store.dart';
import 'core/theme.dart';
import 'core/widgets.dart';
import 'features/auth/login_page.dart';
import 'features/learning/controller.dart';
import 'features/learning/home_page.dart';
import 'features/learning/materials_page.dart';
import 'features/learning/models.dart';
import 'features/learning/progress_page.dart';
import 'features/learning/reading_page.dart';
import 'features/lab/lab_page.dart';
import 'features/profile/profile_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    AppConfig.validate();
    final preferences = await SharedPreferences.getInstance();
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      publishableKey: AppConfig.publishableKey,
      debug: false,
      authOptions: FlutterAuthClientOptions(
        localStorage: SecureSessionStore(
          'quethink.${Uri.parse(AppConfig.supabaseUrl).host}.session',
        ),
      ),
    );
    runApp(
      QuethinkApp(
        locale: AppLocale(preferences),
        client: Supabase.instance.client,
      ),
    );
  } catch (_) {
    runApp(
      MaterialApp(
        home: Scaffold(
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Quethink could not start. Check this build’s public configuration, then restart the app.',
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class QuethinkApp extends StatelessWidget {
  final AppLocale locale;
  final SupabaseClient client;
  const QuethinkApp({super.key, required this.locale, required this.client});
  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: locale,
    builder: (context, _) => MaterialApp(
      title: 'Quethink',
      debugShowCheckedModeBanner: false,
      theme: quethinkTheme(Brightness.light),
      darkTheme: quethinkTheme(Brightness.dark),
      themeMode: ThemeMode.system,
      locale: Locale(locale.value),
      supportedLocales: const [Locale('en'), Locale('id')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      home: AuthGate(client: client, locale: locale),
    ),
  );
}

class AuthGate extends StatefulWidget {
  final SupabaseClient client;
  final AppLocale locale;
  const AuthGate({super.key, required this.client, required this.locale});
  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  late final StreamSubscription<AuthState> subscription;
  @override
  void initState() {
    super.initState();
    subscription = widget.client.auth.onAuthStateChange.listen((_) {
      if (!mounted) return;
      if (widget.client.auth.currentSession == null) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
      setState(() {});
    });
  }

  @override
  void dispose() {
    subscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      widget.client.auth.currentSession == null
      ? LoginPage(client: widget.client)
      : LearningShell(
          key: ValueKey(widget.client.auth.currentUser!.id),
          client: widget.client,
          locale: widget.locale,
        );
}

class LearningShell extends StatefulWidget {
  final SupabaseClient client;
  final AppLocale locale;
  const LearningShell({super.key, required this.client, required this.locale});
  @override
  State<LearningShell> createState() => _LearningShellState();
}

class _LearningShellState extends State<LearningShell> {
  late final LearningController controller;
  late String language;
  int selected = 0;
  @override
  void initState() {
    super.initState();
    language = widget.locale.value;
    controller = LearningController(
      LearningApi(
        baseUrl: AppConfig.apiUrl,
        locale: () => widget.locale.value,
        token: () async {
          var session = widget.client.auth.currentSession;
          if (session?.isExpired ?? false) {
            session = (await widget.client.auth.refreshSession()).session;
          }
          return session?.accessToken;
        },
      ),
    );
    unawaited(controller.refresh());
  }

  @override
  void didUpdateWidget(covariant LearningShell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (language != widget.locale.value) {
      language = widget.locale.value;
      unawaited(controller.refresh());
    }
  }

  @override
  void dispose() {
    controller.dispose();
    controller.api.close();
    super.dispose();
  }

  void open(MaterialItem item, {bool continueLearning = false}) {
    if (item.locked) return;
    if (continueLearning && item.readAt != null) {
      openLab(item.id);
      return;
    }
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) => ReadingPage(
          id: item.id,
          api: controller.api,
          refresh: controller.refresh,
          openLab: () => openLab(item.id),
        ),
      ),
    );
  }

  void openLab(String id) {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) => LabPage(
          id: id,
          learning: controller,
          nextMaterial: (item) {
            Navigator.of(context).popUntil((route) => route.isFirst);
            open(item);
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: controller,
    builder: (context, _) {
      final labels = [
        t(context, 'Home', 'Beranda'),
        t(context, 'Materials', 'Materi'),
        t(context, 'Progress', 'Progres'),
        t(context, 'Profile', 'Profil'),
      ];
      const icons = [
        Icons.home_outlined,
        Icons.menu_book_outlined,
        Icons.insights_outlined,
        Icons.person_outline,
      ];
      final course = controller.course;
      final Widget body;
      if (selected == 3) {
        body = ProfilePage(
          client: widget.client,
          locale: widget.locale,
          course: course,
        );
      } else if (controller.error != null) {
        body = ErrorPanel(
          message: controller.error!,
          retry: controller.refresh,
        );
      } else if (course == null) {
        body = const Center(child: CircularProgressIndicator());
      } else {
        body = switch (selected) {
          0 => HomePage(
            course: course,
            refresh: controller.refresh,
            open: (item) => open(item, continueLearning: true),
            materials: () => setState(() => selected = 1),
          ),
          1 => MaterialsPage(
            course: course,
            refresh: controller.refresh,
            open: open,
          ),
          _ => ProgressPage(course: course),
        };
      }
      final wide = MediaQuery.sizeOf(context).width >= 720;
      return Scaffold(
        appBar: AppBar(
          title: Text(selected == 0 ? 'Quethink' : labels[selected]),
          actions: [
            IconButton(
              tooltip: t(context, 'Refresh progress', 'Segarkan progres'),
              onPressed: controller.loading ? null : controller.refresh,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        body: SafeArea(
          top: false,
          child: Row(
            children: [
              if (wide)
                NavigationRail(
                  selectedIndex: selected,
                  onDestinationSelected: (value) =>
                      setState(() => selected = value),
                  labelType: NavigationRailLabelType.all,
                  destinations: [
                    for (var i = 0; i < labels.length; i++)
                      NavigationRailDestination(
                        icon: Icon(icons[i]),
                        label: Text(labels[i]),
                      ),
                  ],
                ),
              Expanded(child: PageWidth(child: body)),
            ],
          ),
        ),
        bottomNavigationBar: wide
            ? null
            : NavigationBar(
                selectedIndex: selected,
                onDestinationSelected: (value) =>
                    setState(() => selected = value),
                destinations: [
                  for (var i = 0; i < labels.length; i++)
                    NavigationDestination(
                      icon: Icon(icons[i]),
                      label: labels[i],
                    ),
                ],
              ),
      );
    },
  );
}
