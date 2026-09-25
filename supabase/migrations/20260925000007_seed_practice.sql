-- Three concise lessons make the requested Variables and Conditional exercises
-- reachable without filling the rest of the curriculum prematurely.
insert into public.lessons
  (chapter_id, title, slug, summary, content, position, is_required, is_preview, is_published, example_source_code)
select chapter.id, seed.title, seed.slug, seed.summary, seed.content,
       1, true, false, true, seed.example_source_code
from (values
  (4, 'Variables and Data Types', 'variables-and-types',
   'Simpan nilai dalam variabel dan pilih tipe data yang sesuai.',
   $md$## Menyimpan nilai

Variabel memberi nama pada sebuah nilai. `int` menyimpan bilangan bulat dan `String` menyimpan teks.

```java
int jumlah = 3;
String nama = "Ayu";
System.out.println(nama + " memiliki " + jumlah + " buku");
```

Gunakan `Scanner` ketika program perlu membaca input.$md$,
   $java$import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int jumlah = input.nextInt();
        System.out.println("Jumlah: " + jumlah);
    }
}$java$),
  (5, 'Basic Operators', 'basic-operators',
   'Gunakan operator untuk menghitung dan membandingkan nilai.',
   $md$## Operasi dasar

Java memakai `+`, `-`, `*`, dan `/` untuk aritmetika. Perkalian dikerjakan sebelum penjumlahan.

```java
int hasil = 2 + 3 * 4;
System.out.println(hasil); // 14
```$md$,
   null),
  (6, 'If and Else', 'if-else-basics',
   'Pilih langkah berdasarkan kondisi boolean.',
   $md$## Membuat keputusan

`if` menjalankan blok kode saat kondisi benar. `else` menangani keadaan lainnya.

```java
int nilai = 75;
if (nilai >= 75) {
    System.out.println("Lulus");
} else {
    System.out.println("Belum lulus");
}
```$md$,
   null)
) as seed(chapter_position, title, slug, summary, content, example_source_code)
join public.chapters chapter on chapter.position = seed.chapter_position
join public.learning_paths path on path.id = chapter.learning_path_id
where path.slug = 'programming-logic-fundamentals'
on conflict (slug) do nothing;

insert into public.exercises
  (lesson_id, type, title, prompt, starter_code, config, position, is_required, is_published)
select lesson.id, seed.type::public.exercise_type, seed.title, seed.prompt,
       replace(seed.starter_code, chr(92) || 'n', chr(10)), seed.config::jsonb,
       seed.position, true, true
