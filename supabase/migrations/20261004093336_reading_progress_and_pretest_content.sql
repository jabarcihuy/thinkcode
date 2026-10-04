-- Simplify the active database course while retaining all historical records.
begin;
update public.assessments set is_published = false
where learning_path_id = (select id from public.learning_paths where slug = 'database-fundamentals');
update public.exercises set is_required = false
where lesson_id in (select l.id from public.lessons l join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id where p.slug = 'database-fundamentals');

insert into public.assessments (learning_path_id, slug, title, instructions, type, gate_after_chapter, passing_score, position, course_weight_percent, is_published)
select p.id, s.slug, s.title, s.instructions, s.type::public.assessment_type, 3, s.passing_score, s.position, s.weight, true
from public.learning_paths p cross join (values
 ('pre-test-basis-data', 'Pre-test Basis Data', 'Jawab sesuai pemahamanmu sekarang. Pilih Belum tahu jika belum mengenal konsepnya. Ini bukan syarat kelulusan; satu hasil awal disimpan.', 'PRETEST', 0, 5, 0),
 ('post-test-basis-data', 'Post-test Basis Data', 'Kerjakan mandiri setelah membaca semua materi. Nilai diperiksa di server; AI dan petunjuk tidak tersedia selama tes.', 'FINAL', 75, 6, 100)
) s(slug,title,instructions,type,passing_score,position,weight) where p.slug = 'database-fundamentals'
on conflict (learning_path_id, slug) do update set title=excluded.title, instructions=excluded.instructions,
 type=excluded.type, passing_score=excluded.passing_score, course_weight_percent=excluded.course_weight_percent, is_published=true;

