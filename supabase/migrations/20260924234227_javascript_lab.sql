-- Java attempts cannot satisfy JavaScript practice. Keep the earlier concept lessons.
delete from public.exercise_attempts attempt
using public.exercises exercise, public.lessons lesson, public.chapters chapter, public.learning_paths path
where attempt.exercise_id = exercise.id and exercise.lesson_id = lesson.id
  and lesson.chapter_id = chapter.id and chapter.learning_path_id = path.id
  and path.slug = 'programming-logic-fundamentals' and chapter.position >= 3;

delete from public.lesson_progress progress
using public.lessons lesson, public.chapters chapter, public.learning_paths path
where progress.lesson_id = lesson.id and lesson.chapter_id = chapter.id
  and chapter.learning_path_id = path.id and path.slug = 'programming-logic-fundamentals'
  and chapter.position >= 3;

update public.learning_paths set description =
  'Jalur logika pemrograman: susun alur, prediksi output, jalankan JavaScript di browser, dan telusuri eksekusi langkah demi langkah.'
where slug = 'programming-logic-fundamentals';

update public.chapters set description = 'Kenali program, source code, dan JavaScript untuk logika dasar.'
where position = 3 and learning_path_id = (select id from public.learning_paths where slug = 'programming-logic-fundamentals');

update public.lessons set
  content = $md$## Dari algoritma ke program

Program adalah instruksi yang dapat dijalankan komputer. JavaScript memakai `console.log` untuk menampilkan hasil. Sebelum menjalankan kode, prediksi outputnya.

```javascript
console.log("Halo");
console.log("JavaScript");
```

## Alur

Masalah: tampilkan dua salam berurutan.

Flowchart sederhana: **Mulai → tampilkan Halo → tampilkan JavaScript → Selesai**.

Pseudocode:

```text
TAMPILKAN "Halo"
TAMPILKAN "JavaScript"
```

Kode JavaScript menuliskan alur yang sama dengan aturan sintaks bahasa. Logika alur tetap menjadi dasar.$md$
where slug = 'introduction-to-programming';

update public.lessons set
  slug = 'first-javascript-program', title = 'First JavaScript Program',
  summary = 'Jalankan program JavaScript pertama dan telusuri outputnya.',
  content = $md$## Program pertama

Masalah: tampilkan sebuah salam. Flowchart: **Mulai → simpan pesan → tampilkan pesan → Selesai**.

Pseudocode:

```text
SIMPAN "Hello, ThinkCode!" sebagai message
TAMPILKAN message
```

JavaScript:

```javascript
let message = "Hello, ThinkCode!";
console.log(message);
```

Ubah pesan di JavaScript Lab. Tulis prediksi output sebelum Run, lalu buka visualisasi untuk melihat nilai `message` dan langkah output.$md$,
  example_source_code = $js$let message = "Hello, ThinkCode!";
console.log(message);$js$
where slug = 'first-java-program';

update public.lessons set
  summary = 'Simpan nilai dengan let dan const, lalu amati perubahannya.',
  content = $md$## Menyimpan nilai

`let` memberi nama pada nilai yang dapat berubah. `const` dipakai untuk nilai yang tidak ditugaskan ulang. JavaScript memiliki nilai number, string, dan boolean.

Masalah: hitung jumlah buku. Flowchart: **Mulai → tetapkan jumlah → tambah buku → tampilkan jumlah → Selesai**.

Pseudocode:

```text
jumlah ← 2
jumlah ← jumlah + 3
TAMPILKAN jumlah
```

```javascript
let jumlah = 2;
jumlah += 3;
console.log(jumlah);
```

Prediksi hasilnya, lalu lihat perubahan `jumlah` di visualizer. Untuk latihan dengan input, teks masukan tersedia sebagai variabel `input`.$md$,
  example_source_code = $js$let jumlah = 2;
jumlah += 3;
console.log(jumlah);$js$
where slug = 'variables-and-types';

update public.lessons set
  content = $md$## Operasi dasar

JavaScript memakai `+`, `-`, `*`, dan `/` untuk aritmetika. Perkalian dikerjakan sebelum penjumlahan.

```javascript
const hasil = 2 + 3 * 4;
console.log(hasil); // 14
```

Prediksi output, lalu jalankan dan telusuri nilai `hasil`.$md$,
  example_source_code = $js$const hasil = 2 + 3 * 4;
console.log(hasil);$js$
where slug = 'basic-operators';

update public.lessons set
  content = $md$## Membuat keputusan

`if` menjalankan satu cabang saat kondisi benar. `else` menangani cabang lainnya.

Flowchart: **Mulai → baca nilai → nilai ≥ 75? → ya: Lulus / tidak: Belum lulus → Selesai**.

