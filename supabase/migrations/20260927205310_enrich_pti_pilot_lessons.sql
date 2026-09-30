-- Each pilot lesson ends with a concrete transfer task before its graded practice.
update public.lessons as lesson
set content = lesson.content || E'\n\n' || activity.content,
    updated_at = now()
from (values
  ('pti-urai-masalah', $text$## Uji pemahaman

Sebelum menekan tombol pada simulasi antrean, prediksi nama yang akan dilayani. Tambahkan satu mahasiswa baru, lalu jelaskan mengapa ia berada di belakang. Apa yang perlu diubah jika aturan layanan menjadi prioritas, bukan urutan datang?$text$),
  ('pti-algoritma-flowchart', $text$## Uji pemahaman

Gambar ulang alur kelulusan dengan empat bagian: input nilai, pemeriksaan `nilai >= 60`, pesan untuk true, dan pesan untuk false. Telusuri alur dengan nilai 59 dan 60. Jika keduanya memilih pesan yang sama, temukan cabang yang tertukar.$text$),
  ('pti-input-proses-output', $text$## Uji pemahaman

Pada lintasan data, pilih input `-3`. Tulis prediksi sebelum membuka hasil. Lalu ubah proses dari `× 2` menjadi `+ 2` di editor dan jelaskan mengapa output berubah walaupun inputnya sama.$text$),
  ('pti-variabel-nilai-operator', $text$## Uji pemahaman

Tanpa menjalankan kode, tulis tabel tiga baris untuk `saldo`: setelah inisialisasi, setelah `-= 3`, dan setelah `+= 4`. Ubah angka terakhir menjadi 7; periksa tabelmu dengan execution trace. Bedakan nilai lama dari nilai yang baru tersimpan.$text$),
  ('pti-kondisi-if-else', $text$## Uji pemahaman

Pada simulasi nilai batas, prediksi cabang untuk 59, 60, dan 61. Ganti `>=` menjadi `>` di editor. Nilai mana yang berpindah cabang? Jelaskan mengapa satu karakter mengubah keputusan program.$text$),
  ('pti-kondisi-bertingkat', $text$## Uji pemahaman

Tuliskan hasil yang diharapkan untuk usia 17, 18, 59, dan 60 sebelum menjalankan Bug Lab. Setelah memperbaiki urutan kondisi, jalankan keempat nilai itu. Perhatikan kondisi pertama yang bernilai true pada setiap kasus.$text$),
  ('pti-menelusuri-perulangan', $text$## Uji pemahaman

Atur batas loop menjadi 4. Sebelum memajukan simulasi, prediksi nilai `i` saat kondisi pertama kali false dan jumlah baris output. Cocokkan satu langkah demi satu langkah; nilai saat berhenti tidak ikut dicetak.$text$),
  ('pti-bug-lab-loop', $text$## Uji pemahaman

Tuliskan jejak tiga nilai pertama `i` saat kode salah dijalankan. Apakah nilai itu mendekati nol? Setelah mengubah `i++` menjadi `i--`, prediksi baris output dan nilai akhir `i` sebelum menekan Run. Timeout hanya menunjukkan program belum berhenti tepat waktu.$text$),
  ('pti-fungsi-sebagai-rencana', $text$## Uji pemahaman

Telusuri `jumlahSampai(3)` dengan tabel `i` dan `total`. Mengapa `return` ditempatkan setelah loop? Ubah pemanggilan menjadi `jumlahSampai(0)` dan jelaskan mengapa hasilnya nol tanpa memasuki badan loop.$text$)
) as activity(slug, content)
where lesson.slug = activity.slug
  and lesson.content not like '%' || activity.content || '%';
