# Sistem Pembelajaran Quethink

## Alur wajib

**Materi membaca → Lab latihan inti → materi berikutnya → Tantangan Akhir (lulus ≥75) → selesai.**

Tes Awal dinonaktifkan. Pengguna langsung dapat membuka materi pertama; riwayat Tes Awal tetap diarsipkan. Satu sesi tes aktif per pengguna. Dashboard selalu melanjutkan sesi aktif terlebih dahulu.

Materi 1–11 adalah daftar datar dalam urutan Relasi → Read → Write. Halaman materi hanya berisi bacaan, contoh statis, video pendamping opsional, dan Unduh PDF. Tidak ada submateri, latihan, editor query atau panel AI pada bacaan.

## Ketuntasan materi

1. Pengguna membuka materi yang tersedia dan memilih Selesai membaca, lanjut ke Lab.
2. Server menyimpan read_at dan status IN_PROGRESS, bukan langsung COMPLETED.
3. Pengguna masuk ke Lab terkait, mengamati data/diagram dan menyelesaikan satu latihan inti.
4. Server memeriksa jawaban deterministik. Materi COMPLETED jika read_at terisi dan semua latihan required/published passed.
5. Materi prerequisite berikutnya tersedia. Halaman Lab menampilkan latihan inti saja; retry tanpa penalti.

SQL eksplorasi dan Run tetap lokal dalam SQLite Worker. Hasil eksekusi browser tidak menjadi bukti ketuntasan. Latihan inti memakai jawaban deterministik server (prediksi tabel, pilihan, urutan, atau struktur model). Admin hanya boleh mempublikasikan latihan required yang dapat dinilai server.

## Latihan inti

Materi 1: membedakan record dan schema. Materi 2: menyusun model peminjaman buku dengan tabel, PK, FK dan relasi. Materi 3–11: latihan posisi 3 pada bank existing (SELECT/FROM, filter, urutan/limit, JOIN, agregasi, laporan, INSERT, UPDATE, DELETE). Latihan pendukung lama tidak ditampilkan di Lab; riwayatnya tetap disimpan. Model wajib menyertakan tabel/kolom yang ditetapkan prompt; identifier internal bebas. Pemeriksa membandingkan struktur, bukan jumlah tabel saja.

## Tes dan selesai

Tantangan Akhir terbuka setelah semua materi wajib tuntas. Post-test versi SQL memuat 10 soal konsep (25% bobot) dan 6 tugas menulis SQL (75% bobot). Query dinilai di SQLite/WASM server pada data sintetis awal dan variasi privat. Nilai dihitung server, lulus minimal 75; retry setelah sesi sebelumnya selesai. Course complete membutuhkan seluruh materi required complete dan post-test passed. Riwayat Tes Awal diarsipkan dan tidak menjadi syarat atau nilai akhir.

Saat tes IN_PROGRESS: AI, latihan, pengakuan membaca dan pembuat skema dijeda oleh backend. Materi yang sudah selesai boleh ditinjau. Hidden keys server-only; pengguna hanya memperoleh skor dan feedback aman.

## Transisi pengguna lama

Status COMPLETED yang tercatat sebelum migration dipertahankan, read_at dibackfill dari completed_at/started_at. Progres tersebut adalah ketuntasan historis, bukan bukti lulus latihan inti baru. Materi historis tetap dapat ditinjau. Tidak ada lagi syarat baseline untuk membuka materi atau Tantangan Akhir. Riwayat attempt, skor, hasil dan checkpoint lama tidak dihapus.

## Pengawasan akses

RLS membatasi progres/hasil ke pemilik. Mutasi ketuntasan melalui RPC server; pengguna tidak menulis score/status bebas. Validasi URL, prerequisite, read_at dan tantangan aktif ada di server dan database. ADMIN preview terpisah dapat meninjau draft tanpa memengaruhi progres siswa.

## Versi post-test SQL

Post-test konsep lama ditarik dari publikasi; soal, sesi dan hasil lama tetap tersimpan. Nilai lama bukan bukti lulus tugas SQL versi baru. Dashboard menggunakan post-test published saat ini; baseline dan ketuntasan materi tidak direset. Rollout menunggu sesi post-test lama selesai.

## Named guest demo mode

Users may enter `/guest/start` with only a display name. This creates a signed HttpOnly session cookie, not a Supabase user/profile or new role. `/guest` provides dashboard, all published Database Fundamentals materials/PDFs, core Labs, SQLab, contextual AI and pre/post-test demos with the same local learning sequence as an account. Guest pages and APIs are separate from authenticated learner/admin routes; existing RBAC, RLS and official progression remain unchanged.

Guest progress, reading acknowledgements, passed exercises, answer drafts, test summaries and SQLab schemas/data persist locally on this device, not in cloud storage. Shared learner components render the same published content for guest and account. Reading → core pass → next material → Final Challenge follows local demo progression. Guest data never create lesson_progress, exercise_attempts, AI conversations, assessment_sessions or assessment_results. Guest tests are graded by the existing trusted server adapters; private answer/fixture fields are never serialized. Only the transient access session, active test mode and hint level are kept in the signed session cookie. AI/Lab helpers block during an active demo test. A signed-in user with an active official test is also blocked from guest endpoints. Guest mode never grants admin access.

The session lasts at most eight hours (session cookie; explicit exit clears it). Signing uses a purpose-specific HMAC with the existing server-only Supabase secret. Published content reads use narrowly projected server queries, never expose the privileged client. Same-origin mutations, bounded inputs, output limits, per-session/IP/process request caps guard the demo. Quotas are process-local; multi-instance production deployments require an upstream shared rate limit/WAF for reliable global AI cost protection. No database migration or anonymous Supabase sign-in configuration is required.

Local guest data survives renewed guest access, is shared by guests on the same browser profile, and is reset explicitly from Profile without deleting account drafts. Local progress/results are untrusted and unofficial: never accept them for account authorization, official scores, or migration to an account. Server validates the signed active-test session and grades published fixtures, keeping private data off the client. Storage failures must be shown; reset/clear-browser-data removes local recovery. AI conversation remains transient and server quotas unchanged.
