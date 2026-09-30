alter table public.lessons
  add column if not exists example_sql text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'lessons_example_sql_length_check'
      and conrelid = 'public.lessons'::regclass
  ) then
    alter table public.lessons
      add constraint lessons_example_sql_length_check
      check (example_sql is null or length(example_sql) <= 4096);
  end if;
end $$;

-- Archive the former programming course without removing learner history.
update public.assessments
set is_published = false
where learning_path_id in (select id from public.learning_paths where slug <> 'database-fundamentals');

update public.exercises e
set is_published = false
from public.lessons l
join public.chapters c on c.id = l.chapter_id
join public.learning_paths p on p.id = c.learning_path_id
where e.lesson_id = l.id and p.slug <> 'database-fundamentals';

update public.lessons
set is_published = false
where chapter_id in (
  select c.id from public.chapters c
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug <> 'database-fundamentals'
);

update public.chapters c
set is_published = false
from public.learning_paths p
where c.learning_path_id = p.id and p.slug <> 'database-fundamentals';

update public.learning_paths
set is_published = false
where slug <> 'database-fundamentals';

insert into public.learning_paths (slug, title, description, position, is_published)
values (
  'database-fundamentals',
  'Basis Data dan SQL',
  'Pelajari tabel, relasi, dan query SQL dengan data kampus sintetis yang dapat diamati dan dicoba langsung.',
  1,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  position = excluded.position,
  is_published = true,
  updated_at = now();

with path as (
  select id from public.learning_paths where slug = 'database-fundamentals'
), seed(position, title, description) as (
  values
    (1, 'Membaca Data sebagai Relasi', 'Kenali tabel, record, kolom, primary key, foreign key, dan hubungan antartabel.'),
    (2, 'Memilih Sumber dan Kolom', 'Terjemahkan pertanyaan menjadi tabel sumber dengan FROM dan kolom hasil dengan SELECT.'),
    (3, 'Menyaring Record', 'Gunakan WHERE, perbandingan, AND, dan OR untuk memilih baris yang menjawab pertanyaan.'),
    (4, 'Mengurutkan dan Membatasi Hasil', 'Tentukan urutan yang stabil dengan ORDER BY dan ambil hasil yang dibutuhkan dengan LIMIT.'),
    (5, 'Menghubungkan Tabel', 'Gabungkan fakta pendaftaran dengan nama mahasiswa dan mata kuliah melalui key.'),
    (6, 'Merangkum Data', 'Kelompokkan record lalu hitung jumlah dan rata-rata dengan GROUP BY, COUNT, dan AVG.'),
    (7, 'Tantangan Query Kampus', 'Susun query terpadu untuk menjawab pertanyaan data kampus dari awal sampai hasil.')
)
insert into public.chapters (learning_path_id, title, description, position, is_required, is_published)
select path.id, seed.title, seed.description, seed.position, true, true
from path cross join seed
on conflict (learning_path_id, position) do update set
  title = excluded.title,
  description = excluded.description,
  is_required = true,
  is_published = true,
  updated_at = now();

with path as (
  select id from public.learning_paths where slug = 'database-fundamentals'
), seed(chapter_position, lesson_position, slug, title, summary, content, example_sql, is_preview) as (
  values
    (1, 1, 'membaca-data-sebagai-relasi', 'Membaca Data sebagai Relasi', 'Lihat bagaimana tiga tabel kampus saling menyimpan fakta tanpa mengulang informasi.',
     $content$## Pertanyaan: bagaimana data pendaftaran disimpan?

Sebuah daftar datar dapat mengulang nama mahasiswa dan nama mata kuliah berkali-kali. Basis data relasional memisahkan fakta ke beberapa tabel, lalu menghubungkannya dengan nilai key.

Dataset latihan kita memiliki tiga tabel:

- `students` menyimpan identitas mahasiswa: `student_id`, `name`, dan `cohort`.
- `courses` menyimpan mata kuliah: `course_id`, `course_code`, `course_name`, dan `credits`.
- `enrollments` menyimpan pendaftaran dan `score`, bersama key mahasiswa serta mata kuliah.

`student_id` pada `students` adalah **primary key (PK)**: nilainya mengidentifikasi satu record mahasiswa. `student_id` pada `enrollments` adalah **foreign key (FK)** yang menunjuk ke sana. Pola yang sama berlaku untuk `course_id`.

```text
students ── student_id ── enrollments ── course_id ── courses
```

Satu mahasiswa dapat memiliki beberapa record pendaftaran. Karena itu, FK boleh muncul berulang; record tersebut bukan duplikasi jika mewakili mata kuliah berbeda.

## Coba amati

Perhatikan query awal. Hasilnya memiliki empat baris, satu untuk setiap mahasiswa. Di bagian visualisasi, lihat tiga tabel dan tandai kolom PK/FK. Belum perlu menggabungkan tabel dengan SQL; cari dulu jalur key yang menghubungkannya.

## Ingat

- Tabel menyimpan satu jenis fakta; baris adalah record dan kolom adalah atribut.
- PK mengenali satu record dalam tabelnya.
- FK menunjuk ke PK pada tabel lain.
- `enrollments` menghubungkan mahasiswa dan mata kuliah.$content$,
     $sql$SELECT student_id, name, cohort
FROM students
ORDER BY student_id;$sql$, true),
    (2, 1, 'memilih-sumber-dan-kolom', 'Memilih Sumber dan Kolom', 'Bedakan tabel sumber dari kolom yang ingin ditampilkan.',
     $content$## Pertanyaan: data apa yang perlu ditampilkan?

Query dimulai dari pertanyaan. `FROM` menentukan tabel sumber; `SELECT` menentukan kolom hasil. Pada tahap ini gunakan satu tabel agar jelas bedanya memilih kolom dan memilih record.

Untuk menampilkan kode dan nama mata kuliah:

```sql
SELECT course_code, course_name
FROM courses
ORDER BY course_id;
```

Query menghasilkan dua kolom dan tiga baris. `SELECT *` menampilkan semua kolom; itu berguna saat memeriksa tabel, tetapi pertanyaan yang jelas biasanya cukup dijawab dengan kolom yang memang diperlukan.

## Coba ubah pertanyaan

Ganti kolom setelah `SELECT` untuk menampilkan hanya nama mahasiswa. Tabel sumber tetap `students`, dan jumlah baris tidak berubah karena belum ada `WHERE`.

## Ingat

- `FROM` memilih tabel tempat data dibaca.
- `SELECT` memilih kolom hasil.
- Memilih kolom tidak otomatis menyaring baris.
- Tambahkan `ORDER BY` jika urutan hasil perlu konsisten.$content$,
     $sql$SELECT course_code, course_name
FROM courses
ORDER BY course_id;$sql$, false),
    (3, 1, 'menyaring-record', 'Menyaring Record dengan WHERE', 'Tentukan record yang memenuhi kondisi dan lihat baris lain tersaring.',
     $content$## Pertanyaan: mahasiswa angkatan mana yang ingin dilihat?

`WHERE` memeriksa kondisi pada setiap baris. Baris yang memenuhi kondisi masuk ke hasil; baris lain tidak ditampilkan. `SELECT` tetap memilih kolom yang terlihat.

```sql
SELECT name, cohort
FROM students
WHERE cohort = '2025'
ORDER BY name;
```

Nilai teks ditulis dengan tanda petik tunggal. Gunakan `=`, `<>`, `<`, `<=`, `>`, atau `>=` untuk membandingkan nilai. `AND` berarti kedua kondisi harus benar; `OR` berarti salah satu kondisi cukup benar. Pakai tanda kurung saat menggabungkan keduanya agar maksud query mudah dibaca.

## Prediksi, lalu jalankan

Sebelum Run, perkirakan jumlah baris untuk angkatan 2025. Setelah Run, cocokkan hasilnya dengan prediksi. Ganti nilai kondisi menjadi 2024 dan amati baris mana yang berubah.

## Ingat

- `WHERE` menyaring baris, bukan kolom.
- Nilai teks memakai tanda petik tunggal.
- `AND` mempersempit syarat; `OR` menerima salah satu syarat.$content$,
     $sql$SELECT name, cohort
FROM students
WHERE cohort = '2025'
ORDER BY name;$sql$, false),
    (4, 1, 'mengurutkan-dan-membatasi', 'Mengurutkan dan Membatasi Hasil', 'Susun urutan hasil yang stabil, lalu tampilkan hanya jumlah baris yang diminta.',
     $content$## Pertanyaan: mata kuliah mana yang ingin ditampilkan lebih dulu?

Tanpa aturan urut, posisi baris dalam hasil tidak dijamin. `ORDER BY` menetapkan kolom pengurutan. Gunakan `ASC` untuk urutan naik dan `DESC` untuk urutan turun.

```sql
SELECT course_name, credits
FROM courses
ORDER BY credits DESC, course_name ASC
LIMIT 2;
```

Query ini mengurutkan jumlah kredit dari terbesar. Jika nilainya sama, nama mata kuliah menjadi aturan kedua agar hasil tetap stabil. `LIMIT 2` mengambil dua baris teratas setelah pengurutan.

## Coba variasi

Ubah `DESC` menjadi `ASC`, lalu jalankan kembali. Bandingkan baris pertama. Setelah itu ubah angka pada `LIMIT` dan perhatikan jumlah baris hasil.

## Ingat

- Pengurutan dilakukan sebelum batas jumlah baris diterapkan.
- Gunakan aturan pengurutan kedua untuk memecahkan nilai yang seri.
- `LIMIT` mengurangi banyaknya baris yang ditampilkan.$content$,
     $sql$SELECT course_name, credits
FROM courses
ORDER BY credits DESC, course_name ASC
LIMIT 2;$sql$, false),
    (5, 1, 'menghubungkan-tabel', 'Menghubungkan Tabel dengan JOIN', 'Telusuri key pada enrollments untuk menemukan mahasiswa dan mata kuliah yang cocok.',
     $content$## Pertanyaan: siapa mengambil Basis Data?

Nama mahasiswa, mata kuliah, dan nilai tersimpan di tabel yang berbeda. `enrollments` menyimpan fakta pendaftaran; `students` dan `courses` menyimpan detail yang ingin dibaca.

```sql
SELECT s.name, c.course_name, e.score
FROM enrollments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_code = 'IF102'
ORDER BY s.name;
```

Setiap `JOIN` memasangkan dua sisi melalui key yang sama. Alias `e`, `s`, dan `c` membuat nama kolom lebih ringkas. Kondisi `ON` menjelaskan hubungan antartabel; `WHERE` memilih mata kuliah yang ditanyakan.

## Baca jalurnya

Ikuti `enrollments.student_id` ke `students.student_id`, lalu `enrollments.course_id` ke `courses.course_id`. Hasilnya dua record: Alya mendapat 90 dan Citra mendapat 80 pada Basis Data.

## Ingat

- `JOIN` menggabungkan record yang key-nya cocok.
- `ON` menjelaskan pasangan key.
- `WHERE` menyaring hasil setelah sumber tabel ditentukan.$content$,
     $sql$SELECT s.name, c.course_name, e.score
FROM enrollments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_code = 'IF102'
ORDER BY s.name;$sql$, false),
    (6, 1, 'merangkum-data', 'Merangkum Data dengan GROUP BY', 'Ubah beberapa record pendaftaran menjadi ringkasan per mata kuliah.',
     $content$## Pertanyaan: berapa pendaftar dan berapa rata-rata nilainya?

Fungsi agregat merangkum banyak baris menjadi nilai ringkas. `COUNT` menghitung record; `AVG` menghitung rata-rata. `GROUP BY` menentukan record mana yang dirangkum bersama.

```sql
SELECT c.course_name,
       COUNT(e.enrollment_id) AS enrollment_count,
       ROUND(AVG(e.score), 2) AS average_score
FROM courses AS c
JOIN enrollments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY average_score DESC;
```

Satu baris hasil mewakili satu mata kuliah, bukan satu mahasiswa. Kolom yang bukan agregat dicantumkan di `GROUP BY`. Urutan akhir dibuat dari rata-rata tertinggi.

## Periksa arti hasil

Bandingkan `COUNT` dengan `AVG`: jumlah record dan rata-rata menjawab pertanyaan yang berbeda. Sebuah mata kuliah dengan sedikit pendaftar dapat memiliki nilai rata-rata tinggi.

## Ingat

- `COUNT` menghitung record; `AVG` merangkum nilai angka.
- `GROUP BY` menetapkan tingkat ringkasan.
- `ORDER BY` mengurutkan ringkasan yang sudah terbentuk.$content$,
     $sql$SELECT c.course_name,
       COUNT(e.enrollment_id) AS enrollment_count,
       ROUND(AVG(e.score), 2) AS average_score
FROM courses AS c
JOIN enrollments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY average_score DESC;$sql$, false),
    (7, 1, 'tantangan-query-kampus', 'Tantangan Query Kampus', 'Gabungkan filter, relasi, ringkasan, dan pengurutan untuk menjawab pertanyaan terpadu.',
     $content$## Tantangan: mata kuliah mana yang nilainya paling baik?

Cari rata-rata nilai setiap mata kuliah, tetapi hanya dari pendaftaran dengan nilai minimal 80. Tampilkan nama mata kuliah, jumlah pendaftar yang memenuhi syarat, dan rata-ratanya.

Sebelum menjalankan query, susun rencana:

1. Ambil data pendaftaran dan nama mata kuliah dari tabel yang berhubungan.
2. Saring pendaftaran dengan `WHERE`.
3. Kelompokkan berdasarkan mata kuliah.
4. Hitung jumlah dan rata-rata, lalu urutkan rata-rata dari terbesar.

Perhatikan urutan pikir tersebut. SQL ditulis sebagai pernyataan yang mudah dibaca, tetapi hasilnya harus sesuai dengan peran setiap klausa.

## Coba tantangannya

Jalankan query awal. Ubah ambang nilai menjadi 85, prediksi kembali jumlah baris, lalu amati mata kuliah mana yang tersisa.

## Refleksi

Sebelum menyimpan query, tanyakan: apakah filter memakai nilai yang benar, apakah setiap hubungan memakai key yang sesuai, dan apakah hasil ringkasan mewakili satu mata kuliah?$content$,
     $sql$SELECT c.course_name,
       COUNT(e.enrollment_id) AS enrollment_count,
       ROUND(AVG(e.score), 2) AS average_score
FROM courses AS c
JOIN enrollments AS e ON e.course_id = c.course_id
WHERE e.score >= 80
GROUP BY c.course_id, c.course_name
ORDER BY average_score DESC, c.course_name;$sql$, false)
)
insert into public.lessons (
  chapter_id, title, slug, summary, content, example_sql, position,
  is_required, is_preview, is_published
)
select c.id, seed.title, seed.slug, seed.summary, seed.content, seed.example_sql,
       seed.lesson_position, true, seed.is_preview, true
from seed
join public.chapters c on c.learning_path_id = (select id from path) and c.position = seed.chapter_position
on conflict (slug) do update set
  chapter_id = excluded.chapter_id,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  example_sql = excluded.example_sql,
  position = excluded.position,
  is_required = true,
  is_preview = excluded.is_preview,
  is_published = true,
  updated_at = now();

with seed(lesson_slug, title, prompt, starter_sql, expected_output) as (
  values
    ('membaca-data-sebagai-relasi', 'Baca struktur data mahasiswa', 'Prediksi isi tabel hasil. Tulis satu record per baris tanpa header; pisahkan kolom dengan tanda |.', $sql$SELECT student_id, name, cohort FROM students ORDER BY student_id;$sql$, E'1 | Alya | 2025\n2 | Bima | 2025\n3 | Citra | 2024\n4 | Danu | 2024'),
    ('memilih-sumber-dan-kolom', 'Pilih kolom yang diminta', 'Prediksi tabel hasil untuk kode dan nama semua mata kuliah. Satu record per baris; pisahkan kolom dengan tanda |.', $sql$SELECT course_code, course_name FROM courses ORDER BY course_id;$sql$, E'SI101 | Sistem Informasi\nIF102 | Basis Data\nIF103 | Matematika Diskrit'),
    ('menyaring-record', 'Saring mahasiswa angkatan 2025', 'Prediksi tabel hasil. Tulis satu record per baris tanpa header; pisahkan kolom dengan tanda |.', $sql$SELECT name, cohort FROM students WHERE cohort = '2025' ORDER BY name;$sql$, E'Alya | 2025\nBima | 2025'),
    ('mengurutkan-dan-membatasi', 'Ambil dua mata kuliah pertama', 'Prediksi dua baris teratas setelah pengurutan. Tulis satu record per baris; pisahkan kolom dengan tanda |.', $sql$SELECT course_name, credits FROM courses ORDER BY credits DESC, course_name ASC LIMIT 2;$sql$, E'Basis Data | 3\nMatematika Diskrit | 3'),
    ('menghubungkan-tabel', 'Temukan pendaftar Basis Data', 'Prediksi nama mahasiswa, mata kuliah, dan nilai. Tulis satu record per baris; pisahkan kolom dengan tanda |.', $sql$SELECT s.name, c.course_name, e.score FROM enrollments e JOIN students s ON s.student_id = e.student_id JOIN courses c ON c.course_id = e.course_id WHERE c.course_code = 'IF102' ORDER BY s.name;$sql$, E'Alya | Basis Data | 90\nCitra | Basis Data | 80'),
    ('merangkum-data', 'Hitung ringkasan tiap mata kuliah', 'Prediksi nama mata kuliah, jumlah pendaftar, dan rata-rata nilai (dua angka desimal). Satu record per baris; pisahkan kolom dengan tanda |.', $sql$SELECT c.course_name, COUNT(e.enrollment_id) AS enrollment_count, ROUND(AVG(e.score), 2) AS average_score FROM courses c JOIN enrollments e ON e.course_id = c.course_id GROUP BY c.course_id, c.course_name ORDER BY average_score DESC;$sql$, E'Sistem Informasi | 3 | 85.67\nBasis Data | 2 | 85\nMatematika Diskrit | 1 | 82'),
    ('tantangan-query-kampus', 'Ringkas pendaftaran bernilai minimal 80', 'Prediksi nama mata kuliah, jumlah record yang lolos, dan rata-ratanya. Satu record per baris; pisahkan kolom dengan tanda |.', $sql$SELECT c.course_name, COUNT(e.enrollment_id) AS enrollment_count, ROUND(AVG(e.score), 2) AS average_score FROM courses c JOIN enrollments e ON e.course_id = c.course_id WHERE e.score >= 80 GROUP BY c.course_id, c.course_name ORDER BY average_score DESC, c.course_name;$sql$, E'Sistem Informasi | 2 | 91.5\nBasis Data | 2 | 85\nMatematika Diskrit | 1 | 82')
)
insert into public.exercises (lesson_id, type, title, prompt, starter_code, config, position, is_required, is_published)
select l.id, 'PREDICT_OUTPUT', seed.title, seed.prompt, seed.starter_sql,
       jsonb_build_object('answer', jsonb_build_object('output', seed.expected_output)),
       1, true, true
from seed join public.lessons l on l.slug = seed.lesson_slug
on conflict (lesson_id, position) do update set
  type = excluded.type,
  title = excluded.title,
  prompt = excluded.prompt,
  starter_code = excluded.starter_code,
  config = excluded.config,
  is_required = true,
  is_published = true,
  updated_at = now();

with path as (
  select id from public.learning_paths where slug = 'database-fundamentals'
), seed(slug, title, instructions, type, gate_after_chapter, passing_score, position, course_weight_percent) as (
  values
    ('checkpoint-relasi-select', 'Checkpoint 1 · Relasi dan SELECT', 'Periksa pemahaman tentang tabel, key, sumber data, dan kolom hasil.', 'CHECKPOINT'::public.assessment_type, 2, 75, 1, 20),
    ('checkpoint-filter-order', 'Checkpoint 2 · Filter dan Urutan', 'Periksa pemahaman tentang kondisi, pengurutan, dan batas hasil.', 'CHECKPOINT'::public.assessment_type, 4, 75, 2, 20),
    ('checkpoint-join-ringkasan', 'Checkpoint 3 · JOIN dan Ringkasan', 'Periksa pemahaman tentang relasi key, JOIN, dan fungsi agregat.', 'CHECKPOINT'::public.assessment_type, 6, 75, 3, 20),
    ('tes-akhir-query-kampus', 'Tes Akhir · Query Kampus', 'Jawab pertanyaan terpadu tentang tabel mahasiswa, pendaftaran, dan mata kuliah.', 'FINAL'::public.assessment_type, 7, 75, 4, 40)
)
insert into public.assessments (
  learning_path_id, slug, title, instructions, type, gate_after_chapter,
  passing_score, position, course_weight_percent, is_published
)
select path.id, seed.slug, seed.title, seed.instructions, seed.type,
       seed.gate_after_chapter, seed.passing_score, seed.position,
       seed.course_weight_percent, true
from path cross join seed
on conflict (learning_path_id, slug) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  type = excluded.type,
  gate_after_chapter = excluded.gate_after_chapter,
  passing_score = excluded.passing_score,
  position = excluded.position,
  course_weight_percent = excluded.course_weight_percent,
  is_published = true,
  updated_at = now();

with seed(assessment_slug, position, type, title, topic, prompt, starter_sql, public_config, answer_config, weight) as (
  values
    ('checkpoint-relasi-select', 1, 'PSEUDOCODE'::public.exercise_type, 'Pilih pengenal mahasiswa', 'Primary key', 'Kolom mana yang paling tepat untuk mengidentifikasi satu record mahasiswa?', null, '{"mode":"choice","options":[{"id":"name","text":"name"},{"id":"cohort","text":"cohort"},{"id":"student_id","text":"student_id"}]}'::jsonb, '{"choiceId":"student_id"}'::jsonb, 1),
    ('checkpoint-relasi-select', 2, 'PREDICT_OUTPUT'::public.exercise_type, 'Baca kode mata kuliah', 'SELECT dan FROM', 'Tulis nilai hasil satu per baris tanpa header.', $sql$SELECT course_code FROM courses ORDER BY course_id;$sql$, '{}'::jsonb, jsonb_build_object('output', E'SI101\nIF102\nIF103'), 1),
    ('checkpoint-relasi-select', 3, 'PSEUDOCODE'::public.exercise_type, 'Tentukan sumber tabel', 'FROM', 'Klausa mana yang menyebut tabel tempat query membaca data?', null, '{"mode":"choice","options":[{"id":"select","text":"SELECT"},{"id":"from","text":"FROM"},{"id":"order","text":"ORDER BY"}]}'::jsonb, '{"choiceId":"from"}'::jsonb, 1),
    ('checkpoint-relasi-select', 4, 'PREDICT_OUTPUT'::public.exercise_type, 'Ambil dua mahasiswa pertama', 'LIMIT', 'Tulis nama yang muncul, satu nama per baris.', $sql$SELECT name FROM students ORDER BY student_id LIMIT 2;$sql$, '{}'::jsonb, jsonb_build_object('output', E'Alya\nBima'), 1),

    ('checkpoint-filter-order', 1, 'PREDICT_OUTPUT'::public.exercise_type, 'Saring angkatan 2024', 'WHERE', 'Tulis hasil satu nama per baris.', $sql$SELECT name FROM students WHERE cohort = '2024' ORDER BY name;$sql$, '{}'::jsonb, jsonb_build_object('output', E'Citra\nDanu'), 1),
    ('checkpoint-filter-order', 2, 'PSEUDOCODE'::public.exercise_type, 'Pilih logika AND', 'Kondisi', 'Query meminta nilai minimal 80 dan mata kuliah IF102. Operator mana yang mensyaratkan kedua kondisi terpenuhi?', null, '{"mode":"choice","options":[{"id":"and","text":"AND"},{"id":"or","text":"OR"},{"id":"limit","text":"LIMIT"}]}'::jsonb, '{"choiceId":"and"}'::jsonb, 1),
    ('checkpoint-filter-order', 3, 'PREDICT_OUTPUT'::public.exercise_type, 'Urutkan dan batasi mata kuliah', 'ORDER BY dan LIMIT', 'Tulis nama mata kuliah satu per baris.', $sql$SELECT course_name FROM courses ORDER BY course_name LIMIT 2;$sql$, '{}'::jsonb, jsonb_build_object('output', E'Basis Data\nMatematika Diskrit'), 1),
    ('checkpoint-filter-order', 4, 'PSEUDOCODE'::public.exercise_type, 'Pilih urutan operasi', 'ORDER BY', 'Query memakai ORDER BY credits DESC LIMIT 2. Operasi mana yang menentukan dua record teratas?', null, '{"mode":"choice","options":[{"id":"limit-first","text":"LIMIT memilih record sebelum diurutkan"},{"id":"sort-first","text":"ORDER BY mengurutkan dahulu, lalu LIMIT mengambil dua record"},{"id":"where","text":"WHERE mengurutkan record"}]}'::jsonb, '{"choiceId":"sort-first"}'::jsonb, 1),

    ('checkpoint-join-ringkasan', 1, 'PSEUDOCODE'::public.exercise_type, 'Cocokkan key mata kuliah', 'JOIN', 'Pasangan key mana yang menghubungkan pendaftaran ke mata kuliah?', null, '{"mode":"choice","options":[{"id":"wrong","text":"students.name = courses.course_name"},{"id":"right","text":"enrollments.course_id = courses.course_id"},{"id":"score","text":"enrollments.score = courses.credits"}]}'::jsonb, '{"choiceId":"right"}'::jsonb, 1),
    ('checkpoint-join-ringkasan', 2, 'PREDICT_OUTPUT'::public.exercise_type, 'Tampilkan pendaftar Basis Data', 'JOIN', 'Tulis nama dan nilai satu record per baris; pisahkan kolom dengan tanda |.', $sql$SELECT s.name, e.score FROM enrollments e JOIN students s ON s.student_id = e.student_id JOIN courses c ON c.course_id = e.course_id WHERE c.course_code = 'IF102' ORDER BY s.name;$sql$, '{}'::jsonb, jsonb_build_object('output', E'Alya | 90\nCitra | 80'), 1),
    ('checkpoint-join-ringkasan', 3, 'PSEUDOCODE'::public.exercise_type, 'Pilih fungsi penghitung', 'COUNT', 'Fungsi mana yang menghitung banyak record dalam setiap kelompok?', null, '{"mode":"choice","options":[{"id":"avg","text":"AVG"},{"id":"count","text":"COUNT"},{"id":"order","text":"ORDER BY"}]}'::jsonb, '{"choiceId":"count"}'::jsonb, 1),
    ('checkpoint-join-ringkasan', 4, 'PREDICT_OUTPUT'::public.exercise_type, 'Baca ringkasan Basis Data', 'GROUP BY', 'Tulis jumlah pendaftar dan rata-rata nilai untuk Basis Data, dipisahkan tanda |.', $sql$SELECT COUNT(e.enrollment_id), ROUND(AVG(e.score), 2) FROM enrollments e JOIN courses c ON c.course_id = e.course_id WHERE c.course_code = 'IF102';$sql$, '{}'::jsonb, jsonb_build_object('output', '2 | 85'), 1),

    ('tes-akhir-query-kampus', 1, 'PREDICT_OUTPUT'::public.exercise_type, 'Pendaftar bernilai minimal 80', 'WHERE dan JOIN', 'Tulis nama mahasiswa dan mata kuliah satu record per baris; pisahkan kolom dengan tanda |.', $sql$SELECT s.name, c.course_name FROM enrollments e JOIN students s ON s.student_id = e.student_id JOIN courses c ON c.course_id = e.course_id WHERE e.score >= 80 ORDER BY s.name, c.course_name;$sql$, '{}'::jsonb, jsonb_build_object('output', E'Alya | Basis Data\nAlya | Sistem Informasi\nBima | Matematika Diskrit\nCitra | Basis Data\nDanu | Sistem Informasi'), 1),
    ('tes-akhir-query-kampus', 2, 'PSEUDOCODE'::public.exercise_type, 'Pilih level ringkasan', 'GROUP BY', 'Untuk menghitung rata-rata nilai per mata kuliah, kolom mana yang menjadi dasar kelompok?', null, '{"mode":"choice","options":[{"id":"student","text":"students.student_id"},{"id":"course","text":"courses.course_id dan courses.course_name"},{"id":"score","text":"enrollments.score saja"}]}'::jsonb, '{"choiceId":"course"}'::jsonb, 1),
    ('tes-akhir-query-kampus', 3, 'PREDICT_OUTPUT'::public.exercise_type, 'Ringkas nilai yang lolos', 'COUNT dan AVG', 'Tulis nama mata kuliah, jumlah record, dan rata-rata (dua desimal), satu baris per mata kuliah; pisahkan kolom dengan tanda |.', $sql$SELECT c.course_name, COUNT(e.enrollment_id) AS enrollment_count, ROUND(AVG(e.score), 2) AS average_score FROM courses c JOIN enrollments e ON e.course_id = c.course_id WHERE e.score >= 80 GROUP BY c.course_id, c.course_name ORDER BY average_score DESC, c.course_name;$sql$, '{}'::jsonb, jsonb_build_object('output', E'Sistem Informasi | 2 | 91.5\nBasis Data | 2 | 85\nMatematika Diskrit | 1 | 82'), 1),
    ('tes-akhir-query-kampus', 4, 'PSEUDOCODE'::public.exercise_type, 'Pilih peran WHERE', 'Query terpadu', 'Pada query ringkasan, apa peran WHERE e.score >= 80?', null, '{"mode":"choice","options":[{"id":"aggregate","text":"Menyaring record pendaftaran sebelum diringkas"},{"id":"rename","text":"Mengganti nama tabel"},{"id":"sort","text":"Mengurutkan hasil akhir"}]}'::jsonb, '{"choiceId":"aggregate"}'::jsonb, 1)
)
insert into public.assessment_items (
  assessment_id, type, title, topic, prompt, starter_code,
  public_config, answer_config, weight, position
)
select a.id, seed.type, seed.title, seed.topic, seed.prompt, seed.starter_sql,
       seed.public_config, seed.answer_config, seed.weight, seed.position
from seed
join public.assessments a on a.slug = seed.assessment_slug
  and a.learning_path_id = (select id from public.learning_paths where slug = 'database-fundamentals')
on conflict (assessment_id, position) do update set
  type = excluded.type,
  title = excluded.title,
  topic = excluded.topic,
  prompt = excluded.prompt,
  starter_code = excluded.starter_code,
  public_config = excluded.public_config,
  answer_config = excluded.answer_config,
  entry_function = null,
  weight = excluded.weight;
