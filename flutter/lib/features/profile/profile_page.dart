import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/locale.dart';
import '../learning/models.dart';

class ProfilePage extends StatelessWidget {
  final SupabaseClient client;
  final AppLocale locale;
  final Course? course;
  const ProfilePage({
    super.key,
    required this.client,
    required this.locale,
    this.course,
  });
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(24),
    children: [
      CircleAvatar(
        radius: 36,
        child: Text(
          (course?.name.isNotEmpty ?? false)
              ? course!.name.characters.first.toUpperCase()
              : 'Q',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
      const SizedBox(height: 16),
      Text(
        course?.name ?? t(context, 'Your account', 'Akunmu'),
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.titleLarge,
      ),
      const SizedBox(height: 8),
      Text(client.auth.currentUser?.email ?? '', textAlign: TextAlign.center),
      const SizedBox(height: 32),
      Text(
        t(context, 'App language', 'Bahasa aplikasi'),
        style: Theme.of(context).textTheme.titleMedium,
      ),
      const SizedBox(height: 12),
      SegmentedButton<String>(
        segments: const [
          ButtonSegment(value: 'en', label: Text('English')),
          ButtonSegment(value: 'id', label: Text('Indonesia')),
        ],
        selected: {locale.value},
        onSelectionChanged: (selection) async {
          try {
            await locale.change(selection.single);
          } catch (_) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    t(
                      context,
                      'Language could not be saved.',
                      'Bahasa belum tersimpan.',
                    ),
                  ),
                ),
              );
            }
          }
        },
      ),
      const SizedBox(height: 32),
      OutlinedButton.icon(
        onPressed: () async {
          final confirmed = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: Text(t(context, 'Sign out?', 'Keluar dari akun?')),
              content: Text(
                t(
                  context,
                  'Your saved learning progress will remain in your account.',
                  'Progres belajar yang tersimpan tetap ada di akunmu.',
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: Text(t(context, 'Cancel', 'Batal')),
                ),
                FilledButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: Text(t(context, 'Sign out', 'Keluar')),
                ),
              ],
            ),
          );
          if (confirmed == true) {
            try {
              await client.auth.signOut(scope: SignOutScope.local);
            } catch (_) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      t(
                        context,
                        'Could not sign out. Try again.',
                        'Belum bisa keluar. Coba lagi.',
                      ),
                    ),
                  ),
                );
              }
            }
          }
        },
        icon: const Icon(Icons.logout),
        label: Text(t(context, 'Sign out', 'Keluar')),
      ),
    ],
  );
}
