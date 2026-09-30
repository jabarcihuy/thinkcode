# Rancangan Jalur Belajar Basis Data Interaktif

**Tanggal:** 29 September 2026 · **Versi:** 2.0 · **Status:** Acuan kurikulum aktif Quethink. Struktur baru memiliki tiga materi utama—Relasi, Write, dan Read—dengan prerequisite Relasi → Read → Write. Pembaruan implementasi dan konten database dilakukan setelah dokumen ini ditetapkan.

**Tujuan:** menjadi acuan kurikulum pilot setengah semester untuk belajar basis data melalui latihan SQL dan visualisasi relasi/query.

Materi sebelumnya terdiri dari satu unit Relasi dan enam unit Read. Naskah lama dipertahankan sebagai bahan dasar lalu diperluas menjadi struktur tiga materi utama dan submateri di [materi siap ajar jalur Basis Data](2026-09-29-materi-siap-ajar-jalur-basis-data.md). Riset urutan terbaru tersedia di [riset Relasi, Read, dan Write](../research/2026-09-29-riset-urutan-relasi-read-write.md).

## Keputusan Produk

- Quethink diposisikan sebagai platform belajar basis data interaktif.
- Hanya materi basis data yang menjadi materi belajar aktif di Quethink.
- Basis data menjadi satu-satunya `learning_path` aktif; kurikulum pemrograman tidak ditampilkan kepada pengguna.
- SQL adalah satu-satunya bahasa yang dipakai pelajar untuk mengambil dan memahami data.
- Blueprint ini berdiri sendiri dan tidak menunggu pemetaan atau persetujuan dosen/RPS tertentu. Assessment menjadi nilai resmi di dalam Quethink, terpisah dari latihan; nilai tersebut belum terhubung ke gradebook institusi.
- Query latihan hanya memakai SQLite lokal dan data sintetis. Supabase menyimpan akun, materi, dan progres, bukan data playground.

## Konsep Pengalaman Belajar

Quethink dapat mengajarkan basis data sebagai lab eksplorasi:

```text
Pertanyaan tentang data
→ Amati tabel dan relasinya
→ Prediksi hasil atau record sasaran
→ Tulis query SQL
→ Jalankan pada dataset latihan
→ Amati baris hasil atau perubahan data
→ Bandingkan prediksi dan hasil
→ Jelaskan alasan query/perubahan
```

Fokusnya adalah memahami tabel, relasi, seleksi, dan hasil query. Produk tidak berubah menjadi editor administrasi database atau course data engineering.

## Kurikulum Pilot

Rancangan ini ditujukan untuk mahasiswa tahun pertama S1 Informatika yang belum pernah menggunakan SQL. Tidak ada prasyarat bahasa pemrograman. Ini adalah pilot bahan belajar mandiri setengah semester, bukan pemetaan resmi ke RPS Basis Data tertentu.

### Capaian Belajar

Setelah menyelesaikan jalur ini, mahasiswa diharapkan mampu:

1. Membaca schema sederhana dan mengidentifikasi tabel, kolom, record, primary key, foreign key, serta jalur relasi.
2. Mengubah pertanyaan data menjadi pilihan sumber, kolom hasil, filter, dan relasi yang diperlukan.
3. Menulis query satu tabel menggunakan `SELECT`, `FROM`, `WHERE`, kondisi boolean dasar, `ORDER BY`, dan `LIMIT`.
4. Menggabungkan tabel dengan `INNER JOIN ... ON ...` berdasarkan key dan menjelaskan multiplicity hasilnya.
5. Membuat ringkasan dengan `COUNT`, `AVG`, dan `GROUP BY`, serta menjelaskan arti tiap baris ringkasan.
6. Memprediksi sebagian hasil sebelum Run, membandingkannya dengan hasil aktual, dan menjelaskan query menggunakan istilah data yang tepat.

### Tiga Materi Utama dan Submateri

Setiap unit memakai siklus **pertanyaan → amati schema/data → prediksi → tulis/ubah query → Run → telusuri → jelaskan → latihan transfer**. Estimasi awal untuk menguji pengalaman belajar adalah satu sesi mandiri 60–90 menit per unit; itu bukan ketentuan SKS atau jadwal akademik.

