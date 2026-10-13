import '../learning/models.dart';
import 'dataset.dart';

class AnswerOption {
  final String id, text;
  AnswerOption(JsonMap json) : id = json['id'], text = json['text'];
}

class CoreExercise {
  final String id, title, prompt, type, mode;
  final bool passed;
  final String? starterCode;
  final List<String> columns;
  final List<AnswerOption> options, blocks;
  final JsonMap? modeling;
  final String? datasetId;
  final List<String> tableNames;
  CoreExercise(JsonMap json)
    : id = json['id'],
      title = json['title'],
      prompt = json['prompt'],
      type = json['type'],
      mode = json['mode'],
      passed = json['passed'] == true,
      starterCode = json['starterCode'],
      columns = List<String>.from(json['columns'] ?? []),
      options = (json['options'] as List)
          .map((x) => AnswerOption(JsonMap.from(x)))
          .toList(),
      blocks = (json['blocks'] as List)
          .map((x) => AnswerOption(JsonMap.from(x)))
          .toList(),
      modeling = json['modeling'] == null
          ? null
          : JsonMap.from(json['modeling']),
      datasetId = json['data']?['datasetId'],
      tableNames = List<String>.from(json['data']?['tables'] ?? []);
}

class LabContent {
  final MaterialItem lesson;
  final List<CoreExercise> exercises;
  final List<SqlDataset> datasets;
  final List<JsonMap> scenarios;
  final bool sqlEnabled, allowWrite;
  LabContent(JsonMap json)
    : lesson = MaterialItem.fromJson(JsonMap.from(json['lesson'])),
      exercises = (json['exercises'] as List)
          .map((x) => CoreExercise(JsonMap.from(x)))
          .toList(),
      datasets = (json['datasets'] as List)
          .map((x) => SqlDataset.fromJson(JsonMap.from(x)))
          .toList(),
      scenarios = (json['scenarios'] as List)
          .map((x) => JsonMap.from(x))
          .toList(),
      sqlEnabled = json['sqlEnabled'] == true,
      allowWrite = json['allowWrite'] == true;
}
