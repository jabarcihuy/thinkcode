-- Keep one stable exercise row per current lesson so attempt history remains attached.
with exercise_updates(slug, title, prompt, starter_code, public_config, answer_config) as (
  values
    (
      'membaca-bentuk-data',
      'Baca record dan kolom mahasiswa',
      'Tulis isi hasil dalam urutan student_id | name | cohort. Satu record per baris tanpa header.',
      'SELECT student_id, name, cohort FROM students ORDER BY student_id;',
      null::jsonb,
      '{"output":"1 | Alya | 2025\n2 | Bima | 2025\n3 | Citra | 2024\n4 | Danu | 2024"}'::jsonb
    ),
    (
      'key-dan-hubungan-antar-tabel',
      'Ikuti key dari enrollment',
      'Sebuah record enrollments menyimpan student_id dan course_id. Pasangan mana yang harus diikuti untuk menemukan mahasiswa dan mata kuliah terkait?',
      'SELECT enrollment_id, student_id, course_id FROM enrollments ORDER BY enrollment_id;',
      '{"mode":"choice","options":[{"id":"both_keys","text":"enrollments.student_id = students.student_id dan enrollments.course_id = courses.course_id"},{"id":"wrong_ids","text":"enrollments.enrollment_id = students.student_id dan enrollments.course_id = courses.course_name"},{"id":"names","text":"enrollments.student_id = students.name dan enrollments.course_id = courses.course_code"}]}'::jsonb,
      '{"choiceId":"both_keys"}'::jsonb
    ),
    (
      'memilih-sumber-dan-kolom',
      'Pilih kolom tanpa mengubah jumlah record',
      'Query mengambil course_code dan course_name dari courses. Tulis kedua nilai per baris; pisahkan kolom dengan tanda |.',
      'SELECT course_code, course_name FROM courses ORDER BY course_id;',
      null::jsonb,
      '{"output":"SI101 | Sistem Informasi\nIF102 | Basis Data\nIF103 | Matematika Diskrit"}'::jsonb
    ),
    (
      'menyaring-record',
      'Periksa batas minimal 80',
      'Nilai tepat 80 harus ikut karena syaratnya minimal 80. Prediksi enrollment_id dan score, satu record per baris; pisahkan kolom dengan tanda |.',
      'SELECT enrollment_id, score FROM enrollments WHERE score >= 80 ORDER BY enrollment_id;',
      null::jsonb,
      '{"output":"1 | 88\n2 | 90\n4 | 82\n5 | 80\n6 | 95"}'::jsonb
    ),
    (
      'mengurutkan-dan-membatasi',
      'Urutkan hasil seri, lalu batasi',
      'Semua mata kuliah memiliki jumlah kredit yang sama. Gunakan nama menaik sebagai tie-breaker, lalu prediksi dua baris pertama; pisahkan kolom dengan tanda |.',
      'SELECT course_name, credits FROM courses ORDER BY credits DESC, course_name ASC LIMIT 2;',
      null::jsonb,
      '{"output":"Basis Data | 3\nMatematika Diskrit | 3"}'::jsonb
    ),
    (
      'menghubungkan-tabel',
      'Telusuri pendaftar Basis Data',
      'Setiap baris hasil mewakili satu pendaftaran. Prediksi nama mahasiswa, mata kuliah, dan nilai; pisahkan kolom dengan tanda |.',
      'SELECT s.name, c.course_name, e.score FROM enrollments AS e JOIN students AS s ON s.student_id = e.student_id JOIN courses AS c ON c.course_id = e.course_id WHERE c.course_code = ''IF102'' ORDER BY s.name;',
      null::jsonb,
      '{"output":"Alya | Basis Data | 90\nCitra | Basis Data | 80"}'::jsonb
    ),
    (
      'merangkum-data',
      'Bedakan jumlah dan rata-rata',
      'Satu baris hasil mewakili satu mata kuliah. Prediksi nama, jumlah pendaftaran, dan rata-rata nilai dua desimal; pisahkan kolom dengan tanda |.',
      'SELECT c.course_name, COUNT(e.enrollment_id) AS enrollment_count, ROUND(AVG(e.score), 2) AS average_score FROM courses AS c JOIN enrollments AS e ON e.course_id = c.course_id GROUP BY c.course_id, c.course_name ORDER BY average_score DESC;',
      null::jsonb,
      '{"output":"Sistem Informasi | 3 | 85.67\nBasis Data | 2 | 85\nMatematika Diskrit | 1 | 82"}'::jsonb
    ),
    (
      'tantangan-query-kampus',
      'Uji ambang nilai yang berbeda',
      'Ubah ambang dari 80 menjadi 85. Prediksi nama mata kuliah, jumlah pendaftaran yang lolos, dan rata-rata nilainya; pisahkan kolom dengan tanda |.',
      'SELECT c.course_name, COUNT(e.enrollment_id) AS enrollment_count, ROUND(AVG(e.score), 2) AS average_score FROM courses AS c JOIN enrollments AS e ON e.course_id = c.course_id WHERE e.score >= 85 GROUP BY c.course_id, c.course_name ORDER BY average_score DESC, c.course_name;',
      null::jsonb,
      '{"output":"Sistem Informasi | 2 | 91.5\nBasis Data | 1 | 90"}'::jsonb
    ),
    (
      'menambahkan-record-dengan-insert',
      'Pilih INSERT yang valid',
      'Tambahkan Eka sebagai mahasiswa baru dengan student_id 5 dan angkatan 2026. Pilih perintah yang memasangkan nilai ke kolom dengan benar dan tidak memakai key yang sudah ada.',
      'INSERT INTO students (student_id, name, cohort) VALUES (5, ''Eka'', ''2026'');',
      '{"mode":"choice","options":[{"id":"valid","text":"INSERT INTO students (student_id, name, cohort) VALUES (5, ''Eka'', ''2026'');"},{"id":"duplicate","text":"INSERT INTO students (student_id, name, cohort) VALUES (1, ''Eka'', ''2026'');"},{"id":"wrong_order","text":"INSERT INTO students (student_id, name, cohort) VALUES (5, ''2026'', ''Eka'');"}]}'::jsonb,
      '{"choiceId":"valid"}'::jsonb
    ),
    (
      'mengubah-record-dengan-update',
      'Pilih UPDATE dengan target tepat',
      'Setelah memastikan targetnya enrollment_id 3, ubah nilainya menjadi 78. Pilih perintah yang hanya mengubah record tersebut.',
      'UPDATE enrollments SET score = 78 WHERE enrollment_id = 3;',
      '{"mode":"choice","options":[{"id":"primary_key","text":"UPDATE enrollments SET score = 78 WHERE enrollment_id = 3;"},{"id":"all_rows","text":"UPDATE enrollments SET score = 78;"},{"id":"student_id","text":"UPDATE enrollments SET score = 78 WHERE student_id = 2;"}]}'::jsonb,
      '{"choiceId":"primary_key"}'::jsonb
    ),
    (
      'menghapus-record-dengan-delete',
      'Jaga relasi saat DELETE',
      'Mahasiswa dengan student_id 4 masih dirujuk oleh sebuah record enrollments. Mengapa DELETE pada record mahasiswa itu ditolak?',
      'DELETE FROM students WHERE student_id = 4;',
      '{"mode":"choice","options":[{"id":"referenced","text":"Foreign key enrollments.student_id masih merujuk record itu; record anak harus tetap ada atau ditangani lebih dulu."},{"id":"cascade","text":"SQLite selalu menghapus semua record terkait secara otomatis."},{"id":"no_relation","text":"Foreign key tidak memengaruhi perintah DELETE."}]}'::jsonb,
      '{"choiceId":"referenced"}'::jsonb
    )
)
update public.exercises as e
set title = u.title,
    prompt = u.prompt,
    starter_code = u.starter_code,
    config = case
      when u.public_config is null then jsonb_set(e.config, '{answer}', u.answer_config, true)
      else jsonb_set(
        jsonb_set(e.config, '{public}', u.public_config, true),
        '{answer}',
        u.answer_config,
        true
      )
    end
from exercise_updates as u
join public.lessons as l on l.slug = u.slug
join public.chapters as c on c.id = l.chapter_id
join public.learning_paths as p on p.id = c.learning_path_id
where e.lesson_id = l.id
  and p.slug = 'database-fundamentals'
  and e.position = 1;

do $$
declare
  active_lessons integer;
  active_practices integer;
begin
  select count(*) into active_lessons
  from public.lessons l
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals' and l.is_published and l.is_required;

  select count(*) into active_practices
  from public.exercises e
  join public.lessons l on l.id = e.lesson_id
  join public.chapters c on c.id = l.chapter_id
  join public.learning_paths p on p.id = c.learning_path_id
  where p.slug = 'database-fundamentals'
    and l.is_published and l.is_required
    and e.is_published and e.is_required;

  if active_lessons <> 11 or active_practices <> 11 then
    raise exception 'Expected one published required practice for each of the 11 required materials; found % lessons and % practices', active_lessons, active_practices;
  end if;
end $$;
