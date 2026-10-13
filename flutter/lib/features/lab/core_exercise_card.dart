import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';

import '../../core/api.dart';
import '../../core/locale.dart';
import '../learning/models.dart';
import 'answer_fields.dart';
import 'models.dart';
import 'schema_answer_field.dart';
import 'result_table.dart';
import 'dataset.dart';

class CoreExerciseCard extends StatefulWidget {
  final CoreExercise exercise;
  final String pathSlug;
  final LearningApi api;
  final List<SqlDataset> datasets;
  final Future<void> Function(bool) onGraded;
  const CoreExerciseCard({
    super.key,
    required this.exercise,
    required this.pathSlug,
    required this.api,
    required this.datasets,
    required this.onGraded,
  });
  @override
  State<CoreExerciseCard> createState() => _CoreExerciseCardState();
}

class _CoreExerciseCardState extends State<CoreExerciseCard> {
  JsonMap? answer;
  bool busy = false, passed = false;
  String? feedback, error;
  @override
  void initState() {
    super.initState();
    passed = widget.exercise.passed;
    if (widget.exercise.mode == 'order') {
      answer = {'order': widget.exercise.blocks.map((x) => x.id).toList()};
    }
    if (widget.exercise.mode == 'output') answer = {'output': ''};
  }

  void changed(JsonMap value) {
    setState(() {
      answer = value;
      feedback = null;
      error = null;
    });
  }

  Future<void> check() async {
    setState(() {
      busy = true;
      error = null;
      feedback = null;
    });
    try {
      final result = await widget.api.request(
        'exercises/${widget.exercise.id}/check',
        body: {'pathSlug': widget.pathSlug, 'answer': answer},
      );
      if (mounted) {
        setState(() {
          passed = result['passed'] == true;
          feedback = result['feedback'];
        });
      }
      await widget.onGraded(result['lessonCompleted'] == true);
    } catch (cause) {
      if (mounted) {
        setState(
          () => error = cause is ApiException
              ? cause.message
              : t(
                  context,
                  'Could not check your answer.',
                  'Jawaban belum bisa diperiksa.',
                ),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final exercise = widget.exercise, colors = Theme.of(context).colorScheme;
    final dataset = widget.datasets
        .where((x) => x.id == exercise.datasetId)
        .firstOrNull;
    return Padding(
      padding: const EdgeInsets.only(top: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Divider(),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Text(
                  exercise.title,
                  style: Theme.of(context).textTheme.titleLarge
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              if (passed)
                Icon(Icons.check_circle_outline, color: colors.primary),
            ],
          ),
          const SizedBox(height: 12),
          MarkdownBody(data: exercise.prompt),
          const SizedBox(height: 16),
          if (dataset != null)
            for (final table in dataset.tables.where(
              (x) => exercise.tableNames.contains(x.name),
            ))
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      table.name,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    ResultTable(
                      columns: table.columns.map((x) => x.name).toList(),
                      rows: table.rows
                          .map(
                            (row) => table.columns
                                .map((column) => row[column.name])
                                .toList(),
                          )
                          .toList(),
                      label: table.name,
                    ),
                  ],
                ),
              ),
          if (exercise.starterCode != null) ...[
            SelectableText(
              exercise.starterCode!,
              style: const TextStyle(fontFamily: 'monospace', height: 1.6),
            ),
            const SizedBox(height: 20),
          ],
          IgnorePointer(
            ignoring: busy,
            child: switch (exercise.mode) {
              'choice' => ChoiceAnswerField(
                options: exercise.options,
                onChanged: changed,
              ),
              'order' => OrderAnswerField(
                blocks: exercise.blocks,
                onChanged: changed,
              ),
              'schema' => SchemaAnswerField(
                modeling: exercise.modeling!,
                onChanged: changed,
              ),
              _ => OutputAnswerField(
                columns: exercise.columns,
                onChanged: changed,
              ),
            },
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: busy || answer == null ? null : check,
            icon: busy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.fact_check_outlined),
            label: Text(
              t(
                context,
                busy ? 'Checking…' : 'Check answer',
                busy ? 'Memeriksa…' : 'Periksa jawaban',
              ),
            ),
          ),
          if (feedback != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Semantics(
                liveRegion: true,
                child: Text(
                  feedback!,
                  style: TextStyle(
                    color: passed ? colors.primary : colors.onSurface,
                  ),
                ),
              ),
            ),
          if (error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Semantics(
                liveRegion: true,
                child: Text(error!, style: TextStyle(color: colors.error)),
              ),
            ),
        ],
      ),
    );
  }
}
