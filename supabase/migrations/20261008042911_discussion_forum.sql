create table public.forum_topics (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check (char_length(btrim(title)) between 6 and 140),
 body text not null check (char_length(btrim(body)) between 10 and 6000),
 category text not null default 'DATABASE' check (category in ('DATABASE','GENERAL')),
 is_locked boolean not null default false,
 is_hidden boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.forum_replies (
 id uuid primary key default gen_random_uuid(),
 topic_id uuid not null references public.forum_topics(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check (char_length(btrim(body)) between 2 and 4000),
 is_hidden boolean not null default false,
 created_at timestamptz not null default now()
);
create index forum_topics_feed_idx on public.forum_topics(created_at desc,id desc) where not is_hidden;
create index forum_topics_author_quota_idx on public.forum_topics(author_id,created_at desc);
create index forum_replies_topic_order_idx on public.forum_replies(topic_id,created_at,id);
create index forum_replies_author_quota_idx on public.forum_replies(author_id,created_at desc);
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;
revoke all on public.forum_topics,public.forum_replies from public,anon,authenticated;
grant select on public.forum_topics,public.forum_replies to authenticated;
grant all on public.forum_topics,public.forum_replies to service_role;
create policy forum_topic_read on public.forum_topics for select to authenticated
 using (not public.current_user_has_active_assessment() and (not is_hidden or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='ADMIN')));
create policy forum_reply_read on public.forum_replies for select to authenticated
 using (not public.current_user_has_active_assessment() and (not is_hidden or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='ADMIN'))
 and exists(select 1 from public.forum_topics t where t.id=topic_id));

-- Shared guard uses the same advisory lock as assessment start to serialize access changes.
create function public.forum_check_writer(p_user_id uuid) returns void language plpgsql security invoker set search_path='' as $$
begin
 if (select auth.jwt()->>'role') is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 if p_user_id is null or not exists(select 1 from public.profiles where id=p_user_id) then raise exception 'Forbidden' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 if exists(select 1 from public.assessment_sessions where user_id=p_user_id and status='IN_PROGRESS') then raise exception 'Assessment active' using errcode='42501'; end if;
end $$;
create function public.forum_create_topic(p_user_id uuid,p_title text,p_body text,p_category text) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid;
begin
 perform public.forum_check_writer(p_user_id);
 if (select count(*) from public.forum_topics where author_id=p_user_id and created_at>now()-interval '1 hour')>=5 then raise exception 'Forum quota exceeded' using errcode='P0001'; end if;
 insert into public.forum_topics(author_id,title,body,category) values(p_user_id,btrim(p_title),btrim(p_body),p_category) returning id into v_id;
 return v_id;
end $$;
create function public.forum_create_reply(p_user_id uuid,p_topic_id uuid,p_body text) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_topic public.forum_topics%rowtype;v_id uuid;
begin
 perform public.forum_check_writer(p_user_id);
 select * into v_topic from public.forum_topics where id=p_topic_id for update;
 if not found or v_topic.is_hidden or v_topic.is_locked then raise exception 'Topic unavailable' using errcode='42501'; end if;
 if (select count(*) from public.forum_replies where author_id=p_user_id and created_at>now()-interval '1 hour')>=30 then raise exception 'Forum quota exceeded' using errcode='P0001'; end if;
 insert into public.forum_replies(author_id,topic_id,body) values(p_user_id,p_topic_id,btrim(p_body)) returning id into v_id;
 return v_id;
end $$;
create function public.forum_moderate(p_user_id uuid,p_target_id uuid,p_action text,p_value boolean) returns void language plpgsql security invoker set search_path='' as $$
begin
 perform public.forum_check_writer(p_user_id);
 if not exists(select 1 from public.profiles where id=p_user_id and role='ADMIN') then raise exception 'Forbidden' using errcode='42501'; end if;
 if p_action='lock_topic' then update public.forum_topics set is_locked=p_value where id=p_target_id;
 elsif p_action='hide_topic' then update public.forum_topics set is_hidden=p_value where id=p_target_id;
 elsif p_action='hide_reply' then update public.forum_replies set is_hidden=p_value where id=p_target_id;
 else raise exception 'Invalid moderation action' using errcode='22023'; end if;
 if not found then raise exception 'Content unavailable' using errcode='22023'; end if;
end $$;
revoke all on function public.forum_check_writer(uuid),public.forum_create_topic(uuid,text,text,text),public.forum_create_reply(uuid,uuid,text),public.forum_moderate(uuid,uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.forum_check_writer(uuid),public.forum_create_topic(uuid,text,text,text),public.forum_create_reply(uuid,uuid,text),public.forum_moderate(uuid,uuid,text,boolean) to service_role;
notify pgrst,'reload schema';