from (values
  ('what-is-computational-thinking', 1, 'PSEUDOCODE', 'Urutkan langkah solusi',
   'Susun langkah untuk menyelesaikan masalah besar secara terarah.', null,
   '{"public":{"mode":"order","blocks":[{"id":"solve","text":"Selesaikan tiap bagian"},{"id":"split","text":"Pecah masalah menjadi bagian kecil"},{"id":"combine","text":"Gabungkan hasilnya"}]},"answer":{"order":["split","solve","combine"]}}'),
  ('decomposition', 1, 'PSEUDOCODE', 'Pilih langkah decomposition',
   'Saat membuat aplikasi daftar belanja, langkah awal mana yang paling membantu?', null,
   '{"public":{"mode":"choice","options":[{"id":"a","text":"Tulis seluruh aplikasi sekaligus"},{"id":"b","text":"Pisahkan fitur menambah, melihat, dan menghapus item"},{"id":"c","text":"Pilih warna sebelum memahami kebutuhan"}]},"answer":{"choiceId":"b"}}'),
  ('what-is-an-algorithm', 1, 'PSEUDOCODE', 'Urutkan algoritma sederhana',
   'Susun langkah untuk menghitung total dua angka.', null,
   '{"public":{"mode":"order","blocks":[{"id":"show","text":"Tampilkan total"},{"id":"read","text":"Baca dua angka"},{"id":"add","text":"Jumlahkan keduanya"}]},"answer":{"order":["read","add","show"]}}'),
  ('introduction-to-flowchart', 1, 'FLOWCHART', 'Alur input dan output',
   'Susun node flowchart sederhana dari awal sampai selesai.', null,
   '{"public":{"mode":"order","blocks":[{"id":"output","text":"Output: tampilkan hasil"},{"id":"start","text":"Start"},{"id":"input","text":"Input: baca angka"},{"id":"end","text":"End"}]},"answer":{"order":["start","input","output","end"]}}'),
  ('introduction-to-programming', 1, 'PREDICT_OUTPUT', 'Prediksi keluaran Java',
   'Baca kode, lalu tulis tepat apa yang dicetak.',
   'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Halo");\n        System.out.println("Java");\n    }\n}',
   '{"answer":{"output":"Halo\nJava"}}'),
  ('first-java-program', 1, 'CODE_COMPLETION', 'Cetak salam',
   'Ubah bagian TODO agar program mencetak Halo, ThinkCode!',
   'public class Main {\n    public static void main(String[] args) {\n        System.out.println("TODO");\n    }\n}',
   '{"public":{"inputDescription":"Tidak ada input.","outputDescription":"Satu baris salam."}}'),
  ('first-java-program', 2, 'PREDICT_OUTPUT', 'Dua baris keluaran',
   'Prediksi dua baris yang dicetak program.',
   'public class Main {\n    public static void main(String[] args) {\n        System.out.println(2 + 3);\n        System.out.println("Selesai");\n    }\n}',
   '{"answer":{"output":"5\nSelesai"}}'),
  ('variables-and-types', 1, 'CODE_COMPLETION', 'Jumlah dua angka',
   'Baca dua bilangan bulat dari input, lalu cetak jumlahnya.',
   'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner input = new Scanner(System.in);\n        int a = input.nextInt();\n        int b = input.nextInt();\n        System.out.println(0); // ganti dengan jumlah a dan b\n    }\n}',
   '{"public":{"inputDescription":"Dua bilangan bulat dipisahkan spasi.","outputDescription":"Jumlah kedua bilangan."}}'),
  ('variables-and-types', 2, 'PREDICT_OUTPUT', 'Nilai variabel berubah',
   'Apa yang dicetak setelah nilai variabel diperbarui?',
   'public class Main {\n    public static void main(String[] args) {\n        int jumlah = 2;\n        jumlah = jumlah + 3;\n        System.out.println(jumlah);\n    }\n}',
   '{"answer":{"output":"5"}}'),
  ('basic-operators', 1, 'PREDICT_OUTPUT', 'Urutan operasi',
   'Perhatikan urutan operasi Java, lalu tulis hasilnya.',
   'public class Main {\n    public static void main(String[] args) {\n        System.out.println(2 + 3 * 4);\n    }\n}',
   '{"answer":{"output":"14"}}'),
  ('if-else-basics', 1, 'DEBUGGING', 'Perbaiki kondisi genap',
   'Program terbalik saat memilih Genap atau Ganjil. Perbaiki kondisinya.',
   'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner input = new Scanner(System.in);\n        int angka = input.nextInt();\n        if (angka % 2 == 1) {\n            System.out.println("Genap");\n        } else {\n            System.out.println("Ganjil");\n        }\n    }\n}',
   '{"public":{"inputDescription":"Satu bilangan bulat.","outputDescription":"Genap atau Ganjil."}}'),
  ('if-else-basics', 2, 'PROBLEM_SOLVING', 'Tentukan kelulusan',
   'Baca satu nilai. Cetak Lulus jika nilai minimal 75, atau Belum lulus jika kurang.',
   'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner input = new Scanner(System.in);\n        int nilai = input.nextInt();\n        // tulis solusi di sini\n    }\n}',
   '{"public":{"inputDescription":"Satu nilai bilangan bulat.","outputDescription":"Lulus atau Belum lulus."}}')
) as seed(lesson_slug, position, type, title, prompt, starter_code, config)
join public.lessons lesson on lesson.slug = seed.lesson_slug
on conflict (lesson_id, position) do nothing;

insert into public.test_cases (exercise_id, position, stdin, expected_output, is_hidden, weight)
select exercise.id, test.position, test.stdin, test.expected_output, test.is_hidden, test.weight
from (values
  ('first-java-program', 1, 1, '', 'Halo, ThinkCode!', false, 1),
  ('variables-and-types', 1, 1, '2 3', '5', false, 1),
  ('variables-and-types', 1, 2, '0 -4', '-4', true, 1),
  ('if-else-basics', 1, 1, '2', 'Genap', false, 1),
  ('if-else-basics', 1, 2, '3', 'Ganjil', false, 1),
  ('if-else-basics', 1, 3, '0', 'Genap', true, 1),
  ('if-else-basics', 2, 1, '75', 'Lulus', false, 1),
  ('if-else-basics', 2, 2, '74', 'Belum lulus', true, 1),
  ('if-else-basics', 2, 3, '100', 'Lulus', true, 1)
) as test(lesson_slug, exercise_position, position, stdin, expected_output, is_hidden, weight)
join public.lessons lesson on lesson.slug = test.lesson_slug
join public.exercises exercise on exercise.lesson_id = lesson.id and exercise.position = test.exercise_position
on conflict (exercise_id, position) do nothing;