| Materi utama | Materi dan submateri | Interaksi utama | Bukti belajar |
|---|---|---|---|
| **Relasi** | Membaca bentuk data: tabel, schema, baris, record, dan kolom. Key dan hubungan: primary key, foreign key, 1:N, serta tabel penghubung M:N. | Inspeksi tiga tabel; tandai key; ikuti `students → enrollments → courses`; cocokkan satu pertanyaan dengan sumber datanya. | Menjelaskan peran setiap tabel dan menunjuk pasangan PK/FK yang menghubungkannya. |
| **Read** | `SELECT`/`FROM`; `WHERE` dan kondisi; `ORDER BY`/`LIMIT`; `INNER JOIN`; `COUNT`/`AVG`/`GROUP BY`; tantangan query integratif. | Prediksi kolom/baris hasil, tandai baris yang lolos, ikuti pasangan join, lalu jelaskan kelompok dan urutannya. | Menulis query untuk pertanyaan baru serta menjelaskan bagaimana klausa menghasilkan jawaban. |
| **Write** | Satu baris `INSERT`; `UPDATE` dengan target yang dipilih memakai key; `DELETE` dengan preview dan perhatian pada foreign key. | Tambahkan satu baris; sebelum update/delete tampilkan target menggunakan `SELECT` dengan predicate yang sama; konfirmasi, amati dampak, lalu reset. | Mengubah tepat satu record, menjelaskan constraint yang berlaku, memverifikasi keadaan sesudahnya, dan memulihkan seed. |

Nama tiga materi utama mengikuti pengelompokan yang diminta. Urutan learner tetap **Relasi → Read → Write** karena memilih dan memeriksa baris merupakan prasyarat aman untuk `UPDATE` dan `DELETE`. Riset dan batas inferensinya ada pada [catatan riset urutan materi](../research/2026-09-29-riset-urutan-relasi-read-write.md).

