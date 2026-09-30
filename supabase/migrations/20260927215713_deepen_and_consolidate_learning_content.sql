-- Consolidate thin adjacent lessons while preserving their exercises and history.
-- Source lesson rows remain in place but are unpublished, so existing references
-- are not deleted and learners only see the combined lessons.

update public.exercises as exercise
set lesson_id = destination.id,
    position = 2
from public.lessons as source,
     public.lessons as destination
where exercise.lesson_id = source.id
  and source.slug = 'pti-algoritma-flowchart'
  and destination.slug = 'pti-urai-masalah';

update public.exercises as exercise
set lesson_id = destination.id,
    position = 2
from public.lessons as source,
     public.lessons as destination
where exercise.lesson_id = source.id
  and source.slug = 'pti-variabel-nilai-operator'
  and destination.slug = 'pti-input-proses-output';

update public.exercises as exercise
set lesson_id = destination.id,
    position = 2
from public.lessons as source,
     public.lessons as destination
where exercise.lesson_id = source.id
  and source.slug = 'pti-kondisi-bertingkat'
  and destination.slug = 'pti-kondisi-if-else';

update public.exercises as exercise
set lesson_id = destination.id,
    position = 2
from public.lessons as source,
     public.lessons as destination
where exercise.lesson_id = source.id
  and source.slug = 'pti-fungsi-sebagai-rencana'
  and destination.slug = 'pti-menelusuri-perulangan';

update public.lessons
set title = 'Dari Masalah ke Algoritma',
    summary = 'Urai tujuan menjadi langkah yang dapat diuji, lalu gambarkan solusi dengan pseudocode dan flowchart.',
    content = $content$## Tujuan belajar

Setelah lesson ini, kamu dapat menjelaskan tujuan dan data sebuah masalah, memecah pekerjaan menjadi langkah, lalu menyajikan urutan solusi sebagai pseudocode atau flowchart.

## Mulai dari masalah, bukan sintaks

Sebuah instruksi hanya berguna jika orang lain dapat menjalankannya tanpa menebak. Sebelum menulis kode, tanyakan:

1. **Apa hasil yang ingin dicapai?** Nyatakan dalam satu kalimat.
2. **Informasi apa yang tersedia?** Catat input, batasan, dan kondisi awal.
3. **Bagian apa yang harus dilakukan?** Pecah pekerjaan besar menjadi tugas kecil.
4. **Bagaimana kita tahu hasilnya benar?** Tentukan keluaran atau pemeriksaan.

Misalnya, tujuan antrean kantin adalah melayani orang yang paling dahulu datang. Pekerjaan dapat dipecah menjadi mencatat urutan, melihat orang terdepan, melayani orang itu, lalu memperbarui antrean. Memecah masalah membantu kita melihat langkah yang hilang sebelum langkah itu berubah menjadi bug.

## Dari bagian ke algoritma

Algoritma adalah rangkaian instruksi yang jelas, berurutan, dan berakhir. Setiap langkah harus cukup spesifik untuk dilakukan dan diperiksa. “Tentukan hasilnya” terlalu kabur; “bandingkan nilai dengan batas 60” memberi tindakan yang dapat diuji.

Untuk masalah kelulusan, kita dapat menetapkan:

- **Input:** satu nilai.
- **Proses:** periksa apakah nilai sekurang-kurangnya 60.
- **Output:** tampilkan “Lulus” atau “Perlu latihan”.

Pseudocode menulis ide tersebut dengan kalimat ringkas:

```text
MULAI
Baca nilai
JIKA nilai >= 60
  Tampilkan "Lulus"
JIKA TIDAK
  Tampilkan "Perlu latihan"
SELESAI
```

Flowchart menyampaikan alur yang sama dengan bentuk visual: **Mulai → baca nilai → keputusan nilai >= 60? → pilih keluaran → Selesai**. Simbol keputusan memiliki cabang benar dan salah. Pastikan kedua cabang berakhir pada keluaran yang sesuai; jangan membiarkan satu kemungkinan tanpa arah.

