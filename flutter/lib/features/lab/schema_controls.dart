import 'package:flutter/material.dart';

import '../../core/locale.dart';

class SchemaControls extends StatelessWidget {
  final VoidCallback? zoomIn, zoomOut;
  final VoidCallback fit, focus;
  const SchemaControls({
    super.key,
    required this.zoomIn,
    required this.zoomOut,
    required this.fit,
    required this.focus,
  });
  @override
  Widget build(BuildContext context) => Wrap(
    spacing: 8,
    runSpacing: 8,
    crossAxisAlignment: WrapCrossAlignment.center,
    children: [
      IconButton.filledTonal(
        tooltip: t(context, 'Zoom out', 'Perkecil'),
        onPressed: zoomOut,
        style: IconButton.styleFrom(minimumSize: const Size(48, 48)),
        icon: const Icon(Icons.remove),
      ),
      IconButton.filledTonal(
        tooltip: t(context, 'Zoom in', 'Perbesar'),
        onPressed: zoomIn,
        style: IconButton.styleFrom(minimumSize: const Size(48, 48)),
        icon: const Icon(Icons.add),
      ),
      OutlinedButton.icon(
        onPressed: fit,
        icon: const Icon(Icons.fit_screen),
        label: Text(t(context, 'Show all', 'Lihat semua')),
      ),
      OutlinedButton.icon(
        onPressed: focus,
        icon: const Icon(Icons.center_focus_strong),
        label: Text(t(context, 'Focus table', 'Fokus tabel')),
      ),
    ],
  );
}
