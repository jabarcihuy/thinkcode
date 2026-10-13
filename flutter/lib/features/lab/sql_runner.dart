import 'dart:async';
import 'dart:isolate';

import 'package:sqlite3/sqlite3.dart';

import 'dataset.dart';
import 'sql_policy.dart';
import 'sqlite_guards.dart';

class SqlResult {
  final List<String> columns;
  final List<List<Object?>> rows;
  final Map<String, List<DataRowMap>> snapshot;
  final List<DataRowMap> before, after;
  final bool mutation, applied, truncated;
  final String? error;
  const SqlResult({
    this.columns = const [],
    this.rows = const [],
    required this.snapshot,
    this.before = const [],
    this.after = const [],
    this.mutation = false,
    this.applied = false,
    this.truncated = false,
    this.error,
  });
}

class SqlRequest {
  final SqlDataset dataset;
  final String source;
  final Map<String, List<DataRowMap>> snapshot;
  final bool allowWrite, apply;
  const SqlRequest(
    this.dataset,
    this.source,
    this.snapshot,
    this.allowWrite,
    this.apply,
  );
}

Future<SqlResult> runSql(SqlRequest request) async {
  final port = ReceivePort();
  Isolate? isolate;
  try {
    isolate = await Isolate.spawn(_sqlEntry, [port.sendPort, request]);
    return await port.first.timeout(const Duration(seconds: 3)) as SqlResult;
  } on TimeoutException {
    return SqlResult(
      snapshot: request.snapshot,
      error: 'Your query took too long to finish. Execution stopped.',
    );
  } finally {
    isolate?.kill(priority: Isolate.immediate);
    port.close();
  }
}

void _sqlEntry(List<Object> message) {
  final send = message[0] as SendPort, request = message[1] as SqlRequest;
  send.send(executeSql(request));
}

SqlResult executeSql(SqlRequest request) {
  Database? db;
  SqliteGuards? guards;
  PreparedStatement? statement;
  try {
    final plan = inspectSql(
      request.source,
      request.dataset,
      allowWrite: request.allowWrite,
    );
    db = sqlite3.openInMemory();
    db.execute('PRAGMA foreign_keys = ON');
    for (final table in request.dataset.tables) {
      final columns = table.columns
          .map((column) {
            final relation = request.dataset.relations
                .where(
                  (x) => x.child == table.name && x.childColumn == column.name,
                )
                .firstOrNull;
            return '${column.name} ${column.type.toUpperCase()}${column.key == 'PK' ? ' PRIMARY KEY' : ' NOT NULL'}${relation == null ? '' : ' REFERENCES ${relation.parent}(${relation.parentColumn})'}';
          })
          .join(',');
      db.execute('CREATE TABLE ${table.name} ($columns)');
    }
    final remaining = [...request.dataset.tables], seeded = <String>{};
    while (remaining.isNotEmpty) {
      final index = remaining.indexWhere(
        (table) => request.dataset.relations
            .where((r) => r.child == table.name)
            .every((r) => seeded.contains(r.parent)),
      );
      if (index < 0) {
        throw const FormatException('Dataset relationships are not valid.');
      }
      final table = remaining.removeAt(index),
          names = table.columns.map((x) => x.name).toList();
      final seed = db.prepare(
        'INSERT INTO ${table.name} (${names.join(',')}) VALUES (${names.map((_) => '?').join(',')})',
      );
      try {
        for (final row in request.snapshot[table.name] ?? table.rows) {
          seed.execute(names.map((name) => row[name]).toList());
        }
      } finally {
        seed.close();
      }
      seeded.add(table.name);
    }
    List<DataRowMap> target() {
      if (!plan.mutation) return [];
      final table = request.dataset.tables.singleWhere(
        (x) => x.name == plan.table,
      );
      return db!
          .select('SELECT * FROM ${table.name} WHERE ${table.primaryKey} = ?', [
            plan.keyValue,
          ])
          .map((row) => DataRowMap.from(row))
          .toList();
    }

    final before = target();
    db.execute('BEGIN');
    guards = SqliteGuards(db, request.dataset, plan);
    statement = db.prepare(request.source, checkNoTail: true, vtab: false);
    if (!plan.mutation) {
      final cursor = statement.selectCursor(), rows = <List<Object?>>[];
      var characters = 0, truncated = false;
      while (cursor.moveNext()) {
        final row = cursor.current.values
            .map(
              (value) => value is String && value.length > 500
                  ? value.substring(0, 500)
                  : value,
            )
            .toList();
        characters += row.fold<int>(
          0,
          (sum, value) => sum + (value?.toString().length ?? 0),
        );
        if (rows.length >= 100 || characters > 16000) {
          truncated = true;
          break;
        }
        rows.add(row);
      }
      final columns = [...cursor.columnNames];
      statement.close();
      statement = null;
      guards.close();
      guards = null;
      db.execute('ROLLBACK');
      return SqlResult(
        columns: columns,
        rows: rows,
        snapshot: request.snapshot,
        truncated: truncated,
      );
    }
    statement.execute();
    final changed = db.updatedRows;
    statement.close();
    statement = null;
    guards.close();
    guards = null;
    if (changed != 1) {
      throw const FormatException(
        'Change exactly one existing or new record. Check your primary key.',
      );
    }
    final after = target();
    final next = {
      for (final table in request.dataset.tables)
        table.name: db
            .select('SELECT * FROM ${table.name}')
            .map((row) => DataRowMap.from(row))
            .toList(),
    };
    if (next.values.any((rows) => rows.length > 100)) {
      throw const FormatException(
        'This dataset has reached its row limit. Reset and try again.',
      );
    }
    db.execute(request.apply ? 'COMMIT' : 'ROLLBACK');
    return SqlResult(
      snapshot: request.apply ? next : request.snapshot,
      before: before,
      after: after,
      mutation: true,
      applied: request.apply,
    );
  } catch (error) {
    final message = guards?.stopped == true
        ? 'Your query took too long to finish. Execution stopped.'
        : error is FormatException
        ? error.message
        : error is SqliteException
        ? error.message.contains('FOREIGN KEY')
              ? 'This record is referenced by another table. Check the relationship first.'
              : 'Check your SQL and use only tables, columns and operations in this Lab.'
        : 'The query could not run. Reset the data and try again.';
    return SqlResult(snapshot: request.snapshot, error: message);
  } finally {
    statement?.close();
    guards?.close();
    db?.close();
  }
}
