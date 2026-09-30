-- Reorganize the active database course into three main topics while preserving
-- every existing lesson, exercise, attempt, and learner progress row.

update public.chapters c
set title = case c.position
      when 1 then 'Relasi'
      when 2 then 'Read'
      when 3 then 'Write'
      else c.title
    end,
    description = case c.position
      when 1 then 'Pahami tabel, record, kolom, key, dan hubungan antartabel sebelum menulis query.'
      when 2 then 'Ambil, saring, gabungkan, urutkan, dan rangkum data dengan query baca.'
      when 3 then 'Tambahkan, ubah, dan hapus satu record dengan aman pada data latihan.'
      else c.description
    end,
    is_required = true,
    is_published = c.position <= 3,
    updated_at = now()
from public.learning_paths p
where c.learning_path_id = p.id
  and p.slug = 'database-fundamentals';

-- Move the six existing query lessons into Read without changing their IDs.
-- Temporary positions avoid collisions on (chapter_id, position).
update public.lessons l
set position = 100 + l.position,
    updated_at = now()
from public.chapters c
join public.learning_paths p on p.id = c.learning_path_id
where l.chapter_id = c.id
  and p.slug = 'database-fundamentals';

update public.lessons l
set chapter_id = read_chapter.id,
    position = case l.slug
      when 'memilih-sumber-dan-kolom' then 1
      when 'menyaring-record' then 2
      when 'mengurutkan-dan-membatasi' then 3
      when 'menghubungkan-tabel' then 4
      when 'merangkum-data' then 5
      when 'tantangan-query-kampus' then 6
    end,
    updated_at = now()
from public.chapters old_chapter
join public.learning_paths p on p.id = old_chapter.learning_path_id
join public.chapters read_chapter on read_chapter.learning_path_id = p.id and read_chapter.position = 2
where l.chapter_id = old_chapter.id
  and p.slug = 'database-fundamentals'
  and l.slug in (
    'memilih-sumber-dan-kolom', 'menyaring-record', 'mengurutkan-dan-membatasi',
    'menghubungkan-tabel', 'merangkum-data', 'tantangan-query-kampus'
  );

update public.lessons
set title = 'Membaca Bentuk Data',
    slug = 'membaca-bentuk-data',
    summary = 'Kenali tabel, schema, record, baris, dan kolom melalui data kampus yang akan dipakai sepanjang jalur belajar.',
    content = $lesson$
## Pertanyaan: bagaimana informasi kampus disimpan?

Bayangkan daftar pendaftaran mata kuliah yang menyalin nama mahasiswa, nama mata kuliah, dan nilai ke satu tabel panjang. Perubahan nama mata kuliah harus diperbaiki di banyak baris. Basis data relasional menyimpan jenis fakta yang berbeda pada tabel terpisah, lalu menghubungkannya dengan key.

## Kenali bagian sebuah tabel

- **Tabel** mengelompokkan fakta sejenis, seperti `students`, `courses`, atau `enrollments`.
- **Kolom** menjelaskan atribut yang dicatat, seperti `name` atau `course_code`.
- **Baris/record** mewakili satu kejadian atau satu entitas yang dicatat.
- **Schema** menjelaskan nama kolom dan aturan nilainya; isi tabel adalah record yang tersimpan.

Pada tabel `students`, satu record menggambarkan satu mahasiswa. Pada `enrollments`, satu record menggambarkan satu pendaftaran mahasiswa ke mata kuliah tertentu.

## Amati sebelum menulis query

Periksa tiga tabel di bawah. Bandingkan apa yang disimpan `students` dan `courses` dengan fakta pendaftaran pada `enrollments`. Perhatikan bahwa satu baris pendaftaran merujuk pada satu mahasiswa dan satu mata kuliah.

## Cek pemahaman

Jika nama mahasiswa muncul lagi pada dua record pendaftaran, itu tidak otomatis berarti datanya keliru. Kedua record dapat mewakili dua pendaftaran yang berbeda. Kuncinya adalah memahami apa yang diwakili setiap baris.

## Ringkasan

