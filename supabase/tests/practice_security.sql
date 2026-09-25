-- Verifies least-privilege content views and attempt RLS. All rows roll back.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000003101', 'phase3-security-a@example.invalid'),
  ('00000000-0000-4000-8000-000000003102', 'phase3-security-b@example.invalid');

insert into public.lesson_progress (user_id, lesson_id, status, completed_at)
select '00000000-0000-4000-8000-000000003101', lesson.id, 'COMPLETED', now()
from public.lessons lesson join public.chapters chapter on chapter.id = lesson.chapter_id
where chapter.position <= 3;

insert into public.exercise_attempts (user_id, exercise_id, score, passed, feedback)
select '00000000-0000-4000-8000-000000003102', id, 100, true, '{}'::jsonb
from public.exercises limit 1;

insert into public.test_cases (exercise_id, position, stdin, expected_output, is_hidden, weight)
select exercise.id, 99, 'secret-input', 'secret-output', true, 1
from public.exercises exercise join public.lessons lesson on lesson.id = exercise.lesson_id
where lesson.slug = 'variables-and-types' and exercise.position = 1;

set local role authenticated;
do $test$
declare variable_exercise uuid;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000003101', true);
  if has_column_privilege('authenticated', 'public.exercises', 'config', 'SELECT')
     or has_column_privilege('authenticated', 'public.exercises', 'solution_code', 'SELECT') then
    raise exception 'Checker answer or solution column is directly readable';
  end if;
  if has_function_privilege('authenticated', 'public.phase1_complete_lesson(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.phase3_record_attempt(uuid,uuid,text,jsonb,numeric,boolean,jsonb)', 'EXECUTE') then
    raise exception 'Completion RPC is callable by a user';
  end if;
  if exists (select 1 from public.exercise_attempts where user_id = '00000000-0000-4000-8000-000000003102') then
    raise exception 'Another user attempt is readable';
  end if;
  select catalog.id into strict variable_exercise
  from public.published_exercise_catalog catalog
  join public.lessons lesson on lesson.id = catalog.lesson_id
  where lesson.slug = 'variables-and-types' and catalog.position = 1;
  if (select count(*) from public.published_visible_test_cases where exercise_id = variable_exercise) <> 2 then
    raise exception 'Hidden test leaked through visible view';
  end if;
  if (select count(*) from public.test_cases where exercise_id = variable_exercise) <> 2 then
    raise exception 'Hidden test leaked through base-table RLS';
  end if;
  if exists (select 1 from public.published_exercise_catalog where public_config::text like '%"answer"%') then
    raise exception 'Checker answer leaked through catalog';
  end if;
end
$test$;
rollback;
