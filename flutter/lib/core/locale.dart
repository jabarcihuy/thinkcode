import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

String t(BuildContext context, String en, String id) =>
    Localizations.localeOf(context).languageCode == 'id' ? id : en;

class AppLocale extends ChangeNotifier {
  final SharedPreferences preferences;
  String value;
  AppLocale(this.preferences)
    : value = preferences.getString('quethink.locale') == 'id' ? 'id' : 'en';
  Future<void> change(String next) async {
    if (!['en', 'id'].contains(next) || next == value) return;
    if (!await preferences.setString('quethink.locale', next)) {
      throw StateError('Language preference could not be saved.');
    }
    value = next;
    notifyListeners();
  }
}
