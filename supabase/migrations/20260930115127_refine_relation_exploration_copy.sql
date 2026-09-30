-- Relasi activities inspect records and keys; their instructions need no Run/query vocabulary.
update public.lessons l
set content = replace(
  replace(l.content, 'Tidak ada query pada materi Relasi.', 'Fokuskan pengamatan pada record dan key.'),
  'Semua latihan dapat diulang; hasil Run bukan nilai asesmen.',
  'Semua latihan dapat diulang; latihan eksplorasi terpisah dari nilai asesmen.'
)
from public.chapters c, public.learning_paths p
where l.chapter_id = c.id and c.learning_path_id = p.id
  and p.slug = 'database-fundamentals'
  and l.slug in ('membaca-bentuk-data', 'key-dan-hubungan-antar-tabel');
