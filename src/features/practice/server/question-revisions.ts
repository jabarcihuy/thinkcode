import "server-only";
import type { Json } from "@/types/database";

/** Complete public practice instructions; answer override only corrects the early SELECT task. */
export const PRACTICE_REVISIONS: { slug: string; position: number; prompt: string; publicConfig: Json; answer?: Json; feedback?: Json }[] = [
  {
    "slug": "membaca-bentuk-data",
    "position": 1,
    "prompt": "Petugas akademik ingin melihat daftar mahasiswa beserta nama dan angkatannya, bukan daftar mata kuliah atau pendaftaran.\n\nPerhatikan tiga tabel Kampus Mini di bawah. **Tabel mana yang menyimpan satu record untuk setiap mahasiswa?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "courses",
          "text": "courses"
        },
        {
          "id": "students",
          "text": "students"
        },
        {
          "id": "enrollments",
          "text": "enrollments"
        }
      ],
      "subtopic": "Tabel",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments",
          "courses"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "membaca-bentuk-data",
    "position": 2,
    "prompt": "Pada tabel `students`, setiap baris memuat seorang mahasiswa. Header tabel menjelaskan atribut, sedangkan sel memuat nilai atribut tersebut.\n\n**Manakah nama kolom pada tabel students, bukan nama mahasiswa atau nilai angkatan?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "alya",
          "text": "Alya"
        },
        {
          "id": "cohort",
          "text": "cohort"
        },
        {
          "id": "year",
          "text": "2025"
        }
      ],
      "subtopic": "Kolom",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "membaca-bentuk-data",
    "position": 3,
    "prompt": "Bagian akademik menambahkan mahasiswa baru: `student_id = 5`, `name = Eka`, dan `cohort = 2026`. Mahasiswa tersebut disimpan pada tabel `students` yang sudah ada, dengan atribut yang sama seperti mahasiswa lainnya.\n\n**Apa yang berubah pada tabel setelah record itu ditambahkan?** Pilih satu jawaban. Ini merupakan situasi yang perlu kamu pikirkan; data di bawah masih menunjukkan keadaan awal.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "schema",
          "text": "Jumlah kolom bertambah menjadi empat."
        },
        {
          "id": "rows",
          "text": "Jumlah record bertambah; kolom tetap student_id, name, cohort."
        },
        {
          "id": "table",
          "text": "Setiap mahasiswa harus dibuatkan tabel sendiri."
        }
      ],
      "subtopic": "Record dan schema",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "membaca-bentuk-data",
    "position": 4,
    "prompt": "Perpustakaan menyimpan judul dan stok setiap buku pada tabel `books`. Perhatikan header dan record buku pertama.\n\n**Pernyataan mana yang tepat membedakan nama kolom dari nilai di dalam kolom tersebut?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "value",
          "text": "Dasar Basis Data adalah kolom; title adalah nilainya."
        },
        {
          "id": "column",
          "text": "title adalah kolom; Dasar Basis Data adalah salah satu nilainya."
        },
        {
          "id": "record",
          "text": "stock adalah satu record lengkap."
        }
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "library",
      "data": {
        "datasetId": "library",
        "tables": [
          "books"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "key-dan-hubungan-antar-tabel",
    "position": 1,
    "prompt": "Daftar mahasiswa dapat memuat dua orang dengan nama dan angkatan yang sama. Setiap mahasiswa tetap harus dapat dikenali sebagai record yang berbeda.\n\n**Kolom mana pada students digunakan sebagai primary key untuk membedakan record, meskipun nama mahasiswa berulang?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "name",
          "text": "name"
        },
        {
          "id": "id",
          "text": "student_id"
        },
        {
          "id": "cohort",
          "text": "cohort"
        }
      ],
      "subtopic": "Primary key",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "key-dan-hubungan-antar-tabel",
    "position": 2,
    "prompt": "Pendaftaran dengan `enrollment_id = 2` menyimpan `course_id = 20`. Kamu perlu menemukan mata kuliah yang diikuti pada tabel `courses`.\n\n**Kolom mana di courses menjadi tujuan rujukan foreign key course_id pada pendaftaran tersebut?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "enrollment",
          "text": "courses.enrollment_id"
        },
        {
          "id": "code",
          "text": "courses.course_code"
        },
        {
          "id": "course",
          "text": "courses.course_id"
        }
      ],
      "subtopic": "Foreign key",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments",
          "courses"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "key-dan-hubungan-antar-tabel",
    "position": 3,
    "prompt": "Kamu memeriksa pendaftaran dengan `enrollment_id = 2` untuk mengetahui siapa mahasiswanya dan apa mata kuliahnya.\n\n**Susun langkah penelusuran dalam urutan: baca pendaftaran → cari mahasiswa → cari mata kuliah.** Untuk soal ini, telusuri mahasiswa terlebih dahulu agar urutan pemeriksaan konsisten; kedua rujukan sebenarnya bisa diperiksa secara terpisah.",
    "publicConfig": {
      "mode": "order",
      "blocks": [
        {
          "id": "course",
          "text": "Ikuti course_id 20 ke courses: Basis Data."
        },
        {
          "id": "start",
          "text": "Baca enrollment #2: student_id 1 dan course_id 20."
        },
        {
          "id": "student",
          "text": "Ikuti student_id 1 ke students: Alya."
        }
      ],
      "subtopic": "Jalur relasi",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments",
          "courses"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "key-dan-hubungan-antar-tabel",
    "position": 4,
    "prompt": "Nadia memiliki pesanan dengan `order_id = 100` dan `300`. Pesanan 100 memuat Buku Catatan dan Pulpen pada dua record detail yang berbeda.\n\n**Mengapa struktur tabel ini memungkinkan satu pesanan memuat beberapa produk tanpa menambah kolom produk baru di orders?** Pilih satu penjelasan berdasarkan tabel `order_items`.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "direct",
          "text": "customers menyimpan semua produk pada kolom name."
        },
        {
          "id": "detail",
          "text": "order_items merujuk order_id dan product_id; setiap baris adalah satu detail produk dalam pesanan."
        },
        {
          "id": "position",
          "text": "Baris pertama setiap tabel selalu saling berhubungan."
        }
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "shop",
      "data": {
        "datasetId": "shop",
        "tables": [
          "customers",
          "orders",
          "order_items",
          "products"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "key-dan-hubungan-antar-tabel",
    "position": 5,
    "prompt": "Perpustakaan ingin mencatat anggota, buku, dan setiap peminjaman secara terpisah. Seorang anggota dapat melakukan beberapa peminjaman, dan sebuah buku dapat dipinjam pada waktu yang berbeda.\n\n### Tugas\nBuat tepat tiga tabel berikut pada editor model:\n- `members`: `member_id` bertipe integer sebagai PK, dan `name` bertipe text.\n- `books`: `book_id` bertipe integer sebagai PK, dan `title` bertipe text.\n- `loans`: `loan_id` bertipe integer sebagai PK, serta `member_id` dan `book_id` bertipe integer.\n\nHubungkan `loans.member_id` ke `members.member_id` dan `loans.book_id` ke `books.book_id` sebagai foreign key. Jangan tambahkan kolom atau tabel lain. Model ini mencatat satu buku pada setiap record peminjaman; belum mencakup tanggal atau jumlah stok.",
    "publicConfig": {
      "mode": "schema",
      "subtopic": "Model peminjaman"
    }
  },
  {
    "slug": "memilih-sumber-dan-kolom",
    "position": 1,
    "prompt": "Petugas akademik meminta daftar kode dan nama mata kuliah. Ia tidak membutuhkan nama mahasiswa atau nilai pendaftarannya.\n\n**Tabel mana yang tepat menjadi sumber pada klausa FROM?** Pilih satu jawaban berdasarkan kolom pada data di bawah.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "student",
          "text": "students"
        },
        {
          "id": "course",
          "text": "courses"
        },
        {
          "id": "enrollment",
          "text": "enrollments"
        }
      ],
      "subtopic": "FROM",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "courses",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "memilih-sumber-dan-kolom",
    "position": 2,
    "prompt": "Laporan hanya boleh memuat kode mata kuliah dan nama mata kuliah, dengan kode berada di kolom pertama.\n\n**Bagian SELECT mana yang mengambil tepat dua atribut tersebut dari courses?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "all",
          "text": "SELECT *"
        },
        {
          "id": "pair",
          "text": "SELECT course_code, course_name"
        },
        {
          "id": "student",
          "text": "SELECT name, cohort"
        }
      ],
      "subtopic": "SELECT",
      "data": {
        "datasetId": "campus",
        "tables": [
          "courses"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "memilih-sumber-dan-kolom",
    "position": 3,
    "prompt": "Kamu diminta menulis query sederhana yang menampilkan `course_code` lalu `course_name` dari tabel `courses`. Semua mata kuliah ikut ditampilkan; belum diperlukan filter, pengurutan, atau pembatasan hasil.\n\n**Susun dua bagian query: pilihan kolom terlebih dahulu, kemudian tabel sumber.**",
    "publicConfig": {
      "mode": "order",
      "blocks": [
        {
          "id": "source",
          "text": "FROM courses;"
        },
        {
          "id": "columns",
          "text": "SELECT course_code, course_name"
        }
      ],
      "subtopic": "Bentuk hasil",
      "data": {
        "datasetId": "campus",
        "tables": [
          "courses"
        ],
        "relations": false
      }
    },
    "answer": {
      "order": [
        "columns",
        "source"
      ]
    },
    "feedback": {
      "retry": "Tuliskan SELECT beserta kolom yang diminta, lalu FROM beserta tabel sumber. Pengurutan belum diperlukan.",
      "correct": "Urutan tepat. Hubungkan setiap langkah dengan data yang kamu amati."
    }
  },
  {
    "slug": "memilih-sumber-dan-kolom",
    "position": 4,
    "prompt": "Perpustakaan membutuhkan daftar judul dan stok buku. Query di bawah memilih dua kolom tersebut; `ORDER BY book_id` hanya menetapkan urutan tampilan dari ID kecil ke besar.\n\n**Prediksi seluruh baris hasil query.** Masukkan `title | stock` pada setiap baris, tanpa header, sesuai urutan hasil. Gunakan data awal tabel `books` di bawah.",
    "publicConfig": {
      "columns": [
        "title",
        "stock"
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "library",
      "data": {
        "datasetId": "library",
        "tables": [
          "books"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menyaring-record",
    "position": 1,
    "prompt": "Pendaftaran dengan `enrollment_id = 5` memiliki `score = 80`. Laporan menerima nilai minimal 80 dengan kondisi `score >= 80`.\n\n**Apakah record ini termasuk hasil filter?** Pilih jawaban yang menjelaskan perlakuan terhadap nilai tepat pada batas.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "greater",
          "text": "score > 80"
        },
        {
          "id": "inclusive",
          "text": "score >= 80"
        },
        {
          "id": "less",
          "text": "score < 80"
        }
      ],
      "subtopic": "Batas perbandingan",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menyaring-record",
    "position": 2,
    "prompt": "Laporan hanya menerima pendaftaran untuk `course_id = 10` yang sekaligus memiliki `score >= 80`. Kedua syarat harus benar pada record yang sama.\n\n**Operator mana yang menggabungkan kedua syarat sesuai permintaan?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "or",
          "text": "course_id = 10 OR score >= 80"
        },
        {
          "id": "and",
          "text": "course_id = 10 AND score >= 80"
        },
        {
          "id": "equal",
          "text": "course_id = 10 AND score = 80"
        }
      ],
      "subtopic": "AND dan OR",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menyaring-record",
    "position": 3,
    "prompt": "Petugas akademik ingin melihat pendaftaran dengan nilai minimal 80. Query di bawah menampilkan `enrollment_id` dan `score`, diurutkan menurut ID pendaftaran dari kecil ke besar.\n\n**Prediksi seluruh baris hasil query dari data awal enrollments.** Tulis `enrollment_id | score` per baris tanpa header. Nilai tepat 80 ikut dipertimbangkan.",
    "publicConfig": {
      "columns": [
        "enrollment_id",
        "score"
      ],
      "subtopic": "Record hasil",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menyaring-record",
    "position": 4,
    "prompt": "Perpustakaan mencari buku dengan stok sedikitnya tiga eksemplar. Query di bawah menampilkan judul dan stok, diurutkan menurut `book_id`.\n\n**Prediksi seluruh baris hasil query.** Tulis `title | stock` per baris tanpa header, berdasarkan data awal `books`.",
    "publicConfig": {
      "columns": [
        "title",
        "stock"
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "library",
      "data": {
        "datasetId": "library",
        "tables": [
          "books"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengurutkan-dan-membatasi",
    "position": 1,
    "prompt": "Petugas akademik ingin memeriksa dua pendaftaran dengan nilai terendah. Query mengurutkan `score` menaik, memakai `enrollment_id` menaik jika nilai sama, lalu mengambil dua baris.\n\n**Prediksi dua baris hasil query.** Tulis `enrollment_id | score` per baris tanpa header dan pertahankan urutannya.",
    "publicConfig": {
      "columns": [
        "enrollment_id",
        "score"
      ],
      "subtopic": "Arah urutan",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengurutkan-dan-membatasi",
    "position": 2,
    "prompt": "Semua mata kuliah pada data awal memiliki `credits = 3`. Laporan harus mengambil dua mata kuliah dengan kredit terbesar; jika kredit sama, nama mata kuliah diurutkan alfabetis menaik.\n\n**Klausa mana yang memenuhi aturan pemilihan dan menghasilkan urutan yang pasti?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "limit",
          "text": "LIMIT 2 saja"
        },
        {
          "id": "tie",
          "text": "ORDER BY credits DESC, course_name ASC LIMIT 2"
        },
        {
          "id": "one",
          "text": "ORDER BY credits DESC LIMIT 2"
        }
      ],
      "subtopic": "Tie-breaker",
      "data": {
        "datasetId": "campus",
        "tables": [
          "courses"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengurutkan-dan-membatasi",
    "position": 3,
    "prompt": "Laporan penghargaan akademik membutuhkan dua pendaftaran dengan nilai tertinggi. Query mengurutkan `score` menurun, lalu `enrollment_id` menaik jika nilai sama, dan mengambil dua baris.\n\n**Prediksi kedua baris hasil query.** Tulis `enrollment_id | score` per baris tanpa header berdasarkan data awal.",
    "publicConfig": {
      "columns": [
        "enrollment_id",
        "score"
      ],
      "subtopic": "LIMIT",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengurutkan-dan-membatasi",
    "position": 4,
    "prompt": "Koperasi ingin menampilkan dua produk termahal. Query mengurutkan harga menurun, memakai `product_id` menaik jika harga sama, lalu membatasi hasil menjadi dua baris.\n\n**Prediksi kedua baris hasil query.** Tulis `name | price` per baris tanpa header berdasarkan tabel `products`.",
    "publicConfig": {
      "columns": [
        "name",
        "price"
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "shop",
      "data": {
        "datasetId": "shop",
        "tables": [
          "products"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghubungkan-tabel",
    "position": 1,
    "prompt": "Kamu ingin menggabungkan setiap pendaftaran dengan mahasiswa yang benar. `enrollment_id` adalah identitas pendaftaran, sedangkan `student_id` pada enrollments merujuk seorang mahasiswa.\n\n**Pasangan kolom pada kondisi ON mana yang menghubungkan enrollments ke students dengan benar?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "ids",
          "text": "enrollments.enrollment_id = students.student_id"
        },
        {
          "id": "keys",
          "text": "enrollments.student_id = students.student_id"
        },
        {
          "id": "name",
          "text": "enrollments.course_id = students.name"
        }
      ],
      "subtopic": "Pasangan JOIN",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghubungkan-tabel",
    "position": 2,
    "prompt": "Alya memiliki lebih dari satu pendaftaran. Query di bawah menghubungkan mahasiswa dengan pendaftarannya, memilih mahasiswa dengan `student_id = 1`, dan mengurutkan hasil menurut `enrollment_id`.\n\n**Prediksi seluruh baris hasil query.** Tulis `name | score` per baris tanpa header. Satu mahasiswa dapat muncul pada lebih dari satu baris hasil.",
    "publicConfig": {
      "columns": [
        "name",
        "score"
      ],
      "subtopic": "Satu-ke-banyak",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghubungkan-tabel",
    "position": 3,
    "prompt": "Bagian akademik meminta nama mahasiswa, nama mata kuliah, dan nilai untuk mata kuliah berkode `IF102`. Query menghubungkan students, enrollments, dan courses, lalu mengurutkan hasil berdasarkan nama mahasiswa.\n\n**Prediksi seluruh baris hasil query.** Tulis `name | course_name | score` per baris tanpa header berdasarkan data awal.",
    "publicConfig": {
      "columns": [
        "name",
        "course_name",
        "score"
      ],
      "subtopic": "Jalur tiga tabel",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments",
          "courses"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghubungkan-tabel",
    "position": 4,
    "prompt": "Perpustakaan ingin melihat semua buku karya Rani, yaitu penulis dengan `author_id = 1`. Query memasangkan `books.author_id` dengan `authors.author_id` dan mengurutkan buku menurut `book_id`.\n\n**Prediksi seluruh baris hasil query.** Tulis `name | title` per baris tanpa header.",
    "publicConfig": {
      "columns": [
        "name",
        "title"
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "library",
      "data": {
        "datasetId": "library",
        "tables": [
          "authors",
          "books"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "merangkum-data",
    "position": 1,
    "prompt": "Bagian akademik membutuhkan jumlah seluruh pendaftaran pada tabel `enrollments`, termasuk beberapa pendaftaran milik mahasiswa yang sama. Query menggunakan `COUNT(*)`.\n\n**Prediksi nilai total yang dihasilkan.** Masukkan satu angka tanpa nama kolom. Hitung record pendaftaran, bukan mahasiswa unik.",
    "publicConfig": {
      "columns": [
        "total"
      ],
      "subtopic": "COUNT",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "merangkum-data",
    "position": 2,
    "prompt": "Kamu menyusun ringkasan dari `enrollments` menggunakan `GROUP BY course_id`. Record dengan nilai course_id yang sama menjadi satu kelompok.\n\n**Apa yang diwakili oleh satu baris hasil ringkasan?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "student",
          "text": "Satu mahasiswa tanpa memperhatikan pendaftarannya."
        },
        {
          "id": "course",
          "text": "Satu mata kuliah dan pendaftaran yang merujuk course_id itu."
        },
        {
          "id": "column",
          "text": "Satu kolom pada tabel enrollments."
        }
      ],
      "subtopic": "GROUP BY",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments",
          "courses"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "merangkum-data",
    "position": 3,
    "prompt": "Petugas akademik membandingkan jumlah peserta dan rata-rata nilai setiap mata kuliah yang memiliki pendaftaran. Query menghubungkan courses dengan enrollments, mengelompokkan per mata kuliah, membulatkan rata-rata hingga dua angka desimal, lalu mengurutkan rata-rata menurun.\n\n**Prediksi seluruh baris hasil query.** Tulis `course_name | enrollment_count | average_score` per baris tanpa header. Bentuk angka setara seperti `85` dan `85.0` diterima.",
    "publicConfig": {
      "columns": [
        "course_name",
        "enrollment_count",
        "average_score"
      ],
      "subtopic": "AVG",
      "data": {
        "datasetId": "campus",
        "tables": [
          "courses",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "merangkum-data",
    "position": 4,
    "prompt": "Koperasi menghitung jumlah pesanan setiap pelanggan yang sudah memiliki pesanan. Query memakai INNER JOIN customers dengan orders, kemudian mengurutkan hasil berdasarkan `customer_id`.\n\n**Prediksi seluruh baris hasil query.** Tulis `name | order_count` per baris tanpa header. Hitung record pesanan, bukan record detail produk.",
    "publicConfig": {
      "columns": [
        "name",
        "order_count"
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "shop",
      "data": {
        "datasetId": "shop",
        "tables": [
          "customers",
          "orders"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "tantangan-query-kampus",
    "position": 1,
    "prompt": "Permintaan laporan hanya mencakup nama mata kuliah, jumlah pendaftaran, dan rata-rata nilainya. Nama mahasiswa tidak diminta.\n\n**Pasangan tabel mana yang cukup menyediakan semua informasi tersebut?** Pilih satu jawaban berdasarkan tempat penyimpanan nama mata kuliah dan score.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "one",
          "text": "students saja"
        },
        {
          "id": "pair",
          "text": "courses dan enrollments"
        },
        {
          "id": "none",
          "text": "courses saja, karena memiliki credits"
        }
      ],
      "subtopic": "Terjemahkan permintaan",
      "data": {
        "datasetId": "campus",
        "tables": [
          "courses",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "tantangan-query-kampus",
    "position": 2,
    "prompt": "Bagian akademik membutuhkan ringkasan untuk pendaftaran dengan `score >= 85`, dikelompokkan menurut mata kuliah. Pendaftaran yang tidak memenuhi batas tidak boleh ikut dihitung dalam jumlah maupun rata-rata.\n\n**Susun alur pengolahan: hubungkan sumber → saring record → bentuk ringkasan → tampilkan hasil.** Ini urutan konsep pengolahan data, bukan urutan penulisan semua klausa SQL.",
    "publicConfig": {
      "mode": "order",
      "blocks": [
        {
          "id": "group",
          "text": "Kelompokkan yang lolos per course_id dan hitung COUNT/AVG."
        },
        {
          "id": "source",
          "text": "Cocokkan enrollment dengan mata kuliah lewat course_id."
        },
        {
          "id": "filter",
          "text": "Pilih enrollment dengan score >= 85."
        },
        {
          "id": "display",
          "text": "Tampilkan dan urutkan ringkasan."
        }
      ],
      "subtopic": "Filter dan grup",
      "data": {
        "datasetId": "campus",
        "tables": [
          "courses",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "tantangan-query-kampus",
    "position": 3,
    "prompt": "Laporan hanya menghitung pendaftaran dengan nilai minimal 85. Query mengelompokkan pendaftaran yang lolos menurut mata kuliah, menghitung jumlah dan rata-rata nilai, lalu mengurutkan rata-rata menurun dan nama menaik jika rata-rata sama.\n\n**Prediksi seluruh baris hasil query.** Tulis `course_name | enrollment_count | average_score` per baris tanpa header. Yang dinilai adalah tabel hasil; kamu tidak perlu menuliskan penjelasan tambahan.",
    "publicConfig": {
      "columns": [
        "course_name",
        "enrollment_count",
        "average_score"
      ],
      "subtopic": "Verifikasi laporan",
      "data": {
        "datasetId": "campus",
        "tables": [
          "courses",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "tantangan-query-kampus",
    "position": 4,
    "prompt": "Koperasi ingin mengetahui jumlah unit produk yang terjual pada pesanan berstatus `paid`. Query menghubungkan produk, detail pesanan, dan pesanan; menjumlahkan quantity tiap produk; lalu mengurutkan jumlah unit menurun dan product_id menaik jika jumlah sama.\n\n**Prediksi seluruh baris hasil query.** Tulis `name | total_quantity` per baris tanpa header. Produk yang tidak muncul pada detail pesanan lunas tidak ikut tampil.",
    "publicConfig": {
      "columns": [
        "name",
        "total_quantity"
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "shop",
      "data": {
        "datasetId": "shop",
        "tables": [
          "products",
          "order_items",
          "orders"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menambahkan-record-dengan-insert",
    "position": 1,
    "prompt": "Bagian akademik menambahkan mahasiswa baru dengan `student_id = 5`, `name = Eka`, dan `cohort = 2026`. Daftar kolom harus ditulis eksplisit agar setiap nilai masuk ke atribut yang tepat.\n\n**Susun bagian perintah INSERT menjadi satu query yang valid.** Gunakan data awal students sebagai acuan.",
    "publicConfig": {
      "mode": "order",
      "blocks": [
        {
          "id": "values",
          "text": "VALUES (5, 'Eka', '2026');"
        },
        {
          "id": "insert",
          "text": "INSERT INTO students"
        },
        {
          "id": "columns",
          "text": "(student_id, name, cohort)"
        }
      ],
      "subtopic": "Kolom dan nilai",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menambahkan-record-dengan-insert",
    "position": 2,
    "prompt": "Pada data awal, belum ada mahasiswa dengan `student_id = 5`. Petugas langsung mencoba menambahkan pendaftaran yang merujuk student_id tersebut, tanpa menambahkan mahasiswa terlebih dahulu. Foreign key aktif.\n\n**Apa yang terjadi pada penambahan pendaftaran ini?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "auto",
          "text": "SQLite otomatis membuat mahasiswa baru."
        },
        {
          "id": "reject",
          "text": "Foreign key menolak rujukan karena mahasiswa belum ada."
        },
        {
          "id": "name",
          "text": "Key tidak penting jika nama mahasiswa diketahui."
        }
      ],
      "subtopic": "Constraint",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menambahkan-record-dengan-insert",
    "position": 3,
    "prompt": "Kamu perlu menambahkan satu mahasiswa baru: ID 5, nama Eka, angkatan 2026. Semua mahasiswa lama harus tetap tersimpan dan urutan nilai harus cocok dengan daftar kolom.\n\n**Pilih perintah INSERT yang tepat.** Data awal students di bawah digunakan sebagai acuan; tidak ada perubahan nyata yang dilakukan saat memilih jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "duplicate",
          "text": "INSERT INTO students (student_id, name, cohort) VALUES (1, 'Eka', '2026');"
        },
        {
          "id": "valid",
          "text": "INSERT INTO students (student_id, name, cohort) VALUES (5, 'Eka', '2026');"
        },
        {
          "id": "swapped",
          "text": "INSERT INTO students (student_id, name, cohort) VALUES (5, '2026', 'Eka');"
        }
      ],
      "subtopic": "Verifikasi INSERT",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menambahkan-record-dengan-insert",
    "position": 4,
    "prompt": "Perpustakaan akan menambahkan buku baru dengan `book_id = 50`. Buku harus merujuk penulis yang sudah terdaftar; penambahan buku tidak otomatis membuat penulis baru.\n\n**Dari pilihan berikut, author_id mana yang valid berdasarkan tabel authors?** Pilih satu jawaban. Tidak perlu menambah record pada soal ini.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "valid",
          "text": "3, karena authors memuat penulis Sinta dengan author_id 3."
        },
        {
          "id": "title",
          "text": "50, karena sama dengan identitas buku baru."
        },
        {
          "id": "missing",
          "text": "99, karena database otomatis membuat penulis yang belum ada."
        }
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "library",
      "data": {
        "datasetId": "library",
        "tables": [
          "authors",
          "books"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengubah-record-dengan-update",
    "position": 1,
    "prompt": "Bima memiliki dua pendaftaran, dengan `enrollment_id = 3` dan `4`. Petugas hanya ingin memperbaiki nilai pendaftaran 3 dari 74 menjadi 78; pendaftaran 4 harus tetap sama.\n\n**Kondisi WHERE mana yang menargetkan tepat pendaftaran tersebut?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "student",
          "text": "student_id = 2"
        },
        {
          "id": "pk",
          "text": "enrollment_id = 3"
        },
        {
          "id": "score",
          "text": "score >= 74"
        }
      ],
      "subtopic": "Target UPDATE",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengubah-record-dengan-update",
    "position": 2,
    "prompt": "Petugas menjalankan `UPDATE enrollments SET score = 78 WHERE enrollment_id = 3;` pada data awal. Perintah berhasil mengubah satu record saja.\n\n**Pernyataan mana yang tepat menggambarkan keadaan setelah UPDATE?** Pilih satu jawaban dengan membandingkan nilai pendaftaran 3 dan 4 serta jumlah record.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "rows",
          "text": "Ada tujuh enrollment karena UPDATE menambah record."
        },
        {
          "id": "all",
          "text": "Semua nilai Bima menjadi 78."
        },
        {
          "id": "one",
          "text": "Ada enam enrollment; #3 menjadi 78 dan #4 tetap 82."
        }
      ],
      "subtopic": "SET dan dampak",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengubah-record-dengan-update",
    "position": 3,
    "prompt": "Nilai pendaftaran dengan `enrollment_id = 3` perlu diperbaiki dari 74 menjadi 78 tanpa mengubah pendaftaran lainnya.\n\n**Susun prosedur aman: periksa preview target → konfirmasi perubahan → verifikasi hasil tersimpan.** Gunakan primary key untuk memastikan hanya satu record berubah. Kamu menyusun langkah, bukan menulis atau menjalankan query pada soal ini.",
    "publicConfig": {
      "mode": "order",
      "blocks": [
        {
          "id": "verify",
          "text": "Verifikasi score dengan SELECT untuk enrollment_id 3."
        },
        {
          "id": "preview",
          "text": "Baca target dan bandingkan score 74 → 78 pada preview."
        },
        {
          "id": "apply",
          "text": "Terapkan UPDATE score = 78 WHERE enrollment_id = 3."
        }
      ],
      "subtopic": "Verifikasi UPDATE",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "mengubah-record-dengan-update",
    "position": 4,
    "prompt": "Koperasi ingin mengubah `quantity` pada detail dengan `item_id = 2` dari 3 menjadi 4. Produk yang sama juga muncul pada detail pesanan lain sehingga product_id saja tidak cukup sebagai target.\n\n**Langkah mana yang aman sebelum menerapkan UPDATE?** Pilih satu jawaban yang memastikan tepat satu detail berubah.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "all",
          "text": "UPDATE order_items SET quantity = 4 tanpa WHERE."
        },
        {
          "id": "product",
          "text": "Ubah semua detail dengan product_id = 20."
        },
        {
          "id": "preview",
          "text": "Periksa item_id 2, pratinjau UPDATE dengan WHERE item_id = 2, lalu konfirmasi satu record."
        }
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "shop",
      "data": {
        "datasetId": "shop",
        "tables": [
          "order_items",
          "products"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghapus-record-dengan-delete",
    "position": 1,
    "prompt": "Bagian akademik membatalkan hanya pendaftaran dengan `enrollment_id = 6`. Mahasiswa, mata kuliah, dan pendaftaran lainnya harus tetap ada.\n\n**Kondisi WHERE mana yang menargetkan tepat pendaftaran yang dibatalkan?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "course",
          "text": "course_id = 10"
        },
        {
          "id": "all",
          "text": "Tanpa WHERE agar lebih cepat."
        },
        {
          "id": "pk",
          "text": "enrollment_id = 6"
        }
      ],
      "subtopic": "Target DELETE",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghapus-record-dengan-delete",
    "position": 2,
    "prompt": "Pada data awal, Danu memiliki `student_id = 4` dan masih dirujuk oleh pendaftaran dengan `enrollment_id = 6`. Foreign key aktif tanpa penghapusan otomatis pada record anak.\n\nPetugas mencoba `DELETE FROM students WHERE student_id = 4;` sebelum menghapus pendaftaran tersebut. **Mengapa penghapusan mahasiswa ditolak?** Pilih satu jawaban.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "cascade",
          "text": "Semua anak selalu dihapus otomatis."
        },
        {
          "id": "fk",
          "text": "Enrollment #6 masih merujuk student_id 4 melalui FK."
        },
        {
          "id": "score",
          "text": "Nilai 95 terlalu besar untuk DELETE."
        }
      ],
      "subtopic": "Foreign key",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghapus-record-dengan-delete",
    "position": 3,
    "prompt": "Kamu membatalkan pendaftaran dengan `enrollment_id = 6` pada salinan data latihan. Data students tidak boleh berubah. Setelah mengamati hasil penghapusan, salinan latihan perlu dikembalikan ke data awal.\n\n**Susun prosedur: periksa preview → konfirmasi DELETE → verifikasi hasil → reset data.** Jangan reset sebelum hasil perubahan diamati.",
    "publicConfig": {
      "mode": "order",
      "blocks": [
        {
          "id": "reset",
          "text": "Reset data setelah mengamati hasil."
        },
        {
          "id": "apply",
          "text": "Konfirmasi DELETE enrollment_id 6."
        },
        {
          "id": "verify",
          "text": "Verifikasi #6 tidak ada; students tetap empat record."
        },
        {
          "id": "preview",
          "text": "Periksa preview target enrollment #6 dan jumlah satu record."
        }
      ],
      "subtopic": "Verifikasi DELETE",
      "data": {
        "datasetId": "campus",
        "tables": [
          "students",
          "enrollments"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "menghapus-record-dengan-delete",
    "position": 4,
    "prompt": "Perpustakaan mengeluarkan buku Logika Data, yaitu `book_id = 20`, dari katalog. Petugas memeriksa target lalu mengonfirmasi `DELETE FROM books WHERE book_id = 20;`.\n\n**Apa dampak perintah tersebut terhadap books dan authors?** Pilih satu jawaban. Buku lain dan penulisnya tidak menjadi target penghapusan.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "author",
          "text": "Rani dan semua bukunya ikut dihapus."
        },
        {
          "id": "one",
          "text": "Satu buku dihapus; authors dan buku Rani lainnya tetap ada."
        },
        {
          "id": "schema",
          "text": "Kolom title dihapus dari schema books."
        }
      ],
      "subtopic": "Transfer konsep",
      "datasetId": "library",
      "data": {
        "datasetId": "library",
        "tables": [
          "authors",
          "books"
        ],
        "relations": false
      }
    }
  }
];
