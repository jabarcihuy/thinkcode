# Riset dan Rancangan Materi Pilot: Basis Data dan SQL

**Tanggal:** 29 September 2026

**Status:** riset baseline untuk rancangan SELECT-only sebelum perubahan kurikulum 29 September 2026. Catatan tujuh unit dan fokus SELECT di bawah merupakan snapshot historis, bukan struktur aktif. Struktur aktif mengikuti [kurikulum Database Fundamentals](../04-CURRICULUM.md) dan [riset urutan Relasi, Read, Write](2026-09-29-riset-urutan-relasi-read-write.md). Temuan umum tentang dataset, SQL pemula, dan visualisasi tetap menjadi bahan bukti.

**Sasaran awal:** mahasiswa tahun pertama S1 Informatika yang belum pernah belajar SQL secara formal

**Fokus:** membaca data relasional, menyusun query SQL, memprediksi hasil, lalu memeriksa alasan hasil tersebut

## Ringkasan Keputusan Materi

1. Jadikan jalur Basis Data sebagai satu-satunya jalur aktif Quethink; materi pemrograman tidak menjadi konten learner.
2. Rancang pilot sebagai **Query Lab Dasar**: tujuh unit dari membaca tabel sampai tantangan query integratif. Fokusnya penggunaan model relasional dan SQL `SELECT`; bukan survey seluruh topik mata kuliah Basis Data.
3. Gunakan satu dataset kampus sintetis yang sederhana dan sama di semua unit: `students`, `courses`, dan `enrollments`. Tampilkan diagram schema dan tabel 2D sebagai alat utama; interaksi visual harus membantu siswa memprediksi, mengubah query, menelusuri, atau menjelaskan hasil.
4. Gunakan 2D sebagai representasi untuk jalur pilot saat ini. 3D tidak direncanakan untuk materi query relasional; pertimbangkan hanya jika kurikulum kelak memuat data yang memang bersifat spasial dan tugasnya membutuhkan pemahaman kedalaman atau rotasi.
5. Pisahkan latihan dengan retry dan feedback dari asesmen resmi. Query yang dinilai di browser dapat diperiksa atau dimanipulasi pengguna sehingga tidak boleh menjadi sumber nilai resmi yang tepercaya.

Rancangan durasi awal yang dapat diuji adalah tujuh unit, masing-masing satu sesi sekitar 60–90 menit. Durasi ini **rekomendasi untuk prototipe**, bukan ketentuan CS2023 maupun RPS tertentu. Finalisasi waktu dan nilai resmi memerlukan pemetaan ke dokumen mata kuliah yang benar.

## Dasar Cakupan

