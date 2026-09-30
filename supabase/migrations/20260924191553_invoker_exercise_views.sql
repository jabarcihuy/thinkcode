alter table public.exercises
add column public_config jsonb generated always as (config -> 'public') stored;

create policy "Users read published available exercises" on public.exercises
for select to authenticated using (
  is_published
  and public.current_user_lesson_available(lesson_id)
  and exists (
    select 1 from public.lessons lesson
    join public.chapters chapter on chapter.id = lesson.chapter_id
    join public.learning_paths path on path.id = chapter.learning_path_id
    where lesson.id = lesson_id and lesson.is_published and chapter.is_published and path.is_published
  )
);

create policy "Users read visible tests for available exercises" on public.test_cases
for select to authenticated using (
  not is_hidden
  and exists (select 1 from public.exercises exercise where exercise.id = exercise_id and exercise.is_published)
);

grant select (id, lesson_id, type, title, prompt, starter_code, public_config, position, is_required, is_published)
on public.exercises to authenticated;
grant select (id, exercise_id, stdin, expected_output, weight, position)
on public.test_cases to authenticated;

create or replace view public.published_exercise_catalog with (security_invoker = true) as
select e.id, e.lesson_id, e.type, e.title, e.prompt, e.starter_code,
       e.public_config, e.position, e.is_required
from public.exercises e
join public.lessons lesson on lesson.id = e.lesson_id
join public.chapters chapter on chapter.id = lesson.chapter_id
join public.learning_paths path on path.id = chapter.learning_path_id
where e.is_published and lesson.is_published and chapter.is_published and path.is_published
  and public.current_user_lesson_available(e.lesson_id);

create or replace view public.published_visible_test_cases with (security_invoker = true) as
select test.id, test.exercise_id, test.stdin, test.expected_output, test.weight, test.position
from public.test_cases test
join public.exercises exercise on exercise.id = test.exercise_id
join public.lessons lesson on lesson.id = exercise.lesson_id
join public.chapters chapter on chapter.id = lesson.chapter_id
join public.learning_paths path on path.id = chapter.learning_path_id
where not test.is_hidden and exercise.is_published and lesson.is_published
  and chapter.is_published and path.is_published
  and public.current_user_lesson_available(exercise.lesson_id);
