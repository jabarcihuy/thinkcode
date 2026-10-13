import 'package:flutter/foundation.dart';

import '../../core/api.dart';
import 'models.dart';

class LearningController extends ChangeNotifier {
  final LearningApi api;
  Course? course;
  String? error;
  bool loading = false, _disposed = false;
  int _request = 0;
  LearningController(this.api);
  Future<void> refresh() async {
    if (_disposed) return;
    final request = ++_request;
    loading = true;
    error = null;
    notifyListeners();
    try {
      final next = Course.fromJson(await api.request('course'));
      if (!_disposed && request == _request) course = next;
    } catch (cause) {
      if (!_disposed && request == _request) {
        error = cause is ApiException
            ? cause.message
            : 'Learning data could not be loaded.';
      }
    } finally {
      if (!_disposed && request == _request) {
        loading = false;
        notifyListeners();
      }
    }
  }

  @override
  void dispose() {
    _disposed = true;
    _request++;
    super.dispose();
  }
}
