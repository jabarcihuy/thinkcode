-- Replace the published learning path without deleting its progress/history.
alter table public.assessments
  add column course_weight_percent numeric(5,2) not null default 0
  check (course_weight_percent between 0 and 100);

update public.learning_paths
set is_published = false, updated_at = now()
where slug = 'programming-logic-fundamentals';

insert into public.learning_paths (slug, title, description, is_published, position)
values (
  'pemrograman-dasar-pti',
  'Pemrograman Dasar — Pilot S1 PTI',
  'Pilot tujuh minggu pertama RPS Pendidikan Teknologi Informasi: berpikir komputasional, input-proses-output, percabangan, dan perulangan. JavaScript menjadi medium praktik logika di browser.',
  true, 1
)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, is_published = true,
  position = excluded.position, updated_at = now();

insert into public.chapters (learning_path_id, title, description, position, is_required, is_published)
select path.id, seed.title, seed.description, seed.position, true, true
from public.learning_paths path
cross join (values
  (1, 'Dari Masalah ke Algoritma', 'Mengurai masalah, menyusun instruksi, dan membandingkan pseudocode dengan flowchart. Minggu 1–2.'),
  (2, 'Data, Input, Proses, dan Output', 'Membaca masukan, melacak nilai, dan memeriksa hasil. Minggu 3–4.'),
  (3, 'Percabangan dan Keputusan', 'Menguji kondisi, urutan cabang, nilai batas, dan keputusan bertingkat. Minggu 5–6.'),
  (4, 'Perulangan dan Modularitas', 'Menelusuri iterasi, memperbaiki kondisi berhenti, dan mengenal fungsi sebagai jembatan UTS. Minggu 7.')
) as seed(position, title, description)
where path.slug = 'pemrograman-dasar-pti'
on conflict (learning_path_id, position) do update set
  title = excluded.title, description = excluded.description,
  is_required = true, is_published = true, updated_at = now();

insert into public.lessons (
  chapter_id, title, slug, summary, content, position, is_required, is_preview,
  is_published, example_source_code
)
select c.id, lesson.title, lesson.slug, lesson.summary, lesson.content,
       lesson.position, true, lesson.is_preview, true, lesson.example_source_code
