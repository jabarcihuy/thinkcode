import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../core/locale.dart';
import 'dataset.dart';

class SchemaCanvas extends StatefulWidget {
  final SqlDataset dataset;
  final String selected;
  final ValueChanged<String> onSelect;
  const SchemaCanvas({
    super.key,
    required this.dataset,
    required this.selected,
    required this.onSelect,
  });
  @override
  State<SchemaCanvas> createState() => _SchemaCanvasState();
}

class _SchemaCanvasState extends State<SchemaCanvas> {
  final transform = TransformationController();
  bool needsFit = true;
  @override
  void dispose() {
    transform.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant SchemaCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.dataset.id != widget.dataset.id) {
      needsFit = true;
      transform.value = Matrix4.identity();
    }
  }

  Widget tableCard(BuildContext context, DataTableSpec table, double scale) {
    final colors = Theme.of(context).colorScheme;
    return Semantics(
      button: true,
      label: table.name,
      selected: table.name == widget.selected,
      child: Material(
        color: colors.surfaceContainerLowest,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: table.name == widget.selected
                ? colors.primary
                : colors.outlineVariant,
            width: table.name == widget.selected ? 2 : 1,
          ),
        ),
        child: InkWell(
          onTap: () => widget.onSelect(table.name),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                height: 44 * scale,
                color: colors.secondaryContainer,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                alignment: Alignment.centerLeft,
                child: Text(
                  table.name,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: colors.onSecondaryContainer,
                  ),
                ),
              ),
              for (final column in table.columns)
                SizedBox(
                  height: 26 * scale,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            column.name,
                            style: Theme.of(context).textTheme.labelMedium,
                          ),
                        ),
                        Text(
                          column.key ?? column.type,
                          style: Theme.of(context).textTheme.labelSmall,
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final scale = MediaQuery.textScalerOf(context).scale(14) / 14;
    final cardWidth = 200 * scale,
        stride = 250 * scale,
        rowStride = 280 * scale;
    final positions = {
      for (var i = 0; i < widget.dataset.tables.length; i++)
        widget.dataset.tables[i].name: Offset(
          20 + (i % 2) * stride,
          20 + (i ~/ 2) * rowStride,
        ),
    };
    final height = math.max(
          280.0,
          ((widget.dataset.tables.length + 1) ~/ 2) * rowStride,
        ),
        width = widget.dataset.tables.length == 1
            ? cardWidth + 40
            : stride + cardWidth + 40;
    return LayoutBuilder(
      builder: (context, constraints) {
        if (needsFit) {
          needsFit = false;
          final fit = math
              .min(constraints.maxWidth / width, 280 / height)
              .clamp(.35, 1.0);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              transform.value = Matrix4.diagonal3Values(fit, fit, 1);
            }
          });
        }
        return Column(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: SizedBox(
                height: 280,
                child: ColoredBox(
                  color: colors.surfaceContainerLow,
                  child: InteractiveViewer(
                    transformationController: transform,
                    minScale: .35,
                    maxScale: 1.8,
                    constrained: false,
                    boundaryMargin: const EdgeInsets.all(80),
                    child: SizedBox(
                      width: width,
                      height: height,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: CustomPaint(
                              painter: _RelationsPainter(
                                widget.dataset,
                                positions,
                                colors.primary,
                                scale,
                              ),
                            ),
                          ),
                          for (final table in widget.dataset.tables)
                            Positioned(
                              left: positions[table.name]!.dx,
                              top: positions[table.name]!.dy,
                              width: cardWidth,
                              child: tableCard(context, table, scale),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: Text(
                    t(
                      context,
                      'Pan or zoom to explore.',
                      'Geser atau zoom untuk menjelajahi.',
                    ),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
                IconButton(
                  tooltip: t(context, 'Fit schema', 'Paskan skema'),
                  onPressed: () {
                    final scale = math
                        .min(constraints.maxWidth / width, 280 / height)
                        .clamp(.35, 1.0);
                    transform.value = Matrix4.diagonal3Values(scale, scale, 1);
                  },
                  icon: const Icon(Icons.fit_screen),
                ),
                IconButton(
                  tooltip: t(context, 'Reset view', 'Reset tampilan'),
                  onPressed: () => transform.value = Matrix4.identity(),
                  icon: const Icon(Icons.restart_alt),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

class _RelationsPainter extends CustomPainter {
  final SqlDataset dataset;
  final Map<String, Offset> positions;
  final Color color;
  final double scale;
  _RelationsPainter(this.dataset, this.positions, this.color, this.scale);
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    for (final relation in dataset.relations) {
      final parent = dataset.tables.singleWhere(
            (x) => x.name == relation.parent,
          ),
          child = dataset.tables.singleWhere((x) => x.name == relation.child);
      final start =
              positions[parent.name]! +
              Offset(
                200 * scale,
                44 * scale +
                    parent.columns.indexWhere(
                          (x) => x.name == relation.parentColumn,
                        ) *
                        26 *
                        scale +
                    13 * scale,
              ),
          end =
              positions[child.name]! +
              Offset(
                0,
                44 * scale +
                    child.columns.indexWhere(
                          (x) => x.name == relation.childColumn,
                        ) *
                        26 *
                        scale +
                    13 * scale,
              );
      canvas.drawPath(
        Path()
          ..moveTo(start.dx, start.dy)
          ..cubicTo(
            start.dx + 28,
            start.dy,
            end.dx - 28,
            end.dy,
            end.dx,
            end.dy,
          ),
        paint,
      );
      canvas.drawCircle(start, 3, paint);
      canvas.drawCircle(end, 3, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _RelationsPainter oldDelegate) =>
      oldDelegate.dataset != dataset ||
      oldDelegate.color != color ||
      oldDelegate.scale != scale;
}
