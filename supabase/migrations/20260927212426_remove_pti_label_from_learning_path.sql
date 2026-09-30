-- Preserve the existing slug and foreign keys so saved progress and links remain valid.
update public.learning_paths
set title = 'Pemrograman Dasar',
    description = 'Pelajari logika pemrograman dari masalah nyata hingga algoritma, data, keputusan, perulangan, dan fungsi. Materi, video pendukung, simulasi, praktik, dan penilaian tersedia dalam satu jalur.',
    updated_at = now()
where slug = 'pemrograman-dasar-pti';

update public.assessments
set instructions = replace(instructions, 'pilot', 'pembelajaran')
where learning_path_id = (select id from public.learning_paths where slug = 'pemrograman-dasar-pti')
  and instructions like '%pilot%';
