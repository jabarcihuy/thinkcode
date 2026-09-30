-- Follow the user's 2D-only visual direction; retain all lesson/practice history.
update public.lessons l
set content = replace(replace(replace(replace(replace(l.content,
  'Pilih record pada tampilan 2D. Coba mode 3D untuk mengikuti hubungan yang sama. Kembali ke tabel bila ingin membaca nilainya dengan lebih teliti.',
  'Pilih tabel pada skema 2D, klik key untuk mengikuti relasi, lalu pilih record untuk melihat data yang terhubung.'
),
  'Gunakan objek data untuk memeriksa record sumber, lalu jalankan contoh di lab. Ubah satu bagian, prediksi ulang, dan bandingkan hasilnya. 3D membantu mengikuti relasi; tabel hasil tetap 2D.',
  'Gunakan skema 2D untuk memilih tabel sumber dan memeriksa key. Pilih record pada data tabel, lalu jalankan contoh di lab. Ubah satu bagian, prediksi ulang, dan bandingkan hasilnya.'
),
  'Gunakan 2D dan 3D untuk menyelidiki relasi yang sama.',
  'Ikuti relasi pada skema 2D dan periksa record yang terhubung.'
),
  'pilih course 20 di 2D/3D',
  'pilih course 20 pada skema 2D'
),
  'objek 2D/3D memperlihatkan record baru.',
  'data tabel 2D menampilkan record baru.'
)
from public.chapters c, public.learning_paths p
where l.chapter_id=c.id and c.learning_path_id=p.id
  and p.slug='database-fundamentals' and l.is_published;

do $verify$
begin
  if exists (
    select 1 from public.lessons l join public.chapters c on c.id=l.chapter_id
    join public.learning_paths p on p.id=c.learning_path_id
    where p.slug='database-fundamentals' and l.is_published and l.content ilike '%3D%'
  ) then raise exception 'Published materials still refer to 3D'; end if;
end $verify$;
