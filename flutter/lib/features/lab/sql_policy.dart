import 'dataset.dart';

class SqlToken {
  final String value, kind;
  const SqlToken(this.value, this.kind);
}

class SqlPlan {
  final String kind;
  final String? table;
  final Object? keyValue;
  const SqlPlan(this.kind, [this.table, this.keyValue]);
  bool get mutation => kind != 'select';
}

List<SqlToken> tokenizeSql(String source) {
  if (source.trim().isEmpty || source.length > 4096) {
    throw const FormatException(
      'Enter one SQL statement, up to 4096 characters.',
    );
  }
  final result = <SqlToken>[];
  var index = 0;
  while (index < source.length) {
    final character = source[index];
    if (RegExp(r'\s').hasMatch(character)) {
      index++;
      continue;
    }
    if (source.startsWith('--', index) || source.startsWith('/*', index)) {
      throw const FormatException('Remove SQL comments before running.');
    }
    if (character == "'") {
      var value = '';
      index++;
      var closed = false;
      while (index < source.length) {
        if (source[index] == "'") {
          if (index + 1 < source.length && source[index + 1] == "'") {
            value += "'";
            index += 2;
            continue;
          }
          index++;
          closed = true;
          break;
        }
        value += source[index++];
      }
      if (!closed) {
        throw const FormatException('Close the quoted text in your SQL.');
      }
      result.add(SqlToken(value, 'string'));
      continue;
    }
    final word = RegExp(r'^[A-Za-z_][A-Za-z0-9_]*')
        .firstMatch(source.substring(index));
    if (word != null) {
      result.add(SqlToken(word[0]!.toLowerCase(), 'word'));
      index += word[0]!.length;
      continue;
    }
    final number = RegExp(r'^\d+(?:\.\d+)?')
        .firstMatch(source.substring(index));
    if (number != null) {
      result.add(SqlToken(number[0]!, 'number'));
      index += number[0]!.length;
      continue;
    }
    result.add(SqlToken(character, 'symbol'));
    index++;
  }
  if (result.isNotEmpty && result.last.value == ';') result.removeLast();
  if (result.any((token) => token.value == ';' && token.kind == 'symbol')) {
    throw const FormatException('Run one statement at a time.');
  }
  return result;
}

Object? literalValue(List<SqlToken> tokens) {
  if (tokens.length == 1) {
    final token = tokens.single;
    if (token.kind == 'string') {
      if (token.value.length > 500) {
        throw const FormatException(
          'Keep each text value within 500 characters.',
        );
      }
      return token.value;
    }
    if (token.kind == 'number') return num.parse(token.value);
    if (token.value == 'null') return null;
  }
  if (tokens.length == 2 &&
      ['-', '+'].contains(tokens[0].value) &&
      tokens[1].kind == 'number') {
    return num.parse('${tokens[0].value}${tokens[1].value}');
  }
  throw const FormatException(
    'Use a literal text, number or NULL for this change.',
  );
}

