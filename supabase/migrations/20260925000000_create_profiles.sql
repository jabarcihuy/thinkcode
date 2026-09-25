-- Run through Supabase migrations or SQL Editor with a privileged database role.
create type public.app_role as enum ('USER', 'ADMIN');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'USER',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'USER');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();

alter table public.profiles enable row level security;

create policy "Users read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

-- Deliberately no client INSERT/UPDATE/DELETE policy. Admin promotion is a
-- privileged database operation, e.g. UPDATE public.profiles SET role = 'ADMIN'
-- WHERE id = '<verified-user-uuid>'; never expose it in client code.
