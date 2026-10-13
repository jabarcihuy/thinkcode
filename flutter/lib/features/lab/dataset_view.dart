import 'package:flutter/material.dart';

import '../../core/locale.dart';
import 'dataset.dart';
import 'schema_canvas.dart';
import 'result_table.dart';

class DatasetView extends StatefulWidget {
  final SqlDataset dataset;
  final Map<String, List<DataRowMap>> snapshot;
  const DatasetView({super.key, required this.dataset, required this.snapshot});
  @override
  State<DatasetView> createState() => _DatasetViewState();
}

class _DatasetViewState extends State<DatasetView> {
  late String selected = widget.dataset.tables.first.name;
  int page = 0;
  @override
  void didUpdateWidget(covariant DatasetView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.dataset.id != widget.dataset.id) {
      selected = widget.dataset.tables.first.name;
      page = 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final table = widget.dataset.tables.singleWhere((x) => x.name == selected),
        rows = widget.snapshot[selected] ?? table.rows;
    final pages = (rows.length / 5).ceil().clamp(1, 100);
    if (page >= pages) page = pages - 1;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          t(context, 'Tables & relationships', 'Tabel & relasi'),
          style: Theme.of(context).textTheme.titleLarge
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          isExpanded: true,
          initialValue: selected,
          key: ValueKey('${widget.dataset.id}:$selected'),
          decoration: InputDecoration(
            labelText: t(context, 'Inspect table', 'Lihat tabel'),
          ),
          items: widget.dataset.tables
              .map(
                (table) => DropdownMenuItem(
                  value: table.name,
                  child: Text(table.name),
                ),
              )
              .toList(),
          onChanged: (value) {
            if (value != null) {
              setState(() {
                selected = value;
                page = 0;
              });
            }
          },
        ),
        const SizedBox(height: 16),
        SchemaCanvas(
          dataset: widget.dataset,
          selected: selected,
          onSelect: (name) => setState(() {
            selected = name;
            page = 0;
          }),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: table.columns
              .map(
                (column) => Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${column.name} · ${column.type}${column.key == null ? '' : ' · ${column.key}'}',
                  ),
                ),
              )
              .toList(),
        ),
        ResultTable(
          columns: table.columns.map((x) => x.name).toList(),
          rows: rows
              .skip(page * 5)
              .take(5)
              .map((row) => table.columns.map((c) => row[c.name]).toList())
              .toList(),
          label: t(context, 'Synthetic records', 'Record sintetis'),
        ),
        Row(
          children: [
            Expanded(
              child: Text(
                t(
                  context,
                  '${rows.length} records · page ${page + 1}/$pages',
                  '${rows.length} record · halaman ${page + 1}/$pages',
                ),
              ),
            ),
            IconButton(
              tooltip: t(context, 'Previous records', 'Record sebelumnya'),
              onPressed: page > 0 ? () => setState(() => page--) : null,
              icon: const Icon(Icons.chevron_left),
            ),
            IconButton(
              tooltip: t(context, 'Next records', 'Record berikutnya'),
              onPressed: page + 1 < pages ? () => setState(() => page++) : null,
              icon: const Icon(Icons.chevron_right),
            ),
          ],
        ),
      ],
    );
  }
}
