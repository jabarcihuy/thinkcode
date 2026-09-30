-- The Java workspace is now available beside this lesson.
update public.lessons
set content = replace(
  content,
  'Contoh berikut menampilkan satu kalimat. Ini adalah contoh bacaan; workspace untuk menjalankan kode akan hadir pada fase berikutnya.',
  'Contoh berikut menampilkan satu kalimat. Ubah kode di workspace Java, lalu pilih Run untuk melihat hasilnya. Run tidak mengubah progres belajar.'
)
where slug = 'first-java-program'
  and content like '%workspace untuk menjalankan kode akan hadir pada fase berikutnya%';