Pseudocode:

```text
JIKA nilai ≥ 75 MAKA TAMPILKAN "Lulus"
LAINNYA TAMPILKAN "Belum lulus"
```

```javascript
const nilai = 80;
if (nilai >= 75) {
  console.log("Lulus");
} else {
  console.log("Belum lulus");
}
```

Amati nilai kondisi dan cabang yang diambil di visualizer. Pada Bug Lab, jalankan kode yang salah, periksa perilakunya, lalu perbaiki.$md$,
  example_source_code = $js$const nilai = 80;
if (nilai >= 75) {
  console.log("Lulus");
} else {
  console.log("Belum lulus");
}$js$
where slug = 'if-else-basics';

update public.exercises exercise set
  title = 'Prediksi keluaran JavaScript',
  starter_code = $js$console.log("Halo");
console.log("JavaScript");$js$,
  config = '{"answer":{"output":"Halo\nJavaScript"}}'::jsonb
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'introduction-to-programming' and exercise.position = 1;

update public.exercises exercise set
  starter_code = $js$let message = "TODO";
console.log(message);$js$
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'first-javascript-program' and exercise.position = 1;

update public.exercises exercise set
  starter_code = $js$console.log(2 + 3);
console.log("Selesai");$js$
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'first-javascript-program' and exercise.position = 2;

update public.exercises exercise set
  prompt = 'Baca dua bilangan dari variabel input (dipisahkan spasi), lalu cetak jumlahnya.',
  starter_code = $js$const [a, b] = input.trim().split(/\s+/).map(Number);
console.log(0); // ganti dengan jumlah a dan b$js$,
  config = '{"public":{"inputDescription":"Dua bilangan dipisahkan spasi pada variabel input.","outputDescription":"Jumlah kedua bilangan."}}'::jsonb
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'variables-and-types' and exercise.position = 1;

update public.exercises exercise set
  starter_code = $js$let jumlah = 2;
jumlah = jumlah + 3;
console.log(jumlah);$js$
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'variables-and-types' and exercise.position = 2;

update public.exercises exercise set
  prompt = 'Perhatikan urutan operasi JavaScript, lalu tulis hasilnya.',
  starter_code = $js$console.log(2 + 3 * 4);$js$
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'basic-operators' and exercise.position = 1;

update public.exercises exercise set
  starter_code = $js$const angka = Number(input);
if (angka % 2 === 1) {
  console.log("Genap");
} else {
  console.log("Ganjil");
}$js$,
  config = '{"public":{"inputDescription":"Satu bilangan pada variabel input.","outputDescription":"Genap atau Ganjil."}}'::jsonb
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'if-else-basics' and exercise.position = 1;

update public.exercises exercise set
  prompt = 'Baca satu nilai dari variabel input. Cetak Lulus jika minimal 75, atau Belum lulus jika kurang.',
  starter_code = $js$const nilai = Number(input);
// tulis solusi di sini$js$,
  config = '{"public":{"inputDescription":"Satu nilai pada variabel input.","outputDescription":"Lulus atau Belum lulus."}}'::jsonb
from public.lessons lesson where exercise.lesson_id = lesson.id and lesson.slug = 'if-else-basics' and exercise.position = 2;

-- Browser-only coding checks are deliberately public. True hidden inputs cannot be sent to a client sandbox.
update public.test_cases test set is_hidden = false
from public.exercises exercise, public.lessons lesson, public.chapters chapter, public.learning_paths path
where test.exercise_id = exercise.id and exercise.lesson_id = lesson.id
  and lesson.chapter_id = chapter.id and chapter.learning_path_id = path.id
  and path.slug = 'programming-logic-fundamentals';

-- The old Run API is removed. Keep the database quota only for authenticated Check requests.
delete from public.code_request_limits where kind = 'run';
alter table public.code_request_limits drop constraint code_request_limits_kind_check;
alter table public.code_request_limits add constraint code_request_limits_kind_check check (kind = 'check');
create or replace function public.consume_code_request_quota(p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_window timestamptz := date_trunc('minute', now());
  v_accepted boolean := false;
begin
  if v_user_id is null or p_kind <> 'check' then return false; end if;
  insert into public.code_request_limits as quota (user_id, kind, window_started_at, request_count)
  values (v_user_id, 'check', v_window, 1)
  on conflict (user_id, kind) do update
  set window_started_at = v_window,
      request_count = case when quota.window_started_at = v_window then quota.request_count + 1 else 1 end
  where quota.window_started_at <> v_window or quota.request_count < 8
  returning true into v_accepted;
  return coalesce(v_accepted, false);
end;
$$;
