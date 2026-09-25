# ThinkCode

ThinkCode adalah **Interactive Programming Logic Lab**. MVP memakai JavaScript sebagai medium untuk belajar logika, bukan materi web development. Stack: satu Next.js full-stack codebase di Vercel, Supabase PostgreSQL/Auth, Monaco, browser sandbox, dan execution visualizer. Tidak ada compiler atau code runner berbayar yang wajib.

## Menjalankan lokal

1. `npm install`.
2. Salin `.env.example` ke `.env.local`. Isi URL dan publishable key Supabase, secret key server, URL/model/key AI server. Jangan beri prefix `NEXT_PUBLIC_` ke secret key atau kredensial AI.
3. Jalankan seluruh migration di `supabase/migrations` menurut urutan nama pada project Supabase baru. Migrasi terakhir menambahkan Admin CMS dan mencabut write grant konten dari role browser.
4. Di Supabase Dashboard, aktifkan Email provider, atur Site URL, dan daftarkan `http://localhost:3000/auth/confirm` sebagai Redirect URL lokal. Untuk template Confirm signup berbasis token hash, gunakan `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`.
5. `npm run dev`.

Promosi admin hanya oleh operator tepercaya melalui database: `update public.profiles set role = 'ADMIN' where id = '<verified-user-uuid>';`.

## Alur belajar

Landing → register/login → dashboard → learning path → lesson → konsep/flowchart/pseudocode → prediksi output → edit `main.js` → Run → output/trace → practice → AI Tutor → Check → progres → unlock → checkpoint/final assessment. CMS admin memakai draft → preview → publish. Sebagian chapter 7–10 masih berupa struktur kurikulum tanpa lesson lengkap. Lesson terkunci diperiksa server. Guest hanya dapat membaca lesson preview.

Run berjalan lokal di worker dalam iframe ber-origin terisolasi. Source dibatasi 16 KB, input teks 4 KB, output 100 baris/8 KB, trace 200 langkah, dan waktu maksimum 3 detik. Timeout menghentikan worker. `input` adalah string masukan opsional yang tersedia di source JavaScript. Monaco dibundel bersama aplikasi agar tidak memerlukan CDN saat runtime.

Check untuk coding practice menjalankan test **terlihat** di browser. Hasil browser dapat dimanipulasi sehingga hanya merupakan feedback belajar, bukan skor assessment tepercaya. Predict Output, pseudocode, dan flowchart diperiksa server terhadap jawaban privat. Hidden practice coding tests tidak didukung untuk grading browser dan latihan tersebut ditolak saat publish. Assessment coding menggunakan QuickJS/WASM server-side dengan resource limit; test dan jawaban tersembunyi tidak dikirim ke browser atau AI context.

## Biaya dan deployment

Arsitektur awal dapat memakai Vercel Hobby, Supabase Free, dan runtime browser tanpa layanan eksekusi tambahan. Periksa syarat penggunaan dan kuota paket sebelum deployment nyata. Vercel Hobby ditujukan untuk penggunaan personal/nonkomersial. Di Vercel konfigurasi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SECRET_KEY`, `AI_API_URL`, `AI_API_KEY`, dan `AI_MODEL`. `SUPABASE_SECRET_KEY` serta seluruh kredensial AI server-only. Tidak ada layanan compiler/code runner eksternal wajib.

## Pemeriksaan

`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run test:flow:integration`, `npm run test:admin:integration`, dan `npm run build`. Browser integration memakai Chromium, project Supabase dengan migration terpasang, serta user/konten sementara yang dibersihkan setelah uji. Responsive smoke tests mencakup viewport 360, 768, dan 1280px. SQL tests di `supabase/tests` memakai rollback.

## Struktur utama

- `src/app`: halaman, auth callback, protected pages, and learner/admin APIs.
- `src/features/learning`: query, progression, dan UI path/lesson.
- `src/features/workspace`: Monaco, browser sandbox, trace generator, visualizer, output.
- `src/features/practice`: exercise modular, checker, validasi, data access.
- `src/features/ai`, `src/features/assessment`, `src/features/admin`: contextual tutoring, trusted assessment, and role-protected CMS.
- `src/lib/providers`: CodeRunner/AIProvider contracts, BrowserJavaScriptRunner, and QuickJS assessment adapter.
- `src/lib/supabase`, `src/lib/auth`, `src/lib/authorization`: client, session, privileged access, roles.
- `supabase/migrations`: schema, RLS, seed, dan migrasi JavaScript.
