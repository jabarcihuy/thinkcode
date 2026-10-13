import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quethink_mobile/core/theme.dart';
import 'package:quethink_mobile/features/learning/models.dart';
import 'package:quethink_mobile/features/learning/home_page.dart';
import 'package:quethink_mobile/features/learning/materials_page.dart';
import 'package:quethink_mobile/features/lab/answer_fields.dart';
import 'package:quethink_mobile/features/lab/models.dart';
import 'package:quethink_mobile/features/lab/dataset_view.dart';

import 'sql_runner_test.dart' show fixture;

Course course() => Course.fromJson({
  'path': {
    'slug': 'database-fundamentals',
    'title': 'Database Fundamentals',
    'description': 'Explore data and relationships.',
  },
  'profile': {'displayName': 'Learner', 'role': 'USER'},
  'metrics': {
    'totalRequiredLessons': 2,
    'completedRequiredLessons': 0,
    'percentage': 0,
    'currentLessonId': 'one',
  },
  'lessons': [
    for (final id in ['one', 'two'])
      {
        'id': id,
        'slug': id,
        'title': id == 'one' ? 'Tables and data' : 'Relationships',
        'summary': 'Learn how records describe real things.',
        'state': id == 'one' ? 'AVAILABLE' : 'LOCKED',
        'chapterTitle': 'Relations',
        'chapterPosition': 1,
        'readAt': null,
      },
  ],
});
Widget shell(Widget child, {double scale = 1}) => MaterialApp(
  theme: quethinkTheme(Brightness.light),
  home: MediaQuery(
    data: MediaQueryData(textScaler: TextScaler.linear(scale)),
    child: Scaffold(body: child),
  ),
);
void main() {
  for (final width in [320.0, 360.0, 768.0]) {
    testWidgets('dashboard and materials fit $width', (tester) async {
      tester.view.physicalSize = Size(width, 850);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(
        shell(
          HomePage(
            course: course(),
            refresh: () async {},
            open: (_) {},
            materials: () {},
          ),
          scale: 1.3,
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(
        shell(
          MaterialsPage(
            course: course(),
            refresh: () async {},
            open: (_) {
              throw StateError('locked tap');
            },
          ),
          scale: 1.3,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Relationships'));
      expect(tester.takeException(), isNull);
    });
  }
  testWidgets('ordering can be changed without drag gestures', (tester) async {
    Map<String, dynamic>? answer;
    await tester.pumpWidget(
      shell(
        OrderAnswerField(
          blocks: [
            AnswerOption({'id': 'a', 'text': 'First'}),
            AnswerOption({'id': 'b', 'text': 'Second'}),
          ],
          onChanged: (value) => answer = value,
        ),
      ),
    );
    await tester.tap(find.byTooltip('Move step 1 down'));
    await tester.pump();
    expect(answer, {
      'order': ['b', 'a'],
    });
  });
  testWidgets('choice emits only an answer ID', (tester) async {
    Map<String, dynamic>? answer;
    await tester.pumpWidget(
      shell(
        ChoiceAnswerField(
          options: [
            AnswerOption({'id': 'a', 'text': 'Record'}),
            AnswerOption({'id': 'b', 'text': 'Table'}),
          ],
          onChanged: (value) => answer = value,
        ),
      ),
    );
    await tester.tap(find.text('Table'));
    await tester.pump();
    expect(answer, {'choiceId': 'b'});
  });
  testWidgets('schema and records fit 360px with larger text', (tester) async {
    tester.view.physicalSize = const Size(360, 850);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final data = fixture();
    await tester.pumpWidget(
      shell(
        SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: DatasetView(dataset: data, snapshot: data.initialSnapshot),
        ),
        scale: 2,
      ),
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
}
