insert into public.learning_paths (slug, title, description, is_published)
values (
  'programming-logic-fundamentals',
  'Programming Logic Fundamentals',
  'Jalur bertahap untuk memahami cara berpikir komputasional dan dasar pemrograman Java.',
  true
)
on conflict (slug) do nothing;

insert into public.chapters (learning_path_id, title, description, position, is_required, is_published)
select path.id, chapter.title, chapter.description, chapter.position, true, true
from public.learning_paths path
cross join (values
  (1, 'Computational Thinking', 'Mulai dari cara memecah dan memahami masalah.'),
  (2, 'Algorithm & Flowchart', 'Ubah ide menjadi langkah yang runtut.'),
  (3, 'Programming Basics', 'Kenali program, source code, dan struktur Java.'),
  (4, 'Variables & Data Types', 'Materi akan ditambahkan pada fase berikutnya.'),
  (5, 'Operators', 'Materi akan ditambahkan pada fase berikutnya.'),
  (6, 'Conditional Logic', 'Materi akan ditambahkan pada fase berikutnya.'),
  (7, 'Loops', 'Materi akan ditambahkan pada fase berikutnya.'),
  (8, 'Functions', 'Materi akan ditambahkan pada fase berikutnya.'),
  (9, 'Arrays', 'Materi akan ditambahkan pada fase berikutnya.'),
  (10, 'Problem Solving', 'Materi akan ditambahkan pada fase berikutnya.')
) as chapter(position, title, description)
where path.slug = 'programming-logic-fundamentals'
on conflict (learning_path_id, position) do nothing;

insert into public.lessons (
  chapter_id, position, slug, title, summary, content, is_required, is_preview, is_published
)
select chapter.id, lesson.position, lesson.slug, lesson.title, lesson.summary,
       lesson.content, true, lesson.is_preview, true
from public.chapters chapter
join public.learning_paths path on path.id = chapter.learning_path_id
join (values
  (1, 1, 'what-is-computational-thinking', 'What is Computational Thinking?',
   'Belajar melihat masalah sebagai langkah yang dapat dikerjakan.',
   $lesson$
## Berpikir komputasional

Berpikir komputasional adalah cara menyusun masalah agar solusinya jelas dan dapat diulang. Kita mulai dari memahami tujuan, mengenali informasi yang tersedia, lalu membagi pekerjaan menjadi langkah kecil.

Empat kebiasaan yang membantu adalah **decomposition**, mengenali pola, memilih informasi penting, dan menyusun algoritma. Kamu belum perlu menulis kode untuk memakainya.

## Contoh

Saat menyiapkan perjalanan, masalah “berangkat tepat waktu” dapat dipecah menjadi menentukan tujuan, memilih rute, menghitung waktu tempuh, dan menyiapkan barang. Setiap bagian punya keputusan yang lebih sederhana.

## Ringkasan

Mulailah dari masalahnya. Tulis langkah yang dapat diperiksa sebelum memikirkan sintaks program.
   $lesson$, true),
  (1, 2, 'decomposition', 'Decomposition',
   'Pecah masalah besar menjadi bagian yang bisa diselesaikan.',
   $lesson$
## Memecah masalah

Decomposition berarti membagi satu tujuan besar menjadi beberapa tugas kecil. Setiap tugas harus memiliki hasil yang jelas agar lebih mudah dikerjakan dan diuji.

## Contoh

Untuk menghitung nilai akhir siswa, pisahkan pekerjaan menjadi: menerima nilai tugas, menerima nilai ujian, menghitung bobot, dan menampilkan hasil. Dengan begitu, kesalahan pada satu langkah lebih mudah ditemukan.

## Coba pikirkan

Jika kamu ingin membuat daftar belanja otomatis, informasi apa yang perlu dikumpulkan terlebih dahulu? Tuliskan sub-masalahnya sebelum menentukan solusinya.
   $lesson$, false),
  (2, 1, 'what-is-an-algorithm', 'What is an Algorithm?',
   'Susun instruksi yang terurut dan tidak ambigu.',
   $lesson$
## Algoritma

Algoritma adalah urutan instruksi untuk mencapai hasil tertentu. Langkahnya harus cukup jelas sehingga orang lain dapat mengikutinya dengan hasil yang konsisten.

## Contoh

Untuk menentukan apakah bilangan genap: terima sebuah bilangan, bagi dengan dua, lalu periksa sisanya. Jika sisanya nol, bilangan itu genap; jika tidak, bilangan itu ganjil.

Urutan penting. Memeriksa sisa sebelum memiliki bilangan tidak akan menghasilkan jawaban.

## Ringkasan

Algoritma menjelaskan *apa yang dilakukan dan dalam urutan apa*, terlepas dari bahasa pemrograman yang nanti digunakan.
   $lesson$, true),
  (2, 2, 'introduction-to-flowchart', 'Introduction to Flowchart',
   'Visualisasikan alur dan keputusan dalam algoritma.',
   $lesson$
## Membaca alur

Flowchart menggambarkan langkah algoritma sebagai alur. Mulai dan selesai menandai batas proses; kotak proses berisi tindakan; bentuk keputusan memilih cabang berdasarkan kondisi.

## Contoh

Untuk memeriksa kelulusan: mulai → baca nilai → apakah nilai memenuhi batas lulus? → tampilkan “Lulus” atau “Belum lulus” → selesai.

Satu keputusan memiliki cabang yang jelas. Ikuti masing-masing cabang untuk memastikan keduanya mencapai akhir.
   $lesson$, false),
  (3, 1, 'introduction-to-programming', 'Introduction to Programming',
   'Hubungkan algoritma dengan instruksi yang dapat diproses komputer.',
   $lesson$
## Dari algoritma ke program

Program adalah sekumpulan instruksi yang ditulis dalam bahasa yang dapat diproses komputer. **Source code** adalah teks instruksinya; sintaks adalah aturan penulisannya.

Logika yang benar tetap perlu diterjemahkan ke sintaks yang benar. Sebaliknya, kode yang lolos pemeriksaan sintaks belum tentu menyelesaikan masalah yang dimaksud.

## Ringkasan

Mulailah dengan input, proses, dan output. Setelah alurnya jelas, tuliskan instruksinya dalam bahasa pemrograman.
   $lesson$, false),
  (3, 2, 'first-java-program', 'First Java Program',
   'Kenali kerangka program Java dan output sederhana.',
   $lesson$
## Program pertama

Contoh berikut menampilkan satu kalimat. Ini adalah contoh bacaan; workspace untuk menjalankan kode akan hadir pada fase berikutnya.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Halo, ThinkCode!");
    }
}
```

`main` adalah titik awal program. `System.out.println` menulis teks ke output. Tanda kurung kurawal membatasi isi kelas dan method.

## Ringkasan

Perhatikan hubungan antara struktur program dan hasil yang diharapkan sebelum mencoba mengubahnya.
   $lesson$, false)
) as lesson(chapter_position, position, slug, title, summary, content, is_preview)
  on chapter.position = lesson.chapter_position
where path.slug = 'programming-logic-fundamentals'
on conflict (slug) do nothing;
