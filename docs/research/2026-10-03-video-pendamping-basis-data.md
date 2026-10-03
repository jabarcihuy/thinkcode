# Kurasi Video Pendamping Basis Data

**Tanggal pemeriksaan:** 3 Oktober 2026
**Cakupan:** video YouTube berbahasa Indonesia untuk Relasi, SELECT/WHERE, INNER JOIN, dan dasar Write.
**Status:** identitas, deskripsi topik, dan respons oEmbed diperiksa. Peninjauan audiovisual penuh, subtitle, serta pemutaran embed pada perangkat pelajar belum dilakukan.

## Keputusan kurasi

Mulai dengan pilihan terbatas: satu video konsep tabel dan tiga video Read. Jadikan semuanya tambahan opsional sesudah penjelasan dan contoh Quethink, dengan pertanyaan refleksi sebelum kembali ke latihan. Kecocokan di bawah berdasarkan metadata dan deskripsi penerbit, sehingga bukan klaim bahwa seluruh penjelasan, audio, atau contoh SQL telah ditonton dan dinilai.

Video Write yang ditemukan membahas INSERT banyak baris. Tunda rekomendasi bawaan untuk Write sampai segmen yang cocok dengan INSERT satu baris dan UPDATE/DELETE bertarget telah ditinjau. Materi internal dan lab Quethink sudah menjadi sumber utama untuk preview, constraint, serta reset. Jangan memaksakan video pada seluruh sebelas lesson.

Keputusan ini mengikuti [panduan produk](../AGENTS.md), [kurikulum](../04-CURRICULUM.md), [materi siap ajar](../planning/2026-09-29-materi-siap-ajar-jalur-basis-data.md), dan [riset urutan Relasi → Read → Write](2026-09-29-riset-urutan-relasi-read-write.md).

## Tingkat bukti

- **M — metadata resmi:** GET endpoint YouTube oEmbed berhasil mengembalikan judul, nama kanal, URL kanal, dan HTML iframe untuk ID yang dicatat. Ini memverifikasi identitas dan adanya markup embed saat diperiksa; tidak menjamin pemutaran tanpa batas regional/perangkat pada masa mendatang.
- **D — deskripsi penerbit:** judul/deskripsi atau daftar bab dari halaman YouTube asli tersedia melalui indeks pencarian web. Deskripsi Indonesia menjadi bukti bahasa yang dimaksud penerbit. Bahasa audio seluruh video belum diperiksa langsung.
- **A — audiovisual:** belum tersedia untuk semua kandidat. Tidak ada klaim menonton seluruh video, memeriksa setiap query, ataupun menilai kualitas pedagogis dari audio/transkrip.

Pembukaan langsung halaman `watch` dengan alat web gagal mengambil halaman; permintaan HTML langsung juga tidak menghasilkan bukti audiovisual yang dapat dipakai. Karena itu, status D secara sengaja dibedakan dari inspeksi halaman langsung. Metadata resmi oEmbed berhasil diambil melalui HTTPS tanpa API key. Tidak ada video yang diunduh.

## Kandidat yang paling dekat dengan lesson

