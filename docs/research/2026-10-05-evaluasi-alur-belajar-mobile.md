# Evaluasi alur belajar Quethink pada perangkat mobile

Tanggal: 5 Oktober 2026. Status: riset dan rekomendasi; belum mengubah aturan produk atau implementasi.

## Kesimpulan

**Alur perlu diperbaiki pada kesinambungan sesi, perpindahan Materi–Lab, dan bantuan untuk pemula. Bukti yang diperiksa belum membenarkan perombakan menyeluruh, tetapi juga tidak membuktikan semua kunci progres sekarang optimal.** Prioritasnya ialah melindungi pekerjaan siswa dan membuat langkah berikutnya jelas. Evaluasi pelonggaran kunci bacaan dilakukan sesudah masalah tersebut teratasi.

Acuan internal ialah [panduan produk](../AGENTS.md), [sistem pembelajaran](../03-LEARNING_SYSTEM.md), [kurikulum](../04-CURRICULUM.md), dan [alur UX](../09-UX_FLOW.md). Aturan sekarang: diagnostik sekali tanpa ambang lulus → 11 bacaan/PDF → satu inti terverifikasi di Lab per materi → materi berikutnya → post-test ≥75. Video, latihan tambahan, dan AI opsional; AI dijeda saat tes. Ketuntasan historis dipertahankan.

Tidak ada sumber yang diperiksa yang menetapkan kombinasi ini sebagai “standar LMS”. Dokumentasi platform menjelaskan kemampuan konfigurasi; penelitian pembelajaran menguji aktivitas tertentu; panduan aksesibilitas menetapkan syarat interaksi. Ketiganya tidak membuktikan satu urutan halaman terbaik untuk mahasiswa pemula Indonesia.

## Apa yang didukung bukti

**Latihan aktif layak dipertahankan.** Eksperimen Karpicke dan Blunt membandingkan belajar teks sains dengan beberapa strategi. Retrieval practice menghasilkan hasil tes tertunda satu minggu yang lebih baik daripada belajar melalui concept mapping dalam kondisi penelitian tersebut, termasuk pertanyaan inferensi. Ini mendukung kesempatan memprediksi dan mengingat kembali, tetapi bukan bukti langsung efektivitas SQL mobile atau kewajiban lulus satu soal sebelum membaca selanjutnya. [Makalah peneliti, Science 2011](https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Blunt_Science.pdf).

**Contoh dan latihan perlu saling dekat.** Panduan IES memberi dukungan moderat untuk pergantian contoh yang sudah dikerjakan dengan pemecahan masalah, penggabungan gambar dengan penjelasan, dan pengaitan representasi konkret–abstrak. Dukungan untuk kuis yang mengulang konten dan pertanyaan penjelasan mendalam dinilai kuat; penggunaan pertanyaan pendahuluan dinilai minimal. Rekomendasi berlaku lintas mata pelajaran, bukan validasi khusus Quethink. [IES: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/practiceguide/1).

