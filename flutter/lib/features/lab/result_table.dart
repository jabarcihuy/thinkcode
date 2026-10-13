import 'package:flutter/material.dart';

import '../../core/locale.dart';

class ResultTable extends StatelessWidget {
  final List<String> columns;
  final List<List<Object?>> rows;
  final String label;
  const ResultTable({
    super.key,
    required this.columns,
    required this.rows,
    required this.label,
  });
  @override
  Widget build(BuildContext context) {
    if (columns.isEmpty) {
      return Text(t(context, 'No output yet.', 'Belum ada hasil.'));
    }
    if (rows.isEmpty) {
      return Text(
        t(
          context,
          'The query returned no records.',
          'Query tidak mengembalikan record.',
        ),
      );
    }
    return Semantics(
      label: label,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: columns
              .map(
                (name) => DataColumn(
                  label: Text(
                    name,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
              )
              .toList(),
          rows: rows
              .map(
                (row) => DataRow(
                  cells: row
                      .map(
                        (value) => DataCell(
                          SelectableText(value?.toString() ?? 'NULL'),
                        ),
                      )
                      .toList(),
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}