| Topik | Judul resmi dan sumber primer | Kreator | Bukti bahasa/topik | Batas dan penggunaan |
|---|---|---|---|---|
| Tabel, kolom, record | [KONSEP DATABASE - TABLE COLUMN ROW (SUSUNAN BARU)](https://www.youtube.com/watch?v=5xIl5EblCLk) | [Tri Fun Trik](https://www.youtube.com/@TriFunTrik) | M + D. Deskripsi Indonesia menyatakan bagian kedua seri konsep database MySQL dengan tema table, row, dan column. | Kandidat opsional untuk pengenalan bentuk tabel. Belum ada bukti khusus bahwa schema vs isi serta seluruh penjelasan sesuai lesson Quethink. Jangan mengasumsikan ada pembahasan PK/FK. |
| SELECT/FROM | [SQL 01 \| Seleksi Kolom dengan SELECT \| Belajar MySQL \| MariaDB \| Belajar Database](https://www.youtube.com/watch?v=tfHe0qe9p44) | [Indonesia Belajar](https://www.youtube.com/@belajaridn) | M + D. Deskripsi Indonesia mencantumkan pemilihan semua kolom dan sebagian kolom dari tabel. | Pilihan terarah untuk membedakan tabel sumber dan kolom keluaran. Contoh memakai MySQL/MariaDB; data dan alat berbeda dari Quethink. |
| WHERE, perbandingan, AND/OR | [SQL 03 \| Seleksi Baris dengan WHERE \| Belajar MySQL \| MariaDB \| Belajar Database](https://www.youtube.com/watch?v=y5WgcuQn0_E) | [Indonesia Belajar](https://www.youtube.com/@belajaridn) | M + D. Deskripsi Indonesia menyebut seleksi baris, AND, OR, dan operator perbandingan numerik. | Topik sesuai filter dasar, tetapi juga mencakup BETWEEN, LIKE, IN, serta pemeriksaan NULL. Jelaskan bahwa bagian tambahan tersebut belum menjadi tujuan lesson ini. |
| INNER JOIN dan hubungan key | [SQL 05 \| Belajar INNER JOIN \| Belajar MySQL \| MariaDB \| Belajar Database](https://www.youtube.com/watch?v=Chc1tUS_feU) | [Indonesia Belajar](https://www.youtube.com/@belajaridn) | M + D. Deskripsi Indonesia mencantumkan PK/FK, relasi tabel, INNER JOIN dengan ON/USING, WHERE, ORDER BY, dan alias. | Pilihan untuk lesson JOIN sesudah fondasi key. Gunakan `ON` pada praktik Quethink; `USING` bukan tujuan pilot. Jangan menjadikan video JOIN sebagai pengganti lesson Relasi tanpa SQL. |

Durasi total, rentang segmen, subtitle Indonesia, dan pemutaran aktual untuk empat video ini **belum terverifikasi**. Jangan mengisi durasi atau timestamp berdasarkan perkiraan. Tautan di tabel merupakan URL `watch` asli dengan ID sebelas karakter, tanpa parameter pelacakan.

## Kandidat tambahan yang ditahan

| Kandidat | Bukti yang tersedia | Alasan ditahan |
|---|---|---|
| [Belajar Basis Data untuk Pemula](https://www.youtube.com/watch?v=S4igMZFCvh8) — [Programmer Zaman Now](https://www.youtube.com/@ProgrammerZamanNow) | M + D. Judul dan deskripsi Indonesia; daftar bab penerbit menandai model relasional pada 00:43:36, implementasinya pada 01:01:01, dan attribute key pada 01:58:25. Bab berikutnya sampai materi selanjutnya pada 02:53:36. | Kandidat sumber konsep untuk editor, bukan rekomendasi video utuh per lesson. Mencakup ERD, model lain, normalisasi, dan denormalisasi yang melewati scope pilot. Isi PK/FK serta batas segmen perlu dilihat langsung sebelum pemetaan ke `key-dan-hubungan-antar-tabel`. Timestamp berasal dari deskripsi penerbit, bukan hasil menonton. |
| [SQL 09 \| Belajar INSERT UPDATE DELETE \| Data Manipulation Language \| DML \| Belajar MySQL \| MariaDB](https://www.youtube.com/watch?v=L3lyMZZFjrs) — [Indonesia Belajar](https://www.youtube.com/@belajaridn) | M + D. Deskripsi Indonesia mencantumkan INSERT, data tidak lengkap, INSERT banyak data sekaligus, UPDATE, dan DELETE. | Cakupan mutasi lebih luas dari Quethink. Belum ada bukti deskripsi bahwa UPDATE/DELETE menggunakan preview dengan PK, tepat satu target, dan pemeriksaan sesudah perubahan. Jangan menampilkan video utuh sebagai prosedur aman Quethink. |
| [Tutorial MySQL Database (Bahasa Indonesia)](https://www.youtube.com/watch?v=xYBclb-sYQ4) — [Programmer Zaman Now](https://www.youtube.com/@ProgrammerZamanNow) | M + D. Bahasa Indonesia dinyatakan dalam judul; deskripsi mencakup pembuatan database/tabel, manipulasi data, foreign key, dan join. | Terlalu luas untuk satu materi pemula; DDL dan administrasi tidak diterima oleh runner. Tidak dipakai dalam pilihan terbatas. |

## Pemetaan slug dan teks pendamping

Slug diperiksa pada migration seed dan reorganisasi materi yang tersedia di repo; judul learner dapat berubah tanpa mengganti slug.

| Slug lesson | URL kandidat | Status pemetaan | Kalimat pendamping yang disarankan |
|---|---|---|---|
| `membaca-bentuk-data` | `https://www.youtube.com/watch?v=5xIl5EblCLk` | Kandidat opsional berdasarkan M + D | “Video tambahan tentang tabel, kolom, dan baris. Hubungkan contohnya dengan tabel Kampus Mini yang baru kamu amati.” |
| `memilih-sumber-dan-kolom` | `https://www.youtube.com/watch?v=tfHe0qe9p44` | Pilihan Read berdasarkan M + D | “Contoh video memakai MySQL/MariaDB. Di Quethink, gunakan SQLite dan tabel latihan yang tersedia; fokus pada SELECT untuk memilih kolom dan FROM untuk memilih tabel.” |
| `menyaring-record` | `https://www.youtube.com/watch?v=y5WgcuQn0_E` | Pilihan Read berdasarkan M + D | “Fokus pada WHERE, perbandingan, AND, dan OR. Video juga memperkenalkan operator tambahan di luar sasaran latihan ini.” |
| `menghubungkan-tabel` | `https://www.youtube.com/watch?v=Chc1tUS_feU` | Pilihan Read berdasarkan M + D | “Fokus pada INNER JOIN ... ON yang memasangkan foreign key dan primary key. Pada latihan ini, tulis pasangan kolom secara eksplisit dengan ON.” |
| `key-dan-hubungan-antar-tabel` | `https://www.youtube.com/watch?v=S4igMZFCvh8` | Tahan; perlu review segmen | Jangan gunakan sebagai video seluruh lesson sebelum rentang penjelasan key/relasi yang sesuai telah diperiksa. |
| `menambahkan-record-dengan-insert` | `https://www.youtube.com/watch?v=L3lyMZZFjrs` | Tahan; perlu review segmen | Jika digunakan sesudah review: “Latihan Quethink hanya menambahkan satu baris dengan daftar kolom eksplisit. INSERT banyak baris dari video berada di luar latihan.” |
| `mengubah-record-dengan-update` | `https://www.youtube.com/watch?v=L3lyMZZFjrs` | Tahan; perlu review segmen | Jika digunakan sesudah review: “Baca target dengan SELECT dan predicate PK yang sama, tinjau preview, ubah satu record, lalu periksa hasil.” |
| `menghapus-record-dengan-delete` | `https://www.youtube.com/watch?v=L3lyMZZFjrs` | Tahan; perlu review segmen | Jika digunakan sesudah review: “Baca satu target berdasarkan PK sebelum DELETE; foreign key dapat menolak penghapusan induk. Gunakan Reset untuk memulai ulang latihan.” |

## Dialek SQL dan batas runner

Sintaks dasar `SELECT kolom FROM tabel WHERE kondisi` dan `INNER JOIN ... ON ...` tercakup di [dokumentasi SQLite SELECT](https://www.sqlite.org/lang_select.html). Ini mendukung transfer konsep dari video MariaDB; tidak menjamin semua fungsi, tipe, quoting, operator, atau query yang tampak dalam video diterima lab. Gunakan nama tabel/kolom serta string bertanda petik tunggal sesuai contoh internal. Jangan meminta peserta memasang MySQL, XAMPP, atau Beekeeper Studio untuk menyelesaikan Quethink.

SQLite menerima berbagai bentuk INSERT, termasuk banyak baris, sementara Quethink menetapkan batas satu baris. Perbedaan ini adalah **kebijakan runner**, bukan klaim bahwa SQLite tidak mendukung fitur itu. Bentuk `INSERT ... SET` yang ada pada [MySQL INSERT](https://dev.mysql.com/doc/refman/8.4/en/insert.html) juga tidak tercantum sebagai bentuk INSERT SQLite; latihan memakai daftar kolom dan `VALUES`. ([SQLite INSERT](https://www.sqlite.org/lang_insert.html))

UPDATE atau DELETE tanpa WHERE dapat mengenai semua baris di SQLite. Preview dengan predicate PK, satu target, verifikasi, dan reset mengikuti desain Quethink. Jangan mengganti batas itu dengan `LIMIT 1` yang tidak menjelaskan target. ([SQLite UPDATE](https://www.sqlite.org/lang_update.html), [SQLite DELETE](https://www.sqlite.org/lang_delete.html), [kurikulum Quethink](../04-CURRICULUM.md))

Foreign key SQLite perlu diaktifkan per koneksi oleh implementasi lab. Peserta mempelajari referensi dan constraint pada data sintetis; video tidak menjadi instruksi untuk mengubah konfigurasi lab atau Supabase. ([SQLite Foreign Key Support](https://www.sqlite.org/foreignkeys.html), [panduan produk](../AGENTS.md))

## Bukti teknis URL dan embed

Respons resmi oEmbed pada tanggal pemeriksaan mengembalikan judul/kanal di atas dan iframe `https://www.youtube.com/embed/<id>?feature=oembed`. Respons tersebut tidak menyediakan field boolean `embeddable`; bukti yang tersedia adalah keberhasilan respons dan adanya HTML iframe, bukan flag eksplisit atau pemutaran teruji. Endpoint dapat diperiksa kembali untuk setiap ID; contoh sumber langsung:

- [oEmbed konsep tabel](https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D5xIl5EblCLk&format=json)
- [oEmbed SELECT](https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DtfHe0qe9p44&format=json)
- [oEmbed WHERE](https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dy5WgcuQn0_E&format=json)
- [oEmbed INNER JOIN](https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DChc1tUS_feU&format=json)
- [oEmbed DML](https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DL3lyMZZFjrs&format=json)
- [oEmbed konsep PZN](https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DS4igMZFCvh8&format=json)
- [oEmbed tutorial MySQL PZN](https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DxYBclb-sYQ4&format=json)

Implementasi yang dibaca, [LessonVideo](../../src/features/learning/components/lesson-video.tsx) dan [youtubeVideoId](../../src/features/learning/video-url.ts), menerima URL `youtube.com/watch?v=...`/`youtu.be/...` dan membuat iframe `youtube-nocookie.com` hanya setelah tombol dipilih. Parameter timestamp pada watch URL belum diteruskan ke src iframe oleh komponen yang dibaca. Jangan mengandalkan tautan `&t=...` untuk membatasi segmen pada embed saat ini.

Keberhasilan oEmbed bukan verifikasi pemutaran pada `youtube-nocookie.com`. Gunakan label tingkat bukti di atas; akses subtitle, audio Indonesia, durasi, contoh query aktual, dan pemutaran pada desktop/mobile masih perlu pemeriksaan audiovisual untuk menaikkan status kurasi.