**Umpan balik lebih bernilai daripada tanda salah saja.** Butler dan Roediger menemukan umpan balik langsung maupun tertunda meningkatkan jawaban benar dan mengurangi pengulangan pilihan pengecoh pada tes ingatan tertunda dibanding tanpa umpan balik. Konteksnya pembelajaran bacaan dan pilihan ganda. Inferensi untuk Lab: jelaskan konsep yang keliru dan arah pemeriksaan ulang; jangan hanya mengulang tombol Coba lagi. [Makalah peneliti, Memory & Cognition 2008](https://psychnet.wustl.edu/memory/wp-content/uploads/2018/04/Butler-Roediger-2008_MemCog.pdf).

**Kunci progres merupakan keputusan desain.** Moodle memungkinkan ketuntasan berdasar membuka aktivitas, nilai, atau pengakuan siswa; pembatasan akses dapat memakai tanggal, nilai, kelompok, atau ketuntasan aktivitas. Dukungan platform terhadap banyak pilihan tidak membuktikan efektivitas pedagogis salah satunya. [Activity completion](https://docs.moodle.org/en/Activity_completion), [Restrict access](https://docs.moodle.org/en/Restrict_access).

## Pertimbangan terhadap alur sekarang

Urutan Relasi → Read → Write masuk akal secara konseptual: siswa perlu mengenali data dan memilih target sebelum mengubahnya. Daftar datar 11 materi memberi peta yang terbatas. Pemisahan bacaan dari workspace interaktif juga dapat menjaga bacaan tetap ringan. Penilaian ini merupakan inferensi dari kurikulum internal, belum hasil studi penggunaan.

Namun, pada telepon, pindah halaman dapat membuat siswa kehilangan contoh, prompt, posisi, atau draf. Risiko meningkat jika harus kembali ke daftar untuk mencari Lab, memilih ulang latihan, lalu mencari materi berikutnya. Halaman terpisah tetap dapat dipakai bila konteks dan kelanjutan terjaga: satu aksi menuju inti yang tepat, ringkasan konsep dalam Lab, serta aksi berikutnya langsung sesudah berhasil.

Pengakuan “Selesai dibaca” hanya melaporkan tindakan siswa. Ia tidak mengukur pemahaman; bahkan keberhasilan satu inti memberi bukti terbatas pada tugas itu, terutama setelah retry berulang. Jangan menyebut salah satunya sebagai penguasaan seluruh konsep. Membatasi setiap bacaan berikutnya dapat melindungi urutan pemula, tetapi juga menghambat siswa yang ingin membaca penjelasan tambahan ketika tersangkut. Belum ada data Quethink untuk menimbang kedua dampak tersebut.

Ada pula batas keselarasan asesmen: kurikulum menargetkan kemampuan menulis SQL, sedangkan inti deterministik memakai prediksi, pilihan, urutan, atau struktur model. Bentuk ini dapat memeriksa pemahaman, tetapi keberhasilannya belum membuktikan kemampuan menyusun query mandiri. Tinjau pemetaan setiap hasil belajar terhadap tugas sebelum mengklaim kompetensi; kebijakan penilaian server dan isolasi SQLite tetap berlaku.

GOV.UK menyarankan penyederhanaan tugas dan status yang mudah dipahami untuk perjalanan beberapa sesi. Dokumentasi komponen Task list secara khusus melarang penggunaannya untuk proses dengan urutan wajib, dan menyarankan menyimpan progres lalu melanjutkan tempat terakhir. Karena ini panduan layanan pemerintah, penerapannya pada kursus adalah analogi UX: gunakan daftar materi sebagai peta dan satu tombol Lanjutkan sebagai arahan utama. [Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/), [Task list](https://design-system.service.gov.uk/components/task-list/).

## Rekomendasi menurut prioritas

| Prioritas | Keputusan yang disarankan | Manfaat dan kompromi |
|---|---|---|
| 1 | Lindungi draf tes dan latihan; pulihkan jawaban dan posisi ketika kembali. Tampilkan status tersimpan hanya setelah penyimpanan berhasil; sediakan pesan pemulihan ketika gagal. | Mengurangi pekerjaan ulang. Penyimpanan lokal harus jelas berlaku pada perangkat itu; pemulihan lintas perangkat membutuhkan rancangan terpisah. Jawaban resmi tetap dinilai server. |
| 2 | Jadikan transisi langsung: **Selesai dibaca & buka latihan inti**; Lab membuka inti materi yang tepat; sesudah lulus, tampilkan **Lanjut ke Materi N** sebelum AI dan latihan tambahan. | Mengurangi pencarian dan gulir. Aksi gabungan harus menunjukkan kegagalan penyimpanan dengan jelas, sehingga siswa tidak mengira bacaan sudah tercatat. |
| 3 | Beri bantuan singkat sebelum inti: contoh statis yang dijelaskan, tabel kecil, PK/FK berlabel, lalu prediksi dan penjelasan konsep. Latihan tambahan tetap mudah ditemukan. | Mendukung pemula tanpa menambah syarat ketuntasan. Referensi contoh perlu berbeda dari jawaban inti agar tugas tetap bermakna. |
| 4 | Uji alternatif akses bacaan: tampilkan seluruh judul; pertimbangkan mengizinkan melihat bacaan berikutnya sambil tetap mengunci ketuntasan/inti yang bergantung prerequisite. | Membuka jalan keluar saat siswa bingung. Mengubah aturan produk; lakukan melalui prototipe dan keputusan eksplisit, setelah mengamati penyebab siswa tersangkut. |
| 5 | Pertahankan diagnostik tanpa lulus/gagal dan post-test sebagai kebijakan sekarang; perjelas tujuan, panjang, pemulihan, dan cara membaca hasilnya. | Menjaga baseline dan keputusan kelulusan. Biaya onboarding serta ketepatan instrumen tetap perlu dievaluasi. |

Untuk bantuan visual, kedekatan tabel, query, dan hasil lebih penting daripada menampilkan seluruh panel bersamaan. Contoh: sorot baris yang lolos WHERE dan jelaskan alasannya; untuk JOIN, hubungkan FK ke PK lalu tunjukkan mengapa baris berulang. Ini penerapan kontekstual rekomendasi representasi IES, bukan bukti bahwa visualizer yang ada sudah efektif.

## Batas aksesibilitas dan interpretasi tes

Untuk kesesuaian WCAG 2.2, navigasi berulang harus memiliki urutan relatif konsisten (3.2.3, AA); kesalahan input terdeteksi harus dijelaskan dalam teks (3.3.1, A); saran koreksi yang diketahui diberikan dengan pengecualian keamanan/tujuan konten (3.3.3, AA). Pengiriman jawaban tes termasuk cakupan pencegahan kesalahan 3.3.4 (AA), yang membolehkan pilihan reversibel, pemeriksaan, atau konfirmasi. Ini persyaratan formal, bukan kewajiban membuka kunci materi. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

WCAG 3.3.7 membatasi pengisian ulang informasi dalam proses yang sama dengan pengecualian tertentu. Penjelasan W3C secara eksplisit tidak mewajibkan penyimpanan antar sesi. Karena itu autosave lintas sesi adalah rekomendasi UX untuk Quethink, bukan klaim kewajiban kriteria tersebut. Jawaban tes untuk tujuan pengukuran juga perlu mempertimbangkan pengecualian esensial. [W3C: Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html).

Baseline sekali adalah rekaman pemahaman pada waktunya, bukan diagnosis permanen. Untuk pengguna lama yang sudah belajar, sebut hasil “pemahaman saat ini”. Ambang 75 merupakan kebijakan lokal; sumber yang diperiksa tidak menetapkannya universal. Selisih pre/post perlu dilabeli deskriptif, dengan catatan kesetaraan cakupan dan kesulitan soal, kesempatan retry, serta paparan sebelumnya. Tanpa pembanding, selisih tidak membuktikan dampak kausal platform; WWC juga membatasi klaim kausal desain kelompok tanpa kelompok pembanding. [WWC: Designing Quasi-Experiments](https://ies.ed.gov/ncee/wwc/Document/256).

## Pertahankan, ubah, dan hindari

Pertahankan urutan konseptual, praktik inti dengan feedback, retry tanpa penalti, dukungan opsional, pemisahan asesmen, dan riwayat lama. Ubah lebih dulu pemulihan sesi, kejujuran status penyimpanan, transisi, serta bantuan sebelum inti. Hindari mewajibkan video/semua latihan tambahan, menyamakan klik baca dengan kompetensi, atau menyimpulkan efektivitas dari diagram alur.

Sebelum melonggarkan kunci, amati mahasiswa pemula pada ponsel: mulai diagnostik, keluar dan kembali, pindah bacaan–inti, salah lalu retry, dan lanjut setelah lulus. Ukur pekerjaan yang hilang, langkah salah, waktu menemukan inti, serta alasan berhenti. Keberhasilan navigasi dan ketepatan tugas baru perlu dilihat bersama; konversi selesai saja tidak mengukur pembelajaran.

## Pemeriksaan implementasi

Audit statis pada commit `f4e46613` menemukan:

- **P0 — draf tes belum dipulihkan.** [AssessmentWorkspace](../../src/features/assessment/components/assessment-workspace.tsx) menginisialisasi jawaban dan nomor soal dalam `useState` (baris 34–35), memperbarui state (48), lalu mengirim jawaban hanya saat submit (64–66). Halaman sesi tidak memberikan draf tersimpan. Refresh/remount berisiko menghapus jawaban yang belum dikirim. [Aksi dashboard](../../src/features/learning/domain/next-action.ts) baris 5 justru menyatakan “Jawaban tersimpan di perangkat ini”; klaim tersebut tidak didukung mekanisme draf yang diperiksa. Sesi, hasil, dan progres tersimpan berbeda dari draf jawaban.
- **P1 — perpindahan belum langsung.** [Pengakuan membaca](../../src/features/learning/components/acknowledge-reading.tsx) menyimpan lalu `router.refresh()` (18); siswa masih perlu menekan tautan Lab terpisah. Pada [halaman Lab](../../src/app/learn/[pathSlug]/lessons/[lessonSlug]/practice/page.tsx), CTA materi berikutnya (48) berada setelah AI dan latihan tambahan (46–47). Ini dugaan friksi, belum ukuran perilaku pengguna.
- **P1 — pemulihan perlu diperluas.** Query dan prediksi Lab berada dalam state komponen; pembuat skema sudah memiliki penyimpanan lokal. Tidak ditemukan aksi meninggalkan assessment pada UI/API yang diperiksa, walaupun status `ABANDONED` tersedia. Audit lifecycle lebih lanjut sebelum menawarkan aksi tersebut.

Belum ada uji mahasiswa atau simulasi refresh langsung dalam riset ini. Langkah implementasi pertama yang disarankan: draf tes dengan status simpan jujur, pemulihan sesi, dan tes regresi refresh; kemudian transisi langsung. Kode, database, dan aturan ketuntasan belum diubah.
