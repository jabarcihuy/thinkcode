create function public.current_user_lesson_available(p_lesson_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(auth.uid() is not null and public.phase1_lesson_is_available(p_lesson_id, auth.uid()), false);
$$;

revoke all on function public.current_user_lesson_available(uuid) from public, anon;
grant execute on function public.current_user_lesson_available(uuid) to authenticated;

create or replace view public.published_exercise_catalog as
select e.id, e.lesson_id, e.type, e.title, e.prompt, e.starter_code,
       e.config -> 'public' as public_config, e.position, e.is_required
from public.exercises e
join public.lessons lesson on lesson.id = e.lesson_id
join public.chapters chapter on chapter.id = lesson.chapter_id
join public.learning_paths path on path.id = chapter.learning_path_id
where e.is_published and lesson.is_published and chapter.is_published and path.is_published
  and public.current_user_lesson_available(e.lesson_id);

create or replace view public.published_visible_test_cases as
select test.id, test.exercise_id, test.stdin, test.expected_output, test.weight, test.position
from public.test_cases test
join public.exercises exercise on exercise.id = test.exercise_id
join public.lessons lesson on lesson.id = exercise.lesson_id
join public.chapters chapter on chapter.id = lesson.chapter_id
join public.learning_paths path on path.id = chapter.learning_path_id
where not test.is_hidden and exercise.is_published and lesson.is_published
  and chapter.is_published and path.is_published
  and public.current_user_lesson_available(exercise.lesson_id);
