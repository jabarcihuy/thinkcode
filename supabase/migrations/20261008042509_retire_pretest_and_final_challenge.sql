-- Retire the diagnostic surface, preserving attempts/results and sequential core gates.
SET LOCAL lock_timeout='5s';
LOCK TABLE public.assessment_sessions IN SHARE ROW EXCLUSIVE MODE;
UPDATE public.assessment_sessions s SET status='ABANDONED' FROM public.assessments a WHERE a.id=s.assessment_id AND a.type='PRETEST' AND s.status='IN_PROGRESS';
UPDATE public.assessments SET is_published=false WHERE type='PRETEST';
ALTER TABLE public.assessments ADD CONSTRAINT assessments_pretest_retired CHECK(type<>'PRETEST' OR NOT is_published);
UPDATE public.assessments a SET title='Tantangan Akhir Basis Data' FROM public.learning_paths p WHERE p.id=a.learning_path_id AND p.slug='database-fundamentals' AND a.type='FINAL' AND a.is_published;
create or replace function public.phase1_lesson_is_available(p_lesson_id uuid,p_user_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.lessons t join public.chapters c on c.id=t.chapter_id join public.learning_paths p on p.id=c.learning_path_id
 where t.id=p_lesson_id and t.is_published and c.is_published and p.is_published and (
 exists(select 1 from public.lesson_progress lp where lp.user_id=p_user_id and lp.lesson_id=t.id and lp.status='COMPLETED') or (
 not exists(
 select 1 from public.lessons prior join public.chapters pc on pc.id=prior.chapter_id
 left join public.lesson_progress lp on lp.lesson_id=prior.id and lp.user_id=p_user_id
 where pc.learning_path_id=p.id and pc.is_published and pc.is_required and prior.is_published and prior.is_required
 and (pc.position,prior.position)<(c.position,t.position) and lp.status is distinct from 'COMPLETED'))));
$$;

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
 if v_test.type='PRETEST' then raise exception 'Assessment retired' using errcode='42501'; end if;
  if exists(select 1 from public.lessons l join public.chapters c on c.id=l.chapter_id
   where c.learning_path_id=v_test.learning_path_id and c.is_published and c.is_required and l.is_published and l.is_required
    and c.position<=v_test.gate_after_chapter
    and not exists(select 1 from public.lesson_progress lp where lp.user_id=v_user and lp.lesson_id=l.id and lp.status='COMPLETED')) then
   raise exception 'Required material incomplete' using errcode='42501'; end if;
 if not exists(select 1 from public.assessment_items where assessment_id=v_test.id) then raise exception 'No assessment items'; end if;
 insert into public.assessment_sessions(user_id,assessment_id) values(v_user,p_assessment_id) returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.start_assessment_session(uuid) from public,anon;
grant execute on function public.start_assessment_session(uuid) to authenticated;

-- Legacy server-only compatibility predicate; no diagnostic is required.
CREATE OR REPLACE FUNCTION public.course_has_baseline(p_path_id uuid,p_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT p_user_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.learning_paths WHERE id=p_path_id AND is_published); $$;
REVOKE ALL ON FUNCTION public.course_has_baseline(uuid,uuid) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.course_has_baseline(uuid,uuid) TO service_role;
NOTIFY pgrst,'reload schema';
