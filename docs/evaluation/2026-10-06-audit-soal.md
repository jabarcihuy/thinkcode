# Audit soal Quethink — 6 Oktober 2026

## Cakupan dan simpulan

Audit bank aktif: 10 soal diagnostik, 45 latihan pada 11 materi, serta 16 soal post-test. Soal sebelumnya mencakup konsep yang relevan tetapi beberapa tidak mandiri, bergantung pada konteks visual yang tersembunyi, atau memakai contoh yang tidak cocok dengan seed. Revisi mempertahankan alur belajar, identitas soal, hasil historis, bobot dan aturan nilai.

Dokumen [bank soal lengkap](2026-10-06-bank-soal-lengkap.md) memuat setiap soal, pilihan/blok, data publik dan instruksi jawaban, tanpa kunci atau data tes privat.

## Temuan dan perbaikan

| Temuan | Dampak | Perbaikan |
| --- | --- | --- |
| Contoh menyebut tanggal pesanan dan ID 12/15, padahal orders tidak memiliki kolom tanggal dan ID-nya 100/200/300 | Mahasiswa harus menebak informasi yang tidak disediakan | Konteks diganti sesuai tabel sintetis sebenarnya |
| COUNT pesanan memakai narasi empat pesanan, sedangkan seed memiliki tiga pesanan dan empat detail | Salah menilai pemahaman unit yang dihitung | Bedakan pesanan, pelanggan dan detail; jawaban diverifikasi terhadap SQLite |
| Banyak stem satu kalimat tidak menyatakan konteks, format atau batas perubahan | Beban menafsirkan soal melebihi konsep yang diuji | Situasi lengkap, tabel acuan terlihat, tugas eksplisit, kriteria hasil |
| Prediksi laporan meminta penjelasan tetapi checker hanya membaca tabel | Jawaban wajar dapat ditolak karena format | Permintaan disesuaikan menjadi tabel saja; tidak mengklaim menilai penalaran tertulis |
| Core SELECT mengharuskan ORDER BY sebelum materi pengurutan | Gate bergantung pada kompetensi yang belum diajarkan | Dua blok SELECT/FROM; kunci core ini saja disesuaikan |
| Jalur dua FK dipaksa satu urutan tanpa alasan | Urutan alternatif sama sah bisa ditolak | Instruksi secara eksplisit menentukan mahasiswa lalu mata kuliah, dengan penjelasan keduanya independen |
| Contoh DELETE tidak menyertakan FROM | Memperkenalkan sintaks salah | Gunakan DELETE FROM books WHERE book_id = 20 |
| Konsep write dapat memberi query lengkap untuk tugas SQL lain dalam tes yang sama | Nilai menulis SQL terkontaminasi petunjuk silang | Konsep memakai buku, detail pesanan dan pendaftaran; tugas SQL memakai pelanggan, status pesanan dan penarikan buku |
| PK/FK pada visual dapat membocorkan jawaban identifikasi | Mengukur membaca label, bukan pemahaman | Tabel stimulus konsep tanpa label jawaban; diagram relasi hanya untuk kasus SQL yang memang menyediakan skema |

## Bentuk post-test

Sepuluh konsep (25%) dan enam kasus SQL (75%), ambang 75. Konsep tetap pilihan tunggal; kasus menuntut query mandiri dengan data acuan publik. Kasus: promosi koperasi; katalog perpustakaan; ringkasan akademik; pencatatan pelanggan; koreksi pembayaran; penarikan buku. Masing-masing mandiri, tidak bergantung pada jawaban atau mutasi kasus sebelumnya. Percobaan browser selalu seed awal; server menguji query pada seed publik dan varian privat.

Kriteria menyebut urutan kolom/baris, batas inklusif, tie-breaker, satu record target dan data yang harus dipertahankan. Tidak memberi query solusi. Alias keluaran bebas bila grader memang mengizinkannya; numerik AVG tidak diminta dibulatkan pada post-test agar konsisten dengan reference grader. Prediksi latihan yang menggunakan ROUND mengikuti query yang disediakan.

## Visual dan aksesibilitas