-- Completed rows remain reviewable, including learners who earned progress before this change.
create or replace function public.phase1_lesson_is_available(p_lesson_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (
  select 1 from public.lessons t join public.chapters c on c.id=t.chapter_id
  join public.learning_paths p on p.id=c.learning_path_id
  where t.id=p_lesson_id and t.is_published and c.is_published and p.is_published
  and (exists (select 1 from public.lesson_progress lp where lp.user_id=p_user_id and lp.lesson_id=t.id and lp.status='COMPLETED')
   or not exists (
    select 1 from public.lessons prior join public.chapters pc on pc.id=prior.chapter_id
    left join public.lesson_progress lp on lp.lesson_id=prior.id and lp.user_id=p_user_id
    where pc.learning_path_id=p.id and pc.is_published and pc.is_required and prior.is_published and prior.is_required
     and (pc.position,prior.position)<(c.position,t.position) and lp.status is distinct from 'COMPLETED'
   ))
 );
$$;

create or replace function public.acknowledge_material_read(p_lesson_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
 if not public.phase1_lesson_is_available(p_lesson_id,v_user)
  or exists (select 1 from public.assessment_sessions where user_id=v_user and status='IN_PROGRESS') then
  raise exception 'Material unavailable' using errcode='42501';
 end if;
 insert into public.lesson_progress(user_id,lesson_id,status,completed_at)
 values(v_user,p_lesson_id,'COMPLETED',now())
 on conflict(user_id,lesson_id) do update set status='COMPLETED',
 completed_at=coalesce(public.lesson_progress.completed_at,now());
end;
$$;
revoke all on function public.acknowledge_material_read(uuid) from public,anon;
grant execute on function public.acknowledge_material_read(uuid) to authenticated;

-- Formative checks retain attempts but no longer write reading progress.
create or replace function public.phase3_record_attempt(p_user_id uuid,p_exercise_id uuid,p_source_code text,
 p_answer jsonb,p_score numeric,p_passed boolean,p_feedback jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_lesson uuid;
begin
 if (select auth.jwt()->>'role') is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 if p_score is null or p_score<0 or p_score>100 or p_feedback is null
  or length(coalesce(p_source_code,''))>16000 then raise exception 'Invalid attempt'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 select lesson_id into v_lesson from public.exercises where id=p_exercise_id and is_published;
 if v_lesson is null or not public.phase1_lesson_is_available(v_lesson,p_user_id)
  or exists(select 1 from public.assessment_sessions where user_id=p_user_id and status='IN_PROGRESS') then
  raise exception 'Exercise unavailable' using errcode='42501'; end if;
 insert into public.exercise_attempts(user_id,exercise_id,source_code,answer,score,passed,feedback)
 values(p_user_id,p_exercise_id,p_source_code,p_answer,p_score,p_passed,p_feedback);
 return false;
end;
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
 if v_test.type='PRETEST' then
  if exists(select 1 from public.assessment_sessions where user_id=v_user and assessment_id=v_test.id and status='COMPLETED') then
   raise exception 'Baseline already recorded' using errcode='42501'; end if;
 else
  if exists(select 1 from public.lessons l join public.chapters c on c.id=l.chapter_id
   where c.learning_path_id=v_test.learning_path_id and c.is_published and c.is_required and l.is_published and l.is_required
    and c.position<=v_test.gate_after_chapter
    and not exists(select 1 from public.lesson_progress lp where lp.user_id=v_user and lp.lesson_id=l.id and lp.status='COMPLETED')) then
   raise exception 'Required reading incomplete' using errcode='42501'; end if;
 end if;
 if not exists(select 1 from public.assessment_items where assessment_id=v_test.id) then raise exception 'No assessment items'; end if;
 insert into public.assessment_sessions(user_id,assessment_id) values(v_user,p_assessment_id) returning id into v_id;
 return v_id;
end;
$$;
revoke all on function public.start_assessment_session(uuid) from public,anon;
grant execute on function public.start_assessment_session(uuid) to authenticated;

-- Defense in depth: diagnostic results never count as a pass or course score.
create or replace function public.finalize_assessment_session(p_session_id uuid,p_score numeric,p_answers jsonb,p_safe_feedback jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_assessment uuid; v_user uuid; v_passed boolean; v_cutoff numeric; v_type public.assessment_type;
begin
 if (select auth.jwt()->>'role') is distinct from 'service_role' or p_score is null or p_score<0 or p_score>100
  or p_answers is null or octet_length(p_answers::text)>100000 or p_safe_feedback is null or jsonb_typeof(p_safe_feedback)<>'object' then
  raise exception 'Invalid final result' using errcode='42501'; end if;
 select s.assessment_id,s.user_id,a.passing_score,a.type into v_assessment,v_user,v_cutoff,v_type
 from public.assessment_sessions s join public.assessments a on a.id=s.assessment_id
 where s.id=p_session_id and s.status='IN_PROGRESS' for update of s;
 if not found then return false; end if;
 v_passed := v_type<>'PRETEST' and p_score>=v_cutoff;
 update public.assessment_sessions set status='COMPLETED',score=p_score,answers=p_answers,safe_feedback=p_safe_feedback,completed_at=now() where id=p_session_id;
 insert into public.assessment_results(user_id,assessment_id,attempt_count,latest_score,highest_score,passed,completed_at)
 values(v_user,v_assessment,1,p_score,p_score,v_passed,now())
 on conflict(user_id,assessment_id) do update set attempt_count=public.assessment_results.attempt_count+1,
 latest_score=excluded.latest_score,highest_score=greatest(public.assessment_results.highest_score,excluded.highest_score),
 passed=public.assessment_results.passed or excluded.passed,completed_at=now(),updated_at=now();
 return true;
end;
$$;
revoke all on function public.finalize_assessment_session(uuid,numeric,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.finalize_assessment_session(uuid,numeric,jsonb,jsonb) to service_role;

-- Existing RLS/grants on assessment content, sessions and results are unchanged.
-- Prompts are loaded only by the allowlisted authenticated server repository.
-- Ten parallel diagnostic/post questions: Relasi 3 / Read 4 / Write 3.
insert into public.assessment_items(assessment_id,type,title,topic,prompt,public_config,answer_config,weight,position)
select a.id,'FLOWCHART'::public.exercise_type,s.title,s.topic,s.prompt,s.public_config::jsonb,s.answer_config::jsonb,1,s.position::integer
from public.assessments a join public.learning_paths p on p.id=a.learning_path_id
join (values
('pre-test-basis-data','1','Tabel dan kolom','Relasi','Tabel books memiliki kolom book_id, title, stock. Manakah nama kolom?','{"mode": "choice", "options": [{"id": "a", "text": "title"}, {"id": "b", "text": "Buku Basis Data"}, {"id": "c", "text": "5"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "a"}'),
('pre-test-basis-data','2','Identitas record','Relasi','Dua mahasiswa bisa memiliki nama yang sama. Kolom mana paling tepat sebagai primary key students?','{"mode": "choice", "options": [{"id": "a", "text": "name"}, {"id": "b", "text": "student_id yang unik dan tidak kosong"}, {"id": "c", "text": "cohort yang sama untuk satu angkatan"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "b"}'),
('pre-test-basis-data','3','Hubungan tabel','Relasi','Setiap books.author_id menunjuk satu authors.author_id. Apa fungsi foreign key itu?','{"mode": "choice", "options": [{"id": "a", "text": "Mengurutkan judul otomatis"}, {"id": "b", "text": "Menghitung stok buku"}, {"id": "c", "text": "Menghubungkan buku dengan penulis yang ada"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "c"}'),
('pre-test-basis-data','4','Memilih sumber dan kolom','Read','Ingin menampilkan hanya title dari tabel books. Query mana yang sesuai?','{"mode": "choice", "options": [{"id": "a", "text": "SELECT title FROM books;"}, {"id": "b", "text": "SELECT books FROM title;"}, {"id": "c", "text": "DELETE FROM books;"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "a"}'),
('pre-test-basis-data','5','Menyaring record','Read','Stok buku A = 0, B = 2, C = 5. WHERE stock > 2 memilih buku mana?','{"mode": "choice", "options": [{"id": "a", "text": "A dan B"}, {"id": "b", "text": "C"}, {"id": "c", "text": "B dan C"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "b"}'),
('pre-test-basis-data','6','Mengikuti relasi','Read','books.author_id merujuk authors.author_id. Pasangan JOIN yang tepat adalah?','{"mode": "choice", "options": [{"id": "a", "text": "books.title = authors.name"}, {"id": "b", "text": "books.book_id = authors.author_id"}, {"id": "c", "text": "books.author_id = authors.author_id"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "c"}'),
('pre-test-basis-data','7','Menghitung record','Read','Tabel books berisi tiga record. Apa hasil SELECT COUNT(*) FROM books;?','{"mode": "choice", "options": [{"id": "a", "text": "3"}, {"id": "b", "text": "Jumlah seluruh stock"}, {"id": "c", "text": "Satu judul buku"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "a"}'),
('pre-test-basis-data','8','Menambah data','Write','Perintah untuk menambahkan satu buku baru ke tabel books adalah?','{"mode": "choice", "options": [{"id": "a", "text": "UPDATE"}, {"id": "b", "text": "INSERT INTO"}, {"id": "c", "text": "SELECT"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "b"}'),
('pre-test-basis-data','9','Membatasi perubahan','Write','Ingin mengubah stock hanya buku book_id = 7. Query mana paling tepat?','{"mode": "choice", "options": [{"id": "a", "text": "UPDATE books SET stock = 4;"}, {"id": "b", "text": "SELECT stock FROM books;"}, {"id": "c", "text": "UPDATE books SET stock = 4 WHERE book_id = 7;"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "c"}'),
('pre-test-basis-data','10','Menghapus dengan aman','Write','Sebelum DELETE satu record, langkah yang paling aman adalah?','{"mode": "choice", "options": [{"id": "a", "text": "Periksa target dengan SELECT dan kondisi WHERE yang sama"}, {"id": "b", "text": "Hapus seluruh tabel dulu"}, {"id": "c", "text": "Matikan foreign key agar semua data dapat dihapus"}, {"id": "unknown", "text": "Belum tahu"}]}','{"choiceId": "a"}'),
('post-test-basis-data','1','Membedakan struktur dan isi','Relasi','Tabel products(product_id, name, price) berisi (9, "Pensil", 3000). Manakah nama kolom?','{"mode": "choice", "options": [{"id": "a", "text": "Pensil"}, {"id": "b", "text": "price"}, {"id": "c", "text": "3000"}]}','{"choiceId": "b"}'),
('post-test-basis-data','2','Primary key','Relasi','Pada orders, dua pesanan dapat memiliki tanggal yang sama. Kandidat primary key yang tepat adalah?','{"mode": "choice", "options": [{"id": "a", "text": "Tanggal pesanan"}, {"id": "b", "text": "Nama pelanggan"}, {"id": "c", "text": "order_id yang unik dan tidak kosong"}]}','{"choiceId": "c"}'),
('post-test-basis-data','3','Foreign key','Relasi','orders.customer_id merujuk customers.customer_id. Apa hubungan yang dinyatakan?','{"mode": "choice", "options": [{"id": "a", "text": "Setiap pesanan terhubung dengan pelanggan yang ada"}, {"id": "b", "text": "Pesanan harus diurutkan dari harga tertinggi"}, {"id": "c", "text": "Jumlah pesanan selalu sama dengan jumlah pelanggan"}]}','{"choiceId": "a"}'),
('post-test-basis-data','4','SELECT dan FROM','Read','Ingin menampilkan hanya name dan price dari products. Pilih query yang sesuai.','{"mode": "choice", "options": [{"id": "a", "text": "SELECT products FROM name, price;"}, {"id": "b", "text": "SELECT name, price FROM products;"}, {"id": "c", "text": "UPDATE products SET price = 0;"}]}','{"choiceId": "b"}'),
('post-test-basis-data','5','Kondisi batas','Read','Harga produk P = 3000, Q = 5000, R = 7000. WHERE price >= 5000 memilih?','{"mode": "choice", "options": [{"id": "a", "text": "Hanya R"}, {"id": "b", "text": "P dan Q"}, {"id": "c", "text": "Q dan R"}]}','{"choiceId": "c"}'),
('post-test-basis-data','6','Pasangan JOIN','Read','Untuk menampilkan pesanan bersama nama pelanggan, pasangan JOIN yang tepat adalah?','{"mode": "choice", "options": [{"id": "a", "text": "orders.customer_id = customers.customer_id"}, {"id": "b", "text": "orders.order_id = customers.customer_id"}, {"id": "c", "text": "orders.status = customers.name"}]}','{"choiceId": "a"}'),
('post-test-basis-data','7','COUNT','Read','Tabel orders berisi empat record, masing-masing satu pesanan. SELECT COUNT(*) FROM orders; menghasilkan?','{"mode": "choice", "options": [{"id": "a", "text": "Jumlah seluruh harga produk"}, {"id": "b", "text": "4"}, {"id": "c", "text": "Nama pelanggan pertama"}]}','{"choiceId": "b"}'),
('post-test-basis-data','8','INSERT','Write','Ingin menambahkan satu pelanggan baru tanpa mengubah record lama. Pilih perintahnya.','{"mode": "choice", "options": [{"id": "a", "text": "DELETE FROM customers;"}, {"id": "b", "text": "UPDATE customers SET name = ''Nisa'';"}, {"id": "c", "text": "INSERT INTO customers (customer_id, name, city) VALUES (8, ''Nisa'', ''Solo'');"}]}','{"choiceId": "c"}'),
('post-test-basis-data','9','UPDATE terarah','Write','Ingin mengganti status hanya order_id = 12 menjadi selesai. Pilih query aman.','{"mode": "choice", "options": [{"id": "a", "text": "UPDATE orders SET status = ''selesai'' WHERE order_id = 12;"}, {"id": "b", "text": "UPDATE orders SET status = ''selesai'';"}, {"id": "c", "text": "DELETE FROM orders WHERE order_id = 12;"}]}','{"choiceId": "a"}'),
('post-test-basis-data','10','DELETE terarah','Write','Untuk menghapus hanya order_id = 15, tindakan yang tepat adalah?','{"mode": "choice", "options": [{"id": "a", "text": "DELETE FROM orders tanpa WHERE"}, {"id": "b", "text": "Preview WHERE order_id = 15, lalu DELETE dengan kondisi yang sama"}, {"id": "c", "text": "Ubah semua customer_id menjadi NULL lalu hapus"}]}','{"choiceId": "b"}')
) s(slug,position,title,topic,prompt,public_config,answer_config) on a.slug=s.slug
where p.slug='database-fundamentals'
on conflict(assessment_id,position) do nothing;
alter table public.assessments add constraint assessments_diagnostic_zero check(type <> 'PRETEST' or (course_weight_percent = 0 and passing_score = 0));
create unique index assessment_sessions_one_active_user_idx on public.assessment_sessions(user_id) where status='IN_PROGRESS';
notify pgrst,'reload schema';
commit;
