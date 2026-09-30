# Materi Siap Ajar — Quethink Database Fundamentals

**Versi:** bahan ajar pilot 2.0, 29 September 2026

**Sasaran:** mahasiswa tahun pertama Informatika; diasumsikan belum pernah menulis SQL

**Status:** kurikulum disusun dalam tiga materi utama: Relasi, Write, dan Read. Urutan belajar adalah Relasi → Read → Write. Naskah Read yang sudah tersedia dipertahankan dan dikelompokkan ulang; submateri Relasi dan Write dilengkapi di versi ini. Kandidat video belum diverifikasi dan belum diterbitkan.

Dokumen ini menurunkan [rancangan jalur Basis Data](2026-09-29-rancangan-jalur-belajar-basis-data.md) menjadi tiga kelompok utama dan sebelas materi pendek. Setiap materi dapat memiliki subbagian Concept, Example, Inspect, Predict, Query, Result, Practice, dan Summary. Relasi menjadi fondasi; Read diajarkan sebelum Write agar mahasiswa mampu memeriksa sasaran perubahan. Cakupan model relasional dan penerjemahan kebutuhan menjadi query selaras dengan kompetensi CS2023 ([CS2023 — Query the Relational Model](https://csed.acm.org/query-the-relational-model/)).

## Cara Menggunakan Materi

Setiap unit dimulai dari pertanyaan data, bukan hafalan keyword. Mahasiswa melihat schema dan data kecil, memprediksi hasil, menulis SQL, menjalankannya, menelusuri perubahan konseptual, lalu menjelaskan hasil. Siklus ini membantu menemukan query yang **valid secara sintaks tetapi salah menjawab pertanyaan**.

Estimasi satu materi 20–40 menit: orientasi masalah (3–5 menit), membaca schema/data atau target (5 menit), contoh terpandu (5–10 menit), prediksi/eksplorasi (5–10 menit), latihan mandiri (8–12 menit), refleksi (2–3 menit). Materi Write menambah waktu untuk meninjau preview dan reset. Ini perkiraan UX untuk diuji, bukan ketentuan SKS.

Seluruh contoh memakai dataset sintetis **Kampus Mini** dengan tabel `students`, `courses`, dan `enrollments`, seperti didefinisikan pada dokumen rancangan. Hasil SELECT adalah himpunan baris yang benar; urutannya hanya dijamin jika query mencantumkan `ORDER BY`. Lab memakai SQLite WASM di browser Worker dan membatasi statement pada SELECT serta satu-baris INSERT, UPDATE bertarget, dan DELETE bertarget sesuai lesson. Data hanya berlaku selama sesi latihan, dapat di-reset, dan tidak tersimpan di Supabase. Dokumentasi SQLite menyebut urutan SELECT tidak didefinisikan tanpa `ORDER BY` ([SQLite SELECT](https://www.sqlite.org/lang_select.html)).

**Penilaian:** hasil SQLite di browser membantu eksplorasi dan feedback, tetapi bukan sumber nilai assessment. Assessment adalah nilai resmi di dalam Quethink dan memakai jawaban terstruktur yang diverifikasi di server; sistem tidak mengeksekusi SQL bebas mahasiswa terhadap dataset tersembunyi.

## Peta Materi Utama dan Materi

| Materi utama | Materi | Pertanyaan pemantik | Bukti belajar utama |
|---|---|---|---|
| **Relasi** | 1. Membaca Bentuk Data | Apa yang diwakili satu tabel, baris, dan kolom? | Mengidentifikasi struktur tabel dan record. |
| **Relasi** | 2. Key dan Hubungan Antar Tabel | Bagaimana menemukan baris dan menelusuri tabel terkait? | Menandai PK/FK dan menjelaskan jalur relasi. |
| **Read** | 3. Memilih Sumber dan Kolom | Dari tabel dan kolom mana jawaban dibentuk? | Menulis query satu tabel dengan `SELECT` dan `FROM`. |
| **Read** | 4. Memilih Baris dengan `WHERE` | Record mana yang memenuhi kondisi? | Menyusun predicate dan menguji kasus batas. |
| **Read** | 5. Mengurutkan dan Membatasi Hasil | Bagaimana memilih hasil teratas dengan aturan yang jelas? | `ORDER BY`, tie-breaker, dan `LIMIT`. |
| **Read** | 6. Membaca Relasi dengan `JOIN` | Bagaimana menggabungkan fakta dengan nama terkait? | `INNER JOIN ... ON ...` berdasarkan key. |
| **Read** | 7. Membuat Ringkasan Data | Berapa record per kelompok dan berapa rata-ratanya? | `COUNT`, `AVG`, dan `GROUP BY`. |
| **Read** | 8. Tantangan Query Kampus | Query apa yang menjawab pertanyaan baru dengan beberapa klausa? | Query integratif dan penjelasan setiap klausa. |
| **Write** | 9. Menambahkan Record dengan `INSERT` | Informasi apa yang diperlukan untuk menambah satu record valid? | Memasukkan satu baris dan mengenali constraint. |
| **Write** | 10. Mengubah Record dengan `UPDATE` | Bagaimana memastikan hanya target yang dimaksud berubah? | Preview dengan SELECT, update berdasarkan key, verifikasi. |
| **Write** | 11. Menghapus Record dengan `DELETE` | Apa dampak menghapus baris dan kapan relasi mencegahnya? | Preview, hapus satu record, cek FK, reset. |

---

## Relasi — Materi 1: Membaca Bentuk Data

### Tujuan

Mahasiswa dapat membedakan database, tabel, schema, record/baris, dan kolom/atribut pada contoh yang terlihat.

### Materi untuk mahasiswa

Database menyimpan data yang saling berkaitan. Sebuah tabel menyimpan satu jenis record; setiap baris mewakili satu kejadian atau entitas, sedangkan kolom menyatakan atributnya. Nama dan jumlah kolom membentuk schema. Nilai yang tampak di tabel adalah isi atau record saat ini. Tiga tabel pada Kampus Mini memiliki peran berbeda: `students` menyimpan mahasiswa, `courses` menyimpan mata kuliah, dan `enrollments` menyimpan pendaftaran.

Bayangkan satu spreadsheet besar yang mengulang nama mahasiswa, angkatan, kode mata kuliah, nama mata kuliah, dan nilai setiap kali mahasiswa mengambil kelas. Tiga tabel memisahkan jenis fakta itu agar dapat dirujuk bersama. Pada tahap ini, fokuskan perhatian pada **apa yang disimpan tiap tabel**; key dan cara menghubungkannya menjadi materi berikutnya.

### Contoh terpandu

Pada baris `students` dengan `student_id = 1`, satu record menyatakan seorang mahasiswa. Kolom `name` berisi nilai seperti “Alya”; kolom `cohort` berisi angkatan. Nama kolom adalah bagian schema, sementara “Alya” adalah nilai data. Satu record enrollment menyatakan satu pendaftaran mahasiswa pada sebuah mata kuliah.

### Aktivitas inspeksi

Tampilkan tabel secara vertikal pada layar kecil dan berdampingan bila ruang cukup. Minta mahasiswa memilih mana yang merupakan nama tabel, nama kolom, satu record, dan nilai sel. Lalu cocokkan pertanyaan berikut ke tabel sumber:

- “Siapa mahasiswa angkatan 2025?” → `students`
- “Apa nama mata kuliah dan jumlah kreditnya?” → `courses`
- “Mata kuliah apa yang diambil seorang mahasiswa?” → fakta awal ada di `enrollments`, lalu perlu menelusuri hubungan pada materi berikutnya.

### Latihan formatif

**Pertanyaan:** apakah `cohort` adalah nama tabel, nama kolom, atau nilai record?

- **Kunci:** nama kolom pada `students`.
- **Feedback benar:** schema menyebut atribut, record menyimpan nilai untuk atribut itu.
- **Hint jika salah:** lihat apakah kata itu muncul sebagai judul kolom atau isi sebuah sel.

### Ringkasan

- Tabel menyimpan kumpulan record sejenis.
- Baris adalah satu record; kolom adalah satu atribut.
- Schema menjelaskan struktur, sedangkan isi tabel berisi nilai aktual.
- Pilih tabel berdasarkan fakta yang disimpan di dalamnya.

---

## Relasi — Materi 2: Key dan Hubungan Antar Tabel

### Tujuan

Setelah unit ini, mahasiswa dapat membedakan tabel, baris, dan kolom; menemukan primary key dan foreign key; serta mengikuti relasi mahasiswa → pendaftaran → mata kuliah.

### Materi untuk mahasiswa

Bayangkan satu lembar daftar pendaftaran berisi nama mahasiswa, angkatan, nama mata kuliah, kode mata kuliah, dan nilai. Jika satu mahasiswa mengambil tiga mata kuliah, namanya dan angkatannya akan ditulis berulang. Jika nama mata kuliah diperbaiki, kita harus memperbaiki beberapa baris. Basis data relasional menyimpan bagian data yang berbeda pada tabel yang terhubung oleh key.

Pada dataset kita, `students` menyimpan identitas mahasiswa, `courses` menyimpan mata kuliah, dan `enrollments` menyimpan fakta bahwa seorang mahasiswa mengambil sebuah mata kuliah beserta nilainya. Satu `student_id` dapat muncul pada banyak pendaftaran; satu `course_id` juga dapat muncul pada banyak pendaftaran. Karena itu `enrollments` menjadi tabel penghubung untuk relasi banyak-ke-banyak.

**Primary key (PK)** mengidentifikasi satu baris secara unik dalam tabelnya. **Foreign key (FK)** adalah nilai pada tabel yang menunjuk ke key tabel lain. Nama bukan pilihan key yang aman: dua mahasiswa dapat memiliki nama sama, dan nama dapat berubah. Dalam SQLite, deklarasi FK harus benar-benar diaktifkan pada koneksi dengan `PRAGMA foreign_keys = ON`; tanpa itu, constraint dapat tercantum di schema tetapi tidak ditegakkan ([SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html)). Pengaturan ini dilakukan oleh playground, bukan tugas SQL mahasiswa pada unit ini.

### Contoh terpandu

Untuk menjawab **“Mata kuliah apa saja yang diambil Alya?”**, kita membutuhkan nama Alya dari `students`, fakta pendaftarannya dari `enrollments`, dan nama mata kuliah dari `courses`. Jalurnya:

```text
students.student_id
        ↓ cocok dengan
enrollments.student_id
        → enrollments.course_id
        ↓ cocok dengan
courses.course_id
```

Belum perlu menulis JOIN pada unit ini. Tujuannya ialah memilih tabel yang dibutuhkan dan menyebutkan key penghubung sebelum mulai menulis query.

### Aktivitas prediksi dan eksplorasi

Tampilkan tiga kartu tabel tanpa garis relasi. Minta mahasiswa:

1. Menandai satu kolom yang dapat membedakan setiap mahasiswa.
2. Menandai kolom di `enrollments` yang menunjuk ke mahasiswa dan mata kuliah.
3. Menarik hubungan `students → enrollments` dan `courses → enrollments`.
4. Memprediksi berapa baris pendaftaran yang mungkin dimiliki satu mahasiswa.

Setelah jawaban dipilih, tampilkan garis key dan jelaskan bahwa banyak pendaftaran untuk satu mahasiswa adalah data yang sah, bukan duplikasi yang harus dihapus.

### Latihan formatif, kunci, dan feedback

**Latihan A — Pilih key.** Kolom apa yang paling tepat untuk mengidentifikasi satu mahasiswa: `name`, `cohort`, atau `student_id`?

- **Kunci:** `student_id`.
- **Feedback benar:** key harus tetap menunjuk pada satu mahasiswa meskipun nama sama atau angkatan sama.
- **Hint jika salah:** apakah nama atau angkatan pasti unik untuk setiap orang?

**Latihan B — Pilih tabel.** Untuk menjawab “siapa mengambil mata kuliah apa?”, tabel apa yang perlu ditelusuri?

- **Kunci:** ketiga tabel: `students`, `enrollments`, `courses`.
- **Feedback benar:** `enrollments` menghubungkan identitas mahasiswa dengan identitas mata kuliah.
- **Hint jika hanya memilih dua tabel:** tabel mana yang menyimpan pasangan `student_id` dan `course_id`?

**Latihan C — Deteksi relasi.** `student_id = 1` muncul pada dua baris `enrollments`. Apakah salah satu baris harus dihapus?

- **Kunci:** tidak; mahasiswa dapat mengambil lebih dari satu mata kuliah.
- **Feedback:** nilai FK boleh berulang di tabel anak; yang harus unik adalah PK pada tabel induk.

### Ringkasan

- Tabel menyimpan jenis fakta yang berbeda; baris adalah satu record, kolom adalah satu atribut.
- PK mengidentifikasi record pada tabelnya; FK menunjuk ke PK tabel lain.
- `enrollments` menghubungkan mahasiswa dengan mata kuliah dan dapat berisi FK yang berulang.
- Sebelum menulis query lintas tabel, temukan jalur key-nya.

**Exit ticket:** jelaskan dengan satu kalimat mengapa `enrollments` diperlukan.

---

## Read — Materi 1: Memilih Sumber dan Kolom

### Tujuan

Mahasiswa dapat memetakan pertanyaan sederhana ke tabel sumber (`FROM`) dan memilih kolom jawaban (`SELECT`), serta membedakan kolom hasil dari baris sumber.

### Materi untuk mahasiswa

SQL adalah cara menyatakan data yang ingin kita lihat. `FROM` menyebut tabel sumber. `SELECT` menyebut kolom yang ditampilkan. Pada unit ini kita memakai satu tabel agar perhatian tertuju pada hubungan antara pertanyaan dan bentuk hasil.

`SELECT *` berarti “tampilkan semua kolom”. Ini berguna untuk memeriksa isi tabel saat eksplorasi, tetapi query jawaban sebaiknya meminta hanya kolom yang dibutuhkan. Memilih `name` tidak otomatis membuang baris; untuk menyaring baris diperlukan `WHERE`, yang akan dipelajari pada unit berikutnya.

### Contoh terpandu

**Pertanyaan:** “Tampilkan nama dan angkatan semua mahasiswa.”

```sql
SELECT name, cohort
FROM students;
```

Hasil memiliki dua kolom (`name`, `cohort`) dan empat baris. Himpunan isinya:

| name | cohort |
|---|---|
| Alya | 2025 |
| Bima | 2025 |
| Citra | 2024 |
| Danu | 2024 |

Tanpa `ORDER BY`, engine tidak menjanjikan urutan baris tertentu. Tabel latihan boleh menampilkannya dalam urutan stabil untuk memudahkan pembacaan, tetapi urutan itu bukan bagian dari jaminan query.

### Aktivitas prediksi

Sebelum Run, tampilkan query `SELECT course_code FROM courses;`. Minta mahasiswa memilih:

- berapa kolom yang akan muncul;
- berapa baris yang akan muncul;
- apakah semua kolom dari tabel akan tampak.

**Jawaban:** satu kolom, tiga baris, dan hanya `course_code`.

Visualizer menyorot tabel sumber, lalu kolom yang dipilih. Ia tidak menyorot atau menghapus baris karena belum ada filter.

### Latihan formatif, kunci, dan feedback

**Latihan A — Kode mata kuliah.** Tulis query untuk menampilkan kode dan nama semua mata kuliah.

```sql
SELECT course_code, course_name
FROM courses;
```

- **Feedback benar:** `courses` adalah sumber untuk kode dan nama mata kuliah.
- **Hint 1:** cari tabel yang memiliki kedua kolom.
- **Hint 2:** nama kolom ditulis setelah `SELECT`, tabel setelah `FROM`.

**Latihan B — Hanya nama mahasiswa.** Tulis query yang menghasilkan satu kolom `name` dari tabel mahasiswa.

```sql
SELECT name
FROM students;
```

- **Feedback benar:** hasil memiliki satu kolom; seluruh record mahasiswa tetap menjadi sumber.
- **Kesalahan umum:** `SELECT *` menghasilkan query valid, tetapi kolomnya lebih banyak dari yang diminta.

**Latihan C — Diagnosis makna.** Query `SELECT cohort FROM students;` menampilkan cohort setiap mahasiswa. Apakah query itu hanya menampilkan mahasiswa dari cohort tertentu?

- **Kunci:** tidak; query memilih kolom `cohort`, bukan menyaring record.
- **Hint:** bandingkan jumlah record sumber dengan jumlah baris hasil.

### Ringkasan

- `FROM` memilih tabel sumber.
- `SELECT` memilih kolom hasil.
- `SELECT` sendiri tidak menyaring baris.
- Hasil tanpa `ORDER BY` tidak mempunyai urutan yang dijamin.

**Exit ticket:** untuk pertanyaan “tampilkan nama mata kuliah”, sebutkan tabel dan kolom yang akan dipakai.

---

## Read — Materi 2: Memilih Baris dengan `WHERE`

### Tujuan

Mahasiswa dapat menulis predicate dengan operator perbandingan serta menggabungkan kondisi menggunakan `AND` atau `OR`; mahasiswa dapat menjelaskan baris yang lolos dan yang tidak.

### Materi untuk mahasiswa

`WHERE` memeriksa setiap baris sumber. Baris yang kondisinya benar diteruskan ke tahap hasil; baris yang kondisinya salah tidak ditampilkan. `SELECT` tetap menentukan kolom yang terlihat. Dengan demikian, kondisi dan kolom hasil adalah dua keputusan yang berbeda.

Gunakan `=` untuk sama dengan, `<>` untuk tidak sama dengan, dan `<`, `<=`, `>`, `>=` untuk membandingkan nilai. Nilai teks ditulis di antara tanda petik tunggal, misalnya `'2025'`. `AND` mensyaratkan kedua kondisi benar; `OR` menerima baris jika salah satu kondisi benar. Untuk mencampur `AND` dan `OR`, gunakan tanda kurung agar maksud query jelas.

### Contoh terpandu

**Pertanyaan:** “Pendaftaran mana yang memiliki skor setidaknya 80?”

```sql
SELECT enrollment_id, score
FROM enrollments
WHERE score >= 80;
```

Baris yang cocok adalah `(1, 88)`, `(2, 90)`, `(4, 82)`, `(5, 80)`, dan `(6, 95)`. Nilai tepat 80 ikut karena operatornya `>=`, bukan `>`.

### Aktivitas prediksi

Tampilkan angka nilai tanpa query. Minta mahasiswa menyeret setiap baris ke kolom **lolos** atau **tidak lolos** untuk `score >= 80`. Setelah itu, Run query dan bandingkan keputusan. Trace menunjukkan kondisi tiap baris; hasil akhirnya tetap dihasilkan oleh SQLite.

### Latihan formatif, kunci, dan feedback

**Latihan A — Uji batas.** Tampilkan pendaftaran dengan skor dari 80 sampai 90, termasuk kedua batas.

```sql
SELECT enrollment_id, score
FROM enrollments
WHERE score >= 80 AND score <= 90;
```

**Kunci:** ID `1`, `2`, `4`, dan `5` dengan skor `88`, `90`, `82`, `80`.

- **Feedback benar:** kedua syarat harus benar, sehingga 80 dan 90 ikut.
- **Hint:** tulis rentang sebagai “minimal 80 **dan** maksimal 90”.
- **Kesalahan batas:** jika memakai `score > 80`, record bernilai 80 hilang.

**Latihan B — Cari nilai ekstrem.** Tampilkan pendaftaran dengan skor di bawah 75 atau di atas 90.

```sql
SELECT enrollment_id, score
FROM enrollments
WHERE score < 75 OR score > 90;
```

**Kunci:** `(3, 74)` dan `(6, 95)`.

- **Feedback benar:** `OR` tepat karena ada dua rentang alternatif.
- **Hint:** apakah sebuah baris harus sekaligus lebih kecil dari 75 dan lebih besar dari 90? Tidak; gunakan `OR`.

**Latihan C — Cohort sebagai teks.** Tampilkan nama mahasiswa cohort 2025.

```sql
SELECT name
FROM students
WHERE cohort = '2025';
```

**Kunci:** Alya dan Bima; urutan tidak dijamin.

- **Kesalahan umum:** nilai teks tanpa tanda petik dianggap nama kolom atau identifier, bukan teks cohort.

### Ringkasan

- `WHERE` menyaring baris sumber.
- Operator batas menentukan apakah nilai tepat pada batas diterima.
- `AND` berarti semua kondisi harus benar; `OR` berarti salah satu kondisi cukup.
- Teks memakai tanda petik tunggal; query di atas belum mengajarkan nilai `NULL`.

**Exit ticket:** apa beda hasil untuk `score > 80` dan `score >= 80`?

---

## Read — Materi 3: Mengurutkan dan Membatasi Hasil

### Tujuan

Mahasiswa dapat menyusun urutan naik atau turun dengan `ORDER BY`, menambahkan tie-breaker sederhana, dan memakai `LIMIT` untuk menentukan jumlah baris teratas.

### Materi untuk mahasiswa

Tanpa `ORDER BY`, jangan mengandalkan urutan baris yang kebetulan muncul. Urutan penyimpanan bukan aturan tampilan. `ORDER BY score DESC` menaruh skor terbesar di awal; `ASC` menaruh nilai terkecil di awal dan merupakan arah bawaan jika tidak ditulis. Jika dua skor sama, tambahkan kolom kedua untuk menentukan urutan yang stabil. `LIMIT n` membatasi hasil menjadi paling banyak `n` baris ([SQLite SELECT — ORDER BY dan LIMIT](https://www.sqlite.org/lang_select.html)).

### Contoh terpandu

**Pertanyaan:** “Tampilkan tiga pendaftaran dengan skor tertinggi. Jika skor sama, tampilkan ID pendaftaran lebih kecil lebih dulu.”

```sql
SELECT enrollment_id, student_id, course_id, score
FROM enrollments
ORDER BY score DESC, enrollment_id ASC
LIMIT 3;
```

| enrollment_id | student_id | course_id | score |
|---:|---:|---:|---:|
| 6 | 4 | 10 | 95 |
| 2 | 1 | 20 | 90 |
| 1 | 1 | 10 | 88 |

`ORDER BY` menentukan siapa yang berada di urutan atas; `LIMIT 3` mengambil tiga baris pertama setelah pengurutan. Bila `LIMIT 3` digunakan tanpa aturan urutan, query tidak menyatakan “tiga teratas”.

### Aktivitas prediksi

Berikan enam skor dalam posisi acak. Mahasiswa mengurutkannya sendiri, menentukan tie-breaker, lalu memilih tiga teratas. Jalankan query dan bandingkan ranking. Ubah ke `ASC` dan prediksi baris pertama. Tanyakan: “Apa yang berubah ketika arah berubah? Apakah jumlah baris berubah?”

### Latihan formatif, kunci, dan feedback

**Latihan A — Dua skor tertinggi di bawah 90.**

```sql
SELECT enrollment_id, score
FROM enrollments
WHERE score < 90
ORDER BY score DESC, enrollment_id ASC
LIMIT 2;
```

**Kunci:** `(1, 88)` lalu `(4, 82)`.

- **Feedback benar:** filter dikerjakan pada baris yang memenuhi `< 90`, lalu data diurutkan sebelum dibatasi.
- **Hint 1:** sebutkan filter dahulu, lalu aturan ranking.
- **Kesalahan umum:** `LIMIT 2` tidak berarti dua skor tertinggi kecuali `ORDER BY` sudah menyatakannya.

**Latihan B — Tiga nilai terendah.** Tulis query dengan hasil berisi tiga nilai paling kecil, dan jika nilainya sama urutkan dengan `enrollment_id`.

```sql
SELECT enrollment_id, score
FROM enrollments
ORDER BY score ASC, enrollment_id ASC
LIMIT 3;
```

**Kunci:** `(3, 74)`, `(5, 80)`, `(4, 82)`.

- **Feedback:** `ASC` untuk rendah-ke-tinggi; jangan mengganti `LIMIT` menjadi filter.

### Ringkasan

- Urutan hanya dijamin jika dinyatakan dengan `ORDER BY`.
- `ASC` naik; `DESC` turun.
- Tie-breaker memperjelas urutan ketika nilai utama sama.
- `LIMIT` membatasi jumlah baris setelah query menetapkan urutannya.

**Exit ticket:** mengapa `LIMIT 1` saja tidak menjawab pertanyaan “skor tertinggi”?

---

## Read — Materi 4: Membaca Relasi dengan `JOIN`

### Tujuan

Mahasiswa dapat menulis `INNER JOIN ... ON ...` melalui PK/FK yang cocok, membaca hasil pasangan record, dan menjelaskan mengapa satu mahasiswa dapat muncul pada beberapa baris.

### Materi untuk mahasiswa

Informasi mahasiswa, mata kuliah, dan nilai berada di tabel berbeda. `JOIN` membentuk baris gabungan ketika kondisi `ON` cocok. Pada `INNER JOIN`, pasangan tanpa kecocokan tidak ikut di hasil. Hubungkan key yang memiliki arti sama: `students.student_id` dengan `enrollments.student_id`, serta `courses.course_id` dengan `enrollments.course_id`.

Satu mahasiswa dapat muncul berulang karena setiap pendaftaran adalah satu fakta yang berbeda. Itu bukan kesalahan bila pertanyaan memang menanyakan setiap pendaftaran. Untuk membantu membaca query panjang, kita dapat memberi alias seperti `s` untuk `students`, `e` untuk `enrollments`, dan `c` untuk `courses`.

### Contoh terpandu

**Pertanyaan:** “Siapa yang mengambil Basis Data dan berapa nilainya?”

```sql
SELECT s.name, c.course_name, e.score
FROM enrollments AS e
INNER JOIN students AS s ON s.student_id = e.student_id
INNER JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_code = 'IF102'
ORDER BY s.name;
```

| name | course_name | score |
|---|---|---:|
| Alya | Basis Data | 90 |
| Citra | Basis Data | 80 |

Trace konseptual: mulai dari fakta `enrollments`; cocokkan setiap FK ke PK; pilih course `IF102`; tampilkan nama, course, dan score; urutkan berdasarkan nama. Jangan menyebut trace sebagai urutan fisik yang wajib dipakai SQLite.

### Aktivitas prediksi

Tampilkan satu enrollment, misalnya `(student_id=1, course_id=20, score=90)`, lalu kartu student dan course yang tersedia. Minta mahasiswa menghubungkan enrollment itu ke `Alya` dan `Basis Data`. Ulangi untuk seluruh pendaftaran, kemudian bandingkan pasangan yang diprediksi dengan hasil JOIN.

Visualizer 2D menampilkan tabel, key, dan garis relasi; hasil query tetap berupa tabel semantik yang sama dan menjadi sumber data diagram.

### Latihan formatif, kunci, dan feedback

**Latihan A — Daftar setiap pendaftaran.** Tampilkan nama mahasiswa, nama mata kuliah, dan nilai untuk semua pendaftaran.

```sql
SELECT s.name, c.course_name, e.score
FROM enrollments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
ORDER BY s.student_id, c.course_id;
```

**Kunci:** enam baris:

| name | course_name | score |
|---|---|---:|
| Alya | Sistem Informasi | 88 |
| Alya | Basis Data | 90 |
| Bima | Sistem Informasi | 74 |
| Bima | Matematika Diskrit | 82 |
| Citra | Basis Data | 80 |
| Danu | Sistem Informasi | 95 |

- **Feedback benar:** ada enam fakta pendaftaran, sehingga output enam baris.
- **Hint:** satu JOIN menghubungkan mahasiswa; JOIN kedua menghubungkan mata kuliah.

**Latihan B — Perbaiki key.** Query menghasilkan nol baris karena mencocokkan `s.student_id = c.course_id`. Pasangan apa yang seharusnya dibandingkan?

- **Kunci:** hubungkan `s.student_id = e.student_id` dan `c.course_id = e.course_id`.
- **Feedback:** cocokkan domain key dan relasi di schema, bukan dua kolom yang kebetulan sama-sama bernama ID.
- **Hint:** gambar jalur `students → enrollments → courses` sebelum mengubah `ON`.

**Latihan C — Jelaskan banyak baris.** Mengapa Alya muncul dua kali pada Latihan A?

- **Kunci:** ada dua record pendaftaran milik Alya.
- **Feedback:** JOIN mengikuti pasangan yang cocok; ia tidak otomatis meringkas baris menjadi satu per mahasiswa.

### Ringkasan

- `JOIN` menggabungkan record yang memenuhi kondisi `ON`.
- `INNER JOIN` hanya menampilkan pasangan yang cocok.
- Jalur query lintas tabel mengikuti relasi key pada schema.
- Banyak baris untuk satu entitas dapat benar ketika tabel penghubung menyimpan beberapa fakta.

**Exit ticket:** tandai FK dan PK yang digunakan oleh dua JOIN pada contoh.

---

## Read — Materi 5: Membuat Ringkasan Data

### Tujuan

Mahasiswa dapat mengelompokkan baris berdasarkan atribut mata kuliah, menghitung jumlah pendaftaran, menghitung rata-rata score, dan menyebutkan arti satu baris hasil agregasi.

### Materi untuk mahasiswa

Sebelum `GROUP BY`, satu baris enrollment mewakili satu pendaftaran. Setelah `GROUP BY course`, baris-baris enrollment dengan course yang sama diletakkan pada satu kelompok. `COUNT` menghitung nilai/baris pada kelompok, sedangkan `AVG` menghitung rerata angka pada kelompok. Setiap baris hasil sekarang berarti **satu kelompok**, bukan satu pendaftaran.

Pertanyaan pentingnya adalah “apa unit yang sedang dihitung?” Pada materi ini `COUNT(enrollment_id)` menghitung pendaftaran, bukan mahasiswa unik. `COUNT(DISTINCT ...)`, `HAVING`, dan kelompok kosong ditunda agar mahasiswa terlebih dulu memahami satu tingkat agregasi. SQLite mendokumentasikan bahwa `GROUP BY` membentuk kelompok dari baris hasil filter dan menghasilkan satu baris per kelompok ([SQLite SELECT processing](https://www.sqlite.org/lang_select.html)).

### Contoh terpandu

**Pertanyaan:** “Berapa pendaftaran dan berapa rata-rata nilai untuk setiap mata kuliah?”

```sql
SELECT c.course_name,
       COUNT(e.enrollment_id) AS enrollment_count,
       ROUND(AVG(e.score), 2) AS average_score
FROM courses AS c
JOIN enrollments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY AVG(e.score) DESC;
```

| course_name | enrollment_count | average_score |
|---|---:|---:|
| Sistem Informasi | 3 | 85.67 |
| Basis Data | 2 | 85.00 |
| Matematika Diskrit | 1 | 82.00 |

`COUNT` menghasilkan 3, 2, dan 1 karena jumlah baris enrollment per course seperti itu. `AVG` menghitung rata-rata dari score pada kelompok masing-masing. `ROUND(..., 2)` hanya membatasi angka yang ditampilkan ke dua desimal.

### Aktivitas prediksi

Sebelum Run, susun enam kartu enrollment ke dalam kelompok course. Minta mahasiswa memprediksi jumlah kartu di setiap kelompok, lalu menambahkan score dan memprediksi rerata. Setelah query dijalankan, trace menampilkan anggota kelompok dan asal `COUNT`/`AVG`.

Tanyakan: “Jika satu baris output menyatakan satu course, berapa baris output yang diharapkan?” **Jawaban:** tiga, satu untuk tiap course yang memiliki pendaftaran.

### Latihan formatif, kunci, dan feedback

**Latihan A — Jumlah pendaftaran per course.** Tulis query yang menghasilkan nama course dan jumlah pendaftar.

```sql
SELECT c.course_name, COUNT(e.enrollment_id) AS enrollment_count
FROM courses AS c
JOIN enrollments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name;
```

**Kunci:** Sistem Informasi `3`; Basis Data `2`; Matematika Diskrit `1` (urutan tidak dijamin tanpa `ORDER BY`).

- **Feedback benar:** hitungan dibuat setelah record dipisahkan per course.
- **Hint:** kolom identitas kelompok harus dicantumkan di `GROUP BY`.

**Latihan B — Rata-rata per course.** Tambahkan rerata score ke query di atas.

```sql
SELECT c.course_name, ROUND(AVG(e.score), 2) AS average_score
FROM courses AS c
JOIN enrollments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name;
```

**Kunci:** Sistem Informasi `85.67`; Basis Data `85.00`; Matematika Diskrit `82.00`.

- **Feedback:** rerata harus dihitung di dalam setiap grup. Jangan merata-ratakan jumlah pendaftar.
- **Hint:** fungsi yang menghitung mean adalah `AVG(score)`.

**Latihan C — Baca level hasil.** Apakah baris hasil agregasi mewakili mahasiswa, pendaftaran, atau mata kuliah?

- **Kunci:** mata kuliah.
- **Feedback:** lihat atribut `course_name` pada `GROUP BY`; semua enrollment dengan course yang sama menjadi satu grup.

### Ringkasan

- `GROUP BY` menentukan arti satu baris ringkasan.
- `COUNT(enrollment_id)` di sini menghitung pendaftaran.
- `AVG(score)` menghitung rerata nilai di tiap grup.
- Tabel tanpa enrollment tidak muncul karena contoh memakai `INNER JOIN`.

**Exit ticket:** bedakan “jumlah pendaftaran” dengan “jumlah mahasiswa unik”. Konsep kedua belum dihitung pada unit ini.

---

## Read — Materi 6: Tantangan Query Kampus

### Tujuan

Mahasiswa dapat mengurai pertanyaan baru, memilih tabel dan jalur key, menyusun filter, grouping dan agregasi, mengurutkan, membatasi hasil, lalu membuktikan jawabannya dari data sumber.

### Misi

**Pertanyaan:** “Di antara pendaftaran dengan nilai minimal 80, mata kuliah mana yang memiliki rata-rata nilai tertinggi? Tampilkan nama mata kuliah, jumlah pendaftaran yang dihitung, dan rata-ratanya.”

Sebelum menulis query, lengkapi rencana berikut:

1. **Fakta yang dianalisis:** score berada pada `enrollments`.
2. **Nama mata kuliah:** berada pada `courses`.
3. **Relasi:** `enrollments.course_id = courses.course_id`.
4. **Baris yang masuk:** hanya `score >= 80`.
5. **Level ringkasan:** satu baris per mata kuliah.
6. **Ranking:** rata-rata tertinggi lebih dulu; hasil pertama yang diperlukan.

### Prediksi sebelum Run

Nilai minimal 80 yang masuk ke perhitungan:

- Sistem Informasi: 88 dan 95 → rerata 91.5, dua enrollment.
- Basis Data: 90 dan 80 → rerata 85, dua enrollment.
- Matematika Diskrit: 82 → rerata 82, satu enrollment.

Minta mahasiswa memilih hasil teratas dan alasannya. Jangan tampilkan jawaban query sampai prediksi dikirim.

### Query pembahasan

```sql
SELECT c.course_name,
       COUNT(e.enrollment_id) AS enrollment_count,
       ROUND(AVG(e.score), 2) AS average_score
FROM enrollments AS e
JOIN courses AS c ON c.course_id = e.course_id
WHERE e.score >= 80
GROUP BY c.course_id, c.course_name
ORDER BY AVG(e.score) DESC, c.course_code ASC
LIMIT 1;
```

Hasil:

| course_name | enrollment_count | average_score |
|---|---:|---:|
| Sistem Informasi | 2 | 91.50 |

Trace pembelajaran: ambil enrollment; cocokkan course; buang nilai di bawah 80; kelompokkan record yang tersisa per course; hitung jumlah dan rerata; urutkan; ambil satu teratas. Ini trace konseptual pada subset query materi. SQLite yang menghasilkan tabel; visualisasi tidak membuat atau mengubah hasil.

### Latihan transfer, kunci, dan feedback

**Latihan A — Course dengan rerata terendah.** Abaikan syarat nilai minimal 80. Tampilkan satu course dengan rerata terendah, jumlah pendaftaran, dan rerata dua desimal.

```sql
SELECT c.course_name,
       COUNT(e.enrollment_id) AS enrollment_count,
       ROUND(AVG(e.score), 2) AS average_score
FROM enrollments AS e
JOIN courses AS c ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name
ORDER BY AVG(e.score) ASC, c.course_code ASC
LIMIT 1;
```

**Kunci:** Matematika Diskrit, `1`, `82.00`.

- **Feedback benar:** agregat dibuat per course; `ASC` menaruh rerata terkecil terlebih dahulu.
- **Hint 1:** gunakan jalur JOIN dan GROUP BY yang sama.
- **Hint 2:** ubah aturan ranking dan hapus filter `score >= 80` karena soal menyatakan semua enrollment.

**Latihan B — Diagnosis query yang valid tetapi salah.** Seorang mahasiswa menghubungkan `e.course_id = s.student_id` lalu mendapat hasil kosong. Apakah solusi pertamanya menambah `SELECT *`?

- **Kunci:** tidak. Perbaiki jalur relasi: `e.student_id = s.student_id` untuk mahasiswa dan `e.course_id = c.course_id` untuk mata kuliah.
- **Feedback:** lebih banyak kolom hasil tidak memperbaiki pasangan key. Cocokkan query dengan diagram schema.

**Latihan C — Jelaskan jawaban.** Lengkapi: “Mata kuliah teratas adalah ___ karena setelah ___ pendaftaran di bawah 80 dikeluarkan, ada ___ enrollment pada kelompok itu dengan rerata ___.”

- **Kunci:** Sistem Informasi; filter `score >= 80`; dua; 91.50.
- **Feedback:** jawaban query baru lengkap ketika mahasiswa dapat merujuk kembali hasil ringkasan ke data sumber.

### Ringkasan jalur

- Pertanyaan menentukan data yang harus dikembalikan.
- Schema menentukan tabel dan jalur join.
- `WHERE` memilih enrollment sumber sebelum grouping.
- `GROUP BY` menetapkan satu baris per course; `COUNT` dan `AVG` meringkas anggotanya.
- `ORDER BY` dan `LIMIT` menghasilkan ranking yang dinyatakan dengan jelas.
- Hasil query yang benar perlu disertai penjelasan mengapa baris itu menjawab pertanyaan.

**Exit ticket:** untuk setiap klausa pada query, tunjukkan satu bagian pertanyaan yang dijawabnya.

---

## Write — Materi 1: Menambahkan Record dengan `INSERT`

### Tujuan

Mahasiswa dapat menambahkan satu record memakai daftar kolom eksplisit, membedakan nilai wajib dan opsional, serta membaca penolakan primary/foreign key.

### Materi untuk mahasiswa

`INSERT` menambah data baru ke satu tabel. Nilai harus mengikuti kolom yang disebutkan dan memenuhi constraint tabel. Sebutkan kolom secara eksplisit agar hubungan nilai dengan atribut terbaca jelas. Key baru harus unik; foreign key harus menunjuk pada baris induk yang benar-benar ada.

Contoh menambahkan satu mahasiswa latihan:

```sql
INSERT INTO students (student_id, name, cohort)
VALUES (5, 'Eka', '2025');
```

Hasil bukan tabel SELECT, melainkan pesan bahwa satu baris ditambahkan. Jalankan `SELECT student_id, name, cohort FROM students WHERE student_id = 5;` untuk memeriksa keadaan baru. Perubahan hanya hidup pada database latihan sementara.

### Aktivitas prediksi dan eksplorasi

Sebelum Run, cocokkan setiap nilai dengan kolomnya. Prediksi apakah `student_id = 1` dapat dimasukkan lagi dan apa yang terjadi jika `student_id = 5` belum ada ketika dipakai sebagai `enrollments.student_id`. Jalankan contoh invalid secara aman untuk membaca pesan constraint.

### Latihan formatif, kunci, dan feedback

**Latihan A:** tambah satu mahasiswa dengan id `5`, nama `Eka`, cohort `2025`.

- **Kunci:** satu baris ditambahkan; SELECT verifikasi mengembalikan Eka.
- **Hint:** jumlah nilai dan urutannya harus sesuai dengan daftar kolom.

**Latihan B:** buat satu enrollment untuk mahasiswa `5` dan mata kuliah `30`, dengan enrollment id `7` dan score `76`.

- **Kunci:** satu baris valid setelah mahasiswa `5` dimasukkan; kedua FK merujuk pada record yang ada.
- **Hint:** FK bukan label bebas. Temukan record induk yang dirujuk.

### Ringkasan

- `INSERT` menambah record, bukan mengubah record lama.
- Daftar kolom eksplisit memperjelas urutan nilai.
- PK harus unik; FK harus menunjuk pada baris terkait.
- Verifikasi record baru dengan query baca.

---

## Write — Materi 2: Mengubah Record dengan `UPDATE`

### Tujuan

Mahasiswa dapat mempratinjau target, mengubah satu nilai pada record yang dimaksud, memeriksa jumlah baris yang berubah, dan memverifikasi nilai akhirnya.

### Materi untuk mahasiswa

`UPDATE` mengubah nilai pada baris yang sudah ada. Bagian `WHERE` menentukan record sasaran. Sebelum mengeksekusi perubahan, baca target memakai predicate yang sama:

```sql
SELECT enrollment_id, score
FROM enrollments
WHERE enrollment_id = 3;
```

Preview menunjukkan enrollment `3` memiliki score `74`. Setelah meninjau preview, jalankan:

```sql
UPDATE enrollments
SET score = 78
WHERE enrollment_id = 3;
```

Lab meminta konfirmasi dan menampilkan jumlah baris terdampak serta keadaan sesudahnya. Tanpa filter yang tepat, statement dapat mengubah terlalu banyak baris; karena itu Quethink menolak update yang tidak memenuhi batas satu target record.

### Aktivitas prediksi dan eksplorasi

1. Prediksi nilai sebelum perubahan.
2. Periksa hasil SELECT preview.
3. Konfirmasi satu perubahan.
4. Jalankan SELECT verifikasi dengan key yang sama.
5. Reset data dan bandingkan dengan seed semula.

### Latihan formatif, kunci, dan feedback

**Latihan:** ubah score enrollment `3` dari `74` menjadi `78`.

- **Kunci:** preview menampilkan Bima dan course `10`; tepat satu baris berubah ke `78`.
- **Hint 1:** kondisi target memakai `enrollment_id`.
- **Hint 2:** konfirmasikan hanya setelah preview memperlihatkan record yang dimaksud.
- **Hint 3:** nilai sesudah Run harus diverifikasi kembali dengan SELECT.

### Ringkasan

- `SET` menyebut kolom dan nilai baru.
- `WHERE` memilih baris; preview memakai kondisi yang sama.
- Periksa jumlah baris terdampak dan baca kembali nilai setelah perubahan.
- Reset mengembalikan seed, bukan membatalkan perubahan Supabase karena tidak ada perubahan Supabase.

---

## Write — Materi 3: Menghapus Record dengan `DELETE`

### Tujuan

Mahasiswa dapat memeriksa record yang akan dihapus, menghapus satu record latihan, memahami perlindungan foreign key, dan memulihkan data latihan.

### Materi untuk mahasiswa

`DELETE` menghapus baris dari tabel. Tulis predicate yang menunjuk record tertentu, lalu baca preview sebelum menyetujui penghapusan. Contoh menghapus satu enrollment latihan:

```sql
SELECT enrollment_id, student_id, course_id, score
FROM enrollments
WHERE enrollment_id = 6;
```

Jika preview menunjukkan baris yang memang dimaksud, konfirmasikan:

```sql
DELETE FROM enrollments
WHERE enrollment_id = 6;
```

Satu baris enrollment terhapus. Coba menghapus mahasiswa yang masih memiliki enrollment tidak sama: foreign key mencegah penghapusan induk yang masih dirujuk. Untuk pilot ini, selesaikan latihan pada tabel anak dan gunakan Reset untuk kembali ke seed. Tidak ada cascade delete.

### Aktivitas prediksi dan eksplorasi

Tandai jumlah dan isi target sebelum konfirmasi; setelahnya jalankan SELECT yang sama untuk memeriksa bahwa record tidak lagi ada. Coba hapus mahasiswa `1` lalu baca pesan FK; reset mengembalikan seluruh record.

### Latihan formatif, kunci, dan feedback

**Latihan:** hapus enrollment dengan id `6` setelah preview menunjukkan targetnya.

- **Kunci:** tepat satu baris dihapus; SELECT setelahnya tidak mengembalikan row tersebut.
- **Hint 1:** mulai dari SELECT preview dengan key yang sama.
- **Hint 2:** periksa apakah nilai preview adalah row yang diminta.
- **Hint 3:** penghapusan parent dapat ditolak saat masih ada child record.

### Ringkasan

- `DELETE` menghapus record; gunakan key dan preview sasaran terlebih dahulu.
- Foreign key menjaga agar referensi anak tidak kehilangan induknya.
- Satu penghapusan latihan tidak mengubah data akun atau Supabase.
- Reset memulai ulang lesson dengan seed yang dikenal.

---

## Panduan Feedback dan Batas Bantuan

Gunakan feedback bertahap, dari petunjuk ringan ke penjelasan. Jangan langsung mengganti query mahasiswa dengan solusi penuh saat ia hanya bertanya “kenapa salah?”.

| Gejala | Pertanyaan/petunjuk awal | Langkah berikutnya |
|---|---|---|
| Tabel/kolom tidak ditemukan | “Kolom yang kamu pilih ada pada tabel mana di schema?” | Sorot tabel yang memiliki kolom itu. |
| Salah jumlah baris setelah filter | “Cek satu nilai tepat di batas: apakah syaratnya `>` atau `>=`?” | Tampilkan predicate dan baris pembeda. |
| Query valid tetapi hasil kosong pada JOIN | “Kolom apa yang menjadi FK dan PK pada jalur ini?” | Sorot pasangan key; jangan mengubah projection sebagai tebakan. |
| Terlalu banyak baris setelah JOIN | “Satu baris hasil mewakili apa? Berapa enrollment yang cocok?” | Telusuri satu-to-many dan pasangan yang membentuk tiap baris. |
| Hasil `GROUP BY` tak sesuai | “Apa arti satu baris hasil? Kolom apa yang menentukan kelompok?” | Perlihatkan anggota grup sebelum agregat. |
| `LIMIT` menunjukkan hasil yang tidak konsisten | “Aturan urutan apa yang ditulis sebelum membatasi baris?” | Tambahkan `ORDER BY` dan tie-breaker. |
| `INSERT` ditolak | “Apakah key baru unik, dan apakah foreign key menunjuk record yang ada?” | Bantu cek PK/FK dan pasangan kolom-nilai. |
| `UPDATE`/`DELETE` mengenai target yang salah | “Apa yang ditampilkan preview dengan kondisi yang sama?” | Minta mahasiswa memperbaiki predicate dan cek ulang target sebelum konfirmasi. |
| `UPDATE`/`DELETE` tanpa target yang aman | “Record mana yang ingin kamu ubah atau hapus?” | Minta key record yang jelas; jangan menyarankan menjalankan perubahan tanpa filter. |
| DML ditolak foreign key | “Record mana yang masih merujuk pada baris ini?” | Tampilkan hubungan parent/child pada tabel sintetis dan arah reset. |
| Syntax error | “Lihat klausa tepat sebelum penanda error: apakah koma, tanda petik, atau nama kolomnya lengkap?” | Tampilkan bantuan sintaks lokal; jangan mengganti maksud query. |

Practice menggunakan dataset lokal dan hasil query yang dapat dilihat learner; ia dapat diulang dan bersifat formatif. Assessment terpisah dan dinilai server-side dari jawaban deterministik yang tersimpan privat. Jangan memperlakukan output browser sebagai skor resmi atau menyebut data latihan terlihat sebagai hidden test.

## Referensi dan Dasar Rancangan

- Cakupan model relasional dan menerjemahkan kebutuhan menjadi query: [CS2023 — Query the Relational Model](https://csed.acm.org/query-the-relational-model/).
- Semantik SELECT, filter, grouping, serta aturan ordering/limit: [SQLite SELECT](https://www.sqlite.org/lang_select.html).
- Penegakan foreign key per koneksi: [SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html).
- Temuan dan batas bukti tentang kesalahan novice SQL, latihan visual, serta alasan menguji 2D dibanding 3D: [Riset jalur belajar Basis Data](../research/2026-09-29-database-learning-path-research.md) dan [tinjauan bukti bahan SQL](../research/2026-09-29-evidence-review-materi-sql.md).
- Alasan urutan Relasi → Read → Write dan guardrail DML: [Riset urutan Relasi, Read, dan Write](../research/2026-09-29-riset-urutan-relasi-read-write.md), [SQLite INSERT](https://www.sqlite.org/lang_insert.html), [SQLite UPDATE](https://www.sqlite.org/lang_update.html), [SQLite DELETE](https://www.sqlite.org/lang_delete.html), dan [SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html).

Kompetensi dan dokumentasi bahasa database menjadi dasar cakupan serta expected result. Urutan aktivitas, dataset kampus, bentuk prediksi, dan feedback di sini adalah rekomendasi desain Quethink; efektivitasnya belum diuji pada mahasiswa. Kandidat video Indonesia belum diverifikasi dan tidak dianggap konten siap tayang.

## Batas Materi

- Materi pemrograman atau mata kuliah lain.
- Perubahan schema, DML massal, query tanpa batas terhadap database eksternal, atau perubahan Supabase.
- `UPSERT`, `INSERT ... SELECT`, `UPDATE FROM`, cascade delete, dan kontrol transaksi.
- Membuat schema mandiri, normalisasi formal, transaksi, indeks, subquery, outer join, `HAVING`, atau administrasi DBMS.
- Asesmen resmi berbasis query dari browser.
- Menjadikan animasi sebagai pengganti SQL dan tabel hasil. Visualisasi pada jalur ini menggunakan diagram 2D.
- Video pendukung terverifikasi untuk tiap unit; kandidat YouTube belum ditonton dan dicocokkan dengan isi serta dialek SQLite.
- Evaluasi materi dengan mahasiswa; efektivitas rancangan belum diuji.
