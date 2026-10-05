-- Preserve historical completion; new completion requires reading and a trusted core check.
begin;
alter table public.lesson_progress add column read_at timestamptz;
update public.lesson_progress set read_at=coalesce(completed_at,started_at,now()) where status='COMPLETED';

create or replace function public.course_has_baseline(p_path_id uuid,p_user_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.assessments a join public.assessment_sessions s on s.assessment_id=a.id
 where a.learning_path_id=p_path_id and a.type='PRETEST' and a.is_published and s.user_id=p_user_id and s.status='COMPLETED');
$$;
revoke all on function public.course_has_baseline(uuid,uuid) from public,anon,authenticated;
grant execute on function public.course_has_baseline(uuid,uuid) to service_role;

create or replace function public.phase1_lesson_is_available(p_lesson_id uuid,p_user_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.lessons t join public.chapters c on c.id=t.chapter_id join public.learning_paths p on p.id=c.learning_path_id
 where t.id=p_lesson_id and t.is_published and c.is_published and p.is_published and (
 exists(select 1 from public.lesson_progress lp where lp.user_id=p_user_id and lp.lesson_id=t.id and lp.status='COMPLETED') or (
 public.course_has_baseline(p.id,p_user_id) and not exists(
 select 1 from public.lessons prior join public.chapters pc on pc.id=prior.chapter_id
 left join public.lesson_progress lp on lp.lesson_id=prior.id and lp.user_id=p_user_id
 where pc.learning_path_id=p.id and pc.is_published and pc.is_required and prior.is_published and prior.is_required
 and (pc.position,prior.position)<(c.position,t.position) and lp.status is distinct from 'COMPLETED'))));
$$;

-- Exactly one core per active material; the Relasi model replaces its former core.
update public.exercises e set is_required=(e.position=3 and l.slug<>'key-dan-hubungan-antar-tabel')
from public.lessons l join public.chapters c on c.id=l.chapter_id join public.learning_paths p on p.id=c.learning_path_id
where e.lesson_id=l.id and p.slug='database-fundamentals' and l.is_published and e.is_published;
insert into public.exercises(lesson_id,type,title,prompt,config,position,is_required,is_published)
select id,'FLOWCHART','Model Peminjaman Buku','Susun model peminjaman buku. Buat members (member_id integer PK, name text), books (book_id integer PK, title text), dan loans (loan_id integer PK, member_id integer, book_id integer). Hubungkan setiap peminjaman ke anggota dan buku melalui foreign key. Gunakan tepat tiga tabel.',
'{"public":{"mode":"schema","subtopic":"Model peminjaman"},"answer":{"model":{"tables":{"members":{"member_id":{"type":"integer","primary":true},"name":{"type":"text","primary":false}},"books":{"book_id":{"type":"integer","primary":true},"title":{"type":"text","primary":false}},"loans":{"loan_id":{"type":"integer","primary":true},"member_id":{"type":"integer","primary":false},"book_id":{"type":"integer","primary":false}}},"relations":[["members","member_id","loans","member_id"],["books","book_id","loans","book_id"]]}},"feedback":{"correct":"Model tepat: setiap peminjaman menunjuk anggota dan buku yang terpisah.","retry":"Periksa nama dan tipe kolom, primary key setiap tabel, serta dua relasi menuju loans."}}'::jsonb,
5,true,true from public.lessons where slug='key-dan-hubungan-antar-tabel' and is_published;