Urutan ini berfokus pada model relasional dan pembentukan query yang tercantum dalam [CS2023 Data Management](https://csed.acm.org/dm-cs-core/), bukan keseluruhan mata kuliah Basis Data. Studi kesalahan SQL menemukan query join dan agregasi dapat menimbulkan tantangan, sehingga keduanya mendapat unit latihan tersendiri. Rangkuman sumber dan batas inferensi ada di [catatan riset bahan pilot](../research/2026-09-29-database-learning-path-research.md).

### Ritme Setengah Semester

Ritme default adalah delapan minggu untuk tiga materi utama, lalu asesmen akhir pada minggu kedelapan. Setiap materi utama berisi beberapa lesson singkat; perkiraan 20–40 menit per lesson perlu divalidasi melalui uji pengguna.

| Minggu | Materi dan aktivitas | Assessment |
|---|---|---|
| 1 | Relasi — bentuk tabel, schema, record, dan kolom | — |
| 2 | Relasi — key dan hubungan antar tabel | Checkpoint 1 |
| 3 | Read — `SELECT`/`FROM` dan `WHERE` | — |
| 4 | Read — kondisi, `ORDER BY`, dan `LIMIT` | Checkpoint 2 |
| 5 | Read — `JOIN`, agregasi, dan query integratif | — |
| 6 | Write — `INSERT` dan constraint | — |
| 7 | Write — target `UPDATE` dan `DELETE` | Checkpoint 3 |
| 8 | Review Relasi → Read → Write dan investigasi data terintegrasi | Tes Akhir · Relasi, Read, dan Write |

Jadwal ini adalah ritme pilot mandiri, bukan kalender akademik atau ketentuan SKS.

### Batas Materi Pilot

**Termasuk:** relational model dasar; PK/FK; relasi 1:N dan tabel penghubung M:N; `SELECT`; filter dan kondisi boolean; sorting/limit; `INNER JOIN`; `COUNT`/`AVG`; `GROUP BY`; satu baris `INSERT`; `UPDATE`/`DELETE` bertarget dengan preview; prediksi, trace konseptual, validasi FK, serta reset.

**Ditunda:** normalisasi formal, DDL dan perubahan schema, transaksi/ACID, perubahan massal atau tanpa batas, UPSERT, `INSERT ... SELECT`, `UPDATE FROM`, cascade delete, indeks dan optimasi, subquery/CTE, `HAVING`, outer join, trigger, prosedur tersimpan, NoSQL, dan administrasi DBMS. Ini tetap pilot dasar, bukan survei penuh knowledge area Data Management.

## Dataset Pilot: Kampus Mini

Seluruh data sintetis. Dataset yang sama digunakan dari pengenalan schema sampai tantangan query agar konsep bertambah tanpa mahasiswa harus mempelajari domain baru setiap unit.

```text
students(
  student_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  cohort TEXT NOT NULL
)
courses(
  course_id INTEGER PRIMARY KEY,
  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  credits INTEGER NOT NULL
)
enrollments(
  enrollment_id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(student_id),
  course_id INTEGER NOT NULL REFERENCES courses(course_id),
  score REAL NOT NULL
)
```

Relasi: satu mahasiswa dapat memiliki banyak baris `enrollments`; satu mata kuliah dapat memiliki banyak baris `enrollments`. Dengan demikian `students` dan `courses` berelasi M:N melalui `enrollments`.

Saat database latihan diinisialisasi, aktifkan pemeriksaan relasi dengan `PRAGMA foreign_keys = ON` pada koneksi sebelum seed dimasukkan. SQLite menonaktifkan enforcement foreign key secara default per koneksi; tanpa langkah ini, schema yang mencantumkan `REFERENCES` saja belum menjamin data latihan konsisten ([SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html)).

| `student_id` | name | cohort |
|---:|---|---:|
| 1 | Alya | 2025 |
| 2 | Bima | 2025 |
| 3 | Citra | 2024 |
| 4 | Danu | 2024 |

| `course_id` | course_code | course_name | credits |
|---:|---|---|---:|
| 10 | SI101 | Sistem Informasi | 3 |
| 20 | IF102 | Basis Data | 3 |
| 30 | IF103 | Matematika Diskrit | 3 |

| `enrollment_id` | `student_id` | `course_id` | score |
|---:|---:|---:|---:|
| 1 | 1 | 10 | 88 |
| 2 | 1 | 20 | 90 |
| 3 | 2 | 10 | 74 |
| 4 | 2 | 30 | 82 |
| 5 | 3 | 20 | 80 |
| 6 | 4 | 10 | 95 |

Seluruh seed adalah data latihan fiktif, bukan data pengguna Quethink. Skor numerik memungkinkan unit agregasi membandingkan `COUNT` dengan `AVG`.

## Lesson Contoh Lengkap: Pilih dan Saring

**Pertanyaan:** siapa yang masuk angkatan 2025?

**Tujuan:** mahasiswa membedakan kolom hasil (`SELECT`) dari record yang lolos kondisi (`WHERE`).

1. **Amati:** buka tabel `students` dan temukan kolom `cohort`.
2. **Prediksi:** pilih nama yang akan muncul sebelum melihat hasil query.
3. **Tulis:**

   ```sql
   SELECT name, cohort
   FROM students
   WHERE cohort = '2025'
   ORDER BY name;
   ```

4. **Run:** engine SQL menghasilkan Alya dan Bima.
5. **Telusuri:** sorot dua baris yang lolos filter, redupkan baris lain, dan tampilkan hanya kolom `name` serta `cohort` di result table.
6. **Jelaskan:** lengkapi “`WHERE` memilih ___, sedangkan `SELECT` memilih ___.”
7. **Transfer:** ubah pertanyaan menjadi “siapa angkatan 2024?” dan tentukan kondisi query yang perlu diubah.

Feedback untuk kesalahan umum membedakan: teks perlu tanda petik, kolom/kondisi salah, `SELECT *` menampilkan kolom yang tak diminta, dan `WHERE` menyaring baris (bukan menyembunyikan kolom).

## Materi Contoh: Kunci, JOIN, dan Agregasi

### Mengapa Tabel `enrollments` Dibutuhkan

`students.student_id` mengidentifikasi satu mahasiswa. Nilai yang sama boleh muncul di `enrollments.student_id` berkali-kali karena satu mahasiswa dapat mendaftar ke beberapa mata kuliah. Hal serupa berlaku untuk `courses.course_id`. Karena hubungan mahasiswa–mata kuliah adalah banyak-ke-banyak, tabel `enrollments` menyimpan pasangan key tersebut bersama fakta pendaftaran seperti `score`.

Foreign key bukan salinan nama mahasiswa atau mata kuliah. Ia adalah nilai yang menunjuk ke record lain. Inilah alasan query JOIN dapat mengambil data yang tersebar tanpa mengulang nama mata kuliah di setiap record mahasiswa.

### Membaca JOIN sebagai Pasangan Record

```sql
SELECT s.name, c.course_name, e.score
FROM enrollments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_code = 'IF102'
ORDER BY s.name;
```

Pertanyaan dalam bahasa sehari-hari adalah **“siapa mengambil Basis Data dan berapa nilainya?”** `enrollments` menjadi sumber fakta pendaftaran; dua JOIN menambahkan nama mahasiswa dan mata kuliah berdasarkan key. `WHERE` memilih satu mata kuliah, sedangkan `SELECT` memilih tiga kolom untuk dibaca.

| name | course_name | score |
|---|---|---:|
| Alya | Basis Data | 90 |
| Citra | Basis Data | 80 |

Pada visualisasi 2D, visualizer dapat menonjolkan tabel `enrollments` sebagai sumber, menghubungkan baris ke `students` dan `courses` lewat diagram relasi, lalu meredupkan pendaftaran mata kuliah lain. Result table tetap menampilkan dua baris aktual di sampingnya.

### Membaca GROUP BY sebagai Kumpulan

```sql
SELECT c.course_name,
       COUNT(e.enrollment_id) AS enrollment_count,
       AVG(e.score) AS average_score
FROM courses AS c
JOIN enrollments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY average_score DESC;
```

Query ini menyatukan record menurut mata kuliah. `COUNT` menghitung pendaftaran pada tiap grup; `AVG` menghitung rata-rata skor di dalam grup. Setiap baris hasil sekarang mewakili satu mata kuliah, bukan satu mahasiswa.

| course_name | enrollment_count | average_score |
|---|---:|---:|
| Sistem Informasi | 3 | 85.67 |
| Basis Data | 2 | 85.00 |
| Matematika Diskrit | 1 | 82.00 |

Latihan pertama memakai `JOIN` biasa agar semua grup memiliki record sumber. `LEFT JOIN` dan grup kosong baru diperkenalkan kemudian karena perbedaan `COUNT(*)`, `COUNT(column)`, dan `NULL` dapat menambah beban konsep.

## SQL dan Database Latihan

**Keputusan pilot:** SQLite in-memory yang dimuat di browser. Ini memberi engine SQL nyata untuk latihan tanpa koneksi ke Supabase, server database tambahan, atau layanan code runner berbayar. Materi mengajarkan subset SQLite yang tercantum pada tiga materi utama dan lesson di atas.

- Eksekusi ditempatkan di Web Worker agar query yang berat dapat dihentikan tanpa membekukan UI. Batas saat ini: query 4.096 karakter, 1.400 ms, maksimal 100 baris hasil, 2.000 karakter per nilai, dan 80.000 karakter total hasil.
- Setiap sesi memuat dataset latihan baru atau menyediakan reset deterministik.
- Inisialisasi koneksi dengan `PRAGMA foreign_keys = ON` sebelum memasukkan seed agar foreign key benar-benar ditegakkan.
- Runner menerima hanya satu statement yang tervalidasi: `SELECT` yang didukung atau DML satu baris yang secara eksplisit dibutuhkan materi (`INSERT`, `UPDATE`, `DELETE`). Batasi tabel ke tiga tabel sintetis. Tolak DDL, `PRAGMA`, kontrol transaksi, `ATTACH`, multi-statement, dan klausa yang tidak diajarkan.
- Untuk `UPDATE`/`DELETE`, tampilkan record sasaran dari `SELECT` dengan predicate yang sama, minta konfirmasi sebelum mutasi, lalu tampilkan jumlah baris terdampak dan keadaan baru. Tolak perubahan massal atau predicate tanpa target key sesuai aturan runner.
- Aktifkan foreign-key enforcement per koneksi, batas waktu/output/jumlah row yang berubah, dan reset deterministik. Jangan menyimpan perubahan lokal ke Supabase.
- Tidak ada koneksi ke Supabase production, kredensial, filesystem pengguna, atau database pribadi.
- Engine/WASM dimuat saat fitur digunakan agar tidak menambah beban awal halaman.

Dokumentasi resmi SQLite menyediakan JavaScript/WebAssembly untuk browser dan merekomendasikan Worker agar operasi yang lama tidak mengganggu render UI ([SQLite WASM: database in a browser](https://www.sqlite.org/wasm/doc/trunk/demo-123.md), [SQLite Worker API](https://www.sqlite.org/wasm/doc/tip/api-worker1.md)). Database browser bersifat sementara untuk eksplorasi dan practice. Hasil latihan browser tidak menjadi bukti nilai assessment resmi karena pengguna dapat mengubah atau memalsukan state client.

### Contoh Query yang Dijalankan Sungguhan

Pada contoh **“siapa yang mengambil Basis Data?”**, browser menjalankan query ini terhadap seed lokal:

```sql
SELECT s.name, c.course_name, e.score
FROM enrollments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE c.course_code = 'IF102'
ORDER BY s.name;
```

Hasil engine adalah Alya—Basis Data—90 dan Citra—Basis Data—80. Tampilan hasil tersebut datang dari SQLite; bukan dibuat oleh animasi.

Visual saat ini menyorot tabel dan relasi yang disebut query serta menyediakan empat tahap penjelasan umum. Diagram tidak melacak setiap record yang lolos `WHERE` atau pasangan baris hasil JOIN. Gunakan tabel hasil SQLite untuk nilai aktual; perlakukan tahap visual sebagai ringkasan konsep, bukan trace tiap baris.

## Batas Trace Query

SQLite menjelaskan tahapan `SELECT` sederhana sebagai proses **ilustratif**; engine SQL tidak harus menjalankan operasi fisik dalam urutan pedagogis tersebut ([SQLite SELECT processing](https://www.sqlite.org/lang_select.html)). SQLite juga tidak memberikan tabel antara yang universal untuk setiap klausa pada SQL arbitrer. Karena itu:

- Trace visual dibuat dari subset grammar yang didefinisikan Quethink, bukan klaim membaca internal query planner SQLite.
- Jika query di luar subset tetap valid bagi SQLite, hasilnya boleh ditampilkan tanpa trace, dengan pesan jelas bahwa visualisasi langkah belum tersedia.
- Jika sintaks salah, tampilkan error yang aman dan bantu mahasiswa menunjuk klausa terkait tanpa mengarang baris hasil.
- Setiap trace yang didukung diuji terhadap hasil engine untuk memastikan langkah dan hasil akhirnya konsisten.

## Visualisasi 2D Database dan Query

Keputusan arah produk: jalur Basis Data memakai **diagram 2D interaktif yang berubah mengikuti query**. Tabel relasional berisi data kategorikal, sehingga baris, kolom, kondisi, relasi, dan hasil lebih mudah dibaca sebagai tabel dan diagram pada bidang datar. SQL tetap ditulis dan dibaca mahasiswa; visualisasi menerangkan perubahan datanya.

- **`FROM`:** menandai tabel dan record sumber.
- **`WHERE`:** tahap penjelasan menyebut fungsi filter; diagram belum menandai tiap record yang lolos.
- **`JOIN`:** diagram menunjukkan key relasional dan menyorot tabel yang direferensikan; belum menggambar pasangan record hasil per langkah.
- **`SELECT`, `GROUP BY`, agregasi, `ORDER BY`, dan `LIMIT`:** query sungguhan dijalankan SQLite dan hasil aktual tampil sebagai tabel. Diagram tidak membedah record per klausa.

Hasil harus mengikuti query yang benar-benar dijalankan. Baris otoritatif berasal dari SQLite in-memory; trace visual adalah penjelasan pedagogis untuk subset query yang didukung, bukan tiruan urutan eksekusi fisik atau query planner. Jika query valid tetapi belum didukung trace, tampilkan hasil SQLite dengan keterangan bahwa langkah visual belum tersedia. Jangan mengarang baris atau tahapan.

- **Kontrol:** langkah sebelumnya/berikutnya, play/pause, reset, dan keterangan perubahan pada langkah aktif.
- **Tabel hasil:** selalu tampilkan hasil SQLite yang sama dalam tabel semantik yang bisa dibaca, disalin, dan diakses dengan keyboard/screen reader.
- **Cakupan saat ini:** query `SELECT`, filter, sorting, JOIN, agregasi, dan limit dapat dijalankan pada dataset kecil. Visualisasi masih berupa diagram relasi tetap dan tahap penjelasan umum, bukan trace query mendalam.
- **3D:** tidak digunakan pada prototipe ini. Pertimbangkan lagi hanya jika kurikulum kelak membahas data yang secara inheren spasial, seperti geometri GIS tiga dimensi, dan ada tugas belajar yang membutuhkan rotasi atau kedalaman ruang.

Riset database dan query visualization yang dirangkum di [catatan riset bahan pilot](../research/2026-09-29-database-learning-path-research.md) mendukung bantuan visual yang berdampingan dengan SQL yang ditulis mahasiswa, tetapi tidak membuktikan bahwa 3D lebih efektif daripada 2D. Karena itu, prototipe menggunakan 2D sebagai representasi utama yang tetap dapat diakses; 3D bukan kebutuhan atau rencana implementasi jalur ini.

## Video Pembelajaran

Jalur dapat memakai pola video pendukung opsional yang telah digunakan pada lesson Quethink. Video berbahasa Indonesia berfungsi sebagai pengantar satu konsep; lesson tetap meminta mahasiswa memprediksi, menulis SQL, dan menjelaskan hasil.

| Materi utama | Kandidat YouTube | Penggunaan yang direncanakan | Status |
|---|---|---|---|
| Relasi | [Pertemuan 1 — Entitas, Atribut, & Relasi (ERD 1)](https://www.youtube.com/watch?v=jpQdsogCrww) | Pengantar entitas/atribut; setelah menonton, petakan konsep ke tabel, record, kolom, dan key `Kampus Mini`. | Metadata judul/kreator ditemukan; audio, isi, durasi yang cocok, dan subtitle belum ditinjau. |
| Read | [Tutorial MySQL Database (Bahasa Indonesia)](https://www.youtube.com/watch?v=xYBclb-sYQ4) | Kandidat cuplikan “Select Data”; gunakan hanya untuk ide sintaks portable dan cek tiap contoh terhadap SQLite. | Video panjang dan membahas MySQL; timestamp serta kesesuaian tiap contoh belum ditonton. |
| Read | [SQL 05 — Belajar INNER JOIN](https://www.youtube.com/watch?v=Chc1tUS_feU) | Kandidat pengantar pasangan key sebelum menyusun `JOIN ... ON ...`. | Metadata menyebut MySQL/MariaDB; isi, durasi, contoh schema, dan kesesuaian subtitle belum ditinjau. |

Ini shortlist untuk kurasi, bukan link yang sudah disahkan untuk materi learner. Sebelum diterbitkan, tonton kandidat, catat rentang menit yang relevan, validasi dialek/sintaks, audio, subtitle, aksesibilitas, serta tautan. Video tidak boleh membuat unit mengajarkan MySQL khusus ketika playground memakai SQLite.

## Practice dan Assessment

### Practice formatif

- Tiap lesson memiliki aktivitas yang sesuai materinya: **predict**, inspect, **write/fix query**, **preview target**, atau **explain result/change**; retry tidak dibatasi dan tidak menambah nilai resmi.
- Feedback menyebut kategori kesalahan—syntax, tabel/kolom, predicate, join path, atau level agregasi—lalu memberi petunjuk kecil.
- Dataset dan contoh expected result untuk practice memang terlihat pada browser. Jangan menyebutnya hidden test atau bukti penilaian tepercaya.
- AI tutor boleh membantu pada practice dengan konteks unit, schema, query dan hasil yang terlihat. AI tidak memeriksa hidden assessment data atau menetapkan skor.

### Blueprint checkpoint dan final

Practice bersifat formatif dan tidak menambah nilai. Quethink mencatat skor assessment resmi platform dengan bobot berikut; skor tersebut tidak otomatis tersinkron dengan nilai pada sistem akademik kampus.

| Assessment | Cakupan | Bobot skor akhir | Komponen rubrik |
|---|---|---:|---|
| Checkpoint 1 | Relasi: schema, record, PK/FK, relationship path | 15% | Schema & key 50%; pemetaan pertanyaan 50% |
| Checkpoint 2 | Read: `SELECT`, kondisi, sorting/limit, join/aggregation basics | 20% | Query-result reasoning 70%; prediksi dan kasus batas 30% |
| Checkpoint 3 | Write: satu-row `INSERT`, target preview, `UPDATE`/`DELETE`, FK | 25% | Pemilihan target/perintah 40%; prediksi perubahan/constraint 40%; interpretasi 20% |
| Tes Akhir · Relasi, Read, dan Write | Pertanyaan baru: baca relasi, pilih query, dan tentukan perubahan data sintetis yang aman | 40% | Model/jalur 20%; pilihan query/perintah 45%; penjelasan hasil/perubahan 20%; diagnosis kesalahan 15% |

Masing-masing assessment diberi skor 0–100; ambang lulus awal 75 mengikuti default produk Quethink. Nilai akhir jalur adalah jumlah skor assessment × bobot di atas. Retry mengikuti perilaku assessment Quethink dan practice tidak masuk rumus.

### Batas kepercayaan nilai

Browser menjalankan query practice untuk eksplorasi dan umpan balik, tetapi client dapat dimodifikasi sehingga hasil itu bukan bukti nilai assessment. Assessment memakai pemeriksaan jawaban deterministik di server atas konfigurasi jawaban privat; ia tidak menjalankan SQL bebas mahasiswa terhadap dataset tersembunyi. Untuk Write, assessment memeriksa pilihan perintah/target dan prediksi dampak, bukan menjalankan DML dari browser. Expected answers tidak diserialisasi ke payload learner atau AI Tutor. Ini membatasi assessment pada prediksi hasil, urutan blok, dan pilihan terstruktur.

## Batas Rancangan

Termasuk dalam arah yang dieksplorasi:

- Learning path basis data yang terpisah.
- SQL dasar langsung di web pada dataset latihan.
- Relasi tabel dan urutan transformasi query yang divisualisasikan.
- Practice formatif, reset data, dan video pendukung opsional.

Belum termasuk atau belum diputuskan:

- Materi pemrograman dan pemetaan mata kuliah lain.
- Menggunakan database produksi Supabase sebagai playground.
- SQL DDL, DML massal/bebas, impor/export database, atau koneksi database milik pengguna.
- Penilaian resmi berbasis hasil query browser.
- 3D wajib untuk setiap lesson, AR, atau penggunaan model 3D tanpa tujuan belajar yang jelas.
- Library visualisasi 3D dan evaluator SQL assessment.

## Langkah Lanjut yang Disarankan

Blueprint v2 menetapkan tiga materi utama, submateri sebagai lessons, prerequisite Relasi → Read → Write, SQLite in-memory dengan DML terbatas, dan ritme pilot delapan minggu. Materi sebelumnya berisi tujuh lesson dan menjadi bahan untuk struktur baru. Tahap berikutnya adalah menerapkan struktur pada aplikasi dan Supabase dengan mengarsipkan konten lama tanpa menghapus progress/attempt, lalu menguji query baca, mutasi/reset, aksesibilitas, dan assessment.
