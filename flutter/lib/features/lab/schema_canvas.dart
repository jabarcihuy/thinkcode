import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../core/locale.dart';
import 'dataset.dart';
import 'schema_controls.dart';

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
  double? lastWidth;

  void positionView(double zoom, Offset sceneCenter, Size viewport) {
    transform.value = Matrix4.diagonal3Values(zoom, zoom, 1)
      ..setTranslationRaw(
        viewport.width / 2 - sceneCenter.dx * zoom,
        viewport.height / 2 - sceneCenter.dy * zoom,
        0,
      );
  }

  void zoomBy(double factor, Size viewport) {
    final center = Offset(viewport.width / 2, viewport.height / 2);
    final sceneCenter = transform.toScene(center);
    final zoom = (transform.value.getMaxScaleOnAxis() * factor).clamp(.1, 1.8);
    positionView(zoom, sceneCenter, viewport);
  }

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
    final contentBottom =
        widget.dataset.tables
            .map(
              (table) =>
                  positions[table.name]!.dy +
                  (44 + table.columns.length * 26) * scale,
            )
            .reduce(math.max) +
        20;
    return LayoutBuilder(
      builder: (context, constraints) {
        final viewport = Size(constraints.maxWidth, 280);
        void fitAll() {
          final fit = math
              .min(viewport.width / width, viewport.height / contentBottom)
              .clamp(.1, 1.0);
          positionView(fit, Offset(width / 2, contentBottom / 2), viewport);
        }

        void focusTable() {
          final table = widget.dataset.tables.singleWhere(
            (table) => table.name == widget.selected,
          );
          final tableHeight = (44 + table.columns.length * 26) * scale;
          final zoom = math
              .min(
                (viewport.width - 32) / cardWidth,
                (viewport.height - 32) / tableHeight,
              )
              .clamp(.1, 1.8);
          positionView(
            zoom,
            positions[table.name]! + Offset(cardWidth / 2, tableHeight / 2),
            viewport,
          );
        }

        if (needsFit || lastWidth != constraints.maxWidth) {
          lastWidth = constraints.maxWidth;
          needsFit = false;
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              fitAll();
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
                    minScale: .1,
                    maxScale: 1.8,
                    constrained: false,
                    boundaryMargin: const EdgeInsets.all(double.infinity),
                    child: SizedBox(
                      width: width,
                      height: height,
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: Semantics(
                              label: widget.dataset.relations
                                  .map(
                                    (relation) =>
                                        '${relation.parent}.${relation.parentColumn} ${t(context, "links to", "terhubung ke")} ${relation.child}.${relation.childColumn}',
                                  )
                                  .join('. '),
                              child: CustomPaint(
                                painter: _RelationsPainter(
                                  widget.dataset,
                                  positions,
                                  colors.primary,
                                  scale,
                                ),
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
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerLeft,
              child: ValueListenableBuilder<Matrix4>(
                valueListenable: transform,
                builder: (context, matrix, _) => SchemaControls(
                  zoomIn: matrix.getMaxScaleOnAxis() >= 1.8
                      ? null
                      : () => zoomBy(1.25, viewport),
                  zoomOut: matrix.getMaxScaleOnAxis() <= .1001
                      ? null
                      : () => zoomBy(.8, viewport),
                  fit: fitAll,
                  focus: focusTable,
                ),
              ),
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
