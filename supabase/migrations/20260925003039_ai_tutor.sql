create table public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_sessions(id) on delete cascade,
  role text not null check (role in ('USER', 'ASSISTANT')),
  content text not null check (length(content) between 1 and 8000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index ai_sessions_user_recent_idx on public.ai_sessions (user_id, updated_at desc);
create index ai_messages_session_recent_idx on public.ai_messages (session_id, created_at desc);

alter table public.ai_sessions enable row level security;
alter table public.ai_messages enable row level security;

create policy "Users read own AI sessions" on public.ai_sessions
for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users read messages from own AI sessions" on public.ai_messages
for select to authenticated using (
  exists (select 1 from public.ai_sessions s where s.id = session_id and s.user_id = (select auth.uid()))
);

revoke all on public.ai_sessions, public.ai_messages from anon, authenticated;
grant select on public.ai_sessions, public.ai_messages to authenticated;

delete from public.code_request_limits where kind = 'run';
alter table public.code_request_limits drop constraint code_request_limits_kind_check;
alter table public.code_request_limits add constraint code_request_limits_kind_check check (kind in ('check', 'ai'));

create or replace function public.consume_code_request_quota(p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_window timestamptz := date_trunc('minute', now());
  v_limit integer;
  v_accepted boolean := false;
begin
  if v_user_id is null or p_kind not in ('check', 'ai') then return false; end if;
  v_limit := case when p_kind = 'ai' then 8 else 8 end;
  insert into public.code_request_limits as quota (user_id, kind, window_started_at, request_count)
  values (v_user_id, p_kind, v_window, 1)
  on conflict (user_id, kind) do update
  set window_started_at = v_window,
      request_count = case when quota.window_started_at = v_window then quota.request_count + 1 else 1 end
  where quota.window_started_at <> v_window or quota.request_count < v_limit
  returning true into v_accepted;
  return coalesce(v_accepted, false);
end;
$$;

revoke all on function public.consume_code_request_quota(text) from public, anon;
grant execute on function public.consume_code_request_quota(text) to authenticated;

-- The table is added in Phase 5. This stable guard can therefore ship with the
-- tutor first and begins blocking immediately once assessment sessions exist.
create or replace function public.current_user_has_active_assessment()
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare
  v_active boolean := false;
begin
  if auth.uid() is null or to_regclass('public.assessment_sessions') is null then return false; end if;
  execute 'select exists (select 1 from public.assessment_sessions where user_id = $1 and status = ''IN_PROGRESS'')'
    into v_active using auth.uid();
  return coalesce(v_active, false);
end;
$$;
revoke all on function public.current_user_has_active_assessment() from public, anon;
grant execute on function public.current_user_has_active_assessment() to authenticated;
