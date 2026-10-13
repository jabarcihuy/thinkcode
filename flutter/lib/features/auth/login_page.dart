import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config.dart';
import '../../core/locale.dart';

class LoginPage extends StatefulWidget {
  final SupabaseClient client;
  const LoginPage({super.key, required this.client});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final email = TextEditingController(),
      password = TextEditingController(),
      form = GlobalKey<FormState>();
  bool busy = false, visible = false;
  String? error;
  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> signIn() async {
    if (!form.currentState!.validate()) return;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await widget.client.auth.signInWithPassword(
        email: email.text.trim(),
        password: password.text,
      );
      TextInput.finishAutofillContext();
    } on AuthException {
      if (mounted) {
        setState(
          () => error = t(
            context,
            'Could not sign in. Check your email and password, then try again.',
            'Belum bisa masuk. Periksa email dan kata sandi, lalu coba lagi.',
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(
          () => error = t(
            context,
            'Could not connect. Please try again.',
            'Koneksi belum tersedia. Coba lagi.',
          ),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: AutofillGroup(
                child: Form(
                  key: form,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          SvgPicture.asset(
                            'assets/quethink-mark.svg',
                            width: 40,
                            height: 40,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Quethink',
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      Text(
                        t(
                          context,
                          'Understand data.\nOne query at a time.',
                          'Pahami data.\nSatu query setiap langkah.',
                        ),
                        style: Theme.of(context).textTheme.headlineMedium
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        t(
                          context,
                          'Read, explore relationships, and practice SQL.',
                          'Baca, jelajahi relasi, dan latih query SQL.',
                        ),
                        style: Theme.of(context).textTheme.bodyLarge
                            ?.copyWith(color: colors.onSurfaceVariant),
                      ),
                      const SizedBox(height: 16),
                      Align(
                        alignment: Alignment.centerRight,
                        child: SvgPicture.asset(
                          'assets/learning-map.svg',
                          width: 180,
                          height: 108,
                        ),
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: email,
                        enabled: !busy,
                        decoration: const InputDecoration(labelText: 'Email'),
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                        autocorrect: false,
                        textInputAction: TextInputAction.next,
                        validator: (value) => (value ?? '').trim().contains('@')
                            ? null
                            : t(
                                context,
                                'Enter your email.',
                                'Masukkan email.',
                              ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: password,
                        enabled: !busy,
                        obscureText: !visible,
                        autofillHints: const [AutofillHints.password],
                        autocorrect: false,
                        enableSuggestions: false,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => busy ? null : signIn(),
                        decoration: InputDecoration(
                          labelText: t(context, 'Password', 'Kata sandi'),
                          suffixIcon: IconButton(
                            tooltip: t(
                              context,
                              visible ? 'Hide password' : 'Show password',
                              visible
                                  ? 'Sembunyikan kata sandi'
                                  : 'Tampilkan kata sandi',
                            ),
                            onPressed: () => setState(() => visible = !visible),
                            icon: Icon(
                              visible
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                            ),
                          ),
                        ),
                        validator: (value) => (value ?? '').isNotEmpty
                            ? null
                            : t(
                                context,
                                'Enter your password.',
                                'Masukkan kata sandi.',
                              ),
                      ),
                      if (error != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 16),
                          child: Semantics(
                            liveRegion: true,
                            child: Text(
                              error!,
                              style: TextStyle(color: colors.error),
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: busy ? null : signIn,
                          child: busy
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(t(context, 'Sign in', 'Masuk')),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: TextButton(
                          onPressed: busy
                              ? null
                              : () async {
                                  if (!await launchUrl(
                                        Uri.parse(
                                          '${AppConfig.apiUrl}/register',
                                        ),
                                        mode: LaunchMode.externalApplication,
                                      ) &&
                                      mounted) {
                                    setState(
                                      () => error = t(
                                        context,
                                        'Could not open registration.',
                                        'Halaman daftar belum bisa dibuka.',
                                      ),
                                    );
                                  }
                                },
                          child: Text(
                            t(
                              context,
                              'Create an account on the website',
                              'Buat akun melalui website',
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