Tabel acuan ditampilkan sebelum jawaban, tanpa harus membuka canvas. Case SQL mempunyai diagram relasi 2D sederhana ketika relevan. Visual memakai data sintetis publik yang sama dengan runner, bukan hidden fixture. Urutan mobile vertikal: pertanyaan → data → query/jawaban → output. Tabel lebar mempunyai region scroll berlabel dan dapat difokuskan dengan keyboard. Tidak ada diagram 3D atau visual dekoratif yang menambah beban tugas.

## Dasar perancangan

Stem harus berisi masalah lengkap, punya satu jawaban terbaik dan distractor masuk akal; soal tidak seharusnya memberikan jawaban soal lain. Prinsip ini mengikuti [University of Waterloo — Designing Multiple-Choice Questions](https://uwaterloo.ca/centre-for-teaching-excellence/catalogs/tip-sheets/designing-multiple-choice-questions). Tugas dan bentuk jawaban harus selaras dengan tujuan serta menghindari ambiguitas, mengikuti [Cornell — Asking Good Test Questions](https://teaching.cornell.edu/teaching-resources/assessment-evaluation/asking-good-test-questions).

Revisi ini merupakan audit isi dan implementasi, bukan validasi psikometrik. Kemampuan penalaran tertulis dan model data bebas belum dinilai oleh post-test ini. Lakukan uji mahasiswa untuk mengamati waktu, salah tafsir, kesukaran dan distractor; jangan mengklaim kualitas 10/10 atau reliabilitas nilai tanpa bukti tersebut.

## Integritas perubahan

Migration hanya memperbarui stem/stimulus serta satu core SELECT yang terlalu awal menguji sorting. Public configuration hanya menerima referensi dataset dan tabel yang terdaftar, bukan arbitrary row/answer/fixture. Schema, grant dan RLS tidak diubah. Kunci tes tetap server-only; feedback tidak memuat hidden input/output. Migration mengunci pembuatan sesi sementara dan menolak penerapan jika tes terkait masih IN_PROGRESS. Riwayat percobaan, nilai dan completion tidak dihapus.

## Validasi

Revisi 45 latihan dan 16 post-test sudah diterapkan pada Supabase. Revisi 10 pre-test tersedia pada migration terpisah, belum diterapkan selama sesi diagnostik pengguna masih IN_PROGRESS. Dokumen bank soal menampilkan naskah revisi lengkap, termasuk bagian diagnostik yang menunggu aktivasi.

Lihat laporan penyelesaian task untuk hasil lint, typecheck, unit test, integration test dan production build. Unit regression mengeksekusi query prediksi pada SQLite, memeriksa COUNT/batas/FK, memastikan seluruh public stimulus valid, dan menguji penolakan hidden fields/mismatched dataset. Uji browser memakai akun sintetis yang dihapus sesudah pengujian; bukan penelitian dengan mahasiswa sebenarnya.

Hasil pemeriksaan lokal:

- Lint, TypeScript strict, production build: PASS.
- Unit tests: 270 tests pada 46 files, PASS.
- Integration post-test SQL: skor server 100 untuk jawaban benar dan 25 untuk konsep benar/SQL salah; Run, preview, confirm, pemulihan draf, retry, ownership, AI block, RBAC, rate limit, hidden response/bundle/secret scan: PASS.
- Integration kurikulum: seluruh 45 checks dan 11 core, latihan opsional tidak unlock, reading + core membuka materi berikutnya: PASS.
- Integration browser alur wajib: login, baseline, reading-only/PDF semua materi, model relasi, progression, post-test/result dan penolakan score palsu: PASS.
- Responsive smoke: 360/768/1280 px tanpa page overflow; tabel bisa digulir di region sendiri. Garis relasi yang terlalu pucat diperbaiki memakai warna primary. Tidak menambah suppression Impeccable.

Supabase advisors juga dibaca. Temuan yang tersisa berada pada konfigurasi existing: RLS tanpa policy pada tabel yang memang server-only, RPC SECURITY DEFINER yang dapat dipanggil pengguna (guard ownership/prerequisite diuji oleh integration), leaked-password protection nonaktif, serta empat FK tanpa covering index dan dua index belum terpakai. Revisi soal ini tidak membuat tabel/function/index atau mengubah grant. Temuan tersebut tidak diklaim telah diperbaiki oleh task ini.
