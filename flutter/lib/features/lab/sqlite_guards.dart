import 'dart:ffi';

import 'package:ffi/ffi.dart';
import 'package:sqlite3/sqlite3.dart';

import 'dataset.dart';
import 'sql_policy.dart';

const sqliteAsset = 'package:sqlite3/src/ffi/libsqlite3.g.dart';
typedef ProgressCallback = Int32 Function(Pointer<Void>);
typedef AuthorizeCallback = Int32 Function(
  Pointer<Void>,
  Int32,
  Pointer<Utf8>,
  Pointer<Utf8>,
  Pointer<Utf8>,
  Pointer<Utf8>,
);
@Native<
  Void Function(
    Pointer<Void>,
    Int32,
    Pointer<NativeFunction<ProgressCallback>>,
    Pointer<Void>,
  )
>(symbol: 'sqlite3_progress_handler', assetId: sqliteAsset)
external void sqliteProgress(
  Pointer<Void> database,
  int steps,
  Pointer<NativeFunction<ProgressCallback>> callback,
  Pointer<Void> state,
);
@Native<
  Int32 Function(
    Pointer<Void>,
    Pointer<NativeFunction<AuthorizeCallback>>,
    Pointer<Void>,
  )
>(symbol: 'sqlite3_set_authorizer', assetId: sqliteAsset)
external int sqliteAuthorize(
  Pointer<Void> database,
  Pointer<NativeFunction<AuthorizeCallback>> callback,
  Pointer<Void> state,
);
@Native<Int32 Function(Pointer<Void>, Int32, Int32)>(
  symbol: 'sqlite3_limit',
  assetId: sqliteAsset,
)
external int sqliteLimit(Pointer<Void> database, int category, int value);

class SqliteGuards {
  final Database database;
  late final NativeCallable<ProgressCallback> progress;
  late final NativeCallable<AuthorizeCallback> authorizer;
  final Stopwatch clock = Stopwatch()..start();
  bool stopped = false;
  int instructions = 0;
  SqliteGuards(this.database, SqlDataset dataset, SqlPlan plan) {
    for (final entry in {
      0: 65536,
      1: 4096,
      2: 32,
      3: 40,
      4: 0,
      5: 50000,
      6: 8,
      7: 0,
      8: 512,
      9: 8,
      10: 8,
      11: 0,
    }.entries) {
      sqliteLimit(database.handle.cast<Void>(), entry.key, entry.value);
    }
    progress = NativeCallable<ProgressCallback>.isolateLocal((Pointer<Void> _) {
      instructions += 1000;
      stopped = clock.elapsedMilliseconds > 1500 || instructions > 250000;
      return stopped ? 1 : 0;
    }, exceptionalReturn: 1);
    authorizer = NativeCallable<AuthorizeCallback>.isolateLocal((
      Pointer<Void> _,
      int action,
      Pointer<Utf8> first,
      Pointer<Utf8> second,
      Pointer<Utf8> db,
      Pointer<Utf8> context,
    ) {
      final table = first == nullptr ? '' : first.toDartString(),
          column = second == nullptr ? '' : second.toDartString();
      if (action == 21) return 0; // SELECT
      if (action == 20) {
        final spec = dataset.tables.where((x) => x.name == table).firstOrNull;
        return spec != null &&
                (column.isEmpty || spec.columns.any((x) => x.name == column))
            ? 0
            : 1;
      }
      if (action == 31) {
        return {
              'count',
              'avg',
              'sum',
              'min',
              'max',
              'round',
              'lower',
              'upper',
              'length',
              'coalesce',
              'abs',
            }.contains(column.toLowerCase())
            ? 0
            : 1;
      }
      if (plan.mutation &&
          table == plan.table &&
          ((action == 18 && plan.kind == 'insert') ||
              (action == 23 && plan.kind == 'update') ||
              (action == 9 && plan.kind == 'delete'))) {
        return 0;
      }
      return 1; // Deny schema, filesystem, transaction and all other capabilities.
    }, exceptionalReturn: 1);
    sqliteProgress(
      database.handle.cast<Void>(),
      1000,
      progress.nativeFunction,
      nullptr,
    );
    sqliteAuthorize(
      database.handle.cast<Void>(),
      authorizer.nativeFunction,
      nullptr,
    );
  }
  void close() {
    sqliteProgress(database.handle.cast<Void>(), 0, nullptr, nullptr);
    sqliteAuthorize(database.handle.cast<Void>(), nullptr, nullptr);
    progress.close();
    authorizer.close();
  }
}
