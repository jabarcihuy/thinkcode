import 'dart:convert';

import 'package:flutter/material.dart';

import '../../core/locale.dart';
import '../learning/models.dart';
import 'dataset.dart';
import 'schema_canvas.dart';

class SchemaAnswerField extends StatefulWidget {
  final JsonMap modeling;
  final ValueChanged<JsonMap> onChanged;
  const SchemaAnswerField({
    super.key,
    required this.modeling,
    required this.onChanged,
  });
  @override
  State<SchemaAnswerField> createState() => _SchemaAnswerFieldState();
}

class _SchemaAnswerFieldState extends State<SchemaAnswerField> {
  late List<JsonMap> tables = (jsonDecode(
    jsonEncode(widget.modeling['tables']),
  ) as List).map((x) => JsonMap.from(x)).toList();
  final Map<String, JsonMap> links = {};
  String? selectedPreviewTable;
  void changed() {
    widget.onChanged({
      'schema': {
        'version': 1,
        'tables': tables,
        'relations': links.values.toList(),
      },
    });
  }

  SqlDataset? preview() {
    if (tables.any(
      (table) =>
          (table['columns'] as List)
              .where((column) => column['primary'] == true)
              .length !=
          1,
    )) {
      return null;
    }
    return SqlDataset.fromJson({
      'id': 'model',
      'title': 'Model',
      'tables': tables
          .map(
            (table) => {
              'name': table['name'],
              'columns': (table['columns'] as List)
                  .map(
                    (column) => {
                      'name': column['name'],
                      'type': column['type'],
                      if (column['primary'] == true)
                        'key': 'PK'
                      else if (links.containsKey(
                        '${table['id']}:${column['id']}',
                      ))
                        'key': 'FK',
                    },
                  )
                  .toList(),
              'rows': [],
            },
          )
          .toList(),
      'relations': links.values.map((edge) {
        final parent = tables.singleWhere(
              (x) => x['id'] == edge['parentTable'],
            ),
            child = tables.singleWhere((x) => x['id'] == edge['childTable']);
        return {
          'parent': parent['name'],
          'parentColumn': (parent['columns'] as List).singleWhere(
            (x) => x['id'] == edge['parentColumn'],
          )['name'],
          'child': child['name'],
          'childColumn': (child['columns'] as List).singleWhere(
            (x) => x['id'] == edge['childColumn'],
          )['name'],
        };
      }).toList(),
    });
  }

  @override
  Widget build(BuildContext context) {
    final diagram = preview();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(widget.modeling['prompt']),
        const SizedBox(height: 16),
        for (final table in tables)
          Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  table['name'],
                  style: Theme.of(context).textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  (table['columns'] as List)
                      .map((column) => '${column['name']} (${column['type']})')
                      .join(', '),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  key: ValueKey('${table['id']}:pk'),
                  initialValue: (table['columns'] as List)
                      .where((column) => column['primary'] == true)
                      .map<String>((column) => column['id'])
                      .firstOrNull,
                  isExpanded: true,
                  decoration: InputDecoration(
                    labelText: t(context, 'Primary key', 'Primary key'),
                  ),
                  items: (table['columns'] as List)
                      .map(
                        (column) => DropdownMenuItem<String>(
                          value: column['id'],
                          child: Text(column['name']),
                        ),
                      )
                      .toList(),
                  onChanged: (id) {
                    setState(() {
                      for (final column in table['columns']) {
                        column['primary'] = column['id'] == id;
                      }
                      links.removeWhere(
                        (_, edge) =>
                            edge['parentTable'] == table['id'] &&
                                edge['parentColumn'] != id ||
                            edge['childTable'] == table['id'] &&
                                edge['childColumn'] == id,
                      );
                    });
                    changed();
                  },
                ),
              ],
            ),
          ),
        Text(
          t(context, 'Foreign keys', 'Foreign key'),
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        for (final child in tables)
          for (final column in (child['columns'] as List).where(
            (x) => x['primary'] != true,
          ))
            Builder(
              builder: (context) {
                final options = <JsonMap>[];
                for (final parent in tables.where(
                  (x) => x['id'] != child['id'],
                )) {
                  for (final pc in (parent['columns'] as List).where(
                    (x) => x['primary'] == true && x['type'] == column['type'],
                  )) {
                    options.add({
                      'value': '${parent['id']}:${pc['id']}',
                      'parentTable': parent['id'],
                      'parentColumn': pc['id'],
                      'label': '${parent['name']}.${pc['name']}',
                    });
                  }
                }
                if (options.isEmpty) return const SizedBox.shrink();
                final key = '${child['id']}:${column['id']}',
                    edge = links[key],
                    selected = edge == null
                        ? ''
                        : '${edge['parentTable']}:${edge['parentColumn']}';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: DropdownButtonFormField<String>(
                    key: ValueKey('$key:$selected:${options.length}'),
                    initialValue: selected,
                    isExpanded: true,
                    decoration: InputDecoration(
                      labelText: '${child['name']}.${column['name']} →',
                    ),
                    items: [
                      DropdownMenuItem(
                        value: '',
                        child: Text(
                          t(context, 'No relationship', 'Tanpa relasi'),
                        ),
                      ),
                      ...options.map(
                        (option) => DropdownMenuItem<String>(
                          value: option['value'],
                          child: Text(option['label']),
                        ),
                      ),
                    ],
                    onChanged: (value) {
                      setState(() {
                        if (value == null || value.isEmpty) {
                          links.remove(key);
                        } else {
                          final option = options.singleWhere(
                            (x) => x['value'] == value,
                          );
                          links[key] = {
                            'id': 'edge-$key',
                            'parentTable': option['parentTable'],
                            'parentColumn': option['parentColumn'],
                            'childTable': child['id'],
                            'childColumn': column['id'],
                          };
                        }
                      });
                      changed();
                    },
                  ),
                );
              },
            ),
        if (diagram != null) ...[
          const SizedBox(height: 16),
          SchemaCanvas(
            dataset: diagram,
            selected:
                diagram.tables.any(
                  (table) => table.name == selectedPreviewTable,
                )
                ? selectedPreviewTable!
                : diagram.tables.first.name,
            onSelect: (name) => setState(() => selectedPreviewTable = name),
          ),
        ] else
          Text(
            t(
              context,
              'Choose a primary key for each table to preview your model.',
              'Pilih primary key setiap tabel untuk melihat modelmu.',
            ),
          ),
      ],
    );
  }
}
