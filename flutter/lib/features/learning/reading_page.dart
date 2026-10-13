import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/api.dart';
import '../../core/locale.dart';
import '../../core/widgets.dart';
import 'models.dart';

class ReadingPage extends StatefulWidget {
  final String id;
  final LearningApi api;
  final Future<void> Function() refresh;
  final VoidCallback openLab;
  const ReadingPage({
    super.key,
    required this.id,
    required this.api,
    required this.refresh,
    required this.openLab,
  });
  @override
  State<ReadingPage> createState() => _ReadingPageState();
}

class _ReadingPageState extends State<ReadingPage> {
  MaterialReading? reading;
  String? error, locale;
  bool saving = false;
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final next = Localizations.localeOf(context).languageCode;
    if (locale != next) {
      locale = next;
      load();
    }
  }

  Future<void> load() async {
    try {
      final next = MaterialReading.fromJson(
        await widget.api.request('materials/${widget.id}'),
      );
      if (mounted) {
        setState(() {
          reading = next;
          error = null;
        });
      }
    } catch (cause) {
      if (mounted) {
        setState(
          () => error = cause is ApiException
              ? cause.message
              : 'Could not load this material.',
        );
      }
    }
  }

  Future<void> acknowledge() async {
    setState(() => saving = true);
    try {
      if (reading!.lesson.readAt == null) {
        await widget.api.request('materials/${widget.id}/read', body: {});
      }
      await widget.refresh();
      if (mounted) widget.openLab();
    } catch (cause) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              cause is ApiException
                  ? cause.message
                  : t(
                      context,
                      'Could not save progress. Please try again.',
                      'Progres belum tersimpan. Coba lagi.',
                    ),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(t(context, 'Read', 'Baca'))),
    body: SafeArea(
      top: false,
      child: PageWidth(
        child: error != null
            ? ErrorPanel(message: error!, retry: load)
            : reading == null
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                children: [
                  Text(
                    reading!.lesson.title,
                    style: Theme.of(context).textTheme.headlineMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    reading!.lesson.summary,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 24),
                  MarkdownBody(
                    data: reading!.content,
                    selectable: true,
                    styleSheet: MarkdownStyleSheet.fromTheme(Theme.of(context))
                        .copyWith(
                          p: Theme.of(context).textTheme.bodyLarge
                              ?.copyWith(height: 1.75),
                        ),
                    onTapLink: (_, href, _) async {
                      final uri = Uri.tryParse(href ?? '');
                      if (uri?.scheme == 'https') {
                        await launchUrl(
                          uri!,
                          mode: LaunchMode.externalApplication,
                        );
                      }
                    },
                  ),
                  const SizedBox(height: 32),
                  if (reading!.active)
                    Text(
                      t(
                        context,
                        'Reading acknowledgement and Labs are paused during your active challenge.',
                        'Penyimpanan bacaan dan Lab dijeda selama tantangan aktif.',
                      ),
                    )
                  else
                    FilledButton.icon(
                      onPressed: saving ? null : acknowledge,
                      icon: saving
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.arrow_forward),
                      label: Text(
                        t(
                          context,
                          reading!.lesson.readAt == null
                              ? 'Finished reading · open Lab'
                              : 'Open core Lab',
                          reading!.lesson.readAt == null
                              ? 'Selesai membaca · buka Lab'
                              : 'Buka Lab inti',
                        ),
                      ),
                    ),
                ],
              ),
      ),
    ),
  );
}
