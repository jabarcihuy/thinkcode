-- Version the official post-test; preserve old sessions, answers and results.
-- Publish in this transaction only after the matching code and seed have passed local validation.
DO $$
DECLARE old_test public.assessments%rowtype; new_id uuid;
BEGIN
 SELECT * INTO STRICT old_test FROM public.assessments WHERE slug='post-test-basis-data' FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.assessment_sessions WHERE assessment_id=old_test.id AND status='IN_PROGRESS') THEN
   RAISE EXCEPTION 'Finish active old post-test sessions before switching versions';
 END IF;
 INSERT INTO public.assessments(learning_path_id,slug,title,instructions,type,gate_after_chapter,passing_score,course_weight_percent,position,is_published)
 VALUES(old_test.learning_path_id,'post-test-basis-data-sql-v2','Post-test Basis Data',
 'Kerjakan 10 soal konsep dan 6 tugas menulis SQL. Konsep berbobot 25%, SQL 75%. Coba query hanya memakai data awal; nilai diuji ulang di server. AI dan petunjuk tidak tersedia.',
 'FINAL',old_test.gate_after_chapter,75,100,(SELECT max(position)+1 FROM public.assessments WHERE learning_path_id=old_test.learning_path_id),false)
 RETURNING id INTO new_id;
 INSERT INTO public.assessment_items(assessment_id,type,title,topic,prompt,starter_code,public_config,answer_config,entry_function,weight,position)
 SELECT new_id,type,title,topic,prompt,starter_code,public_config,answer_config,entry_function,1,position
 FROM public.assessment_items WHERE assessment_id=old_test.id ORDER BY position;
 INSERT INTO public.assessment_items(assessment_id,type,title,topic,prompt,starter_code,public_config,answer_config,weight,position) VALUES
 (new_id,'PROBLEM_SOLVING','Memilih dua produk','Read','Tulis satu SELECT untuk menampilkan name lalu price dari products dengan price >= 5000. Urutkan price menurun, product_id menaik jika harga sama, lalu ambil dua record. Query harus mengikuti isi tabel, bukan mengisi hasil secara manual.','','{"mode": "sql", "datasetId": "shop", "operation": "SELECT"}'::jsonb,'{"referenceQuery": "SELECT name, price FROM products WHERE price >= 5000 ORDER BY price DESC, product_id ASC LIMIT 2;", "ordered": true, "fixtures": [{"rows": {}, "isHidden": false}, {"rows": {"products": [{"product_id": 10, "name": "Buku Baru", "price": 5000}, {"product_id": 20, "name": "Pena Baru", "price": 5000}, {"product_id": 30, "name": "Map Baru", "price": 4000}]}, "isHidden": true}]}'::jsonb,5,11);
 INSERT INTO public.assessment_items(assessment_id,type,title,topic,prompt,starter_code,public_config,answer_config,weight,position) VALUES
 (new_id,'PROBLEM_SOLVING','Menghubungkan buku dan penulis','Read','Tampilkan title dari books lalu name dari authors untuk seluruh buku. Gunakan pasangan author_id untuk menghubungkan kedua tabel dan urutkan menurut book_id menaik.','','{"mode": "sql", "datasetId": "library", "operation": "SELECT"}'::jsonb,'{"referenceQuery": "SELECT b.title, a.name FROM books b INNER JOIN authors a ON b.author_id = a.author_id ORDER BY b.book_id;", "ordered": true, "fixtures": [{"rows": {}, "isHidden": false}, {"rows": {"books": [{"book_id": 10, "title": "Data Terapan", "author_id": 2, "stock": 5}, {"book_id": 20, "title": "Relasi Baru", "author_id": 3, "stock": 0}, {"book_id": 30, "title": "Buku SQL", "author_id": 1, "stock": 3}, {"book_id": 40, "title": "Praktik Data", "author_id": 2, "stock": 2}]}, "isHidden": true}]}'::jsonb,5,12);
 INSERT INTO public.assessment_items(assessment_id,type,title,topic,prompt,starter_code,public_config,answer_config,weight,position) VALUES
 (new_id,'PROBLEM_SOLVING','Merangkum setiap mata kuliah','Read','Dari enrollments, tampilkan course_id, jumlah pendaftaran, lalu rata-rata score untuk tiap course_id yang memiliki pendaftaran. Gunakan COUNT, AVG dan GROUP BY; urutkan course_id menaik. Alias kolom bebas.','','{"mode": "sql", "datasetId": "campus", "operation": "SELECT"}'::jsonb,'{"referenceQuery": "SELECT course_id, COUNT(*), AVG(score) FROM enrollments GROUP BY course_id ORDER BY course_id;", "ordered": true, "fixtures": [{"rows": {}, "isHidden": false}, {"rows": {"enrollments": [{"enrollment_id": 1, "student_id": 1, "course_id": 10, "score": 0}, {"enrollment_id": 2, "student_id": 1, "course_id": 20, "score": 80}, {"enrollment_id": 3, "student_id": 2, "course_id": 10, "score": 100}, {"enrollment_id": 4, "student_id": 2, "course_id": 30, "score": 60}, {"enrollment_id": 5, "student_id": 3, "course_id": 20, "score": 40}, {"enrollment_id": 6, "student_id": 4, "course_id": 10, "score": 50}]}, "isHidden": true}]}'::jsonb,5,13);
 INSERT INTO public.assessment_items(assessment_id,type,title,topic,prompt,starter_code,public_config,answer_config,weight,position) VALUES
 (new_id,'PROBLEM_SOLVING','Menambahkan pelanggan','Write','Tambahkan satu record ke customers: customer_id 8, name Nisa, city Solo. Gunakan daftar kolom eksplisit dan VALUES. Seluruh record lama harus tetap sama.','','{"mode": "sql", "datasetId": "shop", "operation": "INSERT", "table": "customers"}'::jsonb,'{"referenceQuery": "INSERT INTO customers (customer_id, name, city) VALUES (8, ''Nisa'', ''Solo'');", "ordered": true, "fixtures": [{"rows": {}, "isHidden": false}, {"rows": {"customers": [{"customer_id": 1, "name": "Nadia", "city": "Surabaya"}, {"customer_id": 2, "name": "Raka", "city": "Bandung"}, {"customer_id": 3, "name": "Lina", "city": "Solo"}, {"customer_id": 4, "name": "Reno", "city": "Jakarta"}]}, "isHidden": true}]}'::jsonb,5,14);
 INSERT INTO public.assessment_items(assessment_id,type,title,topic,prompt,starter_code,public_config,answer_config,weight,position) VALUES
 (new_id,'PROBLEM_SOLVING','Mengubah satu pesanan','Write','Ubah status hanya record orders dengan order_id 200 menjadi paid. Gunakan WHERE pada primary key; seluruh nilai dan record lainnya harus tetap sama.','','{"mode": "sql", "datasetId": "shop", "operation": "UPDATE", "table": "orders"}'::jsonb,'{"referenceQuery": "UPDATE orders SET status = ''paid'' WHERE order_id = 200;", "ordered": true, "fixtures": [{"rows": {}, "isHidden": false}, {"rows": {"orders": [{"order_id": 100, "customer_id": 1, "status": "pending"}, {"order_id": 200, "customer_id": 2, "status": "cancelled"}, {"order_id": 300, "customer_id": 1, "status": "pending"}]}, "isHidden": true}]}'::jsonb,5,15);
 INSERT INTO public.assessment_items(assessment_id,type,title,topic,prompt,starter_code,public_config,answer_config,weight,position) VALUES
 (new_id,'PROBLEM_SOLVING','Menghapus satu buku','Write','Hapus hanya record books dengan book_id 20. Gunakan WHERE pada primary key. Seluruh buku dan data penulis lainnya harus tetap sama.','','{"mode": "sql", "datasetId": "library", "operation": "DELETE", "table": "books"}'::jsonb,'{"referenceQuery": "DELETE FROM books WHERE book_id = 20;", "ordered": true, "fixtures": [{"rows": {}, "isHidden": false}, {"rows": {"books": [{"book_id": 10, "title": "Data Baru", "author_id": 2, "stock": 0}, {"book_id": 20, "title": "Buku Pindah", "author_id": 1, "stock": 8}, {"book_id": 30, "title": "Latihan Relasi", "author_id": 3, "stock": 0}, {"book_id": 40, "title": "Query Baru", "author_id": 1, "stock": 0}]}, "isHidden": true}]}'::jsonb,5,16);
 IF (SELECT count(*) FROM public.assessment_items WHERE assessment_id=new_id) <> 16 THEN
   RAISE EXCEPTION 'Expected ten concept questions and six SQL tasks';
 END IF;
 UPDATE public.assessments SET is_published=false WHERE id=old_test.id;
 UPDATE public.assessments SET is_published=true WHERE id=new_id;
END;
$$;

-- No new public grants. Private references/fixtures stay in assessment_items.answer_config.
-- Existing owner-only session/result RLS and service-only finalization remain in force.
