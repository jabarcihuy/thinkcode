import { inspectSqlStatement } from "@/features/database/domain/sql-query";

const missions: Record<string, string> = {
  "memilih-sumber-dan-kolom": "Tampilkan kode dan nama mata kuliah. Hilangkan satu kolom lalu bandingkan: apakah jumlah record berubah?",
  "menyaring-record": "Cari pendaftaran dengan nilai minimal 80. Coba >= lalu >: record mana yang hilang ketika batasnya berubah?",
  "mengurutkan-dan-membatasi": "Cari dua nilai tertinggi. Bandingkan DESC dengan ASC, lalu ubah LIMIT dari 2 menjadi 3.",
  "menghubungkan-tabel": "Ikuti pendaftaran Alya ke mata kuliahnya. Mulai dengan dua tabel, lalu tambahkan courses untuk membaca nama mata kuliah.",
  "merangkum-data": "Hitung peserta dan rata-rata nilai per mata kuliah. Pilih satu course pada objek data dan cocokkan anggota grupnya.",
  "tantangan-query-kampus": "Cari mata kuliah dengan peserta bernilai minimal 85. Ubah ambangnya menjadi 80 dan jelaskan perubahan jumlah serta rata-ratanya.",
};

export function getLessonLabPrompt(sourceSql: string, lessonSlug?: string): string {
  if (lessonSlug && missions[lessonSlug]) return missions[lessonSlug];
  try {
    const statement = inspectSqlStatement(sourceSql);
    if (statement.kind === "select") {
      return "Gunakan pertanyaan pada materi sebagai tujuan. Ubah satu bagian query, prediksi jumlah baris, lalu jalankan dan periksa kolom serta record yang muncul.";
    }

    switch (statement.action) {
      case "INSERT":
        return "Jalankan satu INSERT, periksa pasangan kolom dan nilai pada preview, lalu terapkan. Verifikasi record baru dengan SELECT; reset data untuk mencoba lagi.";
      case "UPDATE":
        return "Pastikan WHERE memakai primary key yang dituju. Periksa record sebelum dan sesudah pada preview, lalu terapkan dan verifikasi dengan SELECT.";
      case "DELETE":
        return "Periksa record sasaran dan dampak foreign key pada preview sebelum menghapus. Setelah mengamati hasil, reset data agar latihan dapat diulang.";
    }
  } catch {
    return "Ubah query untuk menjawab pertanyaan pada materi. Prediksi hasilnya sebelum Run, lalu periksa tabel hasil.";
  }
  return "Ubah query untuk menjawab pertanyaan pada materi. Prediksi hasilnya sebelum Run, lalu periksa tabel hasil.";
}
