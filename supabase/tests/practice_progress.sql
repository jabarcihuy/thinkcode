-- Run against seeded Supabase with a privileged SQL connection. The transaction rolls back.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000003001', 'quethink-database-progress@example.invalid');
set local role service_role;
do $test$
declare
  v_user_id uuid := '00000000-0000-4000-8000-000000003001';
  v_first_lesson uuid;
  v_first_exercise uuid;
  v_second_lesson uuid;
  v_second_exercise uuid;
  v_third_lesson uuid;
  v_expected text;
begin
  perform set_config('request.jwt.claim.role', 'service_role', true);

  select l.id, e.id, e.config #>> '{answer,output}'
  into strict v_first_lesson, v_first_exercise, v_expected
  from public.lessons l
  join public.exercises e on e.lesson_id = l.id and e.position = 1
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals' and l.slug = 'membaca-data-sebagai-relasi'
    and l.is_published and e.is_published;

  select l.id, e.id into strict v_second_lesson, v_second_exercise
  from public.lessons l
  join public.exercises e on e.lesson_id = l.id and e.position = 1
  where l.slug = 'memilih-sumber-dan-kolom' and l.is_published and e.is_published;
  select l.id into strict v_third_lesson
  from public.lessons l where l.slug = 'menyaring-record' and l.is_published;

  perform public.phase3_record_attempt(v_user_id, v_first_exercise, null, '{"output":"jawaban salah"}'::jsonb, 0, false, '{}'::jsonb);
  if exists (select 1 from public.lesson_progress where user_id = v_user_id and lesson_id = v_first_lesson) then
    raise exception 'A failed SQL prediction completed the lesson';
  end if;
  if public.phase1_lesson_is_available(v_second_lesson, v_user_id) then
    raise exception 'The next lesson unlocked before the SQL prediction passed';
  end if;

  perform public.phase3_record_attempt(v_user_id, v_first_exercise, null, jsonb_build_object('output', v_expected), 100, true, '{}'::jsonb);
  if not exists (select 1 from public.lesson_progress where user_id = v_user_id and lesson_id = v_first_lesson and status = 'COMPLETED') then
    raise exception 'A correct SQL prediction did not complete the lesson';
  end if;
  if not public.phase1_lesson_is_available(v_second_lesson, v_user_id) then
    raise exception 'The next lesson remained locked after completion';
  end if;

  select config #>> '{answer,output}' into strict v_expected from public.exercises where id = v_second_exercise;
  perform public.phase3_record_attempt(v_user_id, v_second_exercise, null, jsonb_build_object('output', v_expected), 100, true, '{}'::jsonb);
  if not exists (select 1 from public.lesson_progress where user_id = v_user_id and lesson_id = v_second_lesson and status = 'COMPLETED') then
    raise exception 'The second required SQL practice did not complete its lesson';
  end if;
  if public.phase1_lesson_is_available(v_third_lesson, v_user_id) then
    raise exception 'The next chapter unlocked before its checkpoint passed';
  end if;
end
$test$;
rollback;
