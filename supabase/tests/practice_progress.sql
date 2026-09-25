-- Run against seeded Supabase with a privileged SQL connection. No data persists.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000003001', 'phase3-progress@example.invalid');
set local role service_role;
do $test$
declare
  v_user_id uuid := '00000000-0000-4000-8000-000000003001';
  exercise_id uuid;
  first_lesson uuid;
  next_lesson uuid;
  javascript_lesson uuid;
  first_javascript_exercise uuid;
  second_javascript_exercise uuid;
begin
  perform set_config('request.jwt.claim.role', 'service_role', true);
  select e.id, e.lesson_id into strict exercise_id, first_lesson
  from public.exercises e join public.lessons l on l.id = e.lesson_id
  where l.slug = 'what-is-computational-thinking' and e.position = 1;
  select id into strict next_lesson from public.lessons where slug = 'decomposition';

  perform public.phase3_record_attempt(v_user_id, exercise_id, null, '{"order":["wrong","order"]}'::jsonb, 0, false, '{}'::jsonb);
  if exists (select 1 from public.lesson_progress progress where progress.user_id = v_user_id and progress.lesson_id = first_lesson) then
    raise exception 'Failed mandatory practice completed lesson';
  end if;
  if public.phase1_lesson_is_available(next_lesson, v_user_id) then
    raise exception 'Next lesson unlocked before mandatory practice passed';
  end if;

  perform public.phase3_record_attempt(v_user_id, exercise_id, null, '{"order":["split","solve","combine"]}'::jsonb, 100, true, '{}'::jsonb);
  if not exists (select 1 from public.lesson_progress progress where progress.user_id = v_user_id and progress.lesson_id = first_lesson and progress.status = 'COMPLETED') then
    raise exception 'Passed mandatory practice did not complete lesson';
  end if;
  if not public.phase1_lesson_is_available(next_lesson, v_user_id) then
    raise exception 'Next lesson remains locked';
  end if;

  -- Simulate passing all earlier lessons to isolate the two-practice rule.
  insert into public.lesson_progress (user_id, lesson_id, status, completed_at)
  select v_user_id, lesson.id, 'COMPLETED', now()
  from public.lessons lesson
  join public.chapters chapter on chapter.id = lesson.chapter_id
  where chapter.position < 3 or (chapter.position = 3 and lesson.position = 1)
  on conflict (user_id, lesson_id) do nothing;

  select id into strict javascript_lesson from public.lessons where slug = 'first-javascript-program';
  select id into strict first_javascript_exercise from public.exercises where lesson_id = javascript_lesson and position = 1;
  select id into strict second_javascript_exercise from public.exercises where lesson_id = javascript_lesson and position = 2;
  perform public.phase3_record_attempt(v_user_id, first_javascript_exercise, 'console.log("Hello, ThinkCode!")', null, 100, true, '{}'::jsonb);
  if exists (select 1 from public.lesson_progress where lesson_id = javascript_lesson and user_id = v_user_id) then
    raise exception 'One of two mandatory practices completed lesson';
  end if;
  perform public.phase3_record_attempt(v_user_id, second_javascript_exercise, null, '{"output":"5"}'::jsonb, 100, true, '{}'::jsonb);
  if not exists (select 1 from public.lesson_progress where lesson_id = javascript_lesson and user_id = v_user_id and status = 'COMPLETED') then
    raise exception 'All mandatory practices did not complete lesson';
  end if;
end
$test$;
rollback;
