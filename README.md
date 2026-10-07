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
Login → Dashboard → Pre-test sekali
→ [Materi N → Selesai dibaca → Lab inti lulus → Materi berikutnya]
→ Post-test ≥75 → Selesai
```

### Pre-test

Buka `/pre-test` untuk mencatat pemahaman awal tentang Relasi, Read, dan Write melalui sepuluh pertanyaan. Pilih **Belum tahu** bila belum mengenal konsepnya. Tidak ada syarat lulus atau bobot nilai; hasil yang sudah dikirim tidak dapat diulang. Pre-test wajib diselesaikan sebelum materi baru terbuka; nilainya tidak menentukan kelulusan. Jika belajar sudah dimulai, halaman menjelaskan bahwa hasil bukan lagi baseline sebelum belajar.

### Materi dan PDF

Materi 1–11 disajikan sebagai daftar datar, tanpa submateri. Halaman hanya berisi penjelasan, contoh, tabel statis, ringkasan dan video opsional. Setiap materi dapat diunduh sebagai PDF. Urutan konsep: **Relasi → Read → Write**.

Pilih **Selesai dibaca** untuk mencatat bacaan, lalu lulus satu latihan inti di Lab untuk membuka materi berikutnya. Pre-test wajib selesai sekali sebelum materi baru terbuka. Membuka halaman atau mengunduh PDF saja tidak mengubah progres. Ini merupakan pengakuan membaca, bukan bukti penguasaan materi. Server memeriksa urutan, publication dan akun; URL langsung tidak melewati lock.

### Lab Materi

Buka `/lab` untuk eksplorasi visual dan mencoba query. Lab Relasi menggunakan tabel/key tanpa SQL; Read dan Write memakai SQLite sintetis di browser Worker. Lab tetap vertikal: data → query → hasil. Satu check inti per materi wajib lulus dan dapat diulang. Halaman Lab menampilkan latihan inti saja. Skor latihan terpisah dari nilai post-test. Bookmark halaman `/practice` lama tetap bekerja.

SQLab (skema, data, query, dan perancang database AI) dan Tutor tersedia sebagai alat bantu dari Lab. Navigasi mobile: **Beranda · Materi · Menu · Tes · Profil**.

### Post-test dan penyelesaian

Buka `/post-test` setelah seluruh materi wajib dan latihan intinya tuntas. Sepuluh soal konsep dan enam tugas menulis SQL menguji Relasi, Read, dan Write. Query dinilai pada data sintetis awal dan variasi privat oleh SQLite/WASM dalam Worker server. Konsep berbobot 25%, tugas SQL 75%. Skor dihitung server-side, lulus pada **75/100**, dan percobaan dapat diulang setelah sesi sebelumnya selesai. Post-test memiliki bobot nilai 100%; pre-test tidak dihitung.

Jalur selesai setelah semua materi wajib dan latihan intinya tuntas dan post-test lulus. Skor produk tidak otomatis menjadi nilai yang disahkan kampus. Kedua instrumen belum divalidasi secara psikometrik; selisih skor bukan bukti tunggal efektivitas belajar.

AI, hints, Lab/check dan pencatatan progres membaca dijeda selama sesi tes aktif. Private answer key tidak dikirim ke browser. Hanya satu sesi aktif dapat dimulai per akun. Checkpoint/tes akhir lama kini tidak terbit tetapi riwayat sesi, nilai, latihan dan progres tetap disimpan.

JavaScript/TypeScript adalah teknologi aplikasi, bukan materi mahasiswa. SQL mahasiswa hanya berjalan di browser pada database latihan sintetis.

## Stack

Next.js full-stack, TypeScript, Supabase Auth/PostgreSQL, dan SQLite WASM: browser Worker untuk latihan, Worker server terisolasi untuk penilaian post-test SQL. Tidak ada layanan code/query runner berbayar yang diwajibkan.

## Pemeriksaan

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

`npm run test:schema:integration` menguji pembuat skema, draft, video, dan layout 360/768/1280px pada production server. Memerlukan Chromium lokal dan kredensial Supabase server; akun uji sementara dihapus setelah tes.

Paket [uji mahasiswa](docs/evaluation/2026-10-03-uji-mahasiswa/README.md) menyediakan protokol, tugas peserta, rubrik, dan lembar observasi kosong. Sesi nyata serta efektivitas bahan ajar belum diuji. Pre-test produk tersedia; pengujian instrumennya dengan mahasiswa masih perlu dilakukan.

Untuk menambahkan video pada database existing dengan aman, jalankan migration video yang terbaru; alternatif seed konten idempoten: `npm run seed:videos`. Seed membaca `.env`/`.env.local`, memakai secret server lokal, dan hanya menambahkan video pada empat lesson yang dipetakan; tidak mencatat histori migration. Jika seed sudah diterapkan, migration tetap dapat dijalankan tanpa menggandakan video.

### Pratinjau materi oleh admin

Buka **Admin CMS → Lesson → Buka pratinjau**. Admin dapat meninjau draft atau materi terbit tanpa menyelesaikan urutan belajar. Pratinjau menampilkan bacaan dan bagian pratinjau latihan terpisah berisi skema, lab SQL lokal, dan tampilan latihan; pemeriksaan jawaban dan pencatatan progres nonaktif. Simpan draft terlebih dahulu untuk melihat perubahan terbaru pada pratinjau lengkap.

### Seed bacaan dan PDF

`npm run seed:reading` menerapkan 11 bacaan tanpa mengubah ID materi, latihan, progres atau nilai. Migration `20261004075424_reading_materials_only.sql` menyediakan bacaan yang sama pada database baru; seed konten tidak mencatat histori migration. PDF dibuat server-side dari bacaan yang dapat diakses pengguna, menggunakan font lokal dan tanpa mengambil resource eksternal. Tidak diperlukan konfigurasi PDF tambahan di Vercel.

### Uji alur sederhana

`npm run test:flow:integration` memeriksa baseline pre-test, pembacaan seluruh materi, Lab inti dan tambahan, post-test/retry, manipulasi skor, private key, ownership, RBAC, AI block, query SQLite dan layout 360/768/1280px pada production build. Akun sementara dibersihkan setelah tes. Migration alur terbaru `20261005091218_mandatory_learning_core.sql` diterapkan setelah migration PRETEST dan reading sebelumnya. Tidak ada environment variable baru.

## Tampilan dan transisi

Tema mobile LMS menggunakan Indigo–apricot dan DM Sans lokal. Navigasi bawah maksimal lima tujuan. Dashboard melanjutkan tes aktif atau tahap membaca/Lab yang tepat. Migration mempertahankan ketuntasan historis; pengguna lama perlu baseline sebelum materi baru, sedangkan materi historis tetap dapat ditinjau.

## Post-test SQL tepercaya

Migration `20261006033506_trusted_sql_post_test.sql` membuat versi post-test baru tanpa menghapus hasil lama. Baseline dan progres materi tetap. Nilai konsep versi lama tidak dianggap sebagai kelulusan tugas SQL versi baru. Tidak ada key atau runner berbayar tambahan.

Jalankan `npm run test:sql-assessment:integration` setelah production build untuk menguji Run, pratinjau write, draft, submit, skor server, retry, ownership, AI block, kebocoran hidden data/secret dan layout 360/768/1280. Akun uji dibersihkan setelah tes. Vercel belum di-deploy; lakukan smoke test pada runtime Node 24 setelah deployment.

### SQLab
Buat database lokal sendiri di tab Skema, isi tabel di Data, jalankan SQL di Query, atau minta rancangan sintetis di AI lalu tinjau dan terapkan. Diagram 2D mengikuti struktur. Draf tersimpan hanya di browser dan akun yang sama; tidak memengaruhi nilai dan tidak mengakses database produksi. Maksimal 6 tabel, 8 kolom/tabel, 12 relasi dan 100 record/tabel.
