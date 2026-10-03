# Rubrik Observer dan Survei

Jangan tampilkan kriteria jawaban sebelum peserta mengerjakan tugas. Catat bukti ucapan/tindakan; rubrik ini untuk analisis bahan ajar, bukan nilai resmi.

| Konsep | 0 — belum tampak | 1 — sebagian | 2 — dapat menjelaskan dengan data |
|---|---|---|---|
| Tabel, kolom, record | Tertukar | Menunjuk benar, alasan belum jelas | Membedakan jenis fakta, atribut, dan satu kejadian/entitas |
| Struktur vs isi | Menganggap nilai sebagai schema | Membedakan dengan bantuan | Menjelaskan kolom/key tetap, record dapat berubah |
| PK | Menganggap nama selalu unik | Memilih ID tanpa alasan | Menjelaskan identitas unik per record |
| FK dan kardinalitas | Rujukan/arah tertukar | Pasangan benar, makna belum jelas | Menjelaskan FK peminjaman menunjuk PK anggota/buku dan satu induk dapat dirujuk banyak anak |
| Model kasus | Semua fakta dalam satu tabel/tanpa rujukan | Tabel terpisah, rujukan belum tepat | Anggota/buku terpisah dan peminjaman menghubungkan keduanya; nama tabel alternatif diterima |
| SELECT/FROM (Sesi B) | Sumber dan keluaran tertukar | Query benar karena menyalin | Menjelaskan FROM memilih tabel, SELECT memilih atribut keluaran |
| WHERE (Sesi B) | Batas/AND/OR salah | Hasil benar, alasan belum lengkap | Menjelaskan record yang lolos dan perbedaan > versus >= pada nilai 80 |

Struktur yang lolos petunjuk otomatis pembuat skema tidak otomatis mendapat skor 2. Nilai penjelasan berdasarkan fakta kasus; nama tabel/kolom tidak harus sama dengan contoh. Kasus pesanan memakai rincian pesanan sebagai penghubung produk dan pesanan, dengan quantity pada rincian.

## Survei singkat peserta

Skala 1 sangat tidak setuju, 2 tidak setuju, 3 netral, 4 setuju, 5 sangat setuju. “Tidak mencoba” tersedia untuk video atau fitur yang dilewati.

1. Saya dapat menemukan langkah belajar berikutnya.
2. Saya nyaman mengisi dan mengedit tabel/kolom di ponsel.
3. Diagram membantu saya menjelaskan arah hubungan antar tabel.
4. Petunjuk pemeriksaan membantu saya memutuskan apa yang perlu diperbaiki.
5. Video memberikan penjelasan tambahan yang relevan dengan latihan.
6. Saya dapat menjelaskan mengapa hasil query muncul (Sesi B).

Tambahkan alasan untuk rating rendah/tinggi serta satu perubahan yang paling diinginkan. Laporkan per item; jangan mengubah jumlah rating menjadi “skor usability tervalidasi”.
