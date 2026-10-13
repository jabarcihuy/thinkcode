typedef DataRowMap = Map<String, Object?>;

class DataColumnSpec {
  final String name, type;
  final String? key;
  DataColumnSpec(Map<String, dynamic> json)
    : name = json['name'],
      type = json['type'],
      key = json['key'];
}

class DataTableSpec {
  final String name;
  final List<DataColumnSpec> columns;
  final List<DataRowMap> rows;
  DataTableSpec(Map<String, dynamic> json)
    : name = json['name'],
      columns = (json['columns'] as List)
          .map((x) => DataColumnSpec(Map<String, dynamic>.from(x)))
          .toList(),
      rows = (json['rows'] as List).map((x) => DataRowMap.from(x)).toList();
  String get primaryKey =>
      columns.singleWhere((column) => column.key == 'PK').name;
}

class RelationSpec {
  final String parent, parentColumn, child, childColumn;
  RelationSpec(Map<String, dynamic> json)
    : parent = json['parent'],
      parentColumn = json['parentColumn'],
      child = json['child'],
      childColumn = json['childColumn'];
}

class SqlDataset {
  final String id, title;
  final List<DataTableSpec> tables;
  final List<RelationSpec> relations;
  SqlDataset.fromJson(Map<String, dynamic> json)
    : id = json['id'],
      title = json['title'],
      tables = (json['tables'] as List)
          .map((x) => DataTableSpec(Map<String, dynamic>.from(x)))
          .toList(),
      relations = (json['relations'] as List)
          .map((x) => RelationSpec(Map<String, dynamic>.from(x)))
          .toList() {
    final identifier = RegExp(r'^[a-z_][a-z0-9_]{0,29}$');
    if (tables.isEmpty ||
        tables.length > 6 ||
        tables.map((x) => x.name).toSet().length != tables.length ||
        relations.length > 12) {
      throw const FormatException('Invalid synthetic dataset.');
    }
    for (final table in tables) {
      if (!identifier.hasMatch(table.name) ||
          table.columns.isEmpty ||
          table.columns.length > 8 ||
          table.rows.length > 100 ||
          table.columns.where((x) => x.key == 'PK').length != 1) {
        throw const FormatException('Invalid synthetic table.');
      }
      for (final column in table.columns) {
        if (!identifier.hasMatch(column.name) ||
            !['integer', 'text', 'real'].contains(column.type)) {
          throw const FormatException('Invalid synthetic column.');
        }
      }
      for (final row in table.rows) {
        for (final value in row.values) {
          if (value != null && value is! num && value is! String ||
              value is String && value.length > 500) {
            throw const FormatException('Invalid synthetic value.');
          }
        }
      }
    }
    for (final relation in relations) {
      final parent = tables.singleWhere((x) => x.name == relation.parent),
          child = tables.singleWhere((x) => x.name == relation.child);
      if (parent.primaryKey != relation.parentColumn ||
          !child.columns.any((x) => x.name == relation.childColumn)) {
        throw const FormatException('Invalid synthetic relationship.');
      }
    }
  }
  Map<String, List<DataRowMap>> get initialSnapshot => {
    for (final table in tables)
      table.name: table.rows.map((row) => DataRowMap.from(row)).toList(),
  };
}
