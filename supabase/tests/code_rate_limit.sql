-- Run with a privileged SQL connection. All test data is rolled back.
begin;
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000002001', 'phase2-rate-test@example.invalid');
set local role authenticated;
do $test$
declare i integer;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000002001', true);
  if public.consume_code_request_quota('run') then
    raise exception 'Removed Run quota accepted a request';
  end if;
  for i in 1..8 loop
    if not public.consume_code_request_quota('check') then
      raise exception 'Check quota rejected request %', i;
    end if;
  end loop;
  if public.consume_code_request_quota('check') then
    raise exception 'Check quota allowed request 9';
  end if;
end
$test$;
rollback;
