-- Reading-only public content; preserve IDs, exercises, results and progress.
-- Idempotent with scripts/seed-reading-materials.mjs. No schema/RLS changes.
WITH reading(slug, summary, content) AS (VALUES
('membaca-bentuk-data', 'Memahami tabel, kolom, record, dan schema melalui contoh data Kampus Mini.', $reading$Data kampus terdiri atas mahasiswa, mata kuliah, dan pendaftaran. Ketiganya berhubungan, tetapi menyimpan jenis fakta yang berbeda. Pemisahan ini membuat data lebih mudah dibaca dan mencegah identitas mahasiswa disalin berulang kali untuk setiap mata kuliah.

## Tabel menyimpan satu jenis fakta

Database mengumpulkan data yang saling berhubungan. Tabel students menyimpan mahasiswa, courses menyimpan mata kuliah, dan enrollments menyimpan pendaftaran. Satu mahasiswa dapat memiliki beberapa pendaftaran; pendaftaran bukan mahasiswa baru.

## Kolom adalah atribut, bukan isinya

Pada students, name adalah kolom; Alya adalah salah satu nilainya. cohort mencatat angkatan, sedangkan student_id membedakan mahasiswa. Semua record pada tabel yang sama mengikuti susunan kolom yang sama.

## Record dan schema

Satu baris lengkap, misalnya student_id 1, name Alya, cohort 2025, adalah satu record. Schema menjelaskan nama tabel, kolom, tipe nilai, dan aturan key. Menambah mahasiswa baru mengubah isi record, bukan otomatis menambah kolom.

## Contoh struktur dan isi

| student_id | name | cohort |
| --- | --- | --- |
| 1 | Alya | 2025 |
| 2 | Bima | 2025 |

Tabel di atas memiliki tiga kolom dan menampilkan dua record. `name` adalah atribut; `Alya` dan `Bima` adalah nilai atribut tersebut. Mengganti nama Bima mengubah satu nilai. Menambah mahasiswa mengubah jumlah baris. Menambah atribut baru, misalnya alamat, mengubah schema.

Tipe kolom menentukan bentuk nilai yang dapat disimpan. Identitas dapat berupa bilangan, nama berupa teks, dan nilai ujian berupa angka. Sebuah database bukan sekadar gambar tabel: struktur dan aturan datanya membuat informasi dapat ditelusuri dengan konsisten.

## Ringkasan

Tabel mengelompokkan satu jenis fakta. Kolom menjelaskan atribut, record menyatakan satu kejadian atau objek, dan schema menjelaskan struktur serta aturan. Banyaknya record pada tabel berbeda tidak harus sama.

## Video pendamping (opsional)

[Tabel, kolom, dan baris · Tri Fun Trik](https://www.youtube.com/watch?v=5xIl5EblCLk)

Video memakai contoh MySQL. Hubungkan konsep tabel, kolom, dan barisnya dengan Kampus Mini; kamu tidak perlu memasang software tambahan.
$reading$),
('key-dan-hubungan-antar-tabel', 'Ikuti pendaftaran ke mahasiswa dan mata kuliahnya lewat primary key serta foreign key.', $reading$Mahasiswa dan mata kuliah dapat dihubungkan melalui pendaftaran. Hubungan tersebut memakai identitas record, bukan kemiripan nama atau letak baris. Key menjelaskan bagaimana satu fakta merujuk fakta lain dengan konsisten.

## Primary key: identitas record

Primary key atau PK membedakan setiap record dalam satu tabel. students.student_id mengidentifikasi mahasiswa; nama dapat sama, tetapi PK tetap unik. PK tidak kosong. Nilai 1 pada students tidak berarti sama dengan nilai 1 pada enrollments karena keduanya mengidentifikasi objek yang berbeda.

## Foreign key: rujukan ke tabel lain

enrollments.student_id merujuk students.student_id, dan enrollments.course_id merujuk courses.course_id. Keduanya foreign key atau FK. Pendaftaran 2 mempunyai student_id 1 dan course_id 20: mahasiswa dan mata kuliahnya ditemukan lewat key, bukan urutan baris atau kemiripan nama.

## Satu-ke-banyak dan tabel penghubung

Alya mempunyai dua record enrollments: satu mahasiswa ke banyak pendaftaran. Satu mata kuliah juga mempunyai banyak pendaftaran. Mahasiswa dan mata kuliah memiliki hubungan banyak-ke-banyak melalui enrollments; score adalah nilai untuk satu pasangan mahasiswa–mata kuliah.

## Membaca hubungan secara visual

| Tabel asal | Kolom rujukan | Tabel tujuan | Identitas tujuan |
| --- | --- | --- | --- |
| enrollments | student_id | students | student_id |
| enrollments | course_id | courses | course_id |

Hubungan satu-ke-banyak berarti satu record induk dapat dirujuk banyak record anak. Rujukan yang sama boleh muncul pada beberapa pendaftaran; identitas pendaftarannya tetap berbeda. FK menjaga agar rujukan tidak menunjuk mahasiswa atau mata kuliah yang tidak ada.

Nilai 1 pada dua PK berbeda tidak menunjukkan hubungan. Hubungan hanya dinyatakan oleh pasangan kolom yang memang ditetapkan sebagai rujukan. Relasi juga tidak menjamin urutan tampilan record.

## Ringkasan

PK mengidentifikasi satu record dalam satu tabel. FK merujuk identitas record pada tabel lain. Tabel penghubung menyimpan hubungan banyak-ke-banyak sekaligus atribut hubungan tersebut, seperti nilai untuk satu pendaftaran.
$reading$),
('memilih-sumber-dan-kolom', 'Pilih tabel sumber dan atribut yang diminta tanpa mengubah record.', $reading$Permintaan daftar nama mahasiswa membutuhkan dua keputusan: tabel yang menyimpan mahasiswa dan kolom yang menyimpan namanya. SELECT dan FROM menyatakan kedua keputusan itu. Membaca data tidak mengubah record sumber.

## FROM: tentukan sumber

Pertanyaan menentukan jenis fakta yang dibutuhkan. Daftar mata kuliah berasal dari courses; daftar mahasiswa berasal dari students. FROM menentukan tabel sumber.

## SELECT: tentukan kolom

SELECT menentukan kolom hasil. `SELECT course_code, course_name FROM courses;` memilih dua atribut. `SELECT * FROM courses;` membantu inspeksi awal tetapi menampilkan semua kolom. Urutan kolom pada SELECT menjadi urutan kolom hasil.

## Bentuk hasil yang bisa dijelaskan

Hasil query adalah tabel baru untuk dibaca, bukan pemindahan record sumber. Tanpa ORDER BY, urutan baris tidak dijamin. Contoh memakai ORDER BY course_id agar hasil latihan stabil; pembahasan urutan ada pada materi berikutnya.

```sql
SELECT course_code, course_name
FROM courses
ORDER BY course_id;
```

## Contoh pembacaan

```sql
SELECT student_id, name
FROM students
ORDER BY student_id;
```

Hasil berisi kolom `student_id` dan `name`. Kolom `cohort` tetap tersimpan pada students, tetapi tidak dipilih untuk hasil ini. Urutan kolom mengikuti daftar SELECT. ORDER BY hanya memperjelas urutan tampilan.

`SELECT *` memilih semua kolom. Untuk kebutuhan informasi tertentu, daftar kolom eksplisit lebih mudah diperiksa. Kesalahan memilih tabel sumber tidak dapat diperbaiki hanya dengan mengganti nama kolom.

## Ringkasan

FROM menetapkan sumber record dan SELECT memilih kolom hasil. Query baca menghasilkan representasi data tanpa mengubah tabel sumber.

## Video pendamping (opsional)

[Memilih kolom dengan SELECT · Indonesia Belajar](https://www.youtube.com/watch?v=tfHe0qe9p44)

Contoh video memakai MySQL/MariaDB. Latihan Quethink memakai SQLite dan data berbeda; fokus pada SELECT dan FROM.
$reading$),
('menyaring-record', 'Uji batas nilai serta gabungan kondisi dengan memilih record yang memenuhi syarat.', $reading$Daftar pendaftaran dengan nilai minimal 80 berbeda dari daftar semua pendaftaran. Kondisi menentukan record yang termasuk dalam hasil. Memahami batas perbandingan membantu menghindari jawaban yang hampir benar tetapi keliru pada nilai tertentu.

## Perbandingan dan batas

WHERE memilih record yang memenuhi kondisi. `score >= 80` menerima 80, sedangkan `score > 80` tidak. `=` membandingkan kesamaan; teks memakai kutip tunggal. WHERE memilih baris, bukan menghapusnya.

## AND, OR, dan tanda kurung

AND meminta kedua kondisi benar. OR cukup salah satu kondisi benar. Gunakan tanda kurung saat menggabungkan keduanya agar maksudnya jelas: `(course_id = 10 OR course_id = 20) AND score >= 80`.

## Bukti dari record sumber

Pisahkan pekerjaan: pilih record lewat WHERE, pilih kolom lewat SELECT, lalu susun urutan lewat ORDER BY. Cocokkan setiap hasil ke satu enrollment pada objek data.

```sql
SELECT enrollment_id, score
FROM enrollments
WHERE score >= 80
ORDER BY enrollment_id;
```

## Membaca batas kondisi

| Nilai score | score > 80 | score >= 80 |
| --- | --- | --- |
| 74 | Tidak | Tidak |
| 80 | Tidak | Ya |
| 88 | Ya | Ya |

WHERE bekerja pada setiap record sumber. Record yang tidak memenuhi syarat tidak masuk hasil, tetapi tetap tersimpan. Kondisi pada teks, misalnya `name = 'Alya'`, memakai nilai teks dalam kutip tunggal; nama kolom tidak ditulis sebagai nilai teks.

## Ringkasan

Perbandingan menetapkan batas, AND meminta seluruh syarat benar, dan OR menerima salah satu syarat. Tanda kurung memperjelas kombinasi. SELECT memilih kolom; WHERE memilih baris.

## Video pendamping (opsional)

[Memilih baris dengan WHERE · Indonesia Belajar](https://www.youtube.com/watch?v=y5WgcuQn0_E)

Fokus pada WHERE, perbandingan, AND, dan OR. Operator tambahan di video belum menjadi sasaran latihan ini; gunakan tabel SQLite Quethink.
$reading$),
('mengurutkan-dan-membatasi', 'Cari nilai tertinggi dan pahami mengapa pengurutan harus dilakukan sebelum pembatasan.', $reading$Dua nilai tertinggi hanya dapat dipilih dengan benar jika hasil diurutkan terlebih dahulu. Pengurutan menentukan posisi record dalam hasil, sedangkan pembatasan menentukan jumlah record yang ditampilkan.

## ASC dan DESC

ORDER BY mengurutkan hasil, tidak mengubah urutan penyimpanan record. ASC berarti menaik; DESC menurun. Nilai berbeda pada enrollments.score membantu melihat dampaknya dengan jelas.

## Nilai seri dan tie-breaker

Jika nilai kolom urut sama, gunakan kolom kedua untuk menentukan urutan. Seluruh courses memiliki credits 3. `ORDER BY credits DESC, course_name ASC` mengurutkan nama saat credits seri.

## LIMIT setelah urutan

LIMIT membatasi jumlah hasil. Untuk dua nilai tertinggi, urutkan score DESC, gunakan enrollment_id sebagai pembeda, lalu LIMIT 2.

```sql
SELECT enrollment_id, score
FROM enrollments
ORDER BY score DESC, enrollment_id ASC
LIMIT 2;
```

## Contoh hasil dua nilai tertinggi

| enrollment_id | score |
| --- | --- |
| 6 | 95 |
| 1 | 88 |

Hasil tersebut berasal dari score menurun. Bila dua record memiliki score sama, enrollment_id menaik menjadi pembeda yang konsisten. Tanpa ORDER BY, database tidak menjanjikan urutan hasil; urutan yang pernah terlihat bukan aturan yang dapat diandalkan.

## Ringkasan

ASC mengurutkan menaik dan DESC menurun. Kolom pembeda menyelesaikan nilai seri. LIMIT mengambil sejumlah record dari hasil yang sudah diurutkan, tanpa menghapus record sumber.
$reading$),
('menghubungkan-tabel', 'Cocokkan key terlebih dahulu, lalu terjemahkan record penghubung menjadi informasi manusia.', $reading$Nama mahasiswa berada pada students, sementara nilainya berada pada enrollments. JOIN membaca informasi dari beberapa tabel dengan mencocokkan key yang menyatakan relasinya. Tabel sumber tetap terpisah dan tidak berubah.

## Dua tabel: cocokkan PK dan FK

INNER JOIN memasangkan record yang memenuhi ON. Mulai dari enrollments dan students: `ON students.student_id = enrollments.student_id`. Membandingkan enrollment_id dengan student_id dapat menghasilkan pasangan salah meskipun angka tampak sama.

```sql
SELECT students.name, enrollments.score
FROM enrollments
JOIN students ON students.student_id = enrollments.student_id
ORDER BY enrollments.enrollment_id;
```

## Mengapa nama bisa berulang?

Satu baris hasil JOIN ini mewakili satu pendaftaran, bukan satu mahasiswa unik. Alya muncul dua kali karena mempunyai dua pendaftaran. JOIN tidak otomatis menyatukan atau membuang duplikasi entitas.

## Tiga tabel dan alias

Tambahkan courses lewat course_id agar nama mata kuliah ikut terbaca. `AS s`, `AS e`, dan `AS c` adalah alias singkat untuk tabel, bukan tabel baru. Gunakan prefix saat nama kolom ada di lebih dari satu tabel.

```sql
SELECT s.name, c.course_name, e.score
FROM enrollments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_code = 'IF102'
ORDER BY s.name;
```

## Memahami satu baris hasil

Baris berisi nama Alya, nama mata kuliah, dan score menyatakan satu pendaftaran Alya. Dua baris bernama Alya dapat sama-sama benar bila mata kuliahnya berbeda. Banyak baris hasil tidak selalu berarti banyak mahasiswa berbeda.

INNER JOIN hanya menyertakan pasangan yang cocok. Mahasiswa tanpa pendaftaran tidak muncul ketika students digabung dengan enrollments memakai INNER JOIN. Menambahkan JOIN tidak boleh dilakukan sekadar agar semua tabel ikut; setiap tabel harus menyediakan informasi yang dibutuhkan.

## Ringkasan

JOIN menyatukan informasi pada hasil melalui kondisi ON. Pasangan PK/FK harus tepat. Alias menyingkat referensi tabel dan prefix memperjelas kolom yang namanya sama.

## Video pendamping (opsional)

[INNER JOIN dan pasangan key · Indonesia Belajar](https://www.youtube.com/watch?v=Chc1tUS_feU)

Contoh memakai MySQL/MariaDB. Fokus pada INNER JOIN ... ON; tulis pasangan PK/FK secara eksplisit pada data SQLite Quethink.
$reading$),
('merangkum-data', 'Kelompokkan pendaftaran dan jelaskan perbedaan jumlah peserta dengan rata-rata nilai.', $reading$Ringkasan menjawab pertanyaan tentang sekumpulan record: berapa jumlah pendaftaran dan berapa rata-rata nilainya. Satu baris hasil ringkasan dapat mewakili banyak record sumber, sehingga unit yang dihitung harus jelas.

## COUNT menghitung record

COUNT(*) menghitung baris hasil sumber. Dalam dataset ini setiap enrollment adalah satu pendaftaran. Jangan menyamakan jumlah enrollment dengan jumlah mahasiswa unik: Alya dan Bima masing-masing mempunyai dua enrollment.

## GROUP BY membentuk grup

GROUP BY course_id merangkum pendaftaran per mata kuliah. Pilih course 10: anggota grupnya enrollment #1, #3, dan #6. COUNT untuk grup tersebut membaca tiga record, bukan jumlah kolom atau jumlah credits.

```sql
SELECT course_id, COUNT(*) AS participants
FROM enrollments
GROUP BY course_id
ORDER BY course_id;
```

## AVG dan satu baris per grup

AVG(score) menghitung rata-rata nilai anggota grup. Untuk course 10, (88 + 74 + 95) / 3 ≈ 85,67. ROUND(..., 2) membulatkan angka; tampilan 85 dan 85.00 bernilai sama. JOIN menambahkan nama mata kuliah; GROUP BY tetap menentukan satu baris per mata kuliah yang punya enrollment.

## Contoh ringkasan nilai

```sql
SELECT course_id, COUNT(*) AS participants,
       ROUND(AVG(score), 2) AS average_score
FROM enrollments
GROUP BY course_id
ORDER BY course_id;
```

COUNT(*) menghitung semua record dalam grup. AVG(score) menghitung rata-rata nilai yang tidak NULL; keduanya tidak selalu memakai jumlah yang sama jika ada nilai kosong. Dataset contoh memiliki score terisi. Kolom yang dipilih di luar fungsi agregat sebaiknya ikut menentukan kelompok, sehingga arti setiap baris jelas.

## Ringkasan

COUNT menghitung record, AVG merangkum nilai, dan GROUP BY menetapkan kelompok. Jumlah pendaftaran bukan otomatis jumlah mahasiswa unik.
$reading$),
('tantangan-query-kampus', 'Gabungkan relasi, kondisi, dan ringkasan untuk menjawab pertanyaan kampus.', $reading$Laporan jumlah peserta dengan nilai minimal 85 per mata kuliah memadukan pemilihan sumber, hubungan tabel, penyaringan, pengelompokan, dan pengurutan. Setiap bagian query menjawab bagian berbeda dari kebutuhan informasi.

## Terjemahkan permintaan ke data

Nilai berada di enrollments, nama mata kuliah di courses. Gunakan relasi course_id untuk menggabungkan keduanya. Pertanyaan ini tidak membutuhkan students karena nama mahasiswa tidak diminta.

## Filter sebelum ringkasan

WHERE score >= 85 memilih enrollment sebelum GROUP BY membentuk grup. Rata-rata hanya memakai record yang lolos, bukan semua peserta. Menampilkan nama mata kuliah yang sama tidak berarti grup masih berisi record yang sama.

## Periksa hasil, bukan hanya query berhasil

Gunakan COUNT dan AVG, urutkan rata-rata menurun, dan gunakan nama sebagai pembeda jika seri. JOIN yang salah dapat memberi hasil terlihat masuk akal tetapi berasal dari pasangan salah.

## Contoh laporan terpadu

```sql
SELECT c.course_name, COUNT(*) AS participants,
       ROUND(AVG(e.score), 2) AS average_score
FROM enrollments AS e
JOIN courses AS c ON c.course_id = e.course_id
WHERE e.score >= 85
GROUP BY c.course_id, c.course_name
ORDER BY average_score DESC, c.course_name ASC;
```

Secara konseptual, sumber dan pasangan relasi menentukan record, WHERE membatasi record yang dibaca, GROUP BY membentuk kelompok, agregat menghasilkan ringkasan, dan ORDER BY mengurutkan hasil. Ini adalah model untuk menalar query, bukan jaminan urutan kerja internal mesin database.

Untuk course 10, nilai 74 tidak lolos batas 85, sehingga grup hanya memakai 88 dan 95. Jumlahnya dua dan rata-ratanya 91,5. Menurunkan batas dapat menambah anggota grup dan mengubah rata-rata.

## Ringkasan

Ketepatan query ditentukan oleh makna sumber, pasangan key, kondisi, kelompok, dan hasil. Sintaks yang diterima belum menjamin jawaban sesuai kebutuhan.
$reading$),
('menambahkan-record-dengan-insert', 'Tambahkan satu record baru dan selidiki aturan key sebelum menerapkan perubahan.', $reading$Eka adalah mahasiswa baru angkatan 2026. Identitasnya belum ada pada students. INSERT menyimpan satu record baru dengan nilai yang sesuai dengan kolom dan aturan key. Pendaftaran mata kuliahnya merupakan fakta lain yang perlu dicatat secara terpisah.

## Pasangan kolom dan nilai

INSERT menambah record. Tuliskan daftar kolom agar urutan nilai jelas: student_id, name, cohort berpasangan dengan 5, Eka, 2026. Teks memakai kutip tunggal.

```sql
INSERT INTO students (student_id, name, cohort)
VALUES (5, 'Eka', '2026');
```

## Key menjaga konsistensi

PK baru harus unik. student_id 1 sudah dipakai sehingga tidak dapat dipakai Eka. Jika menambah enrollment, student_id dan course_id harus merujuk record induk yang ada; nama Eka saja tidak cukup sebagai rujukan.

## Preview, terapkan, verifikasi

Lab membatasi satu record per perintah. Preview belum mengubah tabel; terapkan setelah kolom dan nilainya benar. Setelah diterapkan, data tabel 2D menampilkan record baru. Verifikasi dengan `SELECT * FROM students WHERE student_id = 5;`.

## Keadaan sebelum dan sesudah

| Keadaan | students | enrollments |
| --- | --- | --- |
| Sebelum Eka ditambahkan | 4 record | 6 record |
| Sesudah INSERT berhasil | 5 record | 6 record |

INSERT tidak membuat enrollment secara otomatis. Kegagalan karena identitas duplikat atau rujukan FK tidak valid berarti record baru tidak tersimpan. Kolom yang wajib diisi perlu mendapat nilai yang sesuai dengan aturan tabel.

## Ringkasan

INSERT menambah record dengan pasangan kolom dan nilai yang jelas. Key memastikan identitas dan rujukan konsisten. Keberhasilan diperiksa melalui record yang baru tersimpan; schema tidak berubah.
$reading$),
('mengubah-record-dengan-update', 'Perbaiki satu nilai dengan target primary key dan bukti sebelum/sesudah.', $reading$Nilai pendaftaran nomor 3 semula 74 dan perlu diperbaiki menjadi 78. UPDATE mengubah nilai pada record yang sudah ada. Identitas pendaftaran dan jumlah record tetap sama; hanya atribut yang ditetapkan dalam SET yang berubah.

## Temukan satu target

Mulai dengan `SELECT * FROM enrollments WHERE enrollment_id = 3;`. Bima mempunyai dua pendaftaran; student_id 2 bukan target yang cukup sempit. PK enrollment_id mengidentifikasi satu record.

## SET untuk nilai, WHERE untuk target

SET menentukan atribut baru; WHERE menentukan record yang menerima perubahan.

```sql
UPDATE enrollments
SET score = 78
WHERE enrollment_id = 3;
```

Tanpa WHERE, seluruh record bisa berubah pada database biasa; lab sengaja menolaknya. Jangan mengandalkan penolakan lab sebagai pengganti kebiasaan memilih target.

## Bukti sebelum dan sesudah

Preview memperlihatkan score 74 → 78 tanpa langsung menyimpan perubahan. Konfirmasi hanya jika record dan nilai benar. Objek lokal berubah setelah diterapkan; record enrollment #4 tetap bernilai 82. Gunakan SELECT dengan predicate yang sama untuk verifikasi.

## Keadaan sebelum dan sesudah

| enrollment_id | Score sebelum | Score sesudah |
| --- | --- | --- |
| 3 | 74 | 78 |
| 4 | 82 | 82 |

WHERE yang memakai student_id dapat mengenai beberapa pendaftaran mahasiswa yang sama. Identitas pendaftaran lebih tepat ketika yang diperbaiki hanya satu nilai. Perubahan yang aman dimulai dari target yang dapat dijelaskan, bukan dari perkiraan bahwa semua record dalam tabel harus menerima nilai baru.

## Ringkasan

UPDATE mengubah atribut record yang sudah ada. SET menyatakan nilai baru dan WHERE menyatakan target. Jumlah record tetap sama; verifikasi memastikan record lain tidak ikut berubah.
$reading$),
('menghapus-record-dengan-delete', 'Hapus satu pendaftaran dengan aman dan pahami rujukan yang membatasi penghapusan induk.', $reading$Pendaftaran nomor 6 dibatalkan. DELETE menghapus record pendaftaran itu, bukan otomatis menghapus mahasiswa atau mata kuliahnya. Target dan hubungan yang masih merujuk record harus diperhatikan sebelum penghapusan.

## DELETE memilih record untuk dihapus

DELETE menghilangkan record, bukan sekadar mengosongkan score. Periksa `SELECT * FROM enrollments WHERE enrollment_id = 6;` lalu gunakan predicate PK yang sama untuk DELETE.

```sql
DELETE FROM enrollments
WHERE enrollment_id = 6;
```

## Induk yang masih dirujuk

Danu adalah students #4; enrollment #6 merujuknya. Menghapus students #4 lebih dulu ditolak foreign key. Pada dataset ini tidak ada cascading delete. Menghapus enrollment #6 menghapus satu hubungan, bukan otomatis menghapus Danu atau mata kuliahnya.

## Konfirmasi dan pulihkan latihan

Preview menampilkan record target dan jumlah yang akan dihapus. Setelah diterapkan, objek enrollment #6 hilang dan hubungan terkaitnya ikut hilang. Verifikasi dengan SELECT, lalu Reset data untuk mengembalikan enam pendaftaran.

## Keadaan sebelum dan sesudah

| Keadaan | students | enrollments |
| --- | --- | --- |
| Sebelum pendaftaran 6 dihapus | 4 record | 6 record |
| Sesudah DELETE berhasil | 4 record | 5 record |

Penghapusan record anak tidak otomatis menghapus induknya. Sebaliknya, penghapusan induk dapat ditolak bila masih dirujuk. Aturan hubungan perlu dibaca, bukan diasumsikan. Penghapusan tanpa WHERE dapat menghilangkan seluruh record pada database biasa; lab Quethink membatasi tindakan ini pada satu target.

## Ringkasan

DELETE menghilangkan record yang dituju. Key dan relasi membatasi penghapusan. Preview dan verifikasi mendukung keputusan, sedangkan reset hanya memulihkan data latihan lokal.
$reading$)
)
UPDATE public.lessons AS lesson
SET content = reading.content, summary = reading.summary
FROM reading, public.chapters AS chapter, public.learning_paths AS path
WHERE lesson.slug = reading.slug AND lesson.chapter_id = chapter.id
  AND chapter.learning_path_id = path.id AND path.slug = 'database-fundamentals';
