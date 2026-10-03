# Paket Uji Materi dan Mobile Quethink

Status: persiapan siap dipakai; belum ada peserta, pengamatan, atau hasil. Paket ini menguji pembuat skema, video pendamping, dan pemahaman materi. Pre-test produk tetap ditunda.

## Tujuan

- Menemukan hambatan penggunaan di ponsel: navigasi, formulir kolom, PK/FK, diagram, penyimpanan draft, video, dan query.
- Memeriksa apakah mahasiswa dapat menjelaskan tabel/record/kolom, arah rujukan key, dan filter sederhana setelah menggunakan materi.
- Membandingkan manfaat video dan diagram melalui alasan peserta, bukan sekadar rating kesenangan.

## Peserta dan sesi

Mulai satu putaran formatif dengan 5–8 mahasiswa semester pertama Informatika. Jumlah ini adalah pilihan pilot Quethink untuk menemukan masalah, bukan ukuran sampel untuk menyimpulkan efektivitas populasi. Utamakan ponsel milik peserta: Android/iOS, portrait, lebar sekitar 360–430px. Sisakan beberapa sesi tablet/desktop dan, jika tersedia, peserta pengguna keyboard atau teknologi bantu.

Gunakan dua sesi yang dapat dijadwalkan terpisah. Sesi A sekitar 45–60 menit untuk Relasi dan pembuat skema. Sesi B sekitar 30–45 menit untuk SELECT/WHERE setelah prasyarat Read terpenuhi lewat alur produk. Jangan menyelesaikan checkpoint atau memalsukan progres peserta untuk mempercepat tes. Dua lesson Read boleh diuji dalam studi berikutnya setelah peserta menuntaskan Relasi.

Sesi ini tidak menentukan nilai mata kuliah. Mulai dengan pertanyaan pengalaman belajar, bukan pre-test berskor. Rubrik observer dan tugas pemahaman di paket ini merupakan instrumen riset manual; tidak masuk gradebook atau membuka lesson.

## Sebelum sesi

1. Jalankan validasi proyek dan pastikan akun uji biasa bisa login; assessment tidak sedang aktif. Gunakan akun uji/akun sukarela, jangan bagikan kredensial admin.
2. Buka `/schema-builder`, kasus Peminjaman buku, dan pastikan peserta mulai dengan draft kosong setelah persetujuannya. Draft lokal lama bisa hilang saat reset.
3. Siapkan lesson Membaca Bentuk Data; untuk Sesi B, pastikan peserta memang sudah dapat mengakses SELECT/WHERE. SQL Playground hanya memakai data sintetis.
4. Cek koneksi, audio, dan tombol video di perangkat peserta. Jika YouTube diblokir, catat kegagalan video dan lanjutkan tugas tanpa video; jangan anggap materi gagal hanya karena jaringan.
5. Siapkan lembar persetujuan, tugas peserta, dan CSV kosong. Gunakan ID P01/P02; catat versi commit dan ukuran viewport, bukan nama atau email.
6. Uji skrip sekali dengan rekan agar durasi dan instruksi masuk akal. Pilih satu moderator dan satu pencatat bila tersedia.

## Persetujuan dan pembukaan

Bacakan: “Kami sedang mengevaluasi materi dan aplikasi. Silakan ceritakan apa yang kamu pikirkan saat menggunakannya. Keikutsertaan sukarela, kamu boleh berhenti atau melewati pertanyaan, dan hasil sesi tidak memengaruhi nilai. Catatan memakai kode peserta. Rekaman hanya dilakukan dengan persetujuan terpisah.”

Tandai pada lembar: ID peserta, tanggal, setuju mengikuti sesi (ya/tidak), setuju direkam (ya/tidak), dan cara meminta penghapusan data. Default tanpa rekaman. Jelaskan siapa yang dapat melihat catatan dan kapan dihapus; usulan pilot adalah 30 hari setelah analisis selesai. Simpan data peserta di tempat akses terbatas di luar Git. Jika hasil dipakai sebagai riset akademik formal, ikuti proses etik/izin institusi yang berlaku sebelum merekrut.

## Prosedur moderator

Gunakan [tugas peserta](tugas-peserta.md) satu per satu. Minta peserta berpikir keras, lalu amati tanpa menunjukkan tombol/jawaban. Catat upaya dan alasan, bukan hanya berhasil/gagal. Bila buntu, tanyakan “Apa yang kamu harapkan terjadi?”; setelah itu boleh beri bantuan navigasi yang netral dan tandai tugas sebagai dibantu. Untuk miskonsepsi konsep, jangan membocorkan jawaban sebelum catatan selesai.

Sesi A: pembukaan 5 menit, materi Relasi 10–15 menit, skema 15–20 menit, diagram/draft/video 10 menit, refleksi 5–10 menit. Ini anggaran fleksibel; video boleh dijeda dalam waktu sesi tanpa menganggap video sudah ditonton penuh. Sesi B: SELECT/WHERE dan video pilihan 20–30 menit, penjelasan serta survei 10–15 menit.

## Apa yang dicatat

Isi `observasi.csv` untuk tiap tugas: mandiri/dibantu/gagal/dilewati, waktu mulai–selesai, jumlah salah tekan, masalah overflow/keyboard, bantuan, kutipan pendek, dan keparahan. Kode keparahan: 0 pengamatan; 1 gangguan kecil; 2 hambatan yang dapat dipulihkan; 3 tugas inti gagal/draft hilang/tampilan tidak dapat dipakai. Waktu menonton dan gangguan jaringan dipisahkan dari waktu menyelesaikan tugas.

Isi `pemahaman.csv` menggunakan [rubrik](rubrik-dan-survei.md), termasuk alasan peserta. Skor observer ini tidak dijumlahkan menjadi nilai resmi. Survei buatan Quethink bersifat deskriptif, bukan SUS atau instrumen tervalidasi.

## Analisis dan keputusan iterasi

- Laporkan jumlah tugas mandiri/dibantu/gagal beserta jumlah peserta; jangan menyajikan persentase tanpa denominator.
- Kelompokkan miskonsepsi: tabel vs record, PK vs nama, arah FK, satu-ke-banyak, sumber vs hasil, batas filter.
- Prioritaskan semua temuan keparahan 3, kemudian pola yang berulang. Bedakan masalah konten, interaksi, dan jaringan.
- Target internal putaran berikutnya: semua peserta dapat kembali ke draft tanpa kehilangan data; tidak ada overflow halaman pada ponsel; mayoritas dapat menyelesaikan tugas dasar tanpa bantuan navigasi. Ini target desain, bukan hasil pengujian.
- Buat laporan dengan bukti, perubahan yang disarankan, owner, dan status menggunakan `laporan-template.md`. Uji lagi perubahan yang menjawab masalah konkret.

Metode tugas netral, moderator, dan pencatatan mengikuti [GOV.UK — moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing). Evaluasi dengan pengguna teknologi bantu melengkapi pemeriksaan teknis, mengikuti [W3C WAI — involving users](https://www.w3.org/WAI/test-evaluate/involving-users/). Cakupan, dua sesi, jumlah pilot, rubrik, dan target di atas merupakan rancangan Quethink yang perlu diuji.