## Tiga cara, satu logika

Kalimat masalah menjelaskan kebutuhan, pseudocode menata langkah, dan flowchart memperlihatkan alur. Ketiganya bukan tiga solusi berbeda. Jika ketiganya tidak sejalan, kembali ke tujuan dan periksa bagian mana yang berubah. JavaScript baru diperlukan setelah logika dapat dijelaskan dengan cara-cara tersebut.

Kesalahan yang sering terjadi adalah mulai menggambar simbol atau mengetik kode terlalu cepat. Bentuk diagram yang rapi tidak memperbaiki aturan yang belum jelas. Uji alur dengan contoh sederhana: nilai 59 harus mengikuti cabang “Perlu latihan”, sedangkan 60 harus mengikuti cabang “Lulus”. Contoh tepat di batas sering menemukan kekeliruan `>` dan `>=`.

## Coba dan periksa

1. Susun blok rencana dari tujuan, bagian masalah, langkah, lalu pemeriksaan hasil. Jelaskan mengapa pemeriksaan dilakukan setelah langkah solusi.
2. Pada flowchart kelulusan, pilih simpul sesudah nilai dibaca. Prediksi cabang untuk 59 dan 60 sebelum mengecek jawaban.
3. Kembali ke antrean kantin: apa yang berubah jika orang yang dilayani bukan selalu orang paling depan? Nyatakan aturan itu sebagai langkah yang dapat diperiksa.