- Tabel berisi satu kelompok fakta.
- Kolom menyatakan atribut; baris adalah record.
- Schema adalah bentuk tabel, sedangkan record adalah isi datanya.
- Relasi akan terbaca melalui key yang dipelajari pada materi berikutnya.
$lesson$,
    example_sql = 'SELECT student_id, name, cohort FROM students ORDER BY student_id;',
    is_preview = true,
    is_published = true,
    updated_at = now()
where slug = 'membaca-data-sebagai-relasi';

update public.lessons
set position = 1, updated_at = now()
where slug = 'membaca-bentuk-data';

update public.exercises e
set title = 'Baca record pada tabel mahasiswa',
    prompt = 'Prediksi isi tabel students. Tulis satu record per baris tanpa header; pisahkan kolom dengan tanda |.',
    starter_code = 'SELECT student_id, name, cohort FROM students ORDER BY student_id;',
    config = '{"answer":{"output":"1 | Alya | 2025\n2 | Bima | 2025\n3 | Citra | 2024\n4 | Danu | 2024"}}'::jsonb,
    updated_at = now()
where e.lesson_id = (select id from public.lessons where slug = 'membaca-bentuk-data');

-- Add the second Relasi material. Its exercise answer stays in private config.
with target_chapter as (
  select c.id from public.chapters c
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals' and c.position = 1
)
insert into public.lessons (chapter_id, title, slug, summary, content, position, is_required, is_preview, is_published, example_sql)
select id,
       'Key dan Hubungan Antar Tabel',
       'key-dan-hubungan-antar-tabel',
       'Gunakan primary key dan foreign key untuk menelusuri hubungan mahasiswa, pendaftaran, dan mata kuliah.',
       $lesson$
## Pertanyaan: bagaimana satu pendaftaran menemukan dua detail?

`enrollments` menyimpan pendaftaran, tetapi nama mahasiswa berada di `students` dan nama mata kuliah berada di `courses`. Nilai key menjadi penghubung antartabel.

## Primary key mengenali satu record

`students.student_id` adalah **primary key (PK)**. Setiap nilainya mengidentifikasi satu mahasiswa. `courses.course_id` dan `enrollments.enrollment_id` memiliki fungsi serupa pada tabel masing-masing.

## Foreign key merujuk ke tabel lain

`enrollments.student_id` adalah **foreign key (FK)** yang menunjuk pada `students.student_id`. `enrollments.course_id` menunjuk pada `courses.course_id`. FK boleh berulang: mahasiswa yang sama dapat memiliki beberapa pendaftaran.

```text
students 1 ─── banyak enrollments banyak ─── 1 courses
```

`enrollments` berperan sebagai tabel penghubung. Banyak mahasiswa dapat mengambil banyak mata kuliah, sehingga pasangan mahasiswa–mata kuliah membentuk hubungan M:N yang direkam sebagai beberapa hubungan 1:N.

## Telusuri key pada data

Pilih sebuah record `enrollments`. Ikuti `student_id` ke baris dengan `student_id` sama pada `students`, lalu ikuti `course_id` ke `courses`. Key harus cocok; nama yang kebetulan sama tidak cukup untuk membuktikan relasi.

## Ringkasan

- PK mengidentifikasi record pada tabelnya.
- FK merujuk ke key pada tabel lain dan menjaga rujukan tetap valid.
- Satu mahasiswa/mata kuliah dapat terhubung ke banyak pendaftaran.
- Tabel penghubung menyimpan pasangan key untuk hubungan M:N.
$lesson$,
       2, true, false, true,
       'SELECT enrollment_id, student_id, course_id FROM enrollments ORDER BY enrollment_id;'
from target_chapter;

with target_lesson as (
  select l.id from public.lessons l where l.slug = 'key-dan-hubungan-antar-tabel'
)
insert into public.exercises (lesson_id, type, title, prompt, config, position, is_required, is_published)
select id, 'PSEUDOCODE', 'Temukan pasangan key',
       'Kolom mana yang menghubungkan enrollments ke students?',
       '{"answer":{"choiceId":"student_id"},"public":{"mode":"choice","options":[{"id":"student_id","text":"enrollments.student_id = students.student_id"},{"id":"name","text":"enrollments.student_id = students.name"},{"id":"cohort","text":"enrollments.student_id = students.cohort"}]}}'::jsonb,
       1, true, true