SqlPlan inspectSql(String sql, SqlDataset dataset, {required bool allowWrite}) {
  final tokens = tokenizeSql(sql);
  if (tokens.isEmpty) throw const FormatException('Enter a SQL statement.');
  const forbidden = {
    'attach',
    'detach',
    'pragma',
    'vacuum',
    'create',
    'drop',
    'alter',
    'with',
    'recursive',
    'union',
    'intersect',
    'except',
    'returning',
    'trigger',
    'transaction',
    'begin',
    'commit',
    'rollback',
    'savepoint',
    'release',
  };
  if (tokens.any((x) => x.kind == 'word' && forbidden.contains(x.value))) {
    throw const FormatException(
      'Use only the SELECT or single-row changes supported in this Lab.',
    );
  }
  final kind = tokens.first.value;
  if (kind == 'select') {
    if (tokens.where((x) => x.kind == 'word' && x.value == 'select').length !=
        1) {
      throw const FormatException('Use one SELECT without nested queries.');
    }
    return const SqlPlan('select');
  }
  if (!allowWrite || !['insert', 'update', 'delete'].contains(kind)) {
    throw const FormatException('This Lab allows SELECT only.');
  }
  final tableIndex = kind == 'update' ? 1 : 2;
  if (tokens.length <= tableIndex ||
      kind == 'insert' && tokens[1].value != 'into' ||
      kind == 'delete' && tokens[1].value != 'from') {
    throw const FormatException('Check the statement structure.');
  }
  final table = dataset.tables
      .where((x) => x.name == tokens[tableIndex].value)
      .firstOrNull;
  if (table == null) {
    throw const FormatException('Use a table from the selected dataset.');
  }
  final pk = table.primaryKey;
  if (kind == 'insert') {
    final values = tokens.indexWhere(
      (x) => x.kind == 'word' && x.value == 'values',
    );
    if (values < 5 ||
        values + 2 >= tokens.length ||
        tokens[3].value != '(' ||
        tokens[values - 1].value != ')' ||
        tokens[values + 1].value != '(' ||
        tokens.last.value != ')') {
      throw const FormatException(
        'Use INSERT INTO table (columns) VALUES (one row).',
      );
    }
    final columnTokens = tokens.sublist(4, values - 1);
    if (columnTokens.isEmpty || columnTokens.length.isEven) {
      throw const FormatException('Provide column names separated by commas.');
    }
    final columns = <String>[];
    for (var i = 0; i < columnTokens.length; i++) {
      if (i.isOdd) {
        if (columnTokens[i].value != ',') {
          throw const FormatException('Separate columns with commas.');
        }
      } else {
        if (!table.columns.any((x) => x.name == columnTokens[i].value)) {
          throw const FormatException('Use known column names.');
        }
        columns.add(columnTokens[i].value);
      }
    }
    final valuesList = <List<SqlToken>>[[]];
    for (final token in tokens.sublist(values + 2, tokens.length - 1)) {
      if (token.value == ',' && token.kind == 'symbol') {
        valuesList.add([]);
      } else {
        valuesList.last.add(token);
      }
    }
    if (columns.length != valuesList.length ||
        columns.toSet().length != columns.length ||
        !columns.contains(pk)) {
      throw const FormatException(
        'Provide one value per column, including the primary key.',
      );
    }
    final valuesParsed = valuesList.map(literalValue).toList();
    return SqlPlan(kind, table.name, valuesParsed[columns.indexOf(pk)]);
  }
  final where = tokens.indexWhere(
    (x) => x.kind == 'word' && x.value == 'where',
  );
  if (where < 0 ||
      where + 3 >= tokens.length ||
      tokens[where + 1].value != pk ||
      tokens[where + 2].value != '=') {
    throw FormatException('Target one record using WHERE $pk = value.');
  }
  final value = literalValue(tokens.sublist(where + 3));
  if (kind == 'update') {
    if (tokens[2].value != 'set' || where < 5) {
      throw const FormatException(
        'Use UPDATE table SET column = value WHERE primary_key = value.',
      );
    }
    final assignments = <List<SqlToken>>[[]];
    for (final token in tokens.sublist(3, where)) {
      if (token.kind == 'symbol' && token.value == ',') {
        assignments.add([]);
      } else {
        assignments.last.add(token);
      }
    }
    for (final assignment in assignments) {
      if (assignment.length < 3 ||
          assignment[1].value != '=' ||
          assignment[0].value == pk ||
          !table.columns.any((x) => x.name == assignment[0].value)) {
        throw const FormatException(
          'Change an existing non-primary-key column.',
        );
      }
      literalValue(assignment.sublist(2));
    }
  } else if (where != 3) {
    throw const FormatException(
      'Use DELETE FROM table WHERE primary_key = value.',
    );
  }
  return SqlPlan(kind, table.name, value);
}
