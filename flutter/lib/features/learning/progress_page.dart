import 'package:flutter/material.dart';

import '../../core/locale.dart';
import 'models.dart';

class ProgressPage extends StatelessWidget {
  final Course course;
  const ProgressPage({super.key, required this.course});
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      Text(
        t(context, 'Learning progress', 'Progres belajar'),
        style: Theme.of(context).textTheme.headlineSmall
            ?.copyWith(fontWeight: FontWeight.w700),
      ),
      const SizedBox(height: 20),
      Text(
        '${course.percentage}%',
        style: Theme.of(context).textTheme.displaySmall,
      ),
      const SizedBox(height: 12),
      LinearProgressIndicator(
        value: course.percentage / 100,
        minHeight: 8,
        borderRadius: BorderRadius.circular(8),
      ),
      const SizedBox(height: 12),
      Text(
        t(
          context,
          '${course.completed} of ${course.total} required materials complete',
          '${course.completed} dari ${course.total} materi wajib tuntas',
        ),
      ),
      const SizedBox(height: 24),
      for (final item in course.materials)
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(
            item.complete
                ? Icons.check_circle_outline
                : item.locked
                ? Icons.lock_outline
                : Icons.radio_button_unchecked,
          ),
          title: Text(item.title),
          subtitle: Text(
            t(
              context,
              item.complete
                  ? 'Reading and core Lab completed'
                  : item.readAt != null
                  ? 'Reading complete · core Lab remaining'
                  : 'Reading and core Lab remaining',
              item.complete
                  ? 'Bacaan dan Lab inti tuntas'
                  : item.readAt != null
                  ? 'Sudah dibaca · Lab inti belum tuntas'
                  : 'Bacaan dan Lab inti belum tuntas',
            ),
          ),
        ),
      const Divider(),
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          t(
            context,
            'Course completion also requires passing the Final Challenge on the website.',
            'Ketuntasan kelas juga memerlukan kelulusan Tantangan Akhir melalui website.',
          ),
        ),
      ),
    ],
  );
}