from target_lesson;

-- Three Write materials make data changes visible and reversible in the local lab.
with target_chapter as (
  select c.id from public.chapters c
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals' and c.position = 3
), seed(position, title, slug, summary, content, example_sql) as (
  values
    (1, 'Menambahkan Record dengan INSERT', 'menambahkan-record-dengan-insert',
     'Tambahkan satu record dengan daftar kolom eksplisit dan amati constraint key serta foreign key.',
     $lesson$
## Pertanyaan: bagaimana menambahkan mahasiswa baru?

`INSERT` menambahkan record ke tabel. Tulis nama kolom agar hubungan setiap nilai dengan atributnya jelas; jumlah nilai harus sama dengan jumlah kolom.

## Susun satu baris

```sql
INSERT INTO students (student_id, name, cohort)
VALUES (5, 'Eka', '2026');
```

Urutan nilai mengikuti urutan kolom: `5` untuk `student_id`, `Eka` untuk `name`, dan `2026` untuk `cohort`. Teks memakai tanda petik tunggal. Contoh ini hanya menambah satu record.

## Periksa constraint

Primary key tidak boleh dipakai oleh dua record. Kolom wajib tidak boleh kosong. Saat menambahkan pendaftaran ke `enrollments`, kedua foreign key harus merujuk record `students` dan `courses` yang sudah tersedia.

## Amati dan pulihkan

Jalankan preview, periksa baris yang akan ditambahkan, lalu terapkan perubahan. Query `SELECT` dapat memastikan record baru ada. Tombol Reset mengembalikan data kampus ke seed awal.

## Ringkasan

- `INSERT INTO` menyebut tabel dan kolom tujuan.
- `VALUES` memasangkan nilai dengan urutan kolom.
- PK, `NOT NULL`, dan FK menjaga record baru tetap konsisten.
- Data hanya berubah pada sesi latihan browser.
$lesson$,
     'INSERT INTO students (student_id, name, cohort) VALUES (5, ''Eka'', ''2026'');'),
    (2, 'Mengubah Record dengan UPDATE', 'mengubah-record-dengan-update',
     'Pilih satu record melalui primary key, ubah satu atribut, lalu periksa keadaan sebelum dan sesudahnya.',
     $lesson$
## Pertanyaan: bagaimana memperbaiki nilai pendaftaran?

`UPDATE` mengubah nilai pada record yang sudah ada. Sebelum mengubahnya, cari dahulu target dengan kondisi yang sama. Pada lab, perubahan ditampilkan sebagai preview dan belum diterapkan sampai kamu mengonfirmasi.

## Periksa target dengan key

Record `enrollment_id = 3` saat ini memiliki nilai 74. Jalankan query ini untuk memastikan baris sasaran:

```sql
SELECT enrollment_id, score
FROM enrollments
WHERE enrollment_id = 3;
```

Sesudah memeriksa target, ubah query menjadi:

```sql
UPDATE enrollments
SET score = 78
WHERE enrollment_id = 3;
```

`SET` menentukan kolom dan nilai baru; `WHERE` memilih record. Lab hanya menerima target primary key bernilai bulat dan membatasi perubahan menjadi satu record.

## Bandingkan sebelum dan sesudah

Pastikan preview menunjukkan enrollment 3 dengan nilai 74 sebelum perubahan dan 78 sesudahnya. Jika targetnya keliru, batalkan. Sesudah menerapkan, jalankan `SELECT` yang sama untuk memverifikasi nilai.

## Ringkasan

- Pilih target dengan key sebelum mengubah data.
- `SET` menentukan perubahan; `WHERE` menentukan record.
- Periksa preview dan jumlah record yang terdampak.
- Reset memulihkan dataset untuk percobaan berikutnya.
$lesson$,
     'UPDATE enrollments SET score = 78 WHERE enrollment_id = 3;'),
    (3, 'Menghapus Record dengan DELETE', 'menghapus-record-dengan-delete',
     'Hapus satu record latihan yang ditargetkan dengan key dan amati cara foreign key melindungi relasi.',
     $lesson$
## Pertanyaan: apa akibat menghapus sebuah pendaftaran?

`DELETE` menghapus record. Karena tindakan ini menghilangkan baris dari sesi latihan, pilih sasaran terlebih dahulu dan periksa preview dengan teliti.

## Pilih record yang tepat

Enrollment 6 adalah pendaftaran Danu pada mata kuliah SI101. Periksa baris itu lebih dahulu:

```sql
SELECT enrollment_id, student_id, course_id, score
FROM enrollments
WHERE enrollment_id = 6;
```

Jika itu sasaran yang dimaksud, gunakan:

```sql
DELETE FROM enrollments
WHERE enrollment_id = 6;
```

Pada lab, preview menunjukkan baris yang akan dihapus. Konfirmasi menerapkan penghapusan satu record; pembatalan membiarkan data tetap sama.

## Relasi membatasi penghapusan

`enrollments.student_id` merujuk pada `students.student_id`. Karena itu, menghapus mahasiswa yang masih memiliki pendaftaran ditolak oleh foreign key. Hapus record penghubung yang memang menjadi sasaran latihan sebelum mencoba menghapus record induk. Materi ini tidak mengaktifkan cascade delete.

## Pulihkan dataset

Sesudah mengamati hasil, gunakan Reset untuk mengembalikan seluruh record seed. Tidak ada perubahan yang disimpan ke akun atau Supabase.

## Ringkasan

- Tentukan satu target memakai primary key.
- Periksa preview sebelum mengonfirmasi `DELETE`.
- FK mencegah penghapusan yang meninggalkan rujukan tidak valid.
- Reset memulihkan dataset latihan.
$lesson$,
     'DELETE FROM enrollments WHERE enrollment_id = 6;')
)
insert into public.lessons (chapter_id, title, slug, summary, content, position, is_required, is_preview, is_published, example_sql)
select target_chapter.id, seed.title, seed.slug, seed.summary, seed.content, seed.position, true, false, true, seed.example_sql
from target_chapter cross join seed;

