import 'package:flutter_test/flutter_test.dart';
import 'package:http/testing.dart';
import 'package:quethink_mobile/core/api.dart';
import 'package:quethink_mobile/features/learning/controller.dart';

void main() {
  test(
    'late refresh after sign-out does not notify a disposed controller',
    () async {
      final api = LearningApi(
        baseUrl: 'https://example.test',
        token: () async => 'token',
        locale: () => 'en',
        client: MockClient(
          (_) async =>
              throw StateError('Disposed controller must not request data'),
        ),
      );
      final controller = LearningController(api);
      controller.dispose();
      await controller.refresh();
      expect(controller.loading, false);
      api.close();
    },
  );
}
