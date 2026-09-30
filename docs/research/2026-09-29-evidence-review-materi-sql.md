# Tinjauan Riset untuk Materi Pilot SQL

> Tinjauan ini mencatat bukti untuk rancangan awal tujuh unit yang hanya berfokus pada SELECT. Jumlah unit dan cakupan tersebut sudah digantikan oleh kurikulum aktif tiga topik di [docs/04-CURRICULUM.md](../04-CURRICULUM.md). Gunakan sumbernya untuk latar pembelajaran SQL dan visualisasi, bukan sebagai sumber struktur kurikulum aktif.

**Tanggal:** 29 September 2026

**Cakupan:** Bukti untuk mematangkan tujuh unit pada [rancangan jalur belajar Basis Data](../planning/2026-09-29-rancangan-jalur-belajar-basis-data.md).

**Status:** Catatan riset; bukan pemetaan ke RPS Indonesia atau keputusan implementasi.

## Ringkasan

Urutan tujuh unit cocok sebagai *pilot query lab* untuk pemula: mahasiswa perlu membaca model relasional dan kebutuhan informasi sebelum menulis query, kemudian berlatih terpisah pada filter, sorting, join, dan agregasi sebelum menggabungkannya. CS2023 menempatkan pemodelan relasional, tabel/baris/kolom/key, serta pembentukan query SQL dalam kompetensi Data Management. Penelitian pendidikan SQL menunjukkan bahwa pemetaan pertanyaan ke schema, join, agregasi, serta query yang valid secara sintaks tetapi salah secara makna perlu mendapat perhatian eksplisit. Sumber tersebut mendukung urutan dan jenis aktivitas di bawah, tetapi tidak menetapkan durasi 60–90 menit per unit maupun membuktikan keunggulan visualisasi 3D.

## Bukti yang Dapat Dipakai

### Kurikulum

