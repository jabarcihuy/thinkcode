String apiErrorText(String code, String fallback, String locale) {
  if (locale != 'id') return fallback;
  return switch (code) {
    'unauthorized' => 'Sesi berakhir. Keluar, lalu masuk kembali.',
    'locked' => 'Tuntaskan bacaan dan Lab inti sebelumnya.',
    'reading_required' => 'Selesaikan bacaan sebelum membuka Lab inti.',
    'assessment_active' =>
      'Lab dijeda selama tantangan aktif. Selesaikan tantangan di website.',
    'rate_limited' =>
      'Terlalu banyak pemeriksaan. Tunggu sebentar lalu coba lagi.',
    'invalid_input' => 'Periksa jawabanmu dan coba lagi.',
    'not_saved' => 'Progres belum tersimpan. Segarkan dan coba lagi.',
    'not_found' => 'Materi atau latihan tidak ditemukan.',
    'forbidden' => 'Akun belum dapat mengakses halaman ini.',
    _ => 'Koneksi belum tersedia. Coba lagi sebentar.',
  };
}

String sqlErrorText(String message, String locale) {
  if (locale != 'id') return message;
  if (message.contains('too long')) {
    return 'Query terlalu lama berjalan. Eksekusi dihentikan.';
  }
  if (message.contains('referenced by another table')) {
    return 'Record ini dirujuk tabel lain. Periksa relasinya dahulu.';
  }
  if (message.contains('SELECT only')) {
    return 'Lab ini hanya mengizinkan SELECT.';
  }
  if (message.contains('one statement')) {
    return 'Jalankan satu perintah SQL setiap kali.';
  }
  if (message.contains('4096')) {
    return 'Tulis satu perintah SQL, maksimal 4096 karakter.';
  }
  if (message.contains('500 characters')) {
    return 'Batasi setiap teks hingga 500 karakter.';
  }
  if (message.contains('row limit')) {
    return 'Dataset mencapai batas record. Reset untuk mencoba lagi.';
  }
  if (message.contains('exactly one')) {
    return 'Ubah tepat satu record. Periksa nilai primary key.';
  }
  return 'Periksa sintaks SQL, nama tabel dan kolom, serta batas operasi Lab ini.';
}