create or replace function public.acknowledge_material_read(p_lesson_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
 if not public.phase1_lesson_is_available(p_lesson_id,v_user) or exists(select 1 from public.assessment_sessions where user_id=v_user and status='IN_PROGRESS') then
 raise exception 'Material unavailable' using errcode='42501'; end if;
 insert into public.lesson_progress(user_id,lesson_id,status,read_at) values(v_user,p_lesson_id,'IN_PROGRESS',now())
 on conflict(user_id,lesson_id) do update set read_at=coalesce(public.lesson_progress.read_at,now());
end;
$$;
revoke all on function public.acknowledge_material_read(uuid) from public,anon;
grant execute on function public.acknowledge_material_read(uuid) to authenticated;

create or replace function public.phase3_record_attempt(p_user_id uuid,p_exercise_id uuid,p_source_code text,
 p_answer jsonb,p_score numeric,p_passed boolean,p_feedback jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_lesson uuid; v_complete boolean;
begin
 if (select auth.jwt()->>'role') is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 if p_score is null or p_score<0 or p_score>100 or p_feedback is null or length(coalesce(p_source_code,''))>16000 then raise exception 'Invalid attempt'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 select lesson_id into v_lesson from public.exercises where id=p_exercise_id and is_published;
 if v_lesson is null or not public.phase1_lesson_is_available(v_lesson,p_user_id)
 or not exists(select 1 from public.lesson_progress where user_id=p_user_id and lesson_id=v_lesson and read_at is not null)
 or exists(select 1 from public.assessment_sessions where user_id=p_user_id and status='IN_PROGRESS') then raise exception 'Exercise unavailable' using errcode='42501'; end if;
 insert into public.exercise_attempts(user_id,exercise_id,source_code,answer,score,passed,feedback)
 values(p_user_id,p_exercise_id,p_source_code,p_answer,p_score,p_passed,p_feedback);
 -- Only deterministic types can provide completion evidence; browser coding results cannot.
 v_complete:=exists(select 1 from public.exercises where lesson_id=v_lesson and is_required and is_published)
 and not exists(select 1 from public.exercises e where e.lesson_id=v_lesson and e.is_required and e.is_published
 and (e.type not in ('PREDICT_OUTPUT','PSEUDOCODE','FLOWCHART') or not exists(select 1 from public.exercise_attempts a where a.user_id=p_user_id and a.exercise_id=e.id and a.passed)));
 if v_complete then update public.lesson_progress set status='COMPLETED',completed_at=coalesce(completed_at,now()) where user_id=p_user_id and lesson_id=v_lesson; end if;
 return v_complete;
end;
$$;
revoke all on function public.phase3_record_attempt(uuid,uuid,text,jsonb,numeric,boolean,jsonb) from public,anon,authenticated;
grant execute on function public.phase3_record_attempt(uuid,uuid,text,jsonb,numeric,boolean,jsonb) to service_role;
create or replace function public.start_assessment_session(p_assessment_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_test public.assessments%rowtype; v_id uuid; v_active_assessment uuid;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
 -- Serialize starts and reading acknowledgement for the same learner.
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
 select a.* into v_test from public.assessments a join public.learning_paths p on p.id=a.learning_path_id
 where a.id=p_assessment_id and a.is_published and p.is_published;
 if not found then raise exception 'Assessment unavailable' using errcode='42501'; end if;
 select id,assessment_id into v_id,v_active_assessment from public.assessment_sessions where user_id=v_user and status='IN_PROGRESS' order by started_at limit 1;
 if v_id is not null then
  if v_active_assessment=p_assessment_id then return v_id; end if;
  raise exception 'Finish the active assessment first' using errcode='42501';
 end if;
 if v_test.type='PRETEST' then
  if exists(select 1 from public.assessment_sessions where user_id=v_user and assessment_id=v_test.id and status='COMPLETED') then
   raise exception 'Baseline already recorded' using errcode='42501'; end if;
 else
  if not public.course_has_baseline(v_test.learning_path_id,v_user) then raise exception 'Pre-test required' using errcode='42501'; end if;
  if exists(select 1 from public.lessons l join public.chapters c on c.id=l.chapter_id
   where c.learning_path_id=v_test.learning_path_id and c.is_published and c.is_required and l.is_published and l.is_required
    and c.position<=v_test.gate_after_chapter
    and not exists(select 1 from public.lesson_progress lp where lp.user_id=v_user and lp.lesson_id=l.id and lp.status='COMPLETED')) then
   raise exception 'Required material incomplete' using errcode='42501'; end if;
 end if;
 if not exists(select 1 from public.assessment_items where assessment_id=v_test.id) then raise exception 'No assessment items'; end if;
 insert into public.assessment_sessions(user_id,assessment_id) values(v_user,p_assessment_id) returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.start_assessment_session(uuid) from public,anon;
grant execute on function public.start_assessment_session(uuid) to authenticated;


notify pgrst,'reload schema';
commit;
