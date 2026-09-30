create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_paths_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null check (position > 0),
  is_required boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learning_path_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  content text not null default '',
  position integer not null check (position > 0),
  is_required boolean not null default true,
  is_preview boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  unique (chapter_id, position)
);

create type public.lesson_progress_status as enum ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED');

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.lesson_progress_status not null default 'IN_PROGRESS',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, lesson_id),
  constraint persisted_progress_status check (status in ('IN_PROGRESS', 'COMPLETED')),
  constraint completed_progress_has_timestamp check (
    (status = 'COMPLETED' and completed_at is not null) or
    (status = 'IN_PROGRESS' and completed_at is null)
  )
);

create index learning_paths_published_idx on public.learning_paths (is_published, slug);
create index chapters_published_path_idx on public.chapters (learning_path_id, position) where is_published;
create index lessons_published_chapter_idx on public.lessons (chapter_id, position) where is_published;
create index lesson_progress_user_status_idx on public.lesson_progress (user_id, status);

create trigger learning_paths_updated_at before update on public.learning_paths
for each row execute function public.set_profile_updated_at();
create trigger chapters_updated_at before update on public.chapters
for each row execute function public.set_profile_updated_at();
create trigger lessons_updated_at before update on public.lessons
for each row execute function public.set_profile_updated_at();

alter table public.learning_paths enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Published learning paths are readable" on public.learning_paths
for select to anon, authenticated using (is_published);

create policy "Published chapters are readable" on public.chapters
for select to anon, authenticated using (
  is_published and exists (
    select 1 from public.learning_paths path
    where path.id = learning_path_id and path.is_published
  )
);

create policy "Authenticated users read published lessons" on public.lessons
for select to authenticated using (
  is_published and exists (
    select 1 from public.chapters chapter
    join public.learning_paths path on path.id = chapter.learning_path_id
    where chapter.id = chapter_id and chapter.is_published and path.is_published
  )
);

create policy "Guests read published previews" on public.lessons
for select to anon using (
  is_published and is_preview and exists (
    select 1 from public.chapters chapter
    join public.learning_paths path on path.id = chapter.learning_path_id
    where chapter.id = chapter_id and chapter.is_published and path.is_published
  )
);

create policy "Users read own lesson progress" on public.lesson_progress
for select to authenticated using ((select auth.uid()) = user_id);

-- Direct progress writes are intentionally denied. These narrow RPCs are the
-- only client-authorized mutations and validate identity and sequencing.
create function public.phase1_lesson_is_available(p_lesson_id uuid, p_user_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.lessons target
    join public.chapters target_chapter on target_chapter.id = target.chapter_id
    join public.learning_paths path on path.id = target_chapter.learning_path_id
    where target.id = p_lesson_id
      and target.is_published and target_chapter.is_published and path.is_published
      and not exists (
        select 1
        from public.lessons prior
        join public.chapters prior_chapter on prior_chapter.id = prior.chapter_id
        left join public.lesson_progress progress
          on progress.lesson_id = prior.id and progress.user_id = p_user_id
        where prior_chapter.learning_path_id = path.id
          and prior_chapter.is_published and prior_chapter.is_required
          and prior.is_published and prior.is_required
          and (prior_chapter.position, prior.position) < (target_chapter.position, target.position)
          and progress.status is distinct from 'COMPLETED'
      )
  );
$$;

revoke all on function public.phase1_lesson_is_available(uuid, uuid) from public, anon, authenticated;

create function public.phase1_start_lesson(p_lesson_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not public.phase1_lesson_is_available(p_lesson_id, v_user_id) then
    raise exception 'Lesson unavailable' using errcode = '42501';
  end if;
  insert into public.lesson_progress (user_id, lesson_id, status)
  values (v_user_id, p_lesson_id, 'IN_PROGRESS')
  on conflict (user_id, lesson_id) do nothing;
end;
$$;

create function public.phase1_complete_lesson(p_lesson_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not public.phase1_lesson_is_available(p_lesson_id, v_user_id) then
    raise exception 'Lesson unavailable' using errcode = '42501';
  end if;
  insert into public.lesson_progress (user_id, lesson_id, status, completed_at)
  values (v_user_id, p_lesson_id, 'COMPLETED', now())
  on conflict (user_id, lesson_id) do update
  set status = 'COMPLETED', completed_at = coalesce(public.lesson_progress.completed_at, now());
end;
$$;

revoke all on function public.phase1_start_lesson(uuid) from public, anon;
revoke all on function public.phase1_complete_lesson(uuid) from public, anon;
grant execute on function public.phase1_start_lesson(uuid) to authenticated;
grant execute on function public.phase1_complete_lesson(uuid) to authenticated;
