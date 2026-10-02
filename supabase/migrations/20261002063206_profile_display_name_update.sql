-- Learners may update only their own display name. Roles stay server/database controlled.
revoke update on table public.profiles from anon, authenticated;
grant update (display_name) on table public.profiles to authenticated;

create policy "Users update own display name"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