CS2023 menempatkan model data relasional, pemodelan data, integritas referensial, dan pembentukan query SQL pada area Data Management. CS2023 juga membedakan pengetahuan inti dari perluasan seperti relational algebra, definisi schema SQL, subquery, dan query processing. Ini memberi dasar untuk memilih fondasi relasi dan query sebagai inti pilot, tanpa harus mengajarkan seluruh topik Data Management sekaligus. ([CS2023 Data Management CS Core](https://csed.acm.org/dm-cs-core/); [CS2023 Body of Knowledge, DM-Querying](https://csed.acm.org/wp-content/uploads/2024/04/3.1-Body-of-Knowledge-1.pdf))

Silabus pengantar basis data Carnegie Mellon menempatkan pemahaman model relasional dan pembacaan relasi antartabel sebagai kemampuan sebelum menyelesaikan tugas retrieval dengan logical operators, join, grouping, dan aggregation. Silabus ini mendukung urutan “pahami schema dan pertanyaan dahulu, baru tulis query”, tetapi tidak dipakai sebagai standar wajib untuk Quethink. ([CMU Heinz, Introduction to Database Management](https://www.heinz.cmu.edu/current-students/courses/90-728))

## Capaian Belajar Pilot

Pada akhir pilot, mahasiswa diharapkan dapat:

1. **Membaca schema relasional:** mengidentifikasi tabel, kolom, record, primary key, foreign key, dan jalur relasi dalam schema latihan.
2. **Menerjemahkan pertanyaan data:** menentukan tabel sumber, kolom hasil, kondisi filter, dan relasi yang diperlukan sebelum menulis SQL.
3. **Membuat query satu tabel:** memakai `SELECT`, `FROM`, `WHERE`, operator perbandingan, serta `AND`/`OR` untuk memilih kolom dan baris.
4. **Menyajikan hasil yang terarah:** memakai `ORDER BY` dan `LIMIT`, serta menjelaskan bahwa urutan baris tidak dijamin jika query tidak menyatakan `ORDER BY`.
5. **Menghubungkan data:** menulis `INNER JOIN ... ON ...` berdasarkan foreign key dan menjelaskan mengapa relasi satu-ke-banyak dapat menghasilkan beberapa baris.
6. **Meringkas data:** menggunakan `COUNT`, `AVG`, dan `GROUP BY`, serta menyebutkan apa yang dihitung dan apa yang diwakili oleh setiap baris ringkasan.
7. **Memeriksa solusi:** memprediksi sebagian hasil sebelum run, membandingkannya dengan hasil aktual, menguji kasus pembeda, dan menjelaskan query dengan istilah data yang sesuai.

Capaian tersebut merupakan **rekomendasi rancangan** dari fondasi CS2023 dan temuan penelitian kesalahan query; belum dipetakan ke CPMK mata kuliah tertentu.

## Dataset Jangkar

Gunakan satu kasus sintetis yang mudah dipahami mahasiswa dan tidak memuat data pribadi nyata.

```text
students
- student_id (PK)
- name
- cohort

courses
- course_id (PK)
- course_code
- course_name
- credits

enrollments
- enrollment_id (PK)
- student_id (FK → students.student_id)
- course_id (FK → courses.course_id)
- score
```

Seed kecil yang konsisten:

```text
students
1 | Alya  | 2025
2 | Bima  | 2025
3 | Citra | 2024
4 | Danu  | 2024

courses
10 | SI101 | Sistem Informasi | 3
20 | IF102 | Basis Data         | 3
30 | IF103 | Matematika Diskrit | 3

enrollments
1 | 1 | 10 | 88
2 | 1 | 20 | 90
3 | 2 | 10 | 74
4 | 2 | 30 | 82
5 | 3 | 20 | 80
6 | 4 | 10 | 95
```

`enrollments` menjadi tabel penghubung karena satu mahasiswa dapat mengambil beberapa mata kuliah dan satu mata kuliah dapat diikuti beberapa mahasiswa. Kasus ini memberi alasan konkret untuk primary key, foreign key, dan join. Rancangan tersebut sengaja kecil: studi query-writing pada 744 mahasiswa menemukan keberhasilan query turun ketika kompleksitas schema meningkat dari sederhana ke lebih kompleks. Temuan itu berasal dari database latihan dalam konteks studi tersebut; ia mendukung pengendalian kompleksitas awal, bukan aturan bahwa semua latihan harus memakai schema kecil selamanya. ([Taipalus, 2020, *The Effects of Database Complexity on SQL Query Formulation*](https://doi.org/10.1016/j.jss.2020.110576))

Data synthetic ini juga menghindari mengambil schema produksi Supabase sebagai playground. Angka-angka yang dipakai menjadi bukti prediksi pembelajaran, bukan data pengguna Quethink.

## Urutan Unit dan Isi

Setiap unit memakai siklus yang sama: **pertanyaan → amati schema/data → prediksi → tulis atau ubah query → jalankan → telusuri perubahan → jelaskan → latihan transfer**. Siklus ini adalah rekomendasi desain untuk mengubah SQL dari latihan menghafal sintaks menjadi investigasi hasil data.

| Unit | Fokus dan materi | Aktivitas interaktif utama | Bukti belajar |
|---|---|---|---|
| **1. Membaca Data sebagai Relasi** | Database vs tabel; baris/record dan kolom/atribut; primary key; foreign key; relasi 1:N; tabel penghubung untuk relasi mahasiswa–mata kuliah. Pengantar singkat: pemisahan tabel mencegah pengulangan nama mata kuliah pada setiap baris pendaftaran; belum masuk pembuktian normal form. | Bandingkan satu spreadsheet pendaftaran yang mengulang data dengan tiga tabel bersih. Pilih record, tandai primary/foreign key, lalu ikuti hubungan `students → enrollments → courses`. | Mahasiswa dapat menyebutkan PK/FK dan menentukan tabel yang diperlukan untuk pertanyaan “siapa mengambil mata kuliah apa?”. |
| **2. Mengambil Kolom yang Dibutuhkan** | Query deklaratif; `SELECT`, `FROM`, daftar kolom, `*` sebagai inspeksi awal saja. Bedakan memilih kolom dari memilih baris. | Diberi pertanyaan “tampilkan nama dan angkatan mahasiswa”; mahasiswa memilih tabel dan kolom, memprediksi bentuk hasil, lalu menulis `SELECT name, cohort FROM students;`. | Hasil memuat kolom yang tepat, tidak sekadar menjalankan query yang valid. |
| **3. Menyaring Baris** | `WHERE`; `=`, `<>`, `<`, `<=`, `>`, `>=`; kondisi gabungan `AND`/`OR` dengan tanda kurung saat prioritas perlu jelas. Mulai dari satu kondisi, baru gabungkan dua. | Tandai baris yang lolos secara manual untuk nilai cohort dan skor batas. Jalankan query dan sorot record lolos/gugur. Minta satu kasus uji tepat di batas. | Mahasiswa menulis predicate yang sesuai makna kalimat dan dapat menunjukkan baris yang lolos. |
| **4. Mengurutkan dan Membatasi Hasil** | `ORDER BY`, `ASC`, `DESC`, `LIMIT`; perbedaan urutan hasil dengan urutan penyimpanan. | Bandingkan dua arah pengurutan dan ubah `LIMIT`. Minta prediksi record yang masuk ke tiga teratas. Tunjukkan hasil tanpa `ORDER BY` tidak memiliki urutan yang dijamin. | Mahasiswa dapat menghasilkan daftar terurut dengan batas jumlah yang diminta serta tahu kapan `ORDER BY` wajib. |
| **5. Menghubungkan Tabel dengan JOIN** | `INNER JOIN`, pasangan kolom pada `ON`, PK/FK sebagai jalur relasi, alias singkat opsional setelah bentuk dasar dipahami, hasil join dan multiplicity pada relasi 1:N. Tidak mulai dengan implicit/cross join atau beragam outer join. | Susun garis pasangan `enrollments.student_id → students.student_id`; lalu jalankan satu join. Tambahkan `courses` hanya setelah relasi pertama benar. Sebelum run, hitung perkiraan banyak baris output. | Mahasiswa memilih jalur join yang benar, menulis `ON` yang benar, dan menjelaskan baris ganda yang sah akibat banyak pendaftaran. |
| **6. Merangkum per Kelompok** | `COUNT(*)`, `AVG(score)`, `GROUP BY`; satu baris hasil per kelompok; membedakan jumlah baris pendaftaran dari jumlah mahasiswa unik. `HAVING` ditunda sampai konsep kelompok mantap. | Kelompokkan baris `enrollments` per `course_id`, tampilkan jumlah pendaftar, lalu bandingkan dengan agregat keseluruhan. Visualisasi menunjukkan record mana yang masuk ke kelompok. | Mahasiswa menyebutkan level kelompok dan arti nilai agregat, bukan hanya menyalin query contoh. |
| **7. Tantangan: Jawab Pertanyaan Kampus** | Menggabungkan schema reading, `SELECT`, `WHERE`, join, sorting, dan satu agregasi. Membaca kesalahan sintaks vs logika dan membandingkan query yang valid tetapi menjawab pertanyaan berbeda. | Misi “tampilkan mata kuliah dengan rerata skor tertinggi” dipecah menjadi: tentukan tabel → jalur relasi → kelompok → agregasi → urutan → pilih hasil. Mulai dengan scaffold, lalu hilangkan petunjuk. | Mahasiswa menyusun query dari kebutuhan baru dan menjelaskan hasil dengan rujukan pada data sumber. |

Urutan `JOIN` dan agregasi dipisah menjadi dua unit supaya setiap konsep kompleks dapat dilatih sendiri sebelum digabung. Analisis 357.215 submission dari 462 mahasiswa pada tugas lintas bahasa database menemukan operasi join dan aggregation sebagai konsep yang menimbulkan tantangan. Data tersebut mencakup SQL, MongoDB, dan Neo4j, sehingga tidak mengukur persis efektivitas urutan Quethink; ia menjadi alasan untuk memberi latihan bertahap dan diagnostik khusus pada kedua topik. ([Alkhabaz et al., 2023, DataEd](https://doi.org/10.1145/3596673.3596976))

## Contoh Pembelajaran Utuh: `SELECT` dan `WHERE`

**Pertanyaan:** “Siapa mahasiswa angkatan 2025?”

```sql
SELECT name, cohort
FROM students
WHERE cohort = '2025';
```

Alur mahasiswa:

1. Sebelum run, pilih dua baris yang diprediksi cocok.
2. Jelaskan `FROM students` sebagai sumber record yang sedang ditanyakan.
3. Tulis kondisi `cohort = '2025'` dan tandai baris yang lolos.
4. Jelaskan `SELECT name, cohort` sebagai kolom yang ditampilkan dari record yang lolos.
5. Jalankan, bandingkan prediksi dengan hasil, lalu jawab variasi “siapa dari angkatan 2024?” tanpa mengganti struktur query.

SQLite menjelaskan tahapan konseptual query SELECT sederhana mulai dari penentuan input melalui `FROM`, penyaringan oleh `WHERE`, lalu pembentukan hasil kolom. Karena SQL adalah bahasa deklaratif, visualizer harus menyebut tahapan ini sebagai model untuk memahami hasil, bukan klaim bahwa database selalu menjalankan operasi fisik persis dalam urutan tersebut. ([SQLite, SELECT: Simple Select Processing](https://www.sqlite.org/lang_select.html); [CS2023 DM Core: declarative query language](https://csed.acm.org/dm-cs-core/))

## Praktik Visualisasi: 2D sebagai Arah Pilot

### Apa yang didukung sumber

- Studi database-specific *Introducing Databases in Context Through Customizable Visualizations* menyajikan urutan visual relasional, query, dan desain dengan langkah bernama, sorotan, interaksi ulang, serta pertanyaan formatif. Pada perbandingan kustomisasi contoh lintas tiga course dan 85 mahasiswa, tidak ditemukan perbedaan signifikan pada skor pemahaman konten; persepsi kegunaan meningkat pada salah satu konteks. Studi ini mendukung kontekstualisasi dan assessment formatif sebagai pilihan desain, tetapi **bukan** perbandingan 2D dengan 3D. ([Dietrich et al., 2021, *Frontiers in Education*](https://doi.org/10.3389/feduc.2021.719134))
- Studi acak CS tentang representasi notional machine hash table membandingkan video 2D dan 3D. Peneliti melaporkan efek minimal bentuk representasi pada hasil belajar maupun persepsi helpfulness. Studi tersebut bukan materi basis data dan peserta menonton video, jadi ia tidak membuktikan bahwa interaksi 3D SQL tidak akan berguna; ia menolak asumsi bahwa label “3D” sendiri menjamin peningkatan belajar. ([Lewis et al., 2024, SIGCSE Virtual](https://doi.org/10.1145/3649165.3690118))
- Eksperimen awal viSQLizer dengan sampel kecil membandingkan visualisasi query SQL dengan tutorial online; rata-rata hasil tes kedua kelompok serupa. Penulis mengusulkan visualisasi sebagai pelengkap yang tetap memerlukan penjelasan dan latihan, dan menyatakan perlu penelitian lebih lanjut untuk mengukur dampak pada pemahaman. ([Folland, 2016, viSQLizer](https://www.ntnu.no/ojs/index.php/nikt/article/view/5477); [full paper](https://www.ntnu.no/ojs/index.php/nikt/article/download/5477/4950))

### Rekomendasi untuk Quethink

1. **Jadikan schema 2D dan hasil query tabel sebagai baseline yang selalu tersedia.** Tampilkan nama tabel, kolom, PK/FK, dan garis relasi yang dapat dibaca tanpa kamera atau animasi.
2. **Gunakan visualisasi untuk memaksa respons mahasiswa.** Sebelum query dijalankan, minta pilih baris/kolom atau prediksi pasangan join. Setelah run, tampilkan apa yang berubah dan minta mahasiswa menjelaskan satu keputusan.
3. **Pertahankan 2D untuk data relasional.** Diagram tabel/key dan tabel hasil menyatakan relasi tanpa kamera, perspektif, atau risiko elemen saling menutupi.
4. **Jangan menambahkan 3D pada jalur pilot ini.** Pertimbangkan ulang hanya untuk materi spasial, lalu pastikan dimensi ketiga menyampaikan informasi yang tidak jelas di 2D.
5. **Uji manfaat interaksi 2D pada mahasiswa sasaran.** Ukur ketepatan query, penjelasan alasan, waktu, kesalahan, dan preferensi secara terpisah. Jangan menyimpulkan peningkatan belajar dari kesenangan atau preferensi saja.

Poin 1–5 adalah **rekomendasi desain** berdasarkan keterbatasan bukti yang disebutkan, bukan hasil eksperimen Quethink.

## Kesalahan yang Perlu Diantisipasi

1. **Salah menerjemahkan pertanyaan ke schema.** Query-writing adalah tugas transformasi dari kebutuhan informasi ke sintaks sekaligus pemetaan ke tabel/kolom. Latih pola pra-query: *kolom jawaban apa → berasal dari tabel mana → butuh tabel apa lagi → baris apa yang disertakan*. ([Casterella & Vijayasarathy, 2019](https://aisel.aisnet.org/jise/vol30/iss3/4/))
2. **Query valid tetapi maknanya salah.** Dataset yang menghasilkan sebagian output masuk akal dapat menyembunyikan salah filter atau salah hubungan; minta mahasiswa memprediksi record dan memeriksa kasus batas, bukan hanya mengecek ada/tidaknya syntax error. Riset klasifikasi kesalahan mahasiswa menunjukkan kesalahan query mencakup kesalahan sintaks maupun kesalahan logis berulang. ([Taipalus, Siponen & Vartiainen, 2018](https://doi.org/10.1145/3231712))
3. **`SELECT` dianggap memfilter baris.** Bedakan proyeksi kolom (`SELECT`) dari pemilihan baris (`WHERE`) dengan dua sorotan visual terpisah.
4. **Salah memahami hasil join.** Tampilkan kolom kunci yang dipasangkan dan minta memprediksi jumlah output. Multiple rows untuk satu mahasiswa dapat benar jika mahasiswa mengambil beberapa courses.
5. **Salah membaca agregasi.** Minta mahasiswa menyebutkan unit satu baris hasil (“satu baris per course”) dan apakah yang dihitung pendaftaran atau orang unik. Tunda `COUNT(DISTINCT ...)` agar dua makna dasar ini tidak tercampur pada latihan pertama.
6. **Mengira database mengembalikan baris dalam urutan tetap.** Di SQLite, baris hasil multi-row tidak dijamin terurut tanpa `ORDER BY`; ini adalah konsep yang bisa diuji langsung dengan urutan tampil. ([SQLite, SELECT: ORDER BY](https://www.sqlite.org/lang_select.html))

## Penilaian Bahan Ajar

### Practice formatif

- Retry tanpa batas dan feedback segera.
- Setiap tugas menyatakan pertanyaan data dengan jelas, schema yang relevan, bentuk hasil yang diharapkan, dan satu tujuan query.
- Feedback membedakan syntax error, salah tabel/kolom, salah predicate, join path keliru, serta hasil agregasi pada level yang salah.
- Beberapa latihan meminta prediksi output sebelum menekan Run.

### Asesmen sumatif

- Gunakan soal transfer dengan dataset/schema yang sama strukturnya tetapi isi atau konteks data berbeda.
- Minta SQL, hasil yang benar, dan penjelasan singkat query untuk menilai alasan, bukan semata-mata hafalan sintaks.
- Jika nilai resmi diberikan oleh sistem, grader harus memeriksa query di server terhadap database penilaian terkontrol. Browser practice hanya feedback formatif; hidden expected values/checker tidak boleh dikirim ke browser.

Pemisahan practice dan asesmen ini adalah rekomendasi rancangan yang konsisten dengan keputusan keamanan Quethink saat ini; bobot dan kelulusan resmi tetap menunggu RPS/keputusan dosen untuk mata kuliah Basis Data.

## Batas Materi Pilot

**Masuk pilot:** pemahaman tabel/kolom/record, primary dan foreign key, one-to-many serta tabel penghubung, query `SELECT` satu tabel, filter, kondisi boolean dasar, sorting/limit, `INNER JOIN`, `COUNT`/`AVG`, `GROUP BY`, prediksi, visualisasi, dan debugging query sederhana.

**Tidak masuk pilot awal:** pembuatan schema dari nol secara lengkap, normalisasi formal, `INSERT`/`UPDATE`/`DELETE`, transaksi/ACID, indeks, optimasi/query plan, subquery, outer join, `HAVING`, `NULL`/three-valued logic, stored procedure, NoSQL, dan administrasi Supabase. Topik-topik itu merupakan pilihan materi lanjutan setelah pilot dan pemetaan kurikulum, bukan fitur yang perlu dibangun sekarang.

Pembatasan ini sengaja menjaga pilot pada *database literacy* dan query dasar. CS2023 mencakup topik Data Management yang jauh lebih luas; daftar di atas tidak mewakili penyelesaian penuh knowledge area Data Management. ([CS2023 Data Management](https://csed.acm.org/dm-cs-core/); [CS2023 Body of Knowledge](https://csed.acm.org/wp-content/uploads/2024/04/3.1-Body-of-Knowledge-1.pdf))

## Video Pendukung

Video berbahasa Indonesia dapat mendampingi unit sebagai pengantar singkat, tetapi tidak menggantikan query practice. Format tiap unit yang direkomendasikan:

1. Pertanyaan prediksi singkat sebelum menonton.
2. Video terkurasi dengan satu tujuan (misalnya membedakan PK dan FK, atau membaca join).
3. Query langsung menggunakan dataset pilot.
4. Satu soal transfer sesudah video.

**Belum ada video SQL berbahasa Indonesia yang diverifikasi untuk tiap capaian dalam dokumen ini.** Tautan video untuk setiap unit basis data perlu diverifikasi sebelum ditampilkan sebagai rekomendasi belajar. Kurasi berikutnya harus mencatat tautan asli, kreator, durasi/timestamp, bahasa, kecocokan konsep, contoh sintaks yang digunakan, subtitle, dan tanggal pemeriksaan.

## Pertanyaan untuk Validasi Pilot

Sebelum menetapkan jalur resmi atau menambah tabel/database latihan ke produk:

1. Apakah targetnya jalur belajar mandiri tambahan atau bagian dari satu mata kuliah Basis Data dengan RPS dan nilai resmi?
2. Apakah tujuh unit dan cakupan `SELECT`/filter/join/agregasi sesuai CPMK serta alokasi minggu perkuliahan yang dituju?
3. Apakah dataset mahasiswa–mata kuliah terasa dekat bagi target, atau perlu diganti dengan domain kampus lain tanpa menambah tabel terlalu banyak?
4. Apakah mahasiswa mampu menjelaskan hasil lebih baik setelah melihat trace 2D? Jika 3D diuji, apakah ia meningkatkan pemahaman relasi/join dibanding baseline 2D pada asesmen yang sama?
5. Apakah assessor resmi menghendaki hasil query saja, pembenaran query, atau keduanya?

## Sumber

### Kurikulum dan dokumentasi resmi

- [ACM/IEEE-CS/AAAI, CS2023 — Data Management CS Core](https://csed.acm.org/dm-cs-core/)
- [ACM/IEEE-CS/AAAI, CS2023 Body of Knowledge — DM-Querying dan DM-Relational (PDF)](https://csed.acm.org/wp-content/uploads/2024/04/3.1-Body-of-Knowledge-1.pdf)
- [Carnegie Mellon University Heinz College — Introduction to Database Management course catalog](https://www.heinz.cmu.edu/current-students/courses/90-728)
- [SQLite Language — SELECT](https://www.sqlite.org/lang_select.html)
- [SQLite — Foreign Key Support](https://www.sqlite.org/foreignkeys.html)

### Penelitian primer terkait belajar SQL dan visualisasi

- Taipalus, Siponen, & Vartiainen (2018). [Errors and Complications in SQL Query Formulation](https://doi.org/10.1145/3231712). Analisis lebih dari 33.000 query mahasiswa pada course pengantar.
- Taipalus (2020). [The Effects of Database Complexity on SQL Query Formulation](https://doi.org/10.1016/j.jss.2020.110576). Membandingkan submission dari 744 mahasiswa pada schema latihan dengan kompleksitas berbeda.
- Casterella & Vijayasarathy (2019). [Query Structure and Data Model Mapping Errors in Information Retrieval Tasks](https://aisel.aisnet.org/jise/vol30/iss3/4/). Eksperimen intervensi query-writing dengan 63 mahasiswa.
- Alkhabaz, Li, Yang, & Alawini (2023). [Student’s Learning Challenges with Relational, Document, and Graph Query Languages](https://doi.org/10.1145/3596673.3596976). Analisis submission dari 462 mahasiswa; mencakup SQL serta dua model data lainnya.
- Dietrich et al. (2021). [Introducing Databases in Context Through Customizable Visualizations](https://doi.org/10.3389/feduc.2021.719134). Studi visualisasi IntroDB pada tiga course; bukan perbandingan 2D dan 3D.
- Folland (2016). [viSQLizer: Using Visualization for Learning SQL](https://www.ntnu.no/ojs/index.php/nikt/article/view/5477). Prototipe visualisasi SQL dan studi awal dengan sampel kecil.
- Lewis et al. (2024). [Hash Table Notional Machines: A Comparison of 2D and 3D Representations](https://doi.org/10.1145/3649165.3690118). Eksperimen acak tentang bentuk representasi hash table di CS; bukan materi database.

## Rekomendasi Langkah Berikutnya

Tujuh unit, dataset jangkar, dan materi contoh telah menjadi learning path aktif di Supabase. Lab menjalankan SQLite WASM untuk `SELECT`, JOIN, filter, sorting, agregasi, dan limit pada data sintetis; diagram 2D menunjukkan tabel dan relasinya, bukan trace baris tiap klausa. Berikutnya, uji learner untuk keterbacaan materi, kecocokan video berbahasa Indonesia, prediksi hasil, aksesibilitas, dan batasan assessment. Visualisasi 3D tidak direncanakan untuk data relasional pilot ini.
