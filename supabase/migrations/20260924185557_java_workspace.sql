alter table public.lessons add column example_source_code text;

update public.lessons set example_source_code = $java$
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, ThinkCode!");
    }
}
$java$
where slug = 'first-java-program';

create table public.code_request_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('run', 'check')),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (user_id, kind)
);

alter table public.code_request_limits enable row level security;

create function public.consume_code_request_quota(p_kind text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit integer;
  v_window timestamptz := date_trunc('minute', now());
  v_accepted boolean := false;
begin
  if v_user_id is null or p_kind not in ('run', 'check') then
    return false;
  end if;
  v_limit := case p_kind when 'run' then 20 else 8 end;

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
