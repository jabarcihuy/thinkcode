# Kesinambungan belajar dan keselarasan asesmen

Tanggal: 6 Oktober 2026. Tindak lanjut [riset alur mobile](2026-10-05-evaluasi-alur-belajar-mobile.md).

## Implementasi

1. Draf tes memulihkan jawaban dan nomor soal secara sinkron melalui browser storage, terpisah per akun/sesi. Validasi membatasi bentuk, panjang, pilihan, urutan, identitas soal dan kesesuaian konten publik. Draf tidak berisi nilai atau hidden keys. Gagal penyimpanan mempertahankan jawaban di memori, menampilkan pesan dan aksi retry; assessment memberi peringatan sebelum halaman ditutup. Dashboard tidak lagi menyatakan jawaban pasti tersimpan.
2. Submit gagal mempertahankan draf. Login ulang dapat melanjutkan sesi aktif. Jika grading sebelumnya sudah selesai tetapi responsnya hilang, retry memeriksa status sesi server sebelum membuka hasil; tidak menghitung ketuntasan dari state lokal. Submit berhasil membersihkan draf sesi tersebut.
3. Materi tetap hanya bacaan/PDF/video. Satu tombol menyimpan pengakuan membaca lalu membuka inti Lab. Penyimpanan gagal tidak mengalihkan halaman. Dashboard melanjutkan langsung ke anchor inti; CTA materi berikutnya berada tepat sesudah inti, sebelum AI dan latihan tambahan.
4. Jawaban latihan dan query/prediksi disimpan per akun/tugas/dataset. Model inti memakai key per akun. Query dipulihkan sebagai teks, bukan hasil eksekusi atau perubahan tabel; data sintetis selalu dimulai ulang saat halaman dibuka kembali. Reset membuang draf query/prediksi.
5. Contoh opsional untuk sebelas konsep berada sebelum inti, memakai contoh berbeda dari tugas yang dinilai. Feedback gagal menjelaskan cara retry dan mengarah kembali ke bacaan; hasil tes mengarahkan topik yang belum tepat ke materi, tanpa membuka prerequisite melalui link diagnostik.

Tidak ada migration, perubahan nilai ambang, atau perubahan gate. SQL siswa tetap hanya berjalan di SQLite Worker sintetis. Progres, skor, AI blocking dan RLS tetap diputuskan server/database.

## Audit instrumen aktif

Audit read-only `npm run audit:assessment` pada database yang dikonfigurasi menemukan sebelas materi dan satu inti per materi:

| Materi | Bukti inti yang dinilai server |
|---|---|
| 1. Bentuk data | Pilihan konsep record/schema |
| 2. Key dan relasi | Model struktur tabel/PK/FK |
| 3. SELECT/FROM | Urutan penyusunan query |
| 4. WHERE | Prediksi hasil |
| 5. ORDER BY/LIMIT | Prediksi hasil |
| 6. JOIN | Prediksi hasil |
| 7. Agregasi | Prediksi hasil |
| 8. Tantangan query | Prediksi hasil |
| 9. INSERT | Pilihan konsep verifikasi |
| 10. UPDATE | Urutan prosedur |
| 11. DELETE | Urutan prosedur |

Pre-test dan post-test masing-masing memiliki **10 soal pilihan ganda**: Relasi 3, Read 4, Write 3. Identifier exercise internal `FLOWCHART` dengan `mode: choice` bukan bukti bahwa soal meminta diagram flowchart. Audit hanya melaporkan metadata; tidak mencetak kunci jawaban atau data mahasiswa.

| Capaian kurikulum | Bukti sekarang | Batas |
|---|---|---|
| Membaca schema/tabel/record | Pilihan konsep dan diagram | Perlu kasus transfer untuk menilai generalisasi |
| Memahami PK/FK/relasi | Model struktur dinilai server | Penjelasan alasan belum dinilai terstruktur |
| Menerjemahkan pertanyaan data | Pilihan/urutan/prediksi | Belum meminta query mandiri pada tes resmi |
| Menulis SELECT/filter/JOIN/ringkasan | SQL eksplorasi lokal dan prediksi | Penulisan query bukan bukti nilai terpercaya |
| INSERT/UPDATE/DELETE dengan aman | Prosedur/pilihan dan eksplorasi | Eksekusi mandiri belum dinilai resmi |
| Menjelaskan hasil/constraint/reset | Feedback, prediksi dan prosedur | Penjelasan siswa belum memiliki rubrik resmi |

**Kesimpulan:** alur LMS dan concept checks dapat digunakan; nilai post-test mencerminkan instrumen konsep tersebut. Klaim kompetensi menulis SQL mandiri belum didukung. Prioritas berikutnya ialah blueprint tugas aplikasi dan desain checker SQL terbatas yang tepercaya, sebelum mengubah instrumen resmi. Tidak perlu menambah fitur, bahasa pemrograman atau infrastruktur berbayar untuk menutup masalah navigasi.

## Batas pemulihan

- Draf hanya tersedia di browser/profile yang sama; bukan sinkronisasi lintas perangkat atau aplikasi offline.
- Private browsing, pembersihan site data, storage yang diblokir/penuh, atau pergantian konten soal dapat menghalangi pemulihan. Pesan UI menyatakan kondisinya; jika storage gagal, jangan menutup halaman.
- Penyimpanan lokal bukan perlindungan terhadap orang yang memiliki akses ke browser/profile di perangkat bersama. Jangan memakai akun/tugas yang sama serentak di beberapa tab; belum ada resolusi konflik antar-tab.
- Akun berbeda tidak memulihkan draf satu sama lain melalui aplikasi. Hidden answer dan secrets tidak ditambahkan ke browser draft.
- Pengujian otomatis bukan studi usability atau validasi instrumen bersama mahasiswa.

## Verifikasi

- Lint, typecheck dan production build: PASS.
- Unit tests: 217 PASS, 43 file. Termasuk akun/sesi terpisah, payload invalid/oversize, perubahan soal, recovery, quota failure/retry dan query draft.
- Browser: login → pre-test → refresh/offline input/gagal storage/retry → login ulang/resume dan pemulihan respons submit hilang → bacaan → inti Lab → feedback → tuntas → materi berikutnya; SQL query restore/run/reset.
- Viewport 360/768/1280: tidak ada overflow halaman kritis; sembilan screenshot disimpan lokal untuk review. Table/canvas scrolling tetap di area masing-masing.
- API regression: 11 materi/45 latihan, optional tidak unlock, read+trusted core unlock, post-test lulus, AI/Playground blocked saat tes, private keys tidak dikirim, attempt pemilik saja, USER ditolak admin API.
- Pemindaian 166 aset client: nilai credential privat tidak ditemukan. Akun sementara dibersihkan setelah pengujian.
- Detector desain: satu advisory ukuran monospace sel tabel lama `0.82rem` dipertahankan dengan ignore-value khusus file; tidak ada pengecualian seluruh file/rule. Tidak ada perubahan gaya global atau temuan lain yang dibiarkan.