with seed(slug, title, prompt, starter_code, choice_id, options) as (
  values
    ('menambahkan-record-dengan-insert', 'Cocokkan kolom dan nilai', 'Apa yang harus cocok dalam INSERT satu baris?',
     'INSERT INTO students (student_id, name) VALUES (5, ''Eka'');', 'paired',
     '[{"id":"paired","text":"Jumlah nilai harus sama dengan jumlah kolom; nilai mengikuti urutan kolom"},{"id":"any-order","text":"SQLite memasangkan nilai dengan nama secara otomatis"},{"id":"no-columns","text":"Daftar kolom selalu boleh dihilangkan"}]'::jsonb),
    ('mengubah-record-dengan-update', 'Periksa target UPDATE', 'Apa langkah aman sebelum mengonfirmasi UPDATE?',
     'UPDATE enrollments SET score = 78 WHERE enrollment_id = 3;', 'preview',
     '[{"id":"preview","text":"Periksa record dengan primary key yang sama, lalu tinjau preview"},{"id":"all","text":"Hapus WHERE agar semua nilai konsisten"},{"id":"guess","text":"Ubah nilai tanpa melihat record target"}]'::jsonb),
    ('menghapus-record-dengan-delete', 'Pahami batas foreign key', 'Apa yang terjadi jika mahasiswa masih dirujuk oleh enrollment?',
     'DELETE FROM students WHERE student_id = 4;', 'blocked',
     '[{"id":"blocked","text":"Foreign key menolak penghapusan record induk yang masih dirujuk"},{"id":"cascade","text":"Semua data terkait selalu terhapus otomatis"},{"id":"ignored","text":"Relasi tidak memengaruhi DELETE"}]'::jsonb)
)
insert into public.exercises (lesson_id, type, title, prompt, starter_code, config, position, is_required, is_published)
select l.id, 'PSEUDOCODE', seed.title, seed.prompt, seed.starter_code,
       jsonb_build_object(
         'answer', jsonb_build_object('choiceId', seed.choice_id),
         'public', jsonb_build_object('mode','choice','options',seed.options)
       ),
       1, true, true
from seed join public.lessons l on l.slug = seed.slug;

