import 'package:flutter/material.dart';

import '../../core/api.dart';
import '../../core/error_text.dart';
import '../../core/locale.dart';
import '../../core/widgets.dart';
import '../learning/controller.dart';
import '../learning/models.dart';
import 'models.dart';
import 'sql_runner.dart';
import 'dataset.dart';
import 'dataset_view.dart';
import 'result_table.dart';
import 'core_exercise_card.dart';

class LabPage extends StatefulWidget {
  final String id;
  final LearningController learning;
  final void Function(MaterialItem) nextMaterial;
  const LabPage({
    super.key,
    required this.id,
    required this.learning,
    required this.nextMaterial,
  });
  @override
  State<LabPage> createState() => _LabPageState();
}

class _LabPageState extends State<LabPage> {
  final source = TextEditingController();
  LabContent? content;
  String? error, locale;
  int selected = 0;
  Map<String, List<DataRowMap>> snapshot = {};
  SqlResult? result;
  bool busy = false, completed = false;
  @override
  void dispose() {
    source.dispose();
    super.dispose();
  }

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
      final next = LabContent(
        await widget.learning.api.request('materials/${widget.id}/lab'),
      );
      if (mounted) {
        setState(() {
          if (content == null) {
            selected = 0;
            source.text = next.scenarios.first['sql'];
            snapshot = next.datasets.first.initialSnapshot;
          }
          content = next;
          error = null;
          completed = next.lesson.complete;
        });
      }
    } catch (cause) {
      if (mounted) {
        setState(
          () => error = cause is ApiException
              ? cause.message
              : 'The Lab could not be loaded.',
        );
      }
    }
  }

  void switchDataset(int index) {
    setState(() {
      selected = index;
      snapshot = content!.datasets[index].initialSnapshot;
      result = null;
      source.text =
          content!.scenarios
              .where((x) => x['datasetId'] == content!.datasets[index].id)
              .firstOrNull?['sql'] ??
          'SELECT * FROM ${content!.datasets[index].tables.first.name};';
    });
  }

  Future<void> run() async {
    FocusScope.of(context).unfocus();
    setState(() => busy = true);
    final sql = source.text, dataset = content!.datasets[selected];
    try {
      var next = await runSql(
        SqlRequest(dataset, sql, snapshot, content!.allowWrite, false),
      );
      if (!mounted) return;
      if (next.mutation && next.error == null) {
        final columns =
            next.after.firstOrNull?.keys.toList() ??
            next.before.firstOrNull?.keys.toList() ??
            <String>[];
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(
              t(
                context,
                'Review one-row change',
                'Periksa perubahan satu record',
              ),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(t(context, 'Before', 'Sebelum')),
                  ResultTable(
                    columns: columns,
                    rows: next.before
                        .map(
                          (row) =>
                              columns.map((column) => row[column]).toList(),
                        )
                        .toList(),
                    label: t(context, 'Before change', 'Sebelum perubahan'),
                  ),
                  const SizedBox(height: 16),
                  Text(t(context, 'After', 'Sesudah')),
                  ResultTable(
                    columns: columns,
                    rows: next.after
                        .map(
                          (row) =>
                              columns.map((column) => row[column]).toList(),
                        )
                        .toList(),
                    label: t(context, 'After change', 'Sesudah perubahan'),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text(t(context, 'Cancel', 'Batal')),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: Text(t(context, 'Apply change', 'Terapkan perubahan')),
              ),
            ],
          ),
        );
        if (confirmed == true) {
          next = await runSql(
            SqlRequest(dataset, sql, snapshot, content!.allowWrite, true),
          );
        }
      }
      if (mounted) {
        setState(() {
          result = next;
          if (next.applied) snapshot = next.snapshot;
        });
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: Text(t(context, 'Learning Lab', 'Lab Materi'))),
      body: SafeArea(
        top: false,
        child: PageWidth(
          child: error != null
              ? ErrorPanel(message: error!, retry: load)
              : content == null
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                  children: [
                    Text(
                      content!.lesson.title,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      t(
                        context,
                        'Explore synthetic data. Run does not complete the material; pass the core check below.',
                        'Jelajahi data sintetis. Run tidak menuntaskan materi; lulus pemeriksaan inti di bawah.',
                      ),
                    ),
                    const SizedBox(height: 24),
                    if (content!.datasets.length > 1) ...[
                      DropdownButtonFormField<int>(
                        initialValue: selected,
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: t(
                            context,
                            'Practice dataset',
                            'Dataset latihan',
                          ),
                        ),
                        items: [
                          for (var i = 0; i < content!.datasets.length; i++)
                            DropdownMenuItem(
                              value: i,
                              child: Text(content!.datasets[i].title),
                            ),
                        ],
                        onChanged: busy
                            ? null
                            : (index) {
                                if (index != null) switchDataset(index);
                              },
                      ),
                      const SizedBox(height: 20),
                    ],
                    DatasetView(
                      dataset: content!.datasets[selected],
                      snapshot: snapshot,
                    ),
                    if (content!.sqlEnabled) ...[
                      const SizedBox(height: 24),
                      Text(
                        'SQL',
                        style: Theme.of(context).textTheme.titleLarge
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: source,
                        enabled: !busy,
                        minLines: 5,
                        maxLines: 10,
                        maxLength: 4096,
                        keyboardType: TextInputType.multiline,
                        autocorrect: false,
                        enableSuggestions: false,
                        style: const TextStyle(fontFamily: 'monospace'),
                        decoration: InputDecoration(
                          labelText: t(context, 'Your query', 'Query kamu'),
                          alignLabelWithHint: true,
                        ),
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: FilledButton.icon(
                              onPressed: busy ? null : run,
                              icon: busy
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.play_arrow),
                              label: Text(
                                t(
                                  context,
                                  busy ? 'Running…' : 'Run query',
                                  busy ? 'Menjalankan…' : 'Jalankan query',
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            tooltip: t(
                              context,
                              'Reset synthetic data',
                              'Reset data sintetis',
                            ),
                            onPressed: busy
                                ? null
                                : () => switchDataset(selected),
                            icon: const Icon(Icons.restart_alt),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        t(context, 'Query result', 'Hasil query'),
                        style: Theme.of(context).textTheme.titleLarge
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 12),
                      if (result?.error != null)
                        Semantics(
                          liveRegion: true,
                          child: Text(
                            sqlErrorText(
                              result!.error!,
                              Localizations.localeOf(context).languageCode,
                            ),
                            style: TextStyle(color: colors.error),
                          ),
                        )
                      else if (result?.mutation == true)
                        Text(
                          t(
                            context,
                            result!.applied
                                ? 'One record changed. Inspect the table above.'
                                : 'Preview only; no data changed.',
                            result!.applied
                                ? 'Satu record berubah. Periksa tabel di atas.'
                                : 'Hanya pratinjau; data belum berubah.',
                          ),
                        )
                      else
                        ResultTable(
                          columns: result?.columns ?? [],
                          rows: result?.rows ?? [],
                          label: t(
                            context,
                            'SQL query result',
                            'Hasil query SQL',
                          ),
                        ),
                      if (result?.truncated == true)
                        Text(
                          t(
                            context,
                            'Output was limited to keep the Lab responsive.',
                            'Hasil dibatasi agar Lab tetap responsif.',
                          ),
                        ),
                    ],
                    for (final exercise in content!.exercises)
                      CoreExerciseCard(
                        key: ValueKey(exercise.id),
                        exercise: exercise,
                        pathSlug: widget.learning.course!.slug,
                        api: widget.learning.api,
                        datasets: content!.datasets,
                        onGraded: (done) async {
                          await widget.learning.refresh();
                          if (mounted && done) setState(() => completed = true);
                        },
                      ),
                    if (completed) ...[
                      const SizedBox(height: 24),
                      Semantics(
                        liveRegion: true,
                        child: Text(
                          t(context, 'Material completed.', 'Materi tuntas.'),
                          style: TextStyle(
                            color: colors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        onPressed: widget.learning.course?.current == null
                            ? () => Navigator.popUntil(
                                context,
                                (route) => route.isFirst,
                              )
                            : () => widget.nextMaterial(
                                widget.learning.course!.current!,
                              ),
                        icon: const Icon(Icons.arrow_forward),
                        label: Text(
                          t(
                            context,
                            widget.learning.course?.current == null
                                ? 'Back to dashboard'
                                : 'Next material',
                            widget.learning.course?.current == null
                                ? 'Kembali ke beranda'
                                : 'Materi berikutnya',
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
        ),
      ),
    );
  }
}
