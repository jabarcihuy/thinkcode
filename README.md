# Quethink

Quethink membantu mahasiswa memahami basis data relasional dengan melihat tabel, menulis query SQL, dan memeriksa hasilnya langsung.

## Jalankan secara lokal

1. Jalankan `npm install`.
2. Salin `.env.example` ke `.env.local` dan isi kredensial Supabase serta AI server jika tutor akan digunakan. Jangan kirim secret ke browser atau chat.
3. Jalankan migration Supabase sesuai urutan pada project.
4. Untuk daftar tanpa email confirmation, nonaktifkan Confirm Email di Supabase Authentication → Sign In / Providers → Email.
5. Jalankan `npm run dev`.

## Alur pengguna: dari login sampai selesai

```text
Landing page
→ Daftar atau login
→ Dashboard
→ Jalur Basis Data
→ Lesson dan practice
→ Checkpoint
→ Lesson berikutnya
→ Tes Akhir · Relasi, Read, dan Write
→ Jalur selesai
```

### 1. Masuk dan lihat langkah berikutnya

Setelah daftar atau login, pengguna tiba di dashboard. Dashboard menampilkan progres, unit yang sedang dipelajari, lesson berikutnya, dan checkpoint yang sudah terbuka. Pengguna baru memilih **Mulai belajar**; pengguna yang kembali memilih **Lanjutkan belajar**.

### 2. Ikuti tiga materi utama

Konten dikelompokkan sebagai **Relasi**, **Write**, dan **Read**. Urutan belajar mengikuti prasyarat: **Relasi → Read → Write**.

- **Relasi:** Membaca Bentuk Data; Key dan Hubungan Antar Tabel.
- **Read:** Memilih Sumber dan Kolom; Menyaring Record; Mengurutkan dan Membatasi Hasil; Menghubungkan Tabel dengan JOIN; Merangkum Data dengan GROUP BY; Tantangan Query Kampus.
- **Write:** Menambahkan Record dengan INSERT; Mengubah Record dengan UPDATE; Menghapus Record dengan DELETE.

Lesson berikutnya terbuka setelah practice wajib dan checkpoint prasyarat selesai. Lesson terkunci juga diperiksa di server, jadi URL langsung tidak dapat melewati urutan belajar.

### 3. Belajar dan bereksperimen di lesson

Pada setiap unit, pengguna membaca konsep dan contoh, lalu mengamati tabel, kolom, key, serta relasinya. Video berbahasa Indonesia menjadi pendukung opsional jika tersedia; video tidak menggantikan kegiatan query.

Siklus lab:

1. Baca pertanyaan tentang data.
2. Amati skema 2D, pilih tabel untuk melihat record, lalu ikuti hubungan PK/FK.
3. Prediksi baris atau bentuk hasil.
4. Tulis atau ubah query SQL, lalu pilih **Run**.
5. Periksa hasil aktual dan visualisasi relasinya.
6. Coba latihan eksplorasi tiap submateri, lalu tuntaskan satu practice wajib penutup. Gunakan feedback untuk mencoba lagi.

Query dijalankan oleh SQLite pada data sintetis Kampus Mini, Katalog Buku, atau Toko Mini di browser. Query tidak terhubung ke data pengguna atau database Supabase. Contoh utama dan practice wajib memakai Kampus Mini; setiap lesson juga punya latihan opsional pada skema lain. Lab menyediakan tugas lintas konteks yang sesuai materi. Ganti skema memulai sesi lokal baru. Practice dapat dicoba ulang; AI Tutor dapat membantu saat belajar/practice jika tersedia.
Pengguna yang sudah login juga dapat membuka **Chatbot** dan **SQL Playground** dari navigasi akun. Chatbot memakai lesson yang sedang/akan dipelajari sebagai konteks dan menyediakan tautan kembali ke lesson. SQL Playground menyediakan pilihan ketiga skema di Worker lokal, tidak mengubah progres, dan dijeda selama assessment aktif.

### 4. Selesaikan practice untuk membuka materi

Setiap lesson mempunyai dua latihan eksplorasi opsional dan satu practice wajib. Practice wajib harus lulus agar lesson ditandai selesai; latihan opsional tidak menghambat progres. Setelah itu, lesson berikutnya terbuka dan progres dashboard diperbarui. Pengguna dapat mengulang lesson yang sudah selesai.

Checkpoint dan final assessment terpisah dari practice. Selama assessment berlangsung, AI Tutor dan petunjuk dinonaktifkan. Hasil assessment dihitung dan disimpan oleh server; skor minimum lulus saat ini **75/100**. Percobaan dapat diulang setelah sesi sebelumnya dikirim.

### 5. Lewati checkpoint dan tamatkan jalur

Checkpoint tersedia setelah kelompok unit berikut:

- **Checkpoint 1:** setelah materi Relasi.
- **Checkpoint 2:** setelah materi Read.
- **Checkpoint 3:** setelah materi Write.
- **Tes Akhir:** setelah semua materi dan checkpoint prasyarat selesai.

Jalur dinyatakan selesai setelah seluruh lesson wajib selesai dan semua checkpoint serta final assessment lulus. Dashboard dan halaman assessment menampilkan progres, status kelulusan, dan skor. Skor yang tercatat di Quethink tidak otomatis menjadi nilai resmi kampus atau mata kuliah.

JavaScript dan TypeScript adalah teknologi internal aplikasi, bukan materi siswa. Practice SQL hanya memakai dataset latihan lokal; assessment memakai mekanisme penilaian server yang tidak mengirim jawaban privat ke browser.

## Stack

Next.js full-stack, TypeScript, Supabase Auth/PostgreSQL, dan SQLite WASM di browser Worker. Tidak ada layanan code/query runner berbayar yang diwajibkan.

## Pemeriksaan

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

### Pratinjau materi oleh admin

Buka **Admin CMS → Lesson → Buka pratinjau**. Admin dapat meninjau draft atau materi terbit tanpa menyelesaikan urutan belajar. Pratinjau menampilkan materi, skema, lab SQL lokal, dan tampilan latihan; pemeriksaan jawaban dan pencatatan progres nonaktif. Simpan draft terlebih dahulu untuk melihat perubahan terbaru pada pratinjau lengkap.