from public.learning_paths path
join public.chapters c on c.learning_path_id = path.id
cross join (values
  (1, 1, 'pti-urai-masalah', 'Berpikir Komputasional: Urai Masalah', 'Mulai dari tujuan dan data sebelum memilih sintaks.',
   $lesson$## Tujuan

Ubah masalah sehari-hari menjadi bagian kecil yang bisa diamati dan diperiksa.

## Ide inti

Mulai dengan memahami tujuan dan informasi yang tersedia. Pecah pekerjaan, cari pola, lalu abaikan detail yang tidak memengaruhi jawaban. Setiap bagian sebaiknya punya hasil yang jelas.

## Coba sendiri

Sistem antrean kantin perlu menentukan siapa yang dilayani berikutnya. Pisahkan tugasnya: catat urutan kedatangan, pilih orang paling depan, layani, lalu perbarui antrean. Ubah satu langkah dan pikirkan apa akibatnya.

## Penghubung ke Scratch dan kode

Di Scratch, blok disusun sebagai instruksi. ThinkCode akan mengamati logika yang sama melalui urutan langkah dan JavaScript pendek. Bahasa berubah; tujuan, data, dan keputusan tetap perlu jelas.

## Video pendukung

Video opsional: [Belajar algoritma dan pemrograman dengan Scratch — Guru Desa](https://www.youtube.com/watch?v=UhYLAtbKER0). Tonton sebagai pemantik, lalu uji idenya lewat aktivitas.

## Ringkasan

Nyatakan tujuan, data yang dibutuhkan, dan bagian kecil yang menghasilkan jawaban sebelum menulis kode.$lesson$,
   null, false),
  (1, 2, 'pti-algoritma-flowchart', 'Algoritma, Pseudocode, dan Flowchart', 'Bandingkan tiga cara menjelaskan satu solusi.',
   $lesson$## Algoritma yang dapat diikuti

Algoritma adalah urutan langkah yang jelas dan berhingga untuk mencapai tujuan. Langkah ambigu membuat orang mendapat hasil berbeda.

## Dari kalimat ke representasi

Pseudocode menjelaskan langkah dengan bahasa ringkas yang tidak terikat sintaks. Flowchart menunjukkan alur: mulai, proses, keputusan, keluaran, dan selesai.

Mulai → baca nilai → nilai >= 60? → tampilkan hasil → selesai

Pada simpul keputusan ada cabang. Telusuri keduanya agar tidak ada keadaan yang terlupakan.

## Aktivitas

Susun blok flowchart pada latihan. Sebelum memeriksa jawaban, jelaskan mengapa keputusan harus terjadi sebelum program memilih pesan hasil.

## Ringkasan

Flowchart dan pseudocode membantu menguji logika sebelum memperhatikan detail sintaks.$lesson$,
   null, false),
  (2, 1, 'pti-input-proses-output', 'Input, Proses, Output', 'Lacak perjalanan data dari nilai masukan sampai hasil yang dicetak.',
   $lesson$## Tujuan

Bedakan input, proses, dan output, lalu periksa perubahan input terhadap hasil.

## Model kerja

input → proses → output

ThinkCode menyediakan teks pada variabel `input` saat Run. Nilai itu bertipe string. Gunakan `Number(input)` ketika ingin menghitung. `console.log()` menampilkan hasil.

## Contoh

Jika input berisi `6`, program mencetak `12`:

```javascript
const angka = Number(input);
console.log(angka * 2);
```

Coba ubah input menjadi `0` dan `-3`. Prediksi hasil lebih dulu, lalu jalankan.

## Video pendukung

Video opsional: [JavaScript Output untuk Pemula — Cara Fajar](https://www.youtube.com/watch?v=OuccJageYfI). Fokus pada `console.log`; bagian DOM/HTML tidak digunakan.

## Ringkasan

Pastikan tipe data sesuai prosesnya dan hasil program dapat diamati.$lesson$,
   $code$const angka = Number(input);
console.log(angka * 2);$code$, false),
  (2, 2, 'pti-variabel-nilai-operator', 'Variabel, Nilai, dan Operator', 'Amati bagaimana assignment dan ekspresi mengubah keadaan program.',
   $lesson$## Variabel menyimpan keadaan

Variabel memberi nama pada nilai. Gunakan `let` untuk binding yang akan diperbarui dan `const` saat binding tidak diganti. Nilai dasar yang sering dipakai adalah number, string, dan boolean.

```javascript
let saldo = 10;
saldo -= 3;
saldo += 4;
console.log(saldo); // 11
```

Operator menjalankan proses: `+`, `-`, `*`, `/`, perbandingan seperti `>=`, dan logika seperti `&&`. Urutan operasi memengaruhi hasil; gunakan tanda kurung bila membantu pembacaan.

## Prediksi sebelum Run

Catat nilai `saldo` setelah setiap baris. Setelah Run, cocokkan prediksi dengan snapshot visualizer.

## Video pendukung

Video opsional: [Variabel JavaScript — Belajar Coding](https://www.youtube.com/watch?v=BC-WT8HR1fw). Gunakan bagian variabel, bukan contoh input berbasis HTML.

## Ringkasan

Membaca assignment satu per satu membantu menemukan perubahan nilai yang terlewat.$lesson$,
   $code$let saldo = 10;
saldo -= 3;
saldo += 4;
console.log(saldo);$code$, false),
  (3, 1, 'pti-kondisi-if-else', 'Kondisi dan if/else', 'Pilih aksi berdasarkan pertanyaan yang bernilai true atau false.',
   $lesson$## Kondisi adalah pertanyaan

Perbandingan menghasilkan boolean: `true` atau `false`. Contohnya `nilai >= 60`. `if` memilih blok saat kondisi benar; `else` menangani kasus lainnya.

```javascript
const nilai = Number(input);
if (nilai >= 60) {
  console.log('Lulus');
} else {
  console.log('Perlu latihan');
}
```

## Periksa batas

Uji nilai `59`, `60`, dan `61`. Nilai tepat pada batas mengungkap perbedaan antara `>` dan `>=`.

## Video pendukung

Video opsional: [JavaScript If Else — Cara Fajar](https://www.youtube.com/watch?v=AY6fo-wV8yM). Pilot memakai `if`, `else`, dan `else if`; `switch` tidak dibahas.

## Ringkasan

Nyatakan kondisi dan hasil pada kedua cabang sebelum menjalankan program.$lesson$,
   $code$const nilai = Number(input);
if (nilai >= 60) {
  console.log('Lulus');
} else {
  console.log('Perlu latihan');
}$code$, false),
  (3, 2, 'pti-kondisi-bertingkat', 'Cabang Bertingkat dan Nilai Batas', 'Debug urutan kondisi dan uji kasus tepi.',
   $lesson$## Membaca lebih dari satu keputusan

`else if` memeriksa kondisi berikutnya hanya ketika kondisi sebelumnya salah. Urutan penting: kondisi luas yang lebih dulu dapat menangkap kasus khusus.

```javascript
function kategoriUsia(usia) {
  if (usia >= 60) return 'Lansia';
  if (usia >= 18) return 'Dewasa';
  return 'Remaja';
}
```

Tulis tabel kasus: nilai, kondisi pertama, kondisi berikutnya, dan keluaran. Uji tepat di batas 18 dan 60.

## Bug Lab

Latihan sengaja memberi urutan cabang yang salah. Amati output, perbaiki, lalu cek ulang batasnya.

## Video pendukung

Lanjutkan bagian `else if` dari video If Else sebelumnya. Nested-if dijelaskan lewat contoh dan latihan ThinkCode.

## Ringkasan

Kondisi bisa benar secara sintaks tetapi salah secara urutan. Uji setiap rentang dan nilai batas.$lesson$,
   $code$function kategoriUsia(usia) {
  if (usia >= 18) return 'Dewasa';
  if (usia >= 60) return 'Lansia';
  return 'Remaja';
}
console.log(kategoriUsia(Number(input)));$code$, false),
  (4, 1, 'pti-menelusuri-perulangan', 'Menelusuri Perulangan', 'Ikuti nilai penghitung, kondisi, dan perubahan di setiap iterasi.',
   $lesson$## Pengulangan tanpa menyalin baris

Loop menjalankan instruksi selama kondisi berhenti belum terpenuhi. `for` mengelompokkan awal, kondisi, dan perubahan penghitung; `while` memeriksa kondisi setiap putaran.

```javascript
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

| Iterasi | `i` | `i < 3` | Output |
|---:|---:|:---:|:---:|
| 1 | 0 | true | 0 |
| 2 | 1 | true | 1 |
| 3 | 2 | true | 2 |
| berhenti | 3 | false | — |

## Visualizer

Prediksi jumlah iterasi. Setelah Run, gunakan Previous/Next untuk memeriksa nilai `i` dan kondisi setiap langkah.

## Video pendukung

Video opsional: [For Loop dan While Loop JavaScript — Cara Fajar](https://www.youtube.com/watch?v=0r0isf8aSy4). Fokus pada penghitung dan kondisi berhenti.

## Ringkasan

Pastikan setiap iterasi mengubah keadaan sehingga loop akhirnya berhenti.$lesson$,
   $code$for (let i = 0; i < 3; i++) {
  console.log(i);
}$code$, false),
  (4, 2, 'pti-bug-lab-loop', 'Bug Lab: Loop Tidak Berhenti', 'Perbaiki arah penghitung agar loop berhenti setelah tiga keluaran.',
   $lesson$## Amati dahulu

Loop berikut dimaksudkan mencetak `3`, `2`, `1`, lalu berhenti. Namun `i` bergerak menjauhi kondisi berhenti:

```javascript
let i = 3;
while (i > 0) {
  console.log(i);
  i++;
}
```

Run dapat dihentikan oleh batas waktu ThinkCode. UI tetap bisa dipakai karena kode berjalan di sandbox terpisah.

## Perbaiki

Ubah satu bagian agar nilai turun. Jalankan lagi dan amati kondisi `i > 0` berubah dari true menjadi false.

## Cara men-debug loop

1. Catat nilai awal penghitung.
2. Periksa kondisi sebelum badan loop.
3. Pastikan perubahan mendekatkan program pada kondisi berhenti.
4. Uji beberapa iterasi secara manual.

Timeout adalah petunjuk eksekusi melewati batas, bukan bukti solusi benar. Temukan perubahan state yang berlawanan.$lesson$,
   $code$let i = 3;
while (i > 0) {
  console.log(i);
  i++;
}$code$, false),
  (4, 3, 'pti-fungsi-sebagai-rencana', 'Fungsi: Beri Nama pada Langkah', 'Rangkum pengulangan dalam fungsi sederhana sebagai jembatan indikator UTS.',
   $lesson$## Jembatan menuju modularitas

Indikator UTS RPS menyebut penggunaan fungsi/modul. Agar konsep itu tidak muncul tanpa pengantar, pilot memberi pengenalan singkat setelah loop. Fungsi di sini memberi nama pada satu bagian solusi; materi lanjut tetap di luar pilot.

```javascript
function jumlahSampai(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}
console.log(jumlahSampai(4)); // 10
```

Parameter `n` membawa nilai ke fungsi. `return` mengirim hasil kembali. Pisahkan perhitungan dari pemanggilan agar mudah diuji.

## Latihan transfer

Lengkapi `jumlahSampai`, lalu uji `0`, `1`, dan `5`. Jelaskan mengapa kondisi loop mencakup nilai n.

## Ringkasan

Fungsi tidak mengubah logika algoritma; ia memberi nama dan batas yang jelas pada satu bagian solusi.$lesson$,
   $code$function jumlahSampai(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}
console.log(jumlahSampai(Number(input)));$code$, false)
) as lesson(chapter_position, position, slug, title, summary, content, example_source_code, is_preview)
where path.slug = 'pemrograman-dasar-pti' and c.position = lesson.chapter_position
on conflict (slug) do update set
  chapter_id = excluded.chapter_id, title = excluded.title, summary = excluded.summary,
  content = excluded.content, position = excluded.position, is_required = true,
  is_preview = excluded.is_preview, is_published = true,
  example_source_code = excluded.example_source_code, updated_at = now();

insert into public.exercises (lesson_id, type, title, prompt, starter_code, config, position, is_required, is_published)
select l.id, seed.type::public.exercise_type, seed.title, seed.prompt,
       seed.starter_code, seed.config::jsonb, 1, true, true
from public.lessons l
cross join (values
  ('pti-urai-masalah', 'PSEUDOCODE', 'Susun rencana penyelesaian', 'Susun urutan kerja sebelum menulis kode.', null,
   '{"public":{"mode":"order","blocks":[{"id":"answer","text":"Periksa apakah hasil sesuai tujuan"},{"id":"goal","text":"Nyatakan tujuan dan informasi yang tersedia"},{"id":"parts","text":"Pecah pekerjaan menjadi bagian kecil"},{"id":"steps","text":"Susun langkah untuk tiap bagian"}]},"answer":{"order":["goal","parts","steps","answer"]}}'),
  ('pti-algoritma-flowchart', 'FLOWCHART', 'Lengkapi simpul keputusan', 'Flowchart memeriksa nilai kelulusan. Simpul apa yang tepat setelah membaca nilai?', null,
   '{"public":{"mode":"choice","options":[{"id":"output","text":"Langsung tampilkan Lulus"},{"id":"decision","text":"Decision: nilai >= 60? lalu pilih cabang"},{"id":"end","text":"Selesai tanpa keluaran"}]},"answer":{"choiceId":"decision"}}'),
  ('pti-input-proses-output', 'CODE_COMPLETION', 'Gandakan nilai input', 'Input berupa angka sebagai teks. Konversikan ke Number, kalikan dua, lalu cetak hasilnya.',
   $code$const angka = Number(input);
// Cetak dua kali angka$code$,
   '{"public":{"inputDescription":"Satu angka tersedia melalui variabel input.","outputDescription":"Satu angka hasil perkalian dua."}}'),
  ('pti-variabel-nilai-operator', 'PREDICT_OUTPUT', 'Prediksi saldo akhir', 'Berapa nilai yang dicetak setelah kedua assignment?',
   $code$let saldo = 10;
saldo -= 3;
saldo += 4;
console.log(saldo);$code$,
   '{"answer":{"output":"11"}}'),
  ('pti-kondisi-if-else', 'CODE_COMPLETION', 'Periksa batas kelulusan', 'Lengkapi kondisi: nilai 60 atau lebih mencetak Lulus; selain itu mencetak Perlu latihan.',
   $code$const nilai = Number(input);
if (/* lengkapi kondisi */) {
  console.log('Lulus');
} else {
  console.log('Perlu latihan');
}$code$,
   '{"public":{"inputDescription":"Satu nilai bilangan bulat.","outputDescription":"Lulus atau Perlu latihan."}}'),
  ('pti-kondisi-bertingkat', 'DEBUGGING', 'Perbaiki urutan kategori usia', 'Nilai 60 salah dikategorikan karena cabang umum menangkapnya lebih dahulu. Atur ulang keputusan.',
   $code$function kategoriUsia(usia) {
  if (usia >= 18) return 'Dewasa';
  if (usia >= 60) return 'Lansia';
  return 'Remaja';
}
console.log(kategoriUsia(Number(input)));$code$,
   '{"public":{"inputDescription":"Satu usia bilangan bulat.","outputDescription":"Remaja (<18), Dewasa (18–59), atau Lansia (60+)."}}'),
  ('pti-menelusuri-perulangan', 'PREDICT_OUTPUT', 'Prediksi isi loop', 'Tulis output tiap baris sesuai urutannya.',
   $code$for (let i = 0; i < 3; i++) {
  console.log(i);
}$code$,
   '{"answer":{"output":"0\n1\n2"}}'),
  ('pti-bug-lab-loop', 'DEBUGGING', 'Buat penghitung mendekati kondisi berhenti', 'Perbaiki loop agar mencetak 3, 2, 1 lalu berhenti.',
   $code$let i = 3;
while (i > 0) {
  console.log(i);
  i++;
}$code$,
   '{"public":{"inputDescription":"Tidak ada input.","outputDescription":"Tiga baris: 3, 2, 1."}}'),
  ('pti-fungsi-sebagai-rencana', 'CODE_COMPLETION', 'Jumlahkan 1 sampai n', 'Lengkapi fungsi jumlahSampai agar mengembalikan jumlah 1 sampai n. Untuk n <= 0, kembalikan 0.',
   $code$function jumlahSampai(n) {
  let total = 0;
  // lengkapi pengulangan
  return total;
}
console.log(jumlahSampai(Number(input)));$code$,
   '{"public":{"inputDescription":"Satu bilangan bulat n.","outputDescription":"Jumlah bilangan dari 1 sampai n."}}')
) as seed(lesson_slug, type, title, prompt, starter_code, config)
where l.slug = seed.lesson_slug
on conflict (lesson_id, position) do update set
  type = excluded.type, title = excluded.title, prompt = excluded.prompt,
  starter_code = excluded.starter_code, config = excluded.config,
  is_required = true, is_published = true, updated_at = now();

insert into public.test_cases (exercise_id, position, stdin, expected_output, is_hidden, weight)
select exercise.id, seed.position, seed.stdin, seed.expected_output, false, seed.weight
from public.exercises exercise
join public.lessons lesson on lesson.id = exercise.lesson_id
cross join (values
  ('pti-input-proses-output', 1, '6', '12', 1),
  ('pti-input-proses-output', 2, '0', '0', 1),
  ('pti-variabel-nilai-operator', 1, '', '11', 1),
  ('pti-kondisi-if-else', 1, '59', 'Perlu latihan', 1),
  ('pti-kondisi-if-else', 2, '60', 'Lulus', 1),
  ('pti-kondisi-if-else', 3, '90', 'Lulus', 1),
  ('pti-kondisi-bertingkat', 1, '17', 'Remaja', 1),
  ('pti-kondisi-bertingkat', 2, '18', 'Dewasa', 1),
  ('pti-kondisi-bertingkat', 3, '60', 'Lansia', 1),
  ('pti-menelusuri-perulangan', 1, '', '0'||chr(10)||'1'||chr(10)||'2', 1),
  ('pti-bug-lab-loop', 1, '', '3'||chr(10)||'2'||chr(10)||'1', 1),
  ('pti-fungsi-sebagai-rencana', 1, '5', '15', 1),
  ('pti-fungsi-sebagai-rencana', 2, '1', '1', 1),
  ('pti-fungsi-sebagai-rencana', 3, '0', '0', 1)
) as seed(lesson_slug, position, stdin, expected_output, weight)
where lesson.slug = seed.lesson_slug and exercise.position = 1
on conflict (exercise_id, position) do update set
  stdin = excluded.stdin, expected_output = excluded.expected_output,
  is_hidden = false, weight = excluded.weight;

insert into public.assessments (
  learning_path_id, slug, title, instructions, type, gate_after_chapter,
  passing_score, position, is_published, course_weight_percent
)
select path.id, seed.slug, seed.title, seed.instructions, seed.type::public.assessment_type,
       seed.gate_after_chapter, 75, seed.position, true, seed.course_weight_percent
from public.learning_paths path
cross join (values
  ('pti-checkpoint-1', 'CHECKPOINT', 'Penilaian Minggu 1–2', 'Nilai resmi gabungan minggu 1–2 (masing-masing berbobot 5%). Selesaikan lesson unit sebelum memulai. Latihan mandiri dapat diulang terpisah.', 1, 1, 10::numeric),
  ('pti-checkpoint-2', 'CHECKPOINT', 'Penilaian Minggu 3–4', 'Nilai resmi gabungan minggu 3–4 (bobot 3% dan 5%). Skor dihitung server-side; assessment berbeda dari latihan mandiri.', 2, 2, 8::numeric),
  ('pti-checkpoint-3', 'CHECKPOINT', 'Penilaian Minggu 5–6', 'Nilai resmi gabungan minggu 5–6 (bobot 3% dan 5%). Perhatikan kondisi dan nilai batas.', 3, 3, 8::numeric),
  ('pti-checkpoint-4', 'CHECKPOINT', 'Penilaian Minggu 7', 'Nilai resmi untuk materi perulangan dan pengantar fungsi sederhana.', 4, 4, 5::numeric),
  ('pti-uts', 'FINAL', 'Ujian Tengah Semester', 'Penilaian sumatif resmi pilot, bobot 20%. Cakupan: berpikir komputasional, input-proses-output, variabel dan operator, percabangan, perulangan, serta pengantar fungsi yang sudah dipelajari pada minggu 7. AI Tutor dan petunjuk nonaktif selama assessment.', 4, 5, 20::numeric)
) as seed(slug, type, title, instructions, gate_after_chapter, position, course_weight_percent)
where path.slug = 'pemrograman-dasar-pti'
on conflict (learning_path_id, slug) do update set
  title = excluded.title, instructions = excluded.instructions, type = excluded.type,
  gate_after_chapter = excluded.gate_after_chapter, passing_score = excluded.passing_score,
  position = excluded.position, is_published = true,
  course_weight_percent = excluded.course_weight_percent, updated_at = now();

insert into public.assessment_items (
  assessment_id, type, title, topic, prompt, starter_code, public_config,
  answer_config, entry_function, weight, position
)
select a.id, seed.type::public.exercise_type, seed.title, seed.topic, seed.prompt,
       seed.starter_code, seed.public_config::jsonb, seed.answer_config::jsonb,
       seed.entry_function, seed.weight, seed.position
from public.assessments a
cross join (values
  ('pti-checkpoint-1', 1, 'PSEUDOCODE', 'Tentukan urutan langkah', 'Algoritma', 'Atur langkah untuk mengolah dua nilai dan menampilkan hasil.', null,
   '{"mode":"order","blocks":[{"id":"show","text":"Tampilkan hasil"},{"id":"read","text":"Baca dua nilai"},{"id":"process","text":"Jalankan proses sesuai tujuan"}]}',
   '{"order":["read","process","show"]}', null, 1),
  ('pti-checkpoint-1', 2, 'FLOWCHART', 'Pilih simpul flowchart', 'Flowchart', 'Untuk menentukan kelulusan, simpul apa yang menghubungkan nilai dengan dua kemungkinan hasil?', null,
   '{"mode":"choice","options":[{"id":"decision","text":"Decision: nilai >= 60?"},{"id":"finish","text":"End"},{"id":"output","text":"Tampilkan Lulus tanpa pemeriksaan"}]}',
   '{"choiceId":"decision"}', null, 1),
  ('pti-checkpoint-2', 1, 'PREDICT_OUTPUT', 'Lacak perubahan variabel', 'Variabel dan operator', 'Tulis angka yang tercetak setelah seluruh assignment dijalankan.',
   $code$let total = 5;
total *= 2;
total -= 3;
console.log(total);$code$,
   '{}', '{"output":"7"}', null, 3),
  ('pti-checkpoint-2', 2, 'CODE_COMPLETION', 'Hitung luas persegi panjang', 'Input dan proses', 'Lengkapi fungsi agar mengembalikan hasil kali panjang dan lebar.',
   $code$function luasPersegiPanjang(panjang, lebar) {
  // kembalikan luas
}$code$,
   '{}', '{}', 'luasPersegiPanjang', 5),
  ('pti-checkpoint-3', 1, 'DEBUGGING', 'Perbaiki kategori kelulusan', 'Percabangan', 'Nilai batas 60 seharusnya Lulus. Perbaiki kondisi agar batas inklusif.',
   $code$function statusNilai(nilai) {
  if (nilai > 60) return 'Lulus';
  return 'Perlu latihan';
}$code$,
   '{}', '{}', 'statusNilai', 5),
  ('pti-checkpoint-3', 2, 'PSEUDOCODE', 'Urutkan pemeriksaan kategori', 'Kondisi bertingkat', 'Untuk mengelompokkan usia menjadi Lansia (60+), Dewasa (18–59), dan Remaja (<18), susun keputusan.', null,
   '{"mode":"order","blocks":[{"id":"older","text":"Jika usia >= 60, pilih Lansia"},{"id":"adult","text":"Jika belum tertangani dan usia >= 18, pilih Dewasa"},{"id":"young","text":"Jika belum 18, pilih Remaja"}]}',
   '{"order":["older","adult","young"]}', null, 3),
  ('pti-checkpoint-4', 1, 'PREDICT_OUTPUT', 'Telusuri loop', 'Perulangan', 'Tulis output loop sesuai urutan baris.',
   $code$let hasil = 0;
for (let i = 1; i <= 3; i++) hasil += i;
console.log(hasil);$code$,
   '{}', '{"output":"6"}', null, 2),
  ('pti-checkpoint-4', 2, 'CODE_COMPLETION', 'Jumlahkan 1 sampai n', 'Fungsi dan perulangan', 'Isi fungsi yang menerima n dan mengembalikan jumlah bilangan dari 1 sampai n.',
   $code$function jumlahSampai(n) {
  let total = 0;
  // tambahkan nilai 1 sampai n
  return total;
}$code$,
   '{}', '{}', 'jumlahSampai', 3),
  ('pti-uts', 1, 'PSEUDOCODE', 'Susun alur solusi', 'Algoritma', 'Urutkan alur umum untuk menyelesaikan masalah secara terstruktur.', null,
   '{"mode":"order","blocks":[{"id":"check","text":"Periksa hasil dengan kasus uji"},{"id":"understand","text":"Pahami tujuan dan informasi yang ada"},{"id":"plan","text":"Susun langkah atau representasi solusi"},{"id":"implement","text":"Jalankan langkah dalam program"}]}',
   '{"order":["understand","plan","implement","check"]}', null, 1),
  ('pti-uts', 2, 'PREDICT_OUTPUT', 'Prediksi cabang dan output', 'Percabangan', 'Tulis apa yang dicetak ketika nilai adalah 60.',
   $code$const nilai = 60;
if (nilai >= 60) console.log('Lulus');
else console.log('Perlu latihan');$code$,
   '{}', '{"output":"Lulus"}', null, 1),
  ('pti-uts', 3, 'PROBLEM_SOLVING', 'Hitung kelipatan tiga', 'Loop dan fungsi', 'Lengkapi fungsi untuk menghitung banyaknya bilangan dari 1 sampai n yang habis dibagi 3.',
   $code$function hitungKelipatanTiga(n) {
  // gunakan penghitung dan kondisi
}$code$,
   '{}', '{}', 'hitungKelipatanTiga', 4),
  ('pti-uts', 4, 'PROBLEM_SOLVING', 'Jumlahkan bilangan genap', 'Kondisi, loop, dan fungsi', 'Kembalikan jumlah semua bilangan genap dari 1 sampai n. Untuk n <= 0, kembalikan 0.',
   $code$function jumlahGenapSampai(n) {
  // telusuri 1 sampai n dan tambahkan bilangan genap
}$code$,
   '{}', '{}', 'jumlahGenapSampai', 4)
) as seed(assessment_slug, position, type, title, topic, prompt, starter_code, public_config, answer_config, entry_function, weight)
where a.slug = seed.assessment_slug
on conflict (assessment_id, position) do update set
  type = excluded.type, title = excluded.title, topic = excluded.topic, prompt = excluded.prompt,
  starter_code = excluded.starter_code, public_config = excluded.public_config,
  answer_config = excluded.answer_config, entry_function = excluded.entry_function,
  weight = excluded.weight;

insert into public.assessment_test_cases (
  assessment_item_id, args, stdin, expected_output, is_hidden, weight, position
)
select item.id, seed.args::jsonb, '', seed.expected_output, true, seed.weight, seed.position
from public.assessment_items item
join public.assessments assessment on assessment.id = item.assessment_id
cross join (values
  ('pti-checkpoint-2', 'Hitung luas persegi panjang', 1, '[3,4]', '12', 1),
  ('pti-checkpoint-2', 'Hitung luas persegi panjang', 2, '[0,8]', '0', 1),
  ('pti-checkpoint-2', 'Hitung luas persegi panjang', 3, '[10,2]', '20', 1),
  ('pti-checkpoint-3', 'Perbaiki kategori kelulusan', 1, '[60]', 'Lulus', 1),
  ('pti-checkpoint-3', 'Perbaiki kategori kelulusan', 2, '[59]', 'Perlu latihan', 1),
  ('pti-checkpoint-3', 'Perbaiki kategori kelulusan', 3, '[100]', 'Lulus', 1),
  ('pti-checkpoint-4', 'Jumlahkan 1 sampai n', 1, '[5]', '15', 1),
  ('pti-checkpoint-4', 'Jumlahkan 1 sampai n', 2, '[0]', '0', 1),
  ('pti-uts', 'Hitung kelipatan tiga', 1, '[10]', '3', 1),
  ('pti-uts', 'Hitung kelipatan tiga', 2, '[2]', '0', 1),
  ('pti-uts', 'Hitung kelipatan tiga', 3, '[15]', '5', 1),
  ('pti-uts', 'Jumlahkan bilangan genap', 1, '[6]', '12', 1),
  ('pti-uts', 'Jumlahkan bilangan genap', 2, '[1]', '0', 1),
  ('pti-uts', 'Jumlahkan bilangan genap', 3, '[0]', '0', 1)
) as seed(assessment_slug, item_title, position, args, expected_output, weight)
where assessment.slug = seed.assessment_slug and item.title = seed.item_title
on conflict (assessment_item_id, position) do update set
  args = excluded.args, expected_output = excluded.expected_output,
  is_hidden = true, weight = excluded.weight;