CS2023 menyebut relasi, tuple, field, dan pemodelan data dengan tabel, baris, kolom, serta key. Kompetensi *Query the Relational Model* meminta mahasiswa menerjemahkan user story dan business requirement ke query SQL, termasuk `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `JOIN`, dan `GROUP BY`. Dokumen ini menjadi acuan cakupan yang relevan, bukan urutan kuliah atau RPS yang wajib diikuti Quethink. ([CS2023 Data Management Core](https://csed.acm.org/dm-cs-core/); [CS2023: Query the Relational Model](https://csed.acm.org/query-the-relational-model/))

### Tantangan belajar SQL

- Dalam eksperimen 63 mahasiswa yang hampir menyelesaikan mata kuliah basis data 15 minggu, Casterella dan Vijayasarathy mengkaji kesalahan pada dua bagian tugas: menerjemahkan permintaan informasi ke struktur query dan memetakan permintaan itu ke tabel/kolom. Ini memberi dasar untuk aktivitas perencanaan sebelum mengetik sintaks, bukan hanya soal melengkapi kata kunci. ([artikel dan abstrak JISE](https://aisel.aisnet.org/jise/vol30/iss3/4/))
- Analisis 744 mahasiswa pada tiga cohort dan database latihan dengan tingkat kompleksitas berbeda menemukan keberhasilan formulasi lebih tinggi pada database sederhana dibanding database semi-kompleks/kompleks. Perbandingan cohort bukan eksperimen acak per mahasiswa; hasil ini mendukung pengendalian jumlah tabel dan relasi pada pilot, tetapi tidak membuktikan bahwa schema lebih sederhana selalu lebih baik. ([Taipalus, *The Effects of Database Complexity on SQL Query Formulation*](https://doi.org/10.1016/j.jss.2020.110576))
- Analisis lebih dari 33.000 query dari mata kuliah pengantar mengidentifikasi pola kesalahan sintaks, makna/logika, dan komplikasi query. Studi lintas bahasa query dengan 357.215 submission dari 462 mahasiswa juga melaporkan JOIN dan agregasi sebagai operasi yang sulit; karena studi itu mencakup SQL, MongoDB, dan Neo4j, temuan tidak dapat dianggap sebagai ukuran khusus untuk SQLite atau kelas Quethink. ([Taipalus et al., *Errors and Complications in SQL Query Formulation*](https://doi.org/10.1145/3231712); [Alkhabaz et al., DataEd 2023](https://doi.org/10.1145/3596673.3596976))

## Rekomendasi Materi per Unit

Rekomendasi di kolom kanan adalah keputusan desain untuk pilot, bukan temuan eksperimen Quethink.

| Unit | Titik konsep yang perlu dipastikan | Aktivitas/bukti belajar yang disarankan |
|---|---|---|
| **1. Schema, tabel, dan key** | Bedakan schema dari isi; tabel, kolom, dan baris; primary key mengidentifikasi record; foreign key menunjuk record terkait. Perlihatkan tabel penghubung sebagai alasan relasi M:N memerlukan lebih dari satu tabel. CS2023 menyertakan relasi, tuple, fields, key, serta integritas referensial di cakupan inti. | Minta mahasiswa menunjuk kolom yang mengidentifikasi setiap baris, mencocokkan FK ke PK, dan menelusuri `students → enrollments → courses`. Pakai satu dataset kecil yang sama pada semua unit agar kesulitan datang dari konsep baru, bukan schema baru. |
| **2. `SELECT` dan `FROM`** | `FROM` menetapkan sumber record; daftar di `SELECT` menetapkan kolom hasil. Query valid belum tentu menjawab permintaan. SQLite menjelaskan bahwa `SELECT` menghasilkan nol atau lebih baris dan tidak mengubah database. | Beri pertanyaan konkret, lalu minta rencana singkat “tabel sumber → kolom yang diminta → bentuk hasil” sebelum query. Minta memilih kolom hasil tanpa menyaring baris; gunakan `SELECT *` hanya untuk inspeksi awal. |
| **3. `WHERE` dan predicate** | `WHERE` menyaring baris menurut kondisi. Bedakan operator perbandingan, `AND`, `OR`, dan tanda kurung dengan contoh kecil. Hindari pertanyaan bahasa alami yang ambigu. | Prediksi baris yang lolos sebelum Run; tambah contoh nilai tepat di batas perbandingan. Berikan feedback terpisah untuk kolom yang salah, operator yang salah, dan kondisi yang terlalu luas/sempit. Ini menargetkan penerjemahan kebutuhan informasi ke query. |
| **4. `ORDER BY` dan `LIMIT`** | Urutan multi-baris tidak dijamin tanpa `ORDER BY`; `LIMIT` membatasi banyak baris hasil. `LIMIT` tanpa pengurutan yang diminta bukan cara menentukan “top N” yang stabil. | Tampilkan data dengan nilai urut yang jelas atau tambahkan kriteria pemecah seri. Minta mahasiswa membandingkan hasil ASC/DESC dan memprediksi tiga baris teratas; pastikan pertanyaan menyebut kriteria ranking dengan jelas. |
| **5. `INNER JOIN`** | `JOIN ... ON ...` memasangkan baris berdasarkan kondisi; satu baris di sisi PK dapat cocok dengan banyak FK, sehingga output dapat memiliki beberapa baris per entitas. Pasangan yang salah dapat menghasilkan query yang berjalan tetapi jawabannya keliru. | Mulai dari satu pasangan tabel; mahasiswa tandai key yang dicocokkan dan hitung pasangan sebelum Run. Setelah benar, tambahkan tabel ketiga. Sertakan contoh satu mahasiswa dengan beberapa enrollment untuk menguji pemahaman multiplicity. |
| **6. `COUNT`, `AVG`, `GROUP BY`** | Satu baris agregat mewakili satu grup. Bedakan menghitung baris pendaftaran (`COUNT(*)`) dari menghitung nilai non-NULL suatu kolom (`COUNT(column)`); `AVG` mengabaikan NULL dan menghasilkan nilai floating point di SQLite. | Minta mahasiswa menyebut “satu baris hasil mewakili apa?” sebelum mengisi aggregate. Visualisasikan baris sumber yang masuk tiap grup lalu bandingkan jumlah baris dan rerata. Awali tanpa `HAVING`, `COUNT(DISTINCT ...)`, atau grup kosong agar arti grup stabil. |
| **7. Tantangan integratif** | Query dapat valid tetapi secara logika menjawab pertanyaan yang salah. Kebutuhan, schema, filter, join, agregasi, dan urutan harus selaras. | Berikan pertanyaan baru dengan domain dan tingkat schema tetap; kurangi scaffold secara bertahap. Nilai hasil dan penjelasan: tabel yang dipilih, hubungan, kondisi, unit agregasi, dan alasan pengurutan. Gunakan data uji yang dapat membedakan join/filter salah dari solusi benar. |

Urutan pedagogis `FROM → WHERE → grouping/result → DISTINCT` pada dokumentasi SQLite secara eksplisit bersifat *ilustratif*, bukan janji urutan eksekusi fisik engine. Visualizer sebaiknya menamainya “langkah konseptual untuk memahami hasil”, bukan query plan SQLite. Dokumentasi yang sama menyatakan bahwa join menggabungkan kombinasi baris lalu `ON` hanya mempertahankan pasangan dengan ekspresi bernilai true. ([SQLite SELECT](https://www.sqlite.org/lang_select.html))

SQLite juga menyatakan urutan hasil tidak didefinisikan tanpa `ORDER BY` dan `LIMIT` menetapkan batas jumlah baris. Untuk agregat, `COUNT(*)` menghitung semua baris dalam grup, `COUNT(X)` menghitung X non-NULL, sedangkan `AVG(X)` merata-ratakan X non-NULL. Ini adalah perilaku dialek SQLite; materi dan playground harus sama-sama menyebut SQLite agar tidak mengesankan seluruh DBMS identik. ([SQLite SELECT: ORDER BY/LIMIT](https://www.sqlite.org/lang_select.html); [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html))

Pada Unit 1, bila playground memakai constraint foreign key SQLite, aktifkan `PRAGMA foreign_keys = ON` untuk setiap koneksi sebelum memuat seed. Deklarasi `REFERENCES` saja tidak cukup: dokumentasi SQLite menyatakan enforcement dinonaktifkan secara default per koneksi. ([SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html))

## Batas Bukti dan Interpretasi

- CS2023 adalah panduan kompetensi luas untuk pendidikan komputasi; ia tidak menetapkan tujuh unit ini, alokasi waktu, urutan rinci, bobot nilai, atau kesesuaian dengan RPS tertentu.
- Studi query-writing yang dirujuk dilakukan pada populasi, mata kuliah, schema, dan DBMS yang berbeda dari mahasiswa Quethink. Gunakan sebagai sinyal area yang patut diperiksa, bukan prediksi pasti tentang kelas lokal.
- Bukti mendukung query practice dan pemetaan eksplisit kebutuhan ke schema/SQL. Bukti di sini tidak cukup untuk menyimpulkan 3D lebih efektif daripada diagram 2D, atau bahwa animasi saja meningkatkan hasil belajar.
- Materi ini mengajarkan subset SQLite untuk query retrieval dasar. Ia belum mencakup kompetensi keseluruhan mata kuliah basis data seperti normalisasi, transaksi, manipulasi data, keamanan, atau optimasi.

## Sumber

1. [ACM/IEEE-CS/AAAI, CS2023 — DM CS Core](https://csed.acm.org/dm-cs-core/)
2. [ACM/IEEE-CS/AAAI, CS2023 — Query the Relational Model](https://csed.acm.org/query-the-relational-model/)
3. Casterella & Vijayasarathy (2019), [Query Structure and Data Model Mapping Errors in Information Retrieval Tasks](https://aisel.aisnet.org/jise/vol30/iss3/4/), *Journal of Information Systems Education*, 30(3), 178–190.
4. Taipalus (2020), [The Effects of Database Complexity on SQL Query Formulation](https://doi.org/10.1016/j.jss.2020.110576), *Journal of Systems and Software*, 165, 110576.
5. Taipalus, Siponen, & Vartiainen (2018), [Errors and Complications in SQL Query Formulation](https://doi.org/10.1145/3231712), *ACM Transactions on Computing Education*, 18(3).
6. Alkhabaz, Li, Yang, & Alawini (2023), [Student's Learning Challenges with Relational, Document, and Graph Query Languages](https://doi.org/10.1145/3596673.3596976), DataEd 2023, 30–36.
7. [SQLite SELECT](https://www.sqlite.org/lang_select.html), [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html), [SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html).
