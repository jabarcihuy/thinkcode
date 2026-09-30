-- Optional deterministic flowchart exercise for selecting a missing node.
insert into public.exercises (lesson_id, type, title, prompt, starter_code, config, position, is_required, is_published)
select lesson.id, 'FLOWCHART', 'Pilih node keputusan',
  'Alur: Mulai → baca nilai → [?] → tampilkan hasil → Selesai. Node apa yang hilang?',
  null,
  '{"public":{"mode":"choice","options":[{"id":"decision","text":"Keputusan: nilai ≥ 75?"},{"id":"output","text":"Output: tampilkan nilai"},{"id":"end","text":"Selesai"}]},"answer":{"choiceId":"decision"}}'::jsonb,
  2, false, true
from public.lessons lesson where lesson.slug = 'introduction-to-flowchart'
on conflict (lesson_id, position) do nothing;
