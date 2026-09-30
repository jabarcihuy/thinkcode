-- Invoker views need permission for columns referenced in WHERE clauses.
-- RLS still removes every hidden row before a user can read this column.
grant select (is_hidden) on public.test_cases to authenticated;
