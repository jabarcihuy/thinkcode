create type public.assessment_type as enum ('CHECKPOINT', 'FINAL');

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  instructions text not null default '',
  type public.assessment_type not null,
  gate_after_chapter integer not null check (gate_after_chapter between 1 and 10),
  passing_score numeric(5,2) not null default 75 check (passing_score between 0 and 100),
  position integer not null check (position > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learning_path_id, slug),
  unique (learning_path_id, position)
);

create table public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  type public.exercise_type not null,
  title text not null,
  topic text not null,
  prompt text not null,
  starter_code text,
  public_config jsonb not null default '{}'::jsonb check (jsonb_typeof(public_config) = 'object'),
  answer_config jsonb not null default '{}'::jsonb check (jsonb_typeof(answer_config) = 'object'),
  entry_function text check (entry_function is null or entry_function ~ '^[A-Za-z_$][A-Za-z0-9_$]{0,63}$'),
  weight numeric(8,2) not null default 1 check (weight > 0),
  position integer not null check (position > 0),
  unique (assessment_id, position)
);

create table public.assessment_test_cases (
  id uuid primary key default gen_random_uuid(),
  assessment_item_id uuid not null references public.assessment_items(id) on delete cascade,
  args jsonb not null default '[]'::jsonb check (jsonb_typeof(args) = 'array'),
  stdin text not null default '',
  expected_output text not null,
  is_hidden boolean not null default true,
  weight numeric(8,2) not null default 1 check (weight > 0),
  position integer not null check (position > 0),
  unique (assessment_item_id, position)
);

create table public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
  score numeric(5,2) check (score is null or score between 0 and 100),
  answers jsonb not null default '{}'::jsonb check (octet_length(answers::text) <= 100000),
  safe_feedback jsonb not null default '{}'::jsonb check (jsonb_typeof(safe_feedback) = 'object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  latest_score numeric(5,2) not null default 0 check (latest_score between 0 and 100),
  highest_score numeric(5,2) not null default 0 check (highest_score between 0 and 100),
  passed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, assessment_id)
);

create index assessments_published_path_idx on public.assessments (learning_path_id, position) where is_published;
create index assessment_items_order_idx on public.assessment_items (assessment_id, position);
create index assessment_test_cases_item_hidden_idx on public.assessment_test_cases (assessment_item_id, is_hidden, position);
create index assessment_sessions_user_idx on public.assessment_sessions (user_id, assessment_id, started_at desc);
create unique index assessment_sessions_one_active_idx on public.assessment_sessions (user_id, assessment_id) where status = 'IN_PROGRESS';
create index assessment_results_user_idx on public.assessment_results (user_id, assessment_id) where passed;

