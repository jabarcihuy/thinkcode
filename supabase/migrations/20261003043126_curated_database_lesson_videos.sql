-- Curated optional videos. Append only; preserve learner progress and admin content.

update public.lessons set content = content || '

## Video pendamping (opsional)

[Tabel, kolom, dan baris · Tri Fun Trik](https://www.youtube.com/watch?v=5xIl5EblCLk)

Video memakai contoh MySQL. Hubungkan konsep tabel, kolom, dan barisnya dengan Kampus Mini; kamu tidak perlu memasang software tambahan.

Setelah menonton, tunjuk satu kolom dan satu record pada tabel students. Apa bedanya?
'
where slug = 'membaca-bentuk-data'
  and chapter_id in (select c.id from public.chapters c join public.learning_paths p on p.id = c.learning_path_id where p.slug = 'database-fundamentals')
  and strpos(content, 'https://www.youtube.com/watch?v=5xIl5EblCLk') = 0;

update public.lessons set content = content || '

## Video pendamping (opsional)

[Memilih kolom dengan SELECT · Indonesia Belajar](https://www.youtube.com/watch?v=tfHe0qe9p44)

Contoh video memakai MySQL/MariaDB. Latihan Quethink memakai SQLite dan data berbeda; fokus pada SELECT dan FROM.

Setelah menonton, jelaskan mengapa SELECT name FROM students menghasilkan satu kolom, tetapi dapat memuat banyak baris.
'
where slug = 'memilih-sumber-dan-kolom'
  and chapter_id in (select c.id from public.chapters c join public.learning_paths p on p.id = c.learning_path_id where p.slug = 'database-fundamentals')
  and strpos(content, 'https://www.youtube.com/watch?v=tfHe0qe9p44') = 0;

update public.lessons set content = content || '

## Video pendamping (opsional)

[Memilih baris dengan WHERE · Indonesia Belajar](https://www.youtube.com/watch?v=y5WgcuQn0_E)

Fokus pada WHERE, perbandingan, AND, dan OR. Operator tambahan di video belum menjadi sasaran latihan ini; gunakan tabel SQLite Quethink.

Setelah menonton, bandingkan score > 80 dengan score >= 80. Record mana yang akan berbeda?
'
where slug = 'menyaring-record'
  and chapter_id in (select c.id from public.chapters c join public.learning_paths p on p.id = c.learning_path_id where p.slug = 'database-fundamentals')
  and strpos(content, 'https://www.youtube.com/watch?v=y5WgcuQn0_E') = 0;

update public.lessons set content = content || '

## Video pendamping (opsional)

[INNER JOIN dan pasangan key · Indonesia Belajar](https://www.youtube.com/watch?v=Chc1tUS_feU)

Contoh memakai MySQL/MariaDB. Fokus pada INNER JOIN ... ON; tulis pasangan PK/FK secara eksplisit pada data SQLite Quethink.

Setelah menonton, jelaskan mengapa nama mahasiswa bisa muncul lebih dari sekali dalam hasil JOIN dengan enrollments.
'
where slug = 'menghubungkan-tabel'
  and chapter_id in (select c.id from public.chapters c join public.learning_paths p on p.id = c.learning_path_id where p.slug = 'database-fundamentals')
  and strpos(content, 'https://www.youtube.com/watch?v=Chc1tUS_feU') = 0;
