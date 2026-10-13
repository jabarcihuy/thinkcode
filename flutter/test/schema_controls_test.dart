import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quethink_mobile/features/lab/dataset_view.dart';
import 'package:quethink_mobile/features/lab/dataset.dart';
import 'package:quethink_mobile/features/lab/schema_canvas.dart';

import 'mobile_widgets_test.dart' show shell;
import 'sql_runner_test.dart' show fixture;

void main() {
  testWidgets(
    'mobile buttons zoom, focus selected table and restore the full schema',
    (tester) async {
      tester.view.physicalSize = const Size(360, 850);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final semantics = tester.ensureSemantics();
      final data = fixture();
      await tester.pumpWidget(
        shell(
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: DatasetView(dataset: data, snapshot: data.initialSnapshot),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final viewer = tester.widget<InteractiveViewer>(
        find.byType(InteractiveViewer),
      );
      final transform = viewer.transformationController!;
      final initial = transform.value.clone(),
          zoom = initial.getMaxScaleOnAxis();
      await tester.tap(find.byTooltip('Zoom in'));
      await tester.pump();
      expect(transform.value.getMaxScaleOnAxis(), greaterThan(zoom));
      await tester.tap(find.byTooltip('Zoom out'));
      await tester.pump();
      expect(transform.value.getMaxScaleOnAxis(), closeTo(zoom, .001));
      await tester.tap(find.byType(DropdownButtonFormField<String>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('enrollments').last);
      await tester.pumpAndSettle();
      expect(
        tester.widget<SchemaCanvas>(find.byType(SchemaCanvas)).selected,
        'enrollments',
      );
      await tester.tap(find.text('Focus table'));
      await tester.pump();
      final center = transform.toScene(const Offset(160, 140));
      expect(center.dx, closeTo(370, .1));
      await tester.tap(find.text('Show all'));
      await tester.pump();
      expect(transform.value, initial);
      expect(
        tester.getSize(find.byTooltip('Zoom in')).shortestSide,
        greaterThanOrEqualTo(48),
      );
      expect(
        find.bySemanticsLabel('students.id links to enrollments.student_id'),
        findsOneWidget,
      );
      expect(tester.takeException(), isNull);
      semantics.dispose();
    },
  );
  testWidgets('Show all fits a multi-row schema at 200 percent text', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 850);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final data = SqlDataset.fromJson({
      'id': 'large',
      'title': 'Synthetic schema',
      'tables': [
        for (var i = 0; i < 6; i++)
          {
            'name': 'table_$i',
            'columns': [
              {'name': 'id', 'type': 'integer', 'key': 'PK'},
              for (var c = 1; c < 8; c++) {'name': 'column_$c', 'type': 'text'},
            ],
            'rows': [],
          },
      ],
      'relations': [],
    });
    await tester.pumpWidget(
      shell(
        SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: SchemaCanvas(
            dataset: data,
            selected: 'table_0',
            onSelect: (_) {},
          ),
        ),
        scale: 2,
      ),
    );
    await tester.pumpAndSettle();
    final transform = tester
        .widget<InteractiveViewer>(find.byType(InteractiveViewer))
        .transformationController!;
    final bottomRight = MatrixUtils.transformPoint(
      transform.value,
      const Offset(920, 1644),
    );
    expect(bottomRight.dx, lessThanOrEqualTo(320));
    expect(bottomRight.dy, lessThanOrEqualTo(280));
    expect(tester.takeException(), isNull);
  });
}