Video opsional: [Belajar algoritma dan pemrograman dengan Scratch — Guru Desa](https://www.youtube.com/watch?v=UhYLAtbKER0). Perhatikan bagaimana instruksi disusun; setelah menonton, tulis ulang satu rangkaian blok sebagai pseudocode.

## Ringkasan

Pahami tujuan dan data, pecah pekerjaan, susun langkah yang berhingga, lalu uji setiap cabang dengan contoh. Flowchart dan pseudocode membantu memeriksa logika sebelum kita memikirkan syntax.$content$,
    example_source_code = null
where slug = 'pti-urai-masalah';

update public.lessons
set title = 'Data Bergerak: Input, Variabel, dan Operator',
    summary = 'Ikuti perjalanan nilai dari input teks, ke variabel dan perhitungan, sampai output yang bisa diamati.',
    content = $content$## Tujuan belajar

Kamu akan menelusuri perjalanan data dari input, memahami mengapa nilai perlu diberi nama, dan menggunakan operator untuk mengubahnya menjadi hasil.

## Input → proses → output

Program sederhana dapat dibaca sebagai tiga tahap: **input** menyediakan data, **proses** mengolah data, dan **output** memperlihatkan hasil. Di ThinkCode, masukan tersedia melalui variabel `input` sebagai teks. Teks `"6"` belum otomatis menjadi angka untuk perhitungan, jadi konversikan dengan `Number(input)`.

```javascript
const jumlah = Number(input);
const hargaSatuan = 12000;
let total = jumlah * hargaSatuan;
total = total - 2000;
console.log(total);
```

Jika input `3`, perhitungan pertama menghasilkan `36000`; setelah pengurangan, `total` menjadi `34000`. `console.log` menampilkan nilai terakhir. Sebelum Run, coba telusuri input `0` dan `1`, lalu bandingkan prediksi dengan nilai pada Visualizer.

## Variabel adalah nama untuk keadaan

Variabel menghubungkan sebuah nama dengan nilai agar nilai itu bisa dipakai kembali. Gunakan `const` jika nama tersebut tidak akan diisi ulang. Gunakan `let` jika nilai yang ditunjuk perlu berubah selama perhitungan. Pada contoh di atas, `jumlah` dan `hargaSatuan` tetap, sedangkan `total` diperbarui.

Tipe nilai memengaruhi operasi:

- **Number:** `6`, `-2`, `3.5` — dapat dihitung.
- **String:** `"ThinkCode"`, `"6"` — rangkaian karakter.
- **Boolean:** `true` atau `false` — hasil pertanyaan logika.

Perhatikan perbedaan ini: `"2" + "3"` menggabungkan teks menjadi `"23"`, sedangkan `Number("2") + Number("3")` menghasilkan angka `5`. Konversi tipe bukan detail kecil; ia menentukan arti suatu proses.

## Operator dan perubahan nilai

Operator aritmetika dasar adalah `+`, `-`, `*`, dan `/`. Tanda kurung dapat memperjelas urutan perhitungan, seperti `(a + b) * 2`. Assignment seperti `total = total - 2000` membaca nilai lama di kanan lalu menyimpan hasil baru ke nama yang sama. Setelah setiap assignment, keadaan program berubah.

Gunakan tabel kecil untuk menelusuri program saldo:

| Baris | Nilai `saldo` |
|---|---:|
| `let saldo = 10` | 10 |
| `saldo -= 3` | 7 |
| `saldo += 4` | 11 |

Jangan membaca hanya baris terakhir. Tanyakan nilai sebelum baris dijalankan, operasi yang dilakukan, lalu nilai sesudahnya. Itulah state yang akan ditampilkan sebagai jejak eksekusi.

## Aktivitas

1. Lengkapi latihan penggandaan input. Uji `6`, `0`, dan `-3`; jelaskan kaitan nilai input dengan output.
2. Prediksi saldo setelah setiap assignment sebelum menjalankan latihan.
3. Ubah satu angka pada contoh harga, lalu hitung manual nilai `total` setiap kali nilainya ditetapkan.

Video pendukung: [JavaScript Output untuk Pemula — Cara Fajar](https://www.youtube.com/watch?v=OuccJageYfI). Fokus pada `console.log`; bagian DOM/HTML tidak dipakai. Untuk variabel, lihat bagian terkait di [#6 Variabel JavaScript — Belajar Coding](https://www.youtube.com/watch?v=BC-WT8HR1fw), tanpa mengikuti contoh berbasis elemen HTML.

## Ringkasan

Kenali tipe input, ubah teks menjadi angka bila perlu, beri nilai nama yang jelas, lalu telusuri setiap operasi sebagai perubahan state. Output adalah bukti yang dapat dibandingkan dengan prediksi.$content$,
    example_source_code = $code$const jumlah = Number(input);
const hargaSatuan = 12000;
let total = jumlah * hargaSatuan;
total = total - 2000;
console.log(total);$code$
where slug = 'pti-input-proses-output';

update public.lessons
set title = 'Percabangan: Memilih Aksi dan Menguji Batas',
    summary = 'Gunakan kondisi boolean, if/else, dan cabang berurutan untuk menentukan aksi secara tepat.',
    content = $content$## Tujuan belajar

Kamu akan mengubah aturan menjadi kondisi yang bernilai `true` atau `false`, menelusuri cabang yang dijalankan, dan menguji nilai batas agar keputusan tidak salah.

## Kondisi adalah pertanyaan

Perbandingan seperti `nilai >= 60` menghasilkan boolean. `if` menjalankan satu blok ketika kondisi benar; `else` menangani keadaan lain. Kedua cabang harus menggambarkan seluruh kemungkinan yang relevan.

```javascript
const nilai = Number(input);
if (nilai >= 60) {
  console.log('Lulus');
} else {
  console.log('Perlu latihan');
}
```

Untuk nilai 59, kondisi bernilai `false` dan program mencetak “Perlu latihan”. Untuk nilai 60, kondisi bernilai `true` dan program mencetak “Lulus”. Nilai 60 menunjukkan mengapa aturan bahasa sehari-hari “60 atau lebih” harus ditulis `>= 60`, bukan `> 60`.

## Memilih dari beberapa kategori

Jika ada lebih dari dua hasil, `else if` memeriksa kondisi berikutnya hanya saat kondisi sebelumnya salah. Urutan kondisi menentukan hasil. Contoh klasifikasi usia:

```javascript
function kategoriUsia(usia) {
  if (usia >= 60) return 'Lansia';
  if (usia >= 18) return 'Dewasa';
  return 'Remaja';
}
```

Pada usia 65, kondisi pertama langsung cocok sehingga fungsi mengembalikan “Lansia”. Usia 25 tidak cocok pada kondisi pertama, lalu cocok pada kondisi kedua. Usia 17 melewati keduanya dan mendapat hasil terakhir. Bila kondisi `usia >= 18` ditaruh lebih dulu, usia 65 juga memenuhi kondisi tersebut dan tidak pernah mencapai kategori Lansia. Program itu dapat berjalan tanpa error tetapi tetap memiliki logika yang salah.

Untuk aturan rentang, cara lain adalah memeriksa batas bawah secara berurutan:

```javascript
if (usia < 18) {
  console.log('Remaja');
} else if (usia < 60) {
  console.log('Dewasa');
} else {
  console.log('Lansia');
}
```

Setelah cabang pertama salah, kita sudah tahu `usia` sekurang-kurangnya 18. Karena itu kondisi kedua cukup memeriksa apakah usia masih di bawah 60. Memahami apa yang sudah diketahui setelah cabang gagal membantu membuat aturan ringkas dan benar.

## Uji batas, bukan hanya contoh mudah

Untuk batas 18 dan 60, uji `17`, `18`, `19`, `59`, `60`, dan `61`. Catat input, kondisi pertama, kondisi berikutnya yang diperiksa, lalu output. Uji nilai tepat pada batas dan satu nilai di setiap sisinya. Jika aturan memakai beberapa rentang, pastikan tidak ada nilai yang tidak tercakup atau masuk ke dua hasil sekaligus.

## Coba sendiri

1. Lengkapi kondisi kelulusan, lalu prediksi hasil untuk 59, 60, dan 61 sebelum Run.
2. Pada Bug Lab kategori usia, amati bahwa urutan kondisi menyebabkan kategori yang lebih luas menangkap nilai lebih dulu. Perbaiki urutannya dan cek kembali nilai batas.
3. Jelaskan dengan kalimat sendiri mengapa kondisi yang terlalu umum sebaiknya tidak mendahului kondisi yang lebih khusus.

Video opsional: [JavaScript If Else — Cara Fajar](https://www.youtube.com/watch?v=AY6fo-wV8yM). Pilih bagian `if`, `else`, dan `else if`; `switch` berada di luar cakupan lesson ini.

## Ringkasan

Kondisi menjawab pertanyaan, cabang memilih aksi, dan urutannya menentukan keputusan pertama yang cocok. Tulis aturan dengan jelas lalu uji nilai batas dan kedua sisi setiap batas.$content$,
    example_source_code = $code$const usia = Number(input);
if (usia < 18) {
  console.log('Remaja');
} else if (usia < 60) {
  console.log('Dewasa');
} else {
  console.log('Lansia');
}$code$
where slug = 'pti-kondisi-if-else';

update public.lessons
set title = 'Perulangan dan Fungsi: Melacak, Mengulang, Mengemas',
    summary = 'Telusuri penghitung sampai kondisi berhenti, lalu gunakan fungsi untuk memberi nama pada pola perhitungan.',
    content = $content$## Tujuan belajar

Kamu akan membaca bagian awal, kondisi, dan perubahan pada loop; memprediksi jumlah iterasi; lalu membungkus perhitungan berulang dalam fungsi dengan parameter dan nilai balik.

## Loop menjalankan pola yang sama

Loop berguna ketika beberapa langkah perlu dilakukan berulang. Pada `for`, bagian awal menyiapkan penghitung, kondisi menentukan apakah putaran boleh berjalan, dan perubahan memperbarui penghitung.

```javascript
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

| Pemeriksaan | `i` | `i < 3` | Tindakan |
|---|---:|:---:|---|
| pertama | 0 | true | cetak 0, lalu naikkan `i` |
| kedua | 1 | true | cetak 1, lalu naikkan `i` |
| ketiga | 2 | true | cetak 2, lalu naikkan `i` |
| berikutnya | 3 | false | berhenti |

Loop ini mencetak 0, 1, 2 — bukan 3 — karena badan loop hanya berjalan ketika kondisi benar. Batas `< 3` tidak memasukkan angka 3. `while` memakai ide yang sama, tetapi kondisi ditulis terpisah dan harus tetap diperiksa setelah setiap perubahan.

## Pastikan loop bergerak menuju selesai

Untuk menilai loop, periksa tiga hal: dari nilai mana penghitung mulai, kapan kondisi menjadi salah, dan apakah perubahan mendekatkan penghitung ke titik tersebut. Kesalahan batas dapat menambah atau menghilangkan satu iterasi. Arah perubahan yang keliru dapat membuat kondisi selalu benar. Visualizer membantu membandingkan nilai penghitung dan hasil di setiap langkah; gunakan Previous dan Next untuk mencari iterasi pertama yang berbeda dari prediksi.

## Fungsi memberi nama pada pola

Fungsi mengemas langkah yang dapat dipanggil dengan nilai masukan berbeda. Parameter adalah nama untuk nilai yang diterima; `return` mengirim hasil perhitungan kembali ke pemanggil.

```javascript
function jumlahSampai(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total = total + i;
  }
  return total;
}

console.log(jumlahSampai(Number(input)));
```

Untuk `n = 4`, loop menambahkan 1, lalu 2, lalu 3, lalu 4 sehingga `total` menjadi 10. `return total` menyerahkan angka 10 kepada pemanggil; `console.log` yang mencetaknya. Keduanya berbeda: fungsi dapat mengembalikan nilai tanpa mencetak, sehingga hasilnya bisa dipakai dalam perhitungan lain.

Uji `n = 0`, `1`, dan `5`. Untuk 0, kondisi awal `1 <= 0` salah, badan loop tidak berjalan, dan fungsi mengembalikan nilai awal 0. Kasus kecil ini memastikan fungsi tetap berperilaku masuk akal di batas.

## Aktivitas

1. Prediksi keluaran loop tiga iterasi sebelum menjalankan kode. Jelaskan mengapa nilai penghitung terakhir yang terlihat berbeda dari nilai yang membuat loop berhenti.
2. Lengkapi fungsi `jumlahSampai` pada practice dan uji input 0, 1, serta 5.
3. Gunakan Visualizer untuk melihat `i` dan `total` berubah. Temukan baris ketika `total` berubah dan langkah ketika fungsi mengembalikan hasil.

Video opsional: [For Loop dan While Loop JavaScript — Cara Fajar](https://www.youtube.com/watch?v=0r0isf8aSy4). Fokus pada penghitung dan kondisi berhenti; latihan di lesson ini menambahkan cara mengemas loop dalam fungsi.

## Ringkasan

Loop mengulang badan selama kondisi benar, dan setiap putaran perlu memperbarui state menuju kondisi berhenti. Fungsi memberi nama pada pola, menerima parameter, dan mengembalikan hasil yang dapat dipakai lagi.$content$,
    example_source_code = $code$function jumlahSampai(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total = total + i;
  }
  return total;
}

console.log(jumlahSampai(Number(input)));$code$
where slug = 'pti-menelusuri-perulangan';

update public.lessons
set title = 'Bug Lab: Temukan Penyebab Loop Tidak Berhenti',
    summary = 'Amati gejala, bentuk hipotesis tentang state, perbaiki satu bagian, lalu buktikan loop berhenti dengan output yang benar.',
    content = $content$## Misi

Kode dimaksudkan mencetak `3`, `2`, `1`, lalu berhenti. Saat dijalankan, penghitung bergerak ke arah yang salah dan kondisi `i > 0` tetap benar. Output yang bertambah tanpa henti adalah gejala; tugasmu menemukan penyebabnya.

## Alur Bug Lab

### 1. Observe — amati

Sebelum menjalankan kode, catat nilai awal `i`, kondisi loop, dan perubahan pada akhir badan. Prediksi tiga nilai pertama yang tercetak. Perhatikan juga pertanyaan ini: setelah setiap putaran, apakah `i` bergerak mendekati atau menjauhi kondisi berhenti?

### 2. Run — lihat bukti

Jalankan kode. ThinkCode menjalankannya di sandbox browser terpisah, jadi ketika batas waktu tercapai editor tetap dapat digunakan. Pesan timeout berarti eksekusi perlu dihentikan; pesan itu sendiri belum menunjukkan baris yang salah.

### 3. Inspect — cari penyebab

Untuk loop `while`, periksa urutan berikut:

1. Nilai awal sebelum kondisi pertama diperiksa.
2. Kondisi yang menentukan apakah badan dijalankan.
3. Baris yang mengubah penghitung.
4. Nilai penghitung pada pemeriksaan berikutnya.

Tuliskan jejak tiga iterasi di kertas atau gunakan Visualizer. Jika kondisi masih benar setelah setiap perubahan, tanyakan apakah penghitung bergerak ke arah yang diperlukan. Hindari mengganti beberapa baris sekaligus; perubahan kecil membuat penyebab dan dampaknya lebih mudah dilihat.

### 4. Fix — ubah satu hal

Perbaiki perubahan penghitung agar setiap putaran membuat kondisi berhenti semakin dekat. Jalankan ulang dan pastikan output hanya memiliki tiga baris yang diminta. Jangan hanya mengandalkan kode yang selesai berjalan: loop yang berhenti terlalu cepat juga belum tentu benar.

### 5. Check — uji hasil

Practice memeriksa urutan keluaran `3`, `2`, `1`. Setelah memperbaiki kode, telusuri kondisi ketika penghitung bernilai 1 dan perubahan sesudahnya. Kondisi harus menjadi salah sebelum putaran keempat.

## Transfer cara berpikir

Pola pemeriksaan yang sama berlaku untuk setiap loop: **nilai awal → kondisi → badan → perubahan → kondisi berikutnya**. Saat sebuah program berulang terlalu banyak, terlalu sedikit, atau tidak berhenti, mulai dari urutan ini sebelum menebak-nebak sintaks.

Video pendukung loop tersedia pada lesson sebelumnya. Tonton setelah mencoba Bug Lab jika kamu perlu mengulang ide penghitung dan kondisi berhenti.

## Ringkasan

Timeout adalah petunjuk bahwa eksekusi melampaui batas, bukan diagnosis bug. Gunakan jejak state untuk menemukan perubahan yang menjauh dari kondisi berhenti, ubah satu hal, lalu buktikan hasil melalui output dan kondisi terakhir.$content$,
    example_source_code = $code$let i = 3;
while (i > 0) {
  console.log(i);
  i++;
}$code$
where slug = 'pti-bug-lab-loop';

update public.lessons
set is_published = false,
    is_required = false,
    summary = 'Materi digabung ke lesson utama yang berdekatan agar alur belajar lebih utuh.',
    content = $content$Materi ini telah digabung ke lesson utama yang berdekatan. Lesson ini disimpan untuk menjaga referensi dan riwayat lama, tetapi tidak ditampilkan pada learning path.$content$
where slug in (
  'pti-algoritma-flowchart',
  'pti-variabel-nilai-operator',
  'pti-kondisi-bertingkat',
  'pti-fungsi-sebagai-rencana'
);
