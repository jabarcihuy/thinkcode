import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../core/locale.dart';
import 'models.dart';

class HomePage extends StatelessWidget {
  final Course course;
  final Future<void> Function() refresh;
  final void Function(MaterialItem) open;
  final VoidCallback materials;
  const HomePage({
    super.key,
    required this.course,
    required this.refresh,
    required this.open,
    required this.materials,
  });
  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme, current = course.current;
    return RefreshIndicator(
      onRefresh: refresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          Text(
            t(
              context,
              'Hello${course.name.isEmpty ? '' : ', ${course.name}'}.',
              'Halo${course.name.isEmpty ? '' : ', ${course.name}'}.',
            ),
            style: Theme.of(context).textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Text(
            t(
              context,
              'Make sense of data, step by step.',
              'Pahami cara data bekerja, selangkah demi selangkah.',
            ),
            style: TextStyle(color: colors.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          Card(
            margin: EdgeInsets.zero,
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  color: colors.secondaryContainer,
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          course.title,
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: colors.onSecondaryContainer,
                              ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      SvgPicture.asset(
                        'assets/learning-map.svg',
                        width: 64,
                        height: 64,
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              t(
                                context,
                                '${course.completed} of ${course.total} completed',
                                '${course.completed} dari ${course.total} selesai',
                              ),
                            ),
                          ),
                          Text(
                            '${course.percentage}%',
                            style: TextStyle(
                              color: colors.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Semantics(
                        label: t(
                          context,
                          'Learning progress',
                          'Progres belajar',
                        ),
                        value: '${course.percentage}%',
                        child: LinearProgressIndicator(
                          value: course.percentage / 100,
                          borderRadius: BorderRadius.circular(8),
                          minHeight: 7,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  color: colors.primary,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        t(
                          context,
                          course.assessmentActive
                              ? 'Challenge in progress'
                              : current == null
                              ? 'Materials completed'
                              : current.readAt == null
                              ? 'Continue learning'
                              : 'Try the core Lab',
                          course.assessmentActive
                              ? 'Tantangan sedang berlangsung'
                              : current == null
                              ? 'Materi telah tuntas'
                              : current.readAt == null
                              ? 'Lanjutkan belajar'
                              : 'Coba Lab inti',
                        ),
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: colors.onPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        course.assessmentActive
                            ? t(
                                context,
                                'Finish your active challenge on the website before continuing.',
                                'Selesaikan tantangan aktif di website sebelum melanjutkan.',
                              )
                            : current?.title ??
                                  t(
                                    context,
                                    'Your Final Challenge is available on the website.',
                                    'Tantangan Akhir tersedia melalui website.',
                                  ),
                        style: TextStyle(color: colors.onPrimary, height: 1.5),
                      ),
                      if (current != null && !course.assessmentActive) ...[
                        const SizedBox(height: 16),
                        FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: colors.surface,
                            foregroundColor: colors.primary,
                          ),
                          onPressed: () => open(current),
                          icon: const Icon(Icons.arrow_forward),
                          label: Text(
                            t(
                              context,
                              current.readAt == null
                                  ? 'Read material'
                                  : 'Open core Lab',
                              current.readAt == null
                                  ? 'Baca materi'
                                  : 'Buka Lab inti',
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          Text(
            t(context, 'Your learning path', 'Jalur belajarmu'),
            style: Theme.of(context).textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          Card(
            margin: EdgeInsets.zero,
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 12,
              ),
              leading: Icon(Icons.menu_book_rounded, color: colors.primary),
              title: Text(t(context, 'Materials', 'Materi')),
              subtitle: Text(
                t(
                  context,
                  '${course.materials.length} readings · Relations, Read, Write',
                  '${course.materials.length} bacaan · Relasi, Read, Write',
                ),
              ),
              trailing: const Icon(Icons.arrow_forward),
              onTap: materials,
            ),
          ),
        ],
      ),
    );
  }
}
