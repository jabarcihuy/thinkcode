import 'package:flutter/material.dart';

import '../../core/locale.dart';
import '../learning/models.dart';
import 'models.dart';

class ChoiceAnswerField extends StatefulWidget {
  final List<AnswerOption> options;
  final ValueChanged<JsonMap> onChanged;
  const ChoiceAnswerField({
    super.key,
    required this.options,
    required this.onChanged,
  });
  @override
  State<ChoiceAnswerField> createState() => _ChoiceAnswerFieldState();
}

class _ChoiceAnswerFieldState extends State<ChoiceAnswerField> {
  String? selected;
  @override
  Widget build(BuildContext context) => RadioGroup<String>(
    groupValue: selected,
    onChanged: (value) {
      setState(() => selected = value);
      if (value != null) widget.onChanged({'choiceId': value});
    },
    child: Column(
      children: widget.options
          .map(
            (option) => RadioListTile<String>(
              value: option.id,
              title: Text(option.text),
              contentPadding: EdgeInsets.zero,
            ),
          )
          .toList(),
    ),
  );
}

class OrderAnswerField extends StatefulWidget {
  final List<AnswerOption> blocks;
  final ValueChanged<JsonMap> onChanged;
  const OrderAnswerField({
    super.key,
    required this.blocks,
    required this.onChanged,
  });
  @override
  State<OrderAnswerField> createState() => _OrderAnswerFieldState();
}

class _OrderAnswerFieldState extends State<OrderAnswerField> {
  late List<AnswerOption> order = [...widget.blocks];
  void move(int from, int to) {
    setState(() {
      final block = order.removeAt(from);
      order.insert(to, block);
    });
    widget.onChanged({'order': order.map((x) => x.id).toList()});
  }

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(
        t(
          context,
          'Arrange the steps in the correct order.',
          'Susun langkah dalam urutan yang tepat.',
        ),
      ),
      const SizedBox(height: 12),
      for (var i = 0; i < order.length; i++)
        Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 4, 8),
            child: Row(
              children: [
                Text('${i + 1}.'),
                const SizedBox(width: 12),
                Expanded(child: Text(order[i].text)),
                Column(
                  children: [
                    IconButton(
                      tooltip: t(
                        context,
                        'Move step ${i + 1} up',
                        'Pindahkan langkah ${i + 1} ke atas',
                      ),
                      onPressed: i > 0 ? () => move(i, i - 1) : null,
                      icon: const Icon(Icons.keyboard_arrow_up),
                    ),
                    IconButton(
                      tooltip: t(
                        context,
                        'Move step ${i + 1} down',
                        'Pindahkan langkah ${i + 1} ke bawah',
                      ),
                      onPressed: i + 1 < order.length
                          ? () => move(i, i + 1)
                          : null,
                      icon: const Icon(Icons.keyboard_arrow_down),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
    ],
  );
}

class OutputAnswerField extends StatelessWidget {
  final List<String> columns;
  final ValueChanged<JsonMap> onChanged;
  const OutputAnswerField({
    super.key,
    required this.columns,
    required this.onChanged,
  });
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(columns.join(' | '), style: Theme.of(context).textTheme.labelLarge),
      const SizedBox(height: 12),
      TextFormField(
        maxLines: 6,
        maxLength: 4000,
        keyboardType: TextInputType.multiline,
        autocorrect: false,
        enableSuggestions: false,
        decoration: InputDecoration(
          labelText: t(
            context,
            'Your predicted output',
            'Prediksi hasil tabel',
          ),
          alignLabelWithHint: true,
        ),
        onChanged: (value) => onChanged({'output': value}),
      ),
      Text(
        t(
          context,
          'One record per line, without a header. Separate columns with |.',
          'Satu record per baris, tanpa header. Pisahkan kolom dengan |.',
        ),
        style: Theme.of(context).textTheme.bodySmall,
      ),
    ],
  );
}
