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
Login → Dashboard
→ [Materi N → Selesai dibaca → Lab inti lulus → Materi berikutnya]
→ Tantangan Akhir ≥75 → Selesai
```

Tes Awal telah dinonaktifkan. Pengguna langsung mulai dari materi pertama; riwayat tes lama tetap disimpan. Bookmark `/pre-test` diarahkan ke daftar materi.

### Materi dan PDF

Materi 1–11 disajikan sebagai daftar datar, tanpa submateri. Halaman hanya berisi penjelasan, contoh, tabel statis, ringkasan dan video opsional. Setiap materi dapat diunduh sebagai PDF. Urutan konsep: **Relasi → Read → Write**.

Pilih **Selesai dibaca** untuk mencatat bacaan, lalu lulus satu latihan inti di Lab untuk membuka materi berikutnya. Membuka halaman atau mengunduh PDF saja tidak mengubah progres. Ini merupakan pengakuan membaca, bukan bukti penguasaan materi. Server memeriksa urutan, publication dan akun; URL langsung tidak melewati lock.

### Lab Materi

Buka `/lab` untuk eksplorasi visual dan mencoba query. Lab Relasi menggunakan tabel/key tanpa SQL; Read dan Write memakai SQLite sintetis di browser Worker. Lab tetap vertikal: data → query → hasil. Satu check inti per materi wajib lulus dan dapat diulang. Halaman Lab menampilkan latihan inti saja. Skor latihan terpisah dari nilai Tantangan Akhir. Bookmark halaman `/practice` lama tetap bekerja.

SQLab (skema, data, query, dan perancang database AI) dan Tutor tersedia sebagai alat bantu dari Lab. Navigasi mobile: **Beranda · Materi · Menu · Tantangan · Profil**.

### Tantangan Akhir dan penyelesaian

Buka `/post-test` setelah seluruh materi wajib dan latihan intinya tuntas. Sepuluh soal konsep dan enam tugas menulis SQL menguji Relasi, Read, dan Write. Query dinilai pada data sintetis awal dan variasi privat oleh SQLite/WASM dalam Worker server. Konsep berbobot 25%, tugas SQL 75%. Skor dihitung server-side, lulus pada **75/100**, dan percobaan dapat diulang setelah sesi sebelumnya selesai. Tantangan Akhir memiliki bobot nilai 100%. Tes Awal telah dinonaktifkan; riwayatnya tetap disimpan.

Jalur selesai setelah semua materi wajib dan latihan intinya tuntas dan Tantangan Akhir lulus. Skor produk tidak otomatis menjadi nilai yang disahkan kampus. Instrumen belum divalidasi secara psikometrik.

AI, hints, Lab/check dan pencatatan progres membaca dijeda selama sesi tes aktif. Private answer key tidak dikirim ke browser. Hanya satu sesi aktif dapat dimulai per akun. Checkpoint/tes akhir lama kini tidak terbit tetapi riwayat sesi, nilai, latihan dan progres tetap disimpan.

JavaScript/TypeScript adalah teknologi aplikasi, bukan materi mahasiswa. SQL mahasiswa hanya berjalan di browser pada database latihan sintetis.

## Stack

Next.js full-stack, TypeScript, Supabase Auth/PostgreSQL, dan SQLite WASM: browser Worker untuk latihan, Worker server terisolasi untuk penilaian Tantangan Akhir SQL. Tidak ada layanan code/query runner berbayar yang diwajibkan.

## Pemeriksaan

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

`npm run test:schema:integration` menguji pembuat skema, draft, video, dan layout 360/768/1280px pada production server. Memerlukan Chromium lokal dan kredensial Supabase server; akun uji sementara dihapus setelah tes.

Paket [uji mahasiswa](docs/evaluation/2026-10-03-uji-mahasiswa/README.md) menyediakan protokol, tugas peserta, rubrik, dan lembar observasi kosong. Sesi nyata serta efektivitas bahan ajar belum diuji. Pengujian instrumen Tantangan Akhir dengan mahasiswa masih perlu dilakukan.

Untuk menambahkan video pada database existing dengan aman, jalankan migration video yang terbaru; alternatif seed konten idempoten: `npm run seed:videos`. Seed membaca `.env`/`.env.local`, memakai secret server lokal, dan hanya menambahkan video pada empat lesson yang dipetakan; tidak mencatat histori migration. Jika seed sudah diterapkan, migration tetap dapat dijalankan tanpa menggandakan video.

### Pratinjau materi oleh admin

Buka **Admin CMS → Lesson → Buka pratinjau**. Admin dapat meninjau draft atau materi terbit tanpa menyelesaikan urutan belajar. Pratinjau menampilkan bacaan dan bagian pratinjau latihan terpisah berisi skema, lab SQL lokal, dan tampilan latihan; pemeriksaan jawaban dan pencatatan progres nonaktif. Simpan draft terlebih dahulu untuk melihat perubahan terbaru pada pratinjau lengkap.

### Seed bacaan dan PDF

`npm run seed:reading` menerapkan 11 bacaan tanpa mengubah ID materi, latihan, progres atau nilai. Migration `20261004075424_reading_materials_only.sql` menyediakan bacaan yang sama pada database baru; seed konten tidak mencatat histori migration. PDF dibuat server-side dari bacaan yang dapat diakses pengguna, menggunakan font lokal dan tanpa mengambil resource eksternal. Tidak diperlukan konfigurasi PDF tambahan di Vercel.

### Uji alur sederhana

`npm run test:flow:integration` memeriksa akses materi tanpa Tes Awal, pembacaan seluruh materi, Lab inti dan tambahan, Tantangan Akhir/retry, manipulasi skor, private key, ownership, RBAC, AI block, query SQLite dan layout 360/768/1280px pada production build. Akun sementara dibersihkan setelah tes. Migration alur terbaru `20261005091218_mandatory_learning_core.sql` diterapkan setelah migration PRETEST dan reading sebelumnya. Tidak ada environment variable baru.

## Tampilan dan transisi

Tema mobile LMS menggunakan Indigo–apricot dan DM Sans lokal. Navigasi bawah maksimal lima tujuan. Dashboard melanjutkan tes aktif atau tahap membaca/Lab yang tepat. Migration mempertahankan ketuntasan historis; Tes Awal tidak lagi menjadi syarat; materi historis tetap dapat ditinjau.

## Tantangan Akhir SQL tepercaya

Migration `20261006033506_trusted_sql_post_test.sql` membuat versi Tantangan Akhir baru tanpa menghapus hasil lama. Progres materi tetap. Nilai konsep versi lama tidak dianggap sebagai kelulusan tugas SQL versi baru. Tidak ada key atau runner berbayar tambahan.

Jalankan `npm run test:sql-assessment:integration` setelah production build untuk menguji Run, pratinjau write, draft, submit, skor server, retry, ownership, AI block, kebocoran hidden data/secret dan layout 360/768/1280. Akun uji dibersihkan setelah tes. Lakukan smoke test pada runtime Node 24 setelah deployment.

### SQLab
Buat database lokal sendiri di tab Skema, isi tabel di Data, jalankan SQL di Query, atau minta rancangan sintetis di AI lalu tinjau dan terapkan. Diagram 2D mengikuti struktur. Draf tersimpan hanya di browser dan akun yang sama; tidak memengaruhi nilai dan tidak mengakses database produksi. Maksimal 6 tabel, 8 kolom/tabel, 12 relasi dan 100 record/tabel.

### Mode tamu
Pilih **Coba sebagai tamu**, isi nama, lalu gunakan halaman dan konten yang sama dengan akun: beranda, materi/PDF/video, Lab, SQLab, chatbot serta Tantangan Akhir. Alur terarah mengikuti membaca → latihan inti → materi berikutnya → Tantangan Akhir. Progres, jawaban latihan/tes dan draf SQLab tersimpan di browser/perangkat ini, bukan di cloud. Keluar hanya menghapus sesi akses; masuk sebagai tamu lagi memulihkan progres lokal. Profil menyediakan konfirmasi reset data tamu tanpa menghapus draf akun. Perangkat bersama menggunakan satu profil tamu lokal; reset sebelum berganti pengguna. Data dapat hilang jika penyimpanan browser dibersihkan; tidak ada sinkronisasi lintas perangkat atau transfer otomatis ke akun. Nilai tamu bukan nilai resmi. Sesi tamu dan tes aktif tetap divalidasi server; tidak ada akun Supabase atau catatan progres resmi yang dibuat.

### Memeriksa navigasi dengan performa production

`npm run dev` menyusun halaman saat pertama dibuka, sehingga perpindahan pertama dapat lebih lambat. Untuk menguji seperti deployment Vercel, hentikan dev server lalu jalankan:

```bash
npm run build
npm run start
```

Lab Materi memuat eksplorasi SQL ketika panel pertama dibuka. Menutup panel mempertahankan query selama halaman tersebut terbuka. Loading boundary materi memberi respons selama data server dimuat; kecepatan tetap dipengaruhi koneksi ke Supabase dan cold start.

Aplikasi terpasang menggunakan `/app` sebagai pintu masuk sesuai sesi. Perubahan launch URL TWA memerlukan rebuild APK. Fallback offline hanya menawarkan mencoba lagi, tidak menyimpan halaman, token, atau hasil tes.

## Bahasa aplikasi

Quethink mendukung **English** dan **Bahasa Indonesia**. Default: **English**. Ganti bahasa dari selector di header; pilihan berlaku untuk halaman publik, login, tamu, akun, materi, Lab, SQLab, chatbot, tes dan PDF, lalu disimpan pada perangkat melalui cookie. Bahasa UI tidak mengubah query, nama tabel/kolom, nilai data, identitas soal, jawaban atau progress. Tutor AI mengikuti bahasa yang dipilih. Video YouTube pendamping yang sudah tersedia tetap berbahasa Indonesia dan diberi keterangan di mode English.

Terjemahan tersimpan di `src/i18n/messages/`; tidak ada layanan terjemahan runtime atau migration database tambahan. Perubahan konten CMS memerlukan pembaruan katalog terjemahan agar konten baru tersedia dalam kedua bahasa.

## Forum

Buka **Menu → Forum** untuk diskusi Basis Data atau Umum. Akun dapat membuat topik dan membalas; tamu dapat membaca. Admin dapat menutup balasan atau menyembunyikan topik/balasan. Forum dijeda selama Tantangan Akhir aktif. Konten ditampilkan sebagai teks, tanpa HTML.

Migration `20261008042509_retire_pretest_and_final_challenge.sql` menonaktifkan Tes Awal, mempertahankan riwayat, dan menamai ulang tantangan. Migration `20261008042911_discussion_forum.sql` menambahkan topik, balasan, RLS read-only untuk akun, serta mutation server dengan kuota per jam. Tidak ada variabel lingkungan baru.

`npm run test:forum:integration` menguji forum, moderasi, kuota, assessment block, RLS dan mobile pada production build dengan akun sementara yang dibersihkan setelah tes.
