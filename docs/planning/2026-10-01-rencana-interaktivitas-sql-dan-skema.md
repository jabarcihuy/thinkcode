# Rencana Interaktivitas SQL dan Skema

> Status diperbarui 3 Oktober 2026: pembuat skema terpandu diimplementasikan; video pendamping terbatas dikurasi dan ditambahkan; paket uji mahasiswa disiapkan di `docs/evaluation/2026-10-03-uji-mahasiswa`. Sesi nyata, review audiovisual penuh, dan sinkronisasi draft akun belum dilakukan. Pre-test tetap ditunda. Daftar usulan di bawah adalah catatan asal; perilaku aktif mengikuti panduan produk dan roadmap.

## Prinsip pengalaman belajar

Gunakan satu siklus yang konsisten:

**Misi → amati skema/data → prediksi → tulis SQL → jalankan → lihat dampak → jelaskan → latihan transfer**

SQL Playground dan visualizer menjadi bagian dari kegiatan belajar. Visualisasi membantu mahasiswa memahami data dan hubungan antartabel; ia bukan sekadar dekorasi atau simulasi query plan.

## Daftar usulan fitur

### 1. Misi SQL per submateri

Setiap submateri memiliki tujuan kecil dan kontekstual. Contoh: “Temukan peminjaman yang belum dikembalikan.” Mahasiswa memeriksa tabel dan key, memprediksi hasil, menulis query, lalu membandingkan hasilnya.

Mulai dari satu irisan tipis untuk `SELECT` dan `WHERE` sebelum memperluas pola ke materi relasi serta operasi write.

### 2. Visualisasi sebab dan akibat query

Untuk query read, sorot tabel, kolom, dan baris yang dipakai atau lolos filter. Untuk `INSERT`, `UPDATE`, dan `DELETE`, tampilkan perubahan tabel secara vertikal:

**Sebelum → baris yang terdampak → sesudah**

Perubahan hanya terjadi pada database sintetis sementara di browser Worker. Preview `UPDATE`/`DELETE` tidak mengubah data; perubahan terkonfirmasi dapat di-reset.

### 3. Umpan balik berdasarkan konsep

Saat hasil belum sesuai, beri petunjuk yang mengarahkan perhatian ke sumber tabel, relasi, kolom, atau kondisi filter. Gunakan petunjuk bertahap dan izinkan percobaan ulang. Hindari langsung menampilkan query jawaban.

### 4. Latihan transfer lintas skema

Ajarkan konsep dengan Campus Mini, lalu uji pola yang sama di Katalog Buku atau Toko Mini. Tujuannya agar mahasiswa memahami pola relasi dan query, bukan menghafal satu set tabel.

### 5. Video sebagai materi pendamping

Tautkan video berbahasa Indonesia yang relevan sebagai pilihan tambahan pada submateri tertentu. Video tidak menggantikan latihan interaktif dan tidak perlu dipaksakan muncul pada setiap halaman.

### 6. Batas penilaian

Hasil query dari browser Worker bersifat formatif dan dapat dimanipulasi oleh pemilik browser. Jangan gunakan hasil tersebut sebagai nilai resmi. Assessment tetap memakai jawaban yang dapat dinilai server-side dan tidak menerima score atau status lulus dari client.

## Konsep: mahasiswa membuat skema visual sendiri

Fitur ini memungkinkan dan sesuai dengan pembelajaran basis data, jika dibuat sebagai **latihan pemodelan yang terpandu**, bukan editor ERD profesional.

### Alur yang disarankan

1. Mahasiswa menerima kebutuhan singkat, misalnya pencatatan peminjaman buku.
2. Mahasiswa menambahkan tabel, kolom, tipe data dasar, dan primary key pada kanvas 2D.
3. Mahasiswa menghubungkan foreign key dengan memilih kolom asal dan kolom tujuan. Pilihan kontrol tetap tersedia untuk layar sentuh; drag garis tidak menjadi satu-satunya cara.
4. Kanvas menggambar relasi satu-ke-banyak dan menampilkan kesalahan yang bisa ditindaklanjuti, seperti foreign key tanpa tujuan atau tabel tanpa primary key.
5. Setelah mencoba, mahasiswa membuka contoh desain dan membaca alasan di balik pemisahan tabel serta relasinya.

### Batas MVP

- Mendukung tabel, kolom, tipe data dasar, PK, FK, dan relasi satu-ke-banyak.
- Relasi banyak-ke-banyak diajarkan melalui tabel penghubung pada skenario terpandu.
- Perubahan skema berupa konfigurasi visual, bukan DDL yang dijalankan.
- Simpan draft secara lokal di browser terlebih dahulu; sinkronisasi akun dapat diputuskan setelah pola penggunaan diuji.
- Tampilkan daftar objek dan formulir pada mobile; jangan mengandalkan drag-and-drop presisi.
- Penilaian latihan dapat memberi umpan balik formatif, tetapi hasil dari state browser tidak menjadi nilai resmi.

### Batas keamanan penting

Skema buatan mahasiswa tidak boleh dikirim sebagai DDL, seed, atau konfigurasi bebas ke SQL Worker yang ada. Worker sekarang hanya memuat dataset terdaftar dari registry sintetis. Latihan pembuat skema tetap visual dan terpisah dari eksekusi SQL pada MVP. Jika kelak ingin menjalankan query pada skema buatan sendiri, desain validasi, pembatasan resource, dan pemisahan runtime harus ditinjau sebagai perubahan arsitektur tersendiri.

## Ukuran keberhasilan

- Mahasiswa dapat menjelaskan mengapa sebuah baris muncul atau berubah setelah query.
- Mahasiswa dapat membuat relasi PK/FK sederhana dari kebutuhan tertulis.
- Mahasiswa dapat menerapkan konsep yang sama pada skema berbeda.
- Petunjuk membantu percobaan berikutnya tanpa langsung membocorkan jawaban.
- SQL Worker tetap hanya mengakses dataset sintetis yang sudah terdaftar.
