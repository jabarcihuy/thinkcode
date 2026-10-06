# Sistem Pembelajaran Quethink

## Alur wajib

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Pre-test diagnostik menyimpan satu baseline, wajib selesai sebelum materi baru, tanpa ambang lulus atau bobot nilai. Satu sesi tes aktif per pengguna. Dashboard selalu melanjutkan sesi aktif terlebih dahulu.

Materi 1–11 adalah daftar datar dalam urutan Relasi → Read → Write. Halaman materi hanya berisi bacaan, contoh statis, video pendamping opsional, dan Unduh PDF. Tidak ada submateri, latihan, editor query atau panel AI pada bacaan.

## Ketuntasan materi

1. Pengguna membuka materi yang tersedia dan memilih Selesai membaca, lanjut ke Lab.
2. Server menyimpan read_at dan status IN_PROGRESS, bukan langsung COMPLETED.
3. Pengguna masuk ke Lab terkait, mengamati data/diagram dan menyelesaikan satu latihan inti.
4. Server memeriksa jawaban deterministik. Materi COMPLETED jika read_at terisi dan semua latihan required/published passed.
5. Materi prerequisite berikutnya tersedia. Latihan tambahan tidak menghalangi progres; retry tanpa penalti.

SQL eksplorasi dan Run tetap lokal dalam SQLite Worker. Hasil eksekusi browser tidak menjadi bukti ketuntasan. Latihan inti memakai jawaban deterministik server (prediksi tabel, pilihan, urutan, atau struktur model). Admin hanya boleh mempublikasikan latihan required yang dapat dinilai server.

## Latihan inti

Materi 1: membedakan record dan schema. Materi 2: menyusun model peminjaman buku dengan tabel, PK, FK dan relasi. Materi 3–11: latihan posisi 3 pada bank existing (SELECT/FROM, filter, urutan/limit, JOIN, agregasi, laporan, INSERT, UPDATE, DELETE). Latihan lain opsional. Model wajib menyertakan tabel/kolom yang ditetapkan prompt; identifier internal bebas. Pemeriksa membandingkan struktur, bukan jumlah tabel saja.

## Tes dan selesai

Post-test terbuka setelah baseline dan semua materi wajib tuntas. Nilai dihitung server, lulus minimal 75; retry setelah sesi sebelumnya selesai. Course complete membutuhkan seluruh materi required complete dan post-test passed. Pre-test tidak masuk nilai akhir.

Saat tes IN_PROGRESS: AI, latihan, pengakuan membaca dan pembuat skema dijeda oleh backend. Materi yang sudah selesai boleh ditinjau. Hidden keys server-only; pengguna hanya memperoleh skor dan feedback aman.

## Transisi pengguna lama

Status COMPLETED yang tercatat sebelum migration dipertahankan, read_at dibackfill dari completed_at/started_at. Progres tersebut adalah ketuntasan historis, bukan bukti lulus latihan inti baru. Materi historis tetap dapat ditinjau. Sebelum membuka materi baru atau memulai post-test baru, baseline tetap wajib. Riwayat attempt, skor, hasil dan checkpoint lama tidak dihapus. Pengguna yang sudah belajar sebelum baseline diberi keterangan bahwa hasil mengukur pemahaman saat ini.

## Pengawasan akses

RLS membatasi progres/hasil ke pemilik. Mutasi ketuntasan melalui RPC server; pengguna tidak menulis score/status bebas. Validasi URL, pre-test, prerequisite, read_at dan tes aktif ada di server dan database. ADMIN preview terpisah dapat meninjau draft tanpa memengaruhi progres siswa.
