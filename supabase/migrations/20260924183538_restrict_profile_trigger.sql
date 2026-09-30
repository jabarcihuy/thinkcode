-- The auth.users trigger still runs as its owner; no API role needs to call it.
revoke all on function public.handle_new_user() from public, anon, authenticated;
