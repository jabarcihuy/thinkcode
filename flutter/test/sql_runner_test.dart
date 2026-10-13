import 'package:flutter_test/flutter_test.dart';
import 'package:quethink_mobile/features/lab/dataset.dart';
import 'package:quethink_mobile/features/lab/sql_policy.dart';
import 'package:quethink_mobile/features/lab/sql_runner.dart';

SqlDataset fixture({int records = 2}) => SqlDataset.fromJson({
  'id': 'test',
  'title': 'Synthetic test',
  'tables': [
    {
      'name': 'students',
      'columns': [
        {'name': 'id', 'type': 'integer', 'key': 'PK'},
        {'name': 'name', 'type': 'text'},
      ],
      'rows': [
        for (var i = 1; i <= records; i++) {'id': i, 'name': 'Student $i'},
      ],
    },
    {
      'name': 'enrollments',
      'columns': [
        {'name': 'id', 'type': 'integer', 'key': 'PK'},
        {'name': 'student_id', 'type': 'integer', 'key': 'FK'},
      ],
      'rows': [
        {'id': 1, 'student_id': 1},
      ],
    },
  ],
  'relations': [
    {
      'parent': 'students',
      'parentColumn': 'id',
      'child': 'enrollments',
      'childColumn': 'student_id',
    },
  ],
});
void main() {
  SqlResult run(String sql, {bool write = false, bool apply = false}) {
    final data = fixture();
    return executeSql(
      SqlRequest(data, sql, data.initialSnapshot, write, apply),
    );
  }

  test('SELECT and join', () {
    final result = run(
      'SELECT students.name FROM students INNER JOIN enrollments ON students.id = enrollments.student_id',
    );
    expect(result.error, isNull);
    expect(result.rows, [
      ['Student 1'],
    ]);
  });
  test('empty and aggregate output', () {
    expect(run('SELECT * FROM students WHERE id = 999').rows, isEmpty);
    expect(run('SELECT COUNT(*) FROM students').rows, [
      [2],
    ]);
  });
  test('preview leaves data unchanged, apply changes one record', () {
    final preview = run(
      "UPDATE students SET name = 'New' WHERE id = 2",
      write: true,
    );
    expect(preview.error, isNull);
    expect(preview.before.first['name'], 'Student 2');
    expect(preview.after.first['name'], 'New');
    expect(preview.snapshot['students']![1]['name'], 'Student 2');
    final applied = run(
      "UPDATE students SET name = 'New' WHERE id = 2",
      write: true,
      apply: true,
    );
    expect(applied.snapshot['students']![1]['name'], 'New');
    expect(applied.applied, isTrue);
  });
  test('single-row INSERT and DELETE', () {
    expect(
      run(
        "INSERT INTO students (id,name) VALUES (3,'Three')",
        write: true,
        apply: true,
      ).snapshot['students']!.length,
      3,
    );
    expect(
      run(
        'DELETE FROM students WHERE id = 2',
        write: true,
        apply: true,
      ).snapshot['students']!.length,
      1,
    );
  });
  test('foreign key rollback', () {
    final result = run(
      'DELETE FROM students WHERE id = 1',
      write: true,
      apply: true,
    );
    expect(result.error, isNotNull);
    expect(result.snapshot['students']!.length, 2);
  });
  for (final sql in [
    'DROP TABLE students',
    'PRAGMA database_list',
    "ATTACH DATABASE '/tmp/x' AS x",
    'SELECT * FROM sqlite_master',
    "SELECT readfile('secret')",
    "SELECT load_extension('x')",
    'SELECT * FROM students; DELETE FROM students',
    "UPDATE students SET name = 'X'",
    'DELETE FROM students WHERE id > 0',
    'UPDATE students SET id = 99 WHERE id = 2',
    "INSERT INTO students (id,name) VALUES (3,'x'),(4,'y')",
    'WITH RECURSIVE x AS (SELECT 1) SELECT * FROM x',
  ]) {
    test('reject unsafe SQL: $sql', () {
      expect(run(sql, write: true).error, isNotNull);
    });
  }
  test('Read mode rejects writes', () {
    expect(run('DELETE FROM students WHERE id = 2').error, isNotNull);
  });
  test('invalid insert has policy error', () {
    expect(
      () => inspectSql(
        'INSERT INTO students (id) VALUES',
        fixture(),
        allowWrite: true,
      ),
      throwsFormatException,
    );
  });
  test('literal punctuation remains data', () {
    final result = run(
      "INSERT INTO students (id,name) VALUES (3,'O''Neil; safe')",
      write: true,
      apply: true,
    );
    expect(result.error, isNull);
    expect(result.after.first['name'], "O'Neil; safe");
  });
  test('source and output limits', () {
    expect(run('SELECT ${' ' * 4097}1').error, isNotNull);
    final data = fixture(records: 100);
    final result = executeSql(
      SqlRequest(
        data,
        'SELECT a.id,b.id FROM students a CROSS JOIN students b',
        data.initialSnapshot,
        false,
        false,
      ),
    );
    expect(result.rows.length, 100);
    expect(result.truncated, isTrue);
  });
  test('expensive aggregate is interrupted', () {
    final data = fixture(records: 100);
    final watch = Stopwatch()..start();
    final result = executeSql(
      SqlRequest(
        data,
        'SELECT sum(a.id*b.id*c.id*d.id) FROM students a CROSS JOIN students b CROSS JOIN students c CROSS JOIN students d',
        data.initialSnapshot,
        false,
        false,
      ),
    );
    expect(result.error, contains('too long'));
    expect(watch.elapsedMilliseconds, lessThan(3000));
  });
  test('separate isolate', () async {
    final data = fixture();
    final result = await runSql(
      SqlRequest(
        data,
        'SELECT 2 + 3 AS answer',
        data.initialSnapshot,
        false,
        false,
      ),
    );
    expect(result.error, isNull);
    expect(result.rows, [
      [5],
    ]);
  });
}
