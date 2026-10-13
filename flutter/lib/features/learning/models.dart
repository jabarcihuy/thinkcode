typedef JsonMap = Map<String, dynamic>;

class MaterialItem {
  final String id, slug, title, summary, state, chapterTitle;
  final String? readAt;
  final int chapterPosition;
  const MaterialItem({
    required this.id,
    required this.slug,
    required this.title,
    required this.summary,
    required this.state,
    required this.chapterTitle,
    required this.chapterPosition,
    this.readAt,
  });
  factory MaterialItem.fromJson(JsonMap json) => MaterialItem(
    id: json['id'] as String,
    slug: json['slug'] as String,
    title: json['title'] as String,
    summary: json['summary'] as String,
    state: json['state'] as String,
    chapterTitle: json['chapterTitle'] as String,
    chapterPosition: json['chapterPosition'] as int,
    readAt: json['readAt'] as String?,
  );
  bool get locked => state == 'LOCKED';
  bool get complete => state == 'COMPLETED';
  String get artwork => chapterPosition == 1
      ? 'relations'
      : chapterPosition == 2
      ? 'read'
      : 'write';
}

class Course {
  final String title, description, slug, name, role;
  final List<MaterialItem> materials;
  final int total, completed, percentage;
  final String? currentId;
  final bool assessmentActive;
  Course.fromJson(JsonMap json)
    : title = json['path']['title'],
      description = json['path']['description'],
      slug = json['path']['slug'],
      name = json['profile']['displayName'] ?? '',
      role = json['profile']['role'],
      materials = (json['lessons'] as List)
          .map((item) => MaterialItem.fromJson(JsonMap.from(item)))
          .toList(),
      total = json['metrics']['totalRequiredLessons'],
      completed = json['metrics']['completedRequiredLessons'],
      percentage = json['metrics']['percentage'],
      currentId = json['metrics']['currentLessonId'],
      assessmentActive = json['activeAssessment'] == true;
  MaterialItem? get current {
    for (final item in materials) {
      if (item.id == currentId) return item;
    }
    return null;
  }
}

class MaterialReading {
  final MaterialItem lesson;
  final String content;
  final bool active;
  MaterialReading.fromJson(JsonMap json)
    : lesson = MaterialItem.fromJson(JsonMap.from(json['lesson'])),
      content = json['content'],
      active = json['activeAssessment'] == true;
}
