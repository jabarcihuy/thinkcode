begin;

update public.lessons as l
set content = replace(
      l.content,
      'Pada bagian Relasi, fokusnya mengenali bentuk data dan key; query baru dimulai pada topik Read.',
      'Pada bagian Relasi, fokusnya mengenali bentuk data dan key sebelum mempelajari cara mengolah data.'
    )
from public.chapters as c
join public.learning_paths as p on p.id = c.learning_path_id
where l.chapter_id = c.id
  and p.slug = 'database-fundamentals'
  and l.slug = 'membaca-bentuk-data';

update public.exercises as e
set prompt = 'Ikuti student_id dan course_id pada satu record enrollments. Pasangan key mana yang menunjuk ke tabel mahasiswa dan mata kuliah?'
from public.lessons as l
join public.chapters as c on c.id = l.chapter_id
join public.learning_paths as p on p.id = c.learning_path_id
where e.lesson_id = l.id
  and p.slug = 'database-fundamentals'
  and l.slug = 'key-dan-hubungan-antar-tabel'
  and e.position = 1;

do $$
declare
  relation_content_with_query_terms integer;
  relation_lessons_with_sql_lab integer;
begin
  select count(*) into relation_content_with_query_terms
  from public.lessons l
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals'
    and c.position = 1
    and l.is_published
    and (l.content ilike '%query%' or l.content ilike '%sql%');

  select count(*) into relation_lessons_with_sql_lab
  from public.lessons l
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals'
    and c.position = 1
    and l.is_published
    and l.example_sql is not null;

  if relation_content_with_query_terms <> 0 or relation_lessons_with_sql_lab <> 0 then
    raise exception 'Relasi content must focus on tables and keys, without SQL/query wording or SQL labs (found %, %)', relation_content_with_query_terms, relation_lessons_with_sql_lab;
  end if;
end $$;

commit;