alter table public.code_request_limits drop constraint code_request_limits_kind_check;
alter table public.code_request_limits add constraint code_request_limits_kind_check check (kind in ('check', 'ai', 'assessment'));
create or replace function public.consume_code_request_quota(p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_window timestamptz := date_trunc('minute', now());
  v_limit integer;
  v_accepted boolean := false;
begin
  if v_user_id is null or p_kind not in ('check', 'ai', 'assessment') then return false; end if;
  v_limit := case when p_kind = 'assessment' then 4 else 8 end;
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

alter table public.assessments enable row level security;
alter table public.assessment_items enable row level security;
alter table public.assessment_test_cases enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.assessment_results enable row level security;

create policy "Users read own assessment sessions" on public.assessment_sessions
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users read own assessment results" on public.assessment_results
for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.assessments, public.assessment_items, public.assessment_test_cases,
  public.assessment_sessions, public.assessment_results from anon, authenticated;
grant select on public.assessment_sessions, public.assessment_results to authenticated;

create or replace function public.start_assessment_session(p_assessment_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_assessment public.assessments%rowtype;
  v_session_id uuid;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select a.* into v_assessment from public.assessments a
  join public.learning_paths p on p.id = a.learning_path_id
  where a.id = p_assessment_id and a.is_published and p.is_published;
  if not found then raise exception 'Assessment unavailable' using errcode = '42501'; end if;

  if exists (
    select 1 from public.lessons l join public.chapters c on c.id = l.chapter_id
    where c.learning_path_id = v_assessment.learning_path_id and c.is_published and c.is_required
      and l.is_published and l.is_required and c.position <= v_assessment.gate_after_chapter
      and not exists (select 1 from public.lesson_progress lp where lp.user_id = v_user and lp.lesson_id = l.id and lp.status = 'COMPLETED')
  ) then raise exception 'Required lessons are incomplete' using errcode = '42501'; end if;

  if v_assessment.type = 'CHECKPOINT' and exists (
    select 1 from public.assessments earlier
    where earlier.learning_path_id = v_assessment.learning_path_id and earlier.is_published
      and earlier.type = 'CHECKPOINT' and earlier.position < v_assessment.position
      and not exists (select 1 from public.assessment_results r where r.user_id = v_user and r.assessment_id = earlier.id and r.passed)
  ) then raise exception 'Prior checkpoint is required' using errcode = '42501'; end if;

  if v_assessment.type = 'FINAL' and exists (
    select 1 from public.assessments checkpoint
    where checkpoint.learning_path_id = v_assessment.learning_path_id and checkpoint.is_published
      and checkpoint.type = 'CHECKPOINT'
      and not exists (select 1 from public.assessment_results r where r.user_id = v_user and r.assessment_id = checkpoint.id and r.passed)
  ) then raise exception 'All checkpoints are required' using errcode = '42501'; end if;

  insert into public.assessment_sessions (user_id, assessment_id)
  values (v_user, p_assessment_id)
  on conflict (user_id, assessment_id) where status = 'IN_PROGRESS' do nothing
  returning id into v_session_id;
  if v_session_id is null then
    select id into v_session_id from public.assessment_sessions
    where user_id = v_user and assessment_id = p_assessment_id and status = 'IN_PROGRESS';
  end if;
  return v_session_id;
end;
$$;
revoke all on function public.start_assessment_session(uuid) from public, anon;
grant execute on function public.start_assessment_session(uuid) to authenticated;

create or replace function public.finalize_assessment_session(
  p_session_id uuid,
  p_score numeric,
  p_answers jsonb,
  p_safe_feedback jsonb
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_assessment_id uuid;
  v_user_id uuid;
  v_passed boolean;
  v_passing_score numeric;
begin
  if auth.role() <> 'service_role' or p_score < 0 or p_score > 100
     or p_answers is null or octet_length(p_answers::text) > 100000
     or p_safe_feedback is null or jsonb_typeof(p_safe_feedback) <> 'object' then
    raise exception 'Invalid final result' using errcode = '42501';
  end if;

  select s.assessment_id, s.user_id, a.passing_score into v_assessment_id, v_user_id, v_passing_score
  from public.assessment_sessions s join public.assessments a on a.id = s.assessment_id
  where s.id = p_session_id and s.status = 'IN_PROGRESS' for update of s;
  if not found then return false; end if;

  v_passed := p_score >= v_passing_score;
  update public.assessment_sessions set status = 'COMPLETED', score = p_score,
    answers = p_answers, safe_feedback = p_safe_feedback, completed_at = now()
  where id = p_session_id and status = 'IN_PROGRESS';
  if not found then return false; end if;

  insert into public.assessment_results (user_id, assessment_id, attempt_count, latest_score, highest_score, passed, completed_at)
  values (v_user_id, v_assessment_id, 1, p_score, p_score, v_passed, case when v_passed then now() else null end)
  on conflict (user_id, assessment_id) do update set
    attempt_count = public.assessment_results.attempt_count + 1,
    latest_score = excluded.latest_score,
    highest_score = greatest(public.assessment_results.highest_score, excluded.highest_score),
    passed = public.assessment_results.passed or excluded.passed,
    completed_at = case when excluded.passed then now() else public.assessment_results.completed_at end,
    updated_at = now();
  return true;
end;
$$;
revoke all on function public.finalize_assessment_session(uuid, numeric, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.finalize_assessment_session(uuid, numeric, jsonb, jsonb) to service_role;

create or replace function public.phase1_lesson_is_available(p_lesson_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.lessons target
    join public.chapters target_chapter on target_chapter.id = target.chapter_id
    join public.learning_paths path on path.id = target_chapter.learning_path_id
    where target.id = p_lesson_id and target.is_published and target_chapter.is_published and path.is_published
      and not exists (
        select 1 from public.lessons prior
        join public.chapters prior_chapter on prior_chapter.id = prior.chapter_id
        left join public.lesson_progress progress on progress.lesson_id = prior.id and progress.user_id = p_user_id
        where prior_chapter.learning_path_id = path.id and prior_chapter.is_published and prior_chapter.is_required
          and prior.is_published and prior.is_required
          and (prior_chapter.position, prior.position) < (target_chapter.position, target.position)
          and progress.status is distinct from 'COMPLETED'
      )
      and not exists (
        select 1 from public.assessments gate
        where gate.learning_path_id = path.id and gate.is_published and gate.type = 'CHECKPOINT'
          and gate.gate_after_chapter < target_chapter.position
          and not exists (select 1 from public.lesson_progress own_progress where own_progress.user_id = p_user_id and own_progress.lesson_id = target.id and own_progress.status = 'COMPLETED')
          and not exists (select 1 from public.assessment_results r where r.user_id = p_user_id and r.assessment_id = gate.id and r.passed)
      )
  );
$$;

insert into public.assessments (learning_path_id, slug, title, instructions, type, gate_after_chapter, position, is_published)
select path.id, seed.slug, seed.title, seed.instructions, seed.type::public.assessment_type,
       seed.gate_after_chapter, seed.position, true
from public.learning_paths path
cross join (values
  ('checkpoint-1', 'Checkpoint 1 — Logika Dasar', 'Kerjakan mandiri. Run lokal tersedia, tetapi AI Tutor dan petunjuk dinonaktifkan.', 'CHECKPOINT', 3, 1),
  ('checkpoint-2', 'Checkpoint 2 — Data dan Keputusan', 'Gunakan konsep variabel, operator, dan kondisi. AI Tutor dinonaktifkan selama assessment.', 'CHECKPOINT', 6, 2),
  ('checkpoint-3', 'Checkpoint 3 — Repetition dan Struktur Data', 'Tunjukkan pemahaman loop, fungsi, dan array. AI Tutor dinonaktifkan selama assessment.', 'CHECKPOINT', 9, 3),
  ('final-assessment', 'Final Assessment', 'Assessment akhir untuk menyelesaikan learning path. AI Tutor dan petunjuk dinonaktifkan.', 'FINAL', 10, 4)
) as seed(slug, title, instructions, type, gate_after_chapter, position)
where path.slug = 'programming-logic-fundamentals'
on conflict (learning_path_id, slug) do nothing;

insert into public.assessment_items (assessment_id, type, title, topic, prompt, starter_code, public_config, answer_config, entry_function, weight, position)
select a.id, item.type::public.exercise_type, item.title, item.topic, item.prompt,
       replace(item.starter_code, chr(92) || 'n', chr(10)),
       item.public_config::jsonb, item.answer_config::jsonb, item.entry_function, item.weight, item.position
from public.assessments a
cross join (values
  ('checkpoint-1', 1, 'PREDICT_OUTPUT', 'Nilai berubah', 'Variables', 'Apa yang dicetak setelah operasi ini?', 'let total = 2;\ntotal = total + 4;\nconsole.log(total);', '{}', '{"output":"6"}', null, 1),
  ('checkpoint-1', 2, 'PSEUDOCODE', 'Rancang langkah', 'Algorithms', 'Pilih urutan yang tepat untuk menjumlahkan dua nilai dan menampilkan hasilnya.', null, '{"mode":"choice","options":[{"id":"a","text":"Tampilkan, baca, jumlahkan"},{"id":"b","text":"Baca, jumlahkan, tampilkan"},{"id":"c","text":"Jumlahkan, tampilkan, baca"}]}', '{"choiceId":"b"}', null, 1),
  ('checkpoint-1', 3, 'CODE_COMPLETION', 'Buat fungsi sapaan', 'Functions', 'Lengkapi fungsi greet agar mengembalikan sapaan.', 'function greet(name) {\n  // return sapaan\n}', '{}', '{}', 'greet', 2),
  ('checkpoint-2', 1, 'DEBUGGING', 'Perbaiki kategori nilai', 'Conditional logic', 'Perbaiki fungsi agar nilai 75 atau lebih menghasilkan "Pass".', 'function classifyScore(score) {\n  if (score > 75) return "Pass";\n  return "Retry";\n}', '{}', '{}', 'classifyScore', 2),
  ('checkpoint-2', 2, 'PREDICT_OUTPUT', 'Evaluasi ekspresi', 'Operators', 'Apa yang dicetak oleh ekspresi berikut?', 'const result = 2 + 3 * 4;\nconsole.log(result);', '{}', '{"output":"14"}', null, 1),
  ('checkpoint-2', 3, 'FLOWCHART', 'Pilih cabang', 'Flowchart', 'Sebuah nilai lulus bila minimal 75. Pilih kondisi decision yang sesuai.', null, '{"mode":"choice","options":[{"id":"a","text":"score > 75"},{"id":"b","text":"score >= 75"},{"id":"c","text":"score === 75"}]}', '{"choiceId":"b"}', null, 1),
  ('checkpoint-3', 1, 'PROBLEM_SOLVING', 'Jumlahkan isi array', 'Arrays and functions', 'Tulis fungsi sumArray yang mengembalikan jumlah seluruh angka dalam array.', 'function sumArray(values) {\n  // return total\n}', '{}', '{}', 'sumArray', 3),
  ('checkpoint-3', 2, 'PREDICT_OUTPUT', 'Telusuri loop', 'Loops', 'Tulis output dari loop berikut.', 'let total = 0;\nfor (let i = 1; i <= 3; i++) total += i;\nconsole.log(total);', '{}', '{"output":"6"}', null, 1),
  ('checkpoint-3', 3, 'PSEUDOCODE', 'Urutkan pencarian nilai', 'Algorithm design', 'Atur langkah untuk menemukan nilai terbesar di array.', null, '{"mode":"order","blocks":[{"id":"compare","text":"Bandingkan nilai berikutnya"},{"id":"init","text":"Anggap nilai pertama paling besar"},{"id":"update","text":"Perbarui nilai terbesar bila perlu"},{"id":"return","text":"Kembalikan nilai terbesar"}]}', '{"order":["init","compare","update","return"]}', null, 1),
  ('final-assessment', 1, 'PROBLEM_SOLVING', 'Jumlahkan angka genap', 'Loops, conditionals and functions', 'Tulis fungsi sumEven yang menjumlahkan hanya angka genap dalam array.', 'function sumEven(values) {\n  // return jumlah angka genap\n}', '{}', '{}', 'sumEven', 4),
  ('final-assessment', 2, 'DEBUGGING', 'Perbaiki pencarian maksimum', 'Arrays and debugging', 'Perbaiki fungsi agar nilai negatif juga diproses dengan benar.', 'function findMax(values) {\n  let max = 0;\n  for (const value of values) {\n    if (value > max) max = value;\n  }\n  return max;\n}', '{}', '{}', 'findMax', 3),
  ('final-assessment', 3, 'FLOWCHART', 'Pilih urutan keputusan', 'Problem solving', 'Pilih urutan logika yang tepat untuk memeriksa apakah angka positif, negatif, atau nol.', null, '{"mode":"choice","options":[{"id":"a","text":"Periksa nol, lalu positif, selain itu negatif"},{"id":"b","text":"Selalu cetak positif"},{"id":"c","text":"Kurangi angka sampai nol"}]}', '{"choiceId":"a"}', null, 1)
) as item(assessment_slug, position, type, title, topic, prompt, starter_code, public_config, answer_config, entry_function, weight)
where a.slug = item.assessment_slug
on conflict (assessment_id, position) do nothing;

insert into public.assessment_test_cases (assessment_item_id, args, stdin, expected_output, is_hidden, weight, position)
select item.id, test.args::jsonb, test.stdin, test.expected_output, test.is_hidden, test.weight, test.position
from public.assessment_items item
join public.assessments a on a.id = item.assessment_id
cross join (values
  ('checkpoint-1', 'Buat fungsi sapaan', 1, '["Ayu"]', '', 'Halo, Ayu!', false, 1),
  ('checkpoint-1', 'Buat fungsi sapaan', 2, '["ThinkCode"]', '', 'Halo, ThinkCode!', true, 1),
  ('checkpoint-2', 'Perbaiki kategori nilai', 1, '[75]', '', 'Pass', false, 1),
  ('checkpoint-2', 'Perbaiki kategori nilai', 2, '[74]', '', 'Retry', false, 1),
  ('checkpoint-2', 'Perbaiki kategori nilai', 3, '[100]', '', 'Pass', true, 1),
  ('checkpoint-3', 'Jumlahkan isi array', 1, '[[1,2,3]]', '', '6', false, 1),
  ('checkpoint-3', 'Jumlahkan isi array', 2, '[[]]', '', '0', true, 1),
  ('checkpoint-3', 'Jumlahkan isi array', 3, '[[-3,5,8]]', '', '10', true, 1),
  ('final-assessment', 'Jumlahkan angka genap', 1, '[[1,2,3,4]]', '', '6', false, 1),
  ('final-assessment', 'Jumlahkan angka genap', 2, '[[-8,-3,2]]', '', '-6', true, 1),
  ('final-assessment', 'Jumlahkan angka genap', 3, '[[]]', '', '0', true, 1),
  ('final-assessment', 'Perbaiki pencarian maksimum', 1, '[[-5,-2,-9]]', '', '-2', false, 1),
  ('final-assessment', 'Perbaiki pencarian maksimum', 2, '[[3,8,4]]', '', '8', true, 1)
) as test(assessment_slug, item_title, position, args, stdin, expected_output, is_hidden, weight)
where test.assessment_slug = a.slug and test.item_title = item.title
on conflict (assessment_item_id, position) do nothing;