-- Keep existing IDs, result history, and course grading weights while moving the
-- checkpoint gates to the new three-topic path.
update public.assessments a
set title = case a.slug
      when 'checkpoint-relasi-select' then 'Checkpoint 1 · Relasi'
      when 'checkpoint-filter-order' then 'Checkpoint 2 · Read'
      when 'checkpoint-join-ringkasan' then 'Checkpoint 3 · Write'
      when 'tes-akhir-query-kampus' then 'Tes Akhir · Relasi, Read, dan Write'
      else a.title
    end,
    instructions = case a.slug
      when 'checkpoint-relasi-select' then 'Periksa pemahaman tentang tabel, record, primary key, foreign key, dan hubungan antartabel. AI Tutor dan petunjuk nonaktif selama assessment.'
      when 'checkpoint-filter-order' then 'Periksa pemahaman tentang SELECT, kondisi, pengurutan, batas hasil, dan pembacaan relasi. AI Tutor dan petunjuk nonaktif selama assessment.'
      when 'checkpoint-join-ringkasan' then 'Periksa pemahaman tentang INSERT, target UPDATE/DELETE, dan constraint foreign key. AI Tutor dan petunjuk nonaktif selama assessment.'
      when 'tes-akhir-query-kampus' then 'Investigasi akhir: baca hubungan data, jawab pertanyaan dengan SQL, dan pilih perubahan record yang aman. AI Tutor dan petunjuk nonaktif selama assessment.'
      else a.instructions
    end,
    gate_after_chapter = case a.slug
      when 'checkpoint-relasi-select' then 1
      when 'checkpoint-filter-order' then 2
      when 'checkpoint-join-ringkasan' then 3
      when 'tes-akhir-query-kampus' then 3
      else a.gate_after_chapter
    end,
    updated_at = now()
from public.learning_paths p
where a.learning_path_id = p.id
  and p.slug = 'database-fundamentals'
  and a.slug in ('checkpoint-relasi-select','checkpoint-filter-order','checkpoint-join-ringkasan','tes-akhir-query-kampus');

-- Retarget checkpoint 1 to Relasi concepts only.
update public.assessment_items i
set type = 'PSEUDOCODE',
    topic = 'Foreign key',
    title = 'Telusuri rujukan mahasiswa',
    prompt = 'Kolom mana pada enrollments yang merujuk ke primary key pada students?',
    starter_code = null,
    public_config = '{"mode":"choice","options":[{"id":"student_id","text":"enrollments.student_id → students.student_id"},{"id":"name","text":"enrollments.name → students.name"},{"id":"cohort","text":"enrollments.cohort → students.cohort"}]}'::jsonb,
    answer_config = '{"choiceId":"student_id"}'::jsonb
from public.assessments a
join public.learning_paths p on p.id = a.learning_path_id
where i.assessment_id = a.id and p.slug = 'database-fundamentals'
  and a.slug = 'checkpoint-relasi-select' and i.position = 2;

update public.assessment_items i
set topic = 'Relasi 1:N',
    title = 'Kenali relasi satu ke banyak',
    prompt = 'Satu mahasiswa dapat tercatat pada beberapa baris enrollment. Bentuk hubungan apa yang terlihat dari students ke enrollments?',
    public_config = '{"mode":"choice","options":[{"id":"one-many","text":"Satu ke banyak (1:N)"},{"id":"many-one","text":"Banyak ke satu saja"},{"id":"unrelated","text":"Tidak ada hubungan"}]}'::jsonb,
    answer_config = '{"choiceId":"one-many"}'::jsonb
from public.assessments a
join public.learning_paths p on p.id = a.learning_path_id
where i.assessment_id = a.id and p.slug = 'database-fundamentals'
  and a.slug = 'checkpoint-relasi-select' and i.position = 3;

update public.assessment_items i
set type = 'PSEUDOCODE',
    topic = 'Tabel penghubung',
    title = 'Temukan tabel penghubung',
    prompt = 'Tabel mana yang menyimpan pasangan mahasiswa dan mata kuliah?',
    starter_code = null,
    public_config = '{"mode":"choice","options":[{"id":"students","text":"students"},{"id":"courses","text":"courses"},{"id":"enrollments","text":"enrollments"}]}'::jsonb,
    answer_config = '{"choiceId":"enrollments"}'::jsonb
