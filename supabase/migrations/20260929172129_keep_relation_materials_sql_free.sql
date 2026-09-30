begin;

update public.lessons as l
set example_sql = null,
    content = replace(
      replace(
        l.content,
        '## Amati sebelum menulis query',
        '## Amati tabel dan record'
      ),
      'Periksa tiga tabel di bawah. Bandingkan apa yang disimpan `students` dan `courses` dengan fakta pendaftaran pada `enrollments`. Perhatikan bahwa satu baris pendaftaran merujuk pada satu mahasiswa dan satu mata kuliah.',
      'Periksa tiga tabel contoh setelah materi ini. Bandingkan fakta yang disimpan `students` dan `courses` dengan fakta pendaftaran pada `enrollments`. Pada bagian Relasi, fokusnya mengenali bentuk data dan key; query baru dimulai pada topik Read.'
    )
from public.chapters as c
join public.learning_paths as p on p.id = c.learning_path_id
where l.chapter_id = c.id
  and p.slug = 'database-fundamentals'
  and l.slug in ('membaca-bentuk-data', 'key-dan-hubungan-antar-tabel');

update public.exercises as e
set type = 'PSEUDOCODE',
    title = 'Kenali tabel, kolom, dan record',
    prompt = 'Perhatikan tiga tabel dan contoh record. Pilih pernyataan yang membedakan tabel, kolom, record, dan schema dengan benar.',
    starter_code = null,
    config = jsonb_set(
      jsonb_set(
        e.config,
        '{public}',
        '{"mode":"choice","options":[{"id":"table-column-record","text":"students adalah tabel, name adalah kolom, dan satu baris Alya adalah record."},{"id":"mixed-levels","text":"name adalah tabel, students adalah kolom, dan Alya adalah schema."},{"id":"columns-are-rows","text":"Setiap nama kolom seperti name merupakan record yang berbeda."}]}'::jsonb,
        true
      ),
      '{answer}',
      '{"choiceId":"table-column-record"}'::jsonb,
      true
    )
from public.lessons as l
join public.chapters as c on c.id = l.chapter_id
join public.learning_paths as p on p.id = c.learning_path_id
where e.lesson_id = l.id
  and p.slug = 'database-fundamentals'
  and l.slug = 'membaca-bentuk-data'
  and e.position = 1;

update public.exercises as e
set title = 'Ikuti dua foreign key',
    prompt = 'Tanpa menulis query, ikuti student_id dan course_id pada satu record enrollments. Pasangan key mana yang menunjuk ke tabel mahasiswa dan mata kuliah?',
    starter_code = null
from public.lessons as l
join public.chapters as c on c.id = l.chapter_id
join public.learning_paths as p on p.id = c.learning_path_id
where e.lesson_id = l.id
  and p.slug = 'database-fundamentals'
  and l.slug = 'key-dan-hubungan-antar-tabel'
  and e.position = 1;

do $$
declare
  relation_lesson_count integer;
  relation_lessons_with_sql integer;
  relation_practices_without_sql integer;
begin
  select count(*) into relation_lesson_count
  from public.lessons l
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals'
    and c.position = 1
    and l.is_published
    and l.is_required;

  select count(*) into relation_lessons_with_sql
  from public.lessons l
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals'
    and c.position = 1
    and l.is_published
    and l.is_required
    and l.example_sql is not null;

  select count(*) into relation_practices_without_sql
  from public.exercises e
  join public.lessons l on l.id = e.lesson_id
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals'
    and c.position = 1
    and l.is_published
    and l.is_required
    and e.is_published
    and e.is_required
    and e.type = 'PSEUDOCODE'
    and e.starter_code is null;

  if relation_lesson_count <> 2
    or relation_lessons_with_sql <> 0
    or relation_practices_without_sql <> 2 then
    raise exception 'Relasi should have two required materials, no SQL lab, and two concept practices (found %, %, %)', relation_lesson_count, relation_lessons_with_sql, relation_practices_without_sql;
  end if;
end $$;

commit;
