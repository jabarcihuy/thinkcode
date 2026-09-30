create type public.exercise_type as enum (
  'CODE_COMPLETION', 'PREDICT_OUTPUT', 'DEBUGGING',
  'PROBLEM_SOLVING', 'PSEUDOCODE', 'FLOWCHART'
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  type public.exercise_type not null,
  title text not null,
  prompt text not null,
  starter_code text,
  solution_code text,
  config jsonb not null default '{}'::jsonb,
  position integer not null check (position > 0),
  is_required boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, position),
  constraint exercise_config_object check (jsonb_typeof(config) = 'object')
);

create table public.test_cases (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  stdin text,
  expected_output text,
  is_hidden boolean not null default false,
  weight numeric(8,2) not null default 1 check (weight > 0),
  position integer not null check (position > 0),
  unique (exercise_id, position)
);

create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  source_code text,
  answer jsonb,
  score numeric(5,2) not null check (score between 0 and 100),
  passed boolean not null,
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint attempt_source_size check (source_code is null or length(source_code) <= 16000)
);

create index exercises_published_lesson_idx on public.exercises (lesson_id, position) where is_published;
create index test_cases_exercise_hidden_idx on public.test_cases (exercise_id, is_hidden, position);
create index exercise_attempts_user_exercise_idx on public.exercise_attempts (user_id, exercise_id, created_at desc);
create index exercise_attempts_exercise_idx on public.exercise_attempts (exercise_id);

create trigger exercises_updated_at before update on public.exercises
for each row execute function public.set_profile_updated_at();

alter table public.exercises enable row level security;
alter table public.test_cases enable row level security;
alter table public.exercise_attempts enable row level security;

-- No direct SELECT policy exists on exercises or test_cases. Both tables contain
-- solutions, checker answers, or hidden cases. These views select only safe fields.
revoke all on public.exercises from anon, authenticated;
revoke all on public.test_cases from anon, authenticated;

create view public.published_exercise_catalog as
select e.id, e.lesson_id, e.type, e.title, e.prompt, e.starter_code,
       e.config -> 'public' as public_config, e.position, e.is_required
from public.exercises e
join public.lessons lesson on lesson.id = e.lesson_id
join public.chapters chapter on chapter.id = lesson.chapter_id
join public.learning_paths path on path.id = chapter.learning_path_id
where e.is_published and lesson.is_published and chapter.is_published and path.is_published
  and auth.uid() is not null
  and public.phase1_lesson_is_available(e.lesson_id, auth.uid());

create view public.published_visible_test_cases as
select test.id, test.exercise_id, test.stdin, test.expected_output, test.weight, test.position
from public.test_cases test
join public.exercises exercise on exercise.id = test.exercise_id
join public.lessons lesson on lesson.id = exercise.lesson_id
join public.chapters chapter on chapter.id = lesson.chapter_id
join public.learning_paths path on path.id = chapter.learning_path_id
where not test.is_hidden and exercise.is_published and lesson.is_published
  and chapter.is_published and path.is_published and auth.uid() is not null
  and public.phase1_lesson_is_available(exercise.lesson_id, auth.uid());

revoke all on public.published_exercise_catalog from public, anon;
revoke all on public.published_visible_test_cases from public, anon;
grant select on public.published_exercise_catalog to authenticated;
grant select on public.published_visible_test_cases to authenticated;

create policy "Users read own exercise attempts" on public.exercise_attempts
for select to authenticated using ((select auth.uid()) = user_id);

-- Completion is now coupled to an attempt recorded by the trusted Next.js
-- grading endpoint. The Phase 1 manual completion RPC is inaccessible to users.
revoke all on function public.phase1_complete_lesson(uuid) from public, anon, authenticated, service_role;

create function public.phase3_record_attempt(
  p_user_id uuid,
  p_exercise_id uuid,
  p_source_code text,
  p_answer jsonb,
  p_score numeric,
  p_passed boolean,
  p_feedback jsonb
) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_lesson_id uuid;
  v_completed boolean := false;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  if p_score < 0 or p_score > 100 or p_feedback is null
     or (p_source_code is not null and length(p_source_code) > 16000) then
    raise exception 'Invalid attempt' using errcode = '22023';
  end if;

  select lesson_id into v_lesson_id from public.exercises
  where id = p_exercise_id and is_published;
  if v_lesson_id is null or not public.phase1_lesson_is_available(v_lesson_id, p_user_id) then
    raise exception 'Exercise unavailable' using errcode = '42501';
  end if;

  insert into public.exercise_attempts
    (user_id, exercise_id, source_code, answer, score, passed, feedback)
  values
    (p_user_id, p_exercise_id, p_source_code, p_answer, p_score, p_passed, p_feedback);

  if exists (select 1 from public.exercises where lesson_id = v_lesson_id and is_published and is_required)
     and not exists (
       select 1 from public.exercises required_exercise
       where required_exercise.lesson_id = v_lesson_id
         and required_exercise.is_published and required_exercise.is_required
         and not exists (
           select 1 from public.exercise_attempts attempt
           where attempt.user_id = p_user_id and attempt.exercise_id = required_exercise.id and attempt.passed
         )
     ) then
    insert into public.lesson_progress (user_id, lesson_id, status, completed_at)
    values (p_user_id, v_lesson_id, 'COMPLETED', now())
    on conflict (user_id, lesson_id) do update
    set status = 'COMPLETED', completed_at = coalesce(public.lesson_progress.completed_at, now());
    v_completed := true;
  end if;

  return v_completed;
end;
$$;

revoke all on function public.phase3_record_attempt(uuid, uuid, text, jsonb, numeric, boolean, jsonb)
from public, anon, authenticated;
grant execute on function public.phase3_record_attempt(uuid, uuid, text, jsonb, numeric, boolean, jsonb)
to service_role;