from public.assessments a
join public.learning_paths p on p.id = a.learning_path_id
where i.assessment_id = a.id and p.slug = 'database-fundamentals'
  and a.slug = 'checkpoint-relasi-select' and i.position = 4;

-- Retarget checkpoint 3 to guarded write operations.
with replacement(position, topic, title, prompt, starter_code, options, answer) as (
  values
    (1, 'INSERT', 'Pasangkan kolom dan nilai', 'Bagaimana nilai dipasangkan pada INSERT satu baris?',
     'INSERT INTO students (student_id, name) VALUES (5, ''Eka'');',
     '[{"id":"paired","text":"Jumlah nilai sama dengan jumlah kolom dan urutannya sesuai"},{"id":"automatic","text":"Database menebak pasangan nilai secara otomatis"},{"id":"duplicate","text":"Primary key boleh dipakai berulang"}]'::jsonb, 'paired'),
    (2, 'UPDATE', 'Periksa target sebelum mengubah', 'Apa yang perlu dilakukan sebelum mengonfirmasi UPDATE enrollment 3?',
     'UPDATE enrollments SET score = 78 WHERE enrollment_id = 3;',
     '[{"id":"preview","text":"Periksa enrollment_id yang sama dan tinjau nilai sebelum/sesudah"},{"id":"drop-where","text":"Hapus WHERE supaya baris target ditemukan"},{"id":"skip","text":"Langsung terapkan tanpa melihat preview"}]'::jsonb, 'preview'),
    (3, 'DELETE dan foreign key', 'Kenali record yang masih dirujuk', 'Apa akibat menghapus mahasiswa yang masih mempunyai record enrollment?',
     'DELETE FROM students WHERE student_id = 4;',
     '[{"id":"blocked","text":"Foreign key menolak penghapusan record induk yang masih dirujuk"},{"id":"cascade","text":"Semua record terkait otomatis terhapus"},{"id":"unrelated","text":"Penghapusan tidak dipengaruhi relasi"}]'::jsonb, 'blocked'),
    (4, 'Target record', 'Pilih target DELETE yang tepat', 'Untuk menghapus satu pendaftaran, target mana yang harus dipakai?',
     'DELETE FROM enrollments WHERE enrollment_id = 6;',
     '[{"id":"primary","text":"Primary key enrollment_id = 6"},{"id":"all","text":"Semua record pada enrollments"},{"id":"course","text":"Semua pendaftaran dengan course_id yang sama"}]'::jsonb, 'primary')
)
update public.assessment_items i
set type = 'PSEUDOCODE', topic = replacement.topic, title = replacement.title,
    prompt = replacement.prompt, starter_code = replacement.starter_code,
    public_config = jsonb_build_object('mode','choice','options',replacement.options),
    answer_config = jsonb_build_object('choiceId',replacement.answer)
from public.assessments a
join public.learning_paths p on p.id = a.learning_path_id
join replacement on true
where i.assessment_id = a.id and p.slug = 'database-fundamentals'
  and a.slug = 'checkpoint-join-ringkasan'
  and i.position = replacement.position;

-- Add one write-safety question to the final investigation while keeping its
-- existing query and relation questions.
insert into public.assessment_items (assessment_id, type, title, topic, prompt, starter_code, public_config, answer_config, weight, position)
select a.id, 'PSEUDOCODE', 'Pilih target sebelum mengubah', 'Write dan keselamatan data',
       'Apa yang perlu ditinjau sebelum UPDATE atau DELETE diterapkan?', null,
       '{"mode":"choice","options":[{"id":"same-key","text":"Baris yang cocok dengan primary key pada WHERE dan preview sebelum/sesudah"},{"id":"all-rows","text":"Semua baris tabel tanpa memeriksa target"},{"id":"client-score","text":"Skor dari browser"}]}'::jsonb,
       '{"choiceId":"same-key"}'::jsonb, 1, 5
from public.assessments a
join public.learning_paths p on p.id = a.learning_path_id
where p.slug = 'database-fundamentals' and a.slug = 'tes-akhir-query-kampus'
on conflict (assessment_id, position) do nothing;
