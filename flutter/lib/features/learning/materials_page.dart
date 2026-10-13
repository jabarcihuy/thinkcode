import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../core/locale.dart';
import 'models.dart';

class MaterialsPage extends StatelessWidget {
  final Course course;
  final Future<void> Function() refresh;
  final void Function(MaterialItem) open;
  const MaterialsPage({
    super.key,
    required this.course,
    required this.refresh,
    required this.open,
  });
  @override
  Widget build(BuildContext context) => RefreshIndicator(
    onRefresh: refresh,
    child: ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      itemCount: course.materials.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  course.title,
                  style: Theme.of(context).textTheme.headlineSmall
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  course.description,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          );
        }
        final item = course.materials[index - 1],
            colors = Theme.of(context).colorScheme;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Card(
            margin: EdgeInsets.zero,
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: item.locked ? null : () => open(item),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 68,
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: colors.secondaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          SvgPicture.asset(
                            'assets/lesson-${item.artwork}.svg',
                            width: 56,
                            height: 56,
                          ),
                          Text(
                            index.toString().padLeft(2, '0'),
                            style: TextStyle(
                              color: colors.onSecondaryContainer,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                item.locked
                                    ? Icons.lock_outline
                                    : item.complete
                                    ? Icons.check_circle_outline
                                    : Icons.play_circle_outline,
                                size: 16,
                                color: colors.primary,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  t(
                                    context,
                                    item.locked
                                        ? 'Locked'
                                        : item.complete
                                        ? 'Completed'
                                        : item.id == course.currentId
                                        ? 'Current'
                                        : 'Available',
                                    item.locked
                                        ? 'Terkunci'
                                        : item.complete
                                        ? 'Tuntas'
                                        : item.id == course.currentId
                                        ? 'Saat ini'
                                        : 'Tersedia',
                                  ),
                                  style: Theme.of(context)
                                      .textTheme
                                      .labelMedium,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item.title,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item.summary,
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(color: colors.onSurfaceVariant),
                          ),
                          if (!item.locked) ...[
                            const SizedBox(height: 12),
                            Text(
                              t(context, 'Read →', 'Baca →'),
                              style: TextStyle(
                                color: colors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    ),
  );
}
