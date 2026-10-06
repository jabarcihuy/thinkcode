import "server-only";
import type { Json } from "@/types/database";

/** Public wording/visual references only. Private answer IDs and grading fixtures remain unchanged. */
export const ASSESSMENT_REVISIONS: {slug:string; position:number; title:string; prompt:string; publicConfig:Json}[] = [
  {
    "slug": "pre-test-basis-data",
    "position": 1,
    "title": "Membaca kolom katalog",
    "prompt": "Petugas perpustakaan menyimpan daftar buku pada tabel `books` di bawah. Setiap baris mewakili satu buku, sedangkan judul kolom menyatakan atributnya.\n\nManakah yang merupakan **nama kolom** pada tabel tersebut?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "title"
        },
        {
          "id": "b",
          "text": "Dasar Basis Data"
        },
        {
          "id": "c",
          "text": "5"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 2,
    "title": "Identitas mahasiswa",
    "prompt": "Bagian akademik menyimpan mahasiswa pada tabel `students`. Mahasiswa yang berbeda boleh memiliki nama dan angkatan yang sama. Setiap `student_id` diberikan kepada satu mahasiswa dan tidak boleh kosong.\n\nKolom mana yang tepat digunakan untuk membedakan setiap record mahasiswa?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "name"
        },
        {
          "id": "b",
          "text": "student_id"
        },
        {
          "id": "c",
          "text": "cohort"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 3,
    "title": "Rujukan buku ke penulis",
    "prompt": "Perpustakaan menyimpan buku dan penulis pada dua tabel terpisah. Nilai `books.author_id` harus merujuk `authors.author_id` yang sudah ada.\n\nApa tujuan rujukan tersebut ketika sebuah buku dicatat?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Menentukan urutan judul buku di katalog."
        },
        {
          "id": "b",
          "text": "Menghitung jumlah stok setiap buku."
        },
        {
          "id": "c",
          "text": "Menghubungkan buku dengan record penulisnya."
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 4,
    "title": "Daftar judul untuk pengunjung",
    "prompt": "Petugas ingin menyiapkan daftar yang hanya berisi judul buku dari tabel `books`. Kolom lain tidak diperlukan dan data asli tidak boleh berubah.\n\nQuery mana yang menghasilkan daftar tersebut?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "SELECT title FROM books;"
        },
        {
          "id": "b",
          "text": "SELECT stock FROM books;"
        },
        {
          "id": "c",
          "text": "SELECT * FROM books;"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 5,
    "title": "Memilih buku dengan stok cukup",
    "prompt": "Perpustakaan menyiapkan daftar buku untuk kegiatan membaca bersama. Hanya buku dengan stok **lebih dari 2** yang boleh dipilih.\n\nJika kondisi query adalah `WHERE stock > 2`, pasangan judul mana yang masuk hasil berdasarkan data di bawah?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Dasar Basis Data dan Pengantar SQL"
        },
        {
          "id": "b",
          "text": "Dasar Basis Data dan Algoritma Ringkas"
        },
        {
          "id": "c",
          "text": "Algoritma Ringkas dan Pengantar SQL"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 6,
    "title": "Laporan buku dan penulis",
    "prompt": "Petugas membutuhkan judul buku bersama nama penulisnya. Informasi judul berada di `books`, sedangkan nama penulis berada di `authors`. `books.author_id` menyimpan rujukan penulis.\n\nPasangan kolom mana yang harus dicocokkan saat menghubungkan kedua tabel?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "books.title = authors.name"
        },
        {
          "id": "b",
          "text": "books.book_id = authors.author_id"
        },
        {
          "id": "c",
          "text": "books.author_id = authors.author_id"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 7,
    "title": "Menghitung judul terdaftar",
    "prompt": "Petugas ingin mengetahui banyaknya record buku dalam katalog, bukan total eksemplar stok. Setiap baris tabel `books` mewakili satu judul terdaftar.\n\nBerapa hasil query berikut berdasarkan seluruh data tabel?\n\n```sql\nSELECT COUNT(*) FROM books;\n```",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "4"
        },
        {
          "id": "b",
          "text": "10"
        },
        {
          "id": "c",
          "text": "3"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 8,
    "title": "Mencatat buku baru",
    "prompt": "Perpustakaan menerima satu judul baru yang belum tercatat. Petugas ingin menambahkan satu record ke tabel `books` dan mempertahankan seluruh record sebelumnya.\n\nPerintah SQL apa yang digunakan untuk kebutuhan tersebut?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "UPDATE"
        },
        {
          "id": "b",
          "text": "INSERT INTO"
        },
        {
          "id": "c",
          "text": "SELECT"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 9,
    "title": "Memperbarui stok satu buku",
    "prompt": "Setelah menerima tambahan eksemplar, stok buku dengan `book_id = 30` harus menjadi **4**. Stok buku lain tidak boleh berubah.\n\nQuery mana yang memperbarui hanya record yang dimaksud?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "UPDATE books SET stock = 4;"
        },
        {
          "id": "b",
          "text": "UPDATE books SET stock = 4 WHERE author_id = 1;"
        },
        {
          "id": "c",
          "text": "UPDATE books SET stock = 4 WHERE book_id = 30;"
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
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
    "slug": "pre-test-basis-data",
    "position": 10,
    "title": "Menghapus record secara terarah",
    "prompt": "Buku dengan `book_id = 20` akan dikeluarkan dari katalog. Petugas perlu memastikan bahwa hanya buku tersebut yang dihapus dan data penulis tetap ada.\n\nApa langkah yang tepat **sebelum** menjalankan DELETE?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Periksa record dengan SELECT dan WHERE book_id = 20, lalu gunakan kondisi yang sama untuk DELETE."
        },
        {
          "id": "b",
          "text": "Periksa semua buku, lalu jalankan DELETE FROM books tanpa WHERE."
        },
        {
          "id": "c",
          "text": "Periksa penulis buku, lalu hapus record penulisnya."
        },
        {
          "id": "unknown",
          "text": "Belum tahu"
        }
      ],
      "data": {
        "datasetId": "library",
        "tables": [
          "books",
          "authors"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 1,
    "title": "Koperasi: membedakan atribut dan nilai",
    "prompt": "Koperasi kampus menyimpan produk pada tabel `products`. Pengelola ingin membuat laporan harga. Ia melihat nilai `Pulpen` pada salah satu record dan label `price` pada bagian atas tabel.\n\nManakah yang merupakan **atribut/kolom** untuk harga, bukan nilai dalam sebuah record?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Pulpen"
        },
        {
          "id": "b",
          "text": "price"
        },
        {
          "id": "c",
          "text": "5000"
        }
      ],
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
    "slug": "post-test-basis-data-sql-v2",
    "position": 2,
    "title": "Koperasi: identitas setiap pesanan",
    "prompt": "Nadia dapat membuat lebih dari satu pesanan. Beberapa pesanan juga dapat memiliki status yang sama. Koperasi menetapkan bahwa setiap `order_id` harus unik dan tidak kosong.\n\nAtribut mana yang tepat menjadi primary key agar tiap pesanan tetap dapat dibedakan?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "status"
        },
        {
          "id": "b",
          "text": "customer_id"
        },
        {
          "id": "c",
          "text": "order_id"
        }
      ],
      "data": {
        "datasetId": "shop",
        "tables": [
          "orders"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 3,
    "title": "Koperasi: pelanggan yang belum terdaftar",
    "prompt": "Setiap pesanan koperasi wajib merujuk pelanggan yang sudah tercatat. Petugas mencoba membuat pesanan baru dengan `customer_id = 999`, tetapi ID tersebut tidak ada pada tabel `customers`.\n\nJika foreign key `orders.customer_id` diterapkan, apa yang seharusnya terjadi?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Pesanan ditolak karena record pelanggan yang dirujuk belum ada."
        },
        {
          "id": "b",
          "text": "Pesanan diterima dan record pelanggan 999 dibuat secara otomatis."
        },
        {
          "id": "c",
          "text": "Pesanan diterima dengan mengaitkannya ke pelanggan pertama."
        }
      ],
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
    "slug": "post-test-basis-data-sql-v2",
    "position": 4,
    "title": "Koperasi: menyiapkan label harga",
    "prompt": "Pengelola ingin mencetak daftar nama produk dan harga dari tabel `products`. Laporan hanya memerlukan dua kolom tersebut; ID produk tidak ikut ditampilkan dan data asli tetap sama.\n\nQuery mana yang menghasilkan kolom **name lalu price**?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "SELECT product_id, price FROM products;"
        },
        {
          "id": "b",
          "text": "SELECT name, price FROM products;"
        },
        {
          "id": "c",
          "text": "SELECT price, name FROM products;"
        }
      ],
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
    "slug": "post-test-basis-data-sql-v2",
    "position": 5,
    "title": "Koperasi: batas harga promosi",
    "prompt": "Koperasi memasukkan produk dengan harga **minimal Rp5.000** ke daftar promosi. Harga tepat Rp5.000 tetap memenuhi syarat.\n\nBerdasarkan tabel `products`, produk mana yang lolos kondisi `price >= 5000`?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Buku Catatan dan Tas"
        },
        {
          "id": "b",
          "text": "Pulpen dan Tas"
        },
        {
          "id": "c",
          "text": "Buku Catatan, Pulpen, dan Tas"
        }
      ],
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
    "slug": "post-test-basis-data-sql-v2",
    "position": 6,
    "title": "Koperasi: mengaitkan pesanan dan pelanggan",
    "prompt": "Petugas ingin mencetak nomor pesanan dan nama pelanggan pemiliknya. Satu pelanggan boleh memiliki beberapa pesanan, sehingga nomor pesanan tidak sama dengan identitas pelanggan.\n\nPasangan ON mana yang menghubungkan `orders` dan `customers` sesuai rujukan pelanggan?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "orders.customer_id = customers.customer_id"
        },
        {
          "id": "b",
          "text": "orders.order_id = customers.customer_id"
        },
        {
          "id": "c",
          "text": "orders.customer_id = customers.name"
        }
      ],
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
    "slug": "post-test-basis-data-sql-v2",
    "position": 7,
    "title": "Koperasi: jumlah pesanan",
    "prompt": "Pengelola menanyakan banyaknya pesanan yang tercatat. Satu baris `orders` adalah satu pesanan; jumlah detail produk dan jumlah pelanggan bukan yang diminta.\n\nBerapa hasil query berikut pada data awal?\n\n```sql\nSELECT COUNT(*) FROM orders;\n```",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "2"
        },
        {
          "id": "b",
          "text": "3"
        },
        {
          "id": "c",
          "text": "4"
        }
      ],
      "data": {
        "datasetId": "shop",
        "tables": [
          "orders"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 8,
    "title": "Perpustakaan: mencatat judul baru",
    "prompt": "Perpustakaan menerima buku baru berjudul **Praktik Data** dari penulis dengan `author_id = 2`. Petugas menyediakan `book_id = 50` dan mencatat stok awal 1. Buku lama tidak boleh diubah.\n\nQuery mana yang menambahkan satu record dengan seluruh nilai tersebut?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "INSERT INTO books (book_id, title, author_id, stock) VALUES (50, 'Praktik Data', 2, 0);"
        },
        {
          "id": "b",
          "text": "UPDATE books SET title = 'Praktik Data', stock = 1 WHERE book_id = 30;"
        },
        {
          "id": "c",
          "text": "INSERT INTO books (book_id, title, author_id, stock) VALUES (50, 'Praktik Data', 2, 1);"
        }
      ],
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
    "slug": "post-test-basis-data-sql-v2",
    "position": 9,
    "title": "Koperasi: dampak koreksi detail pesanan",
    "prompt": "Petugas mengoreksi jumlah unit pada satu detail pesanan. Ia menjalankan query berikut pada data awal:\n\n```sql\nUPDATE order_items SET quantity = 4 WHERE item_id = 2;\n```\n\nRecord mana yang berubah jika query berhasil? Pilih dampak yang sesuai, bukan langkah untuk memperbarui seluruh pesanan.",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Hanya item_id 2 menjadi quantity 4; detail lainnya tetap."
        },
        {
          "id": "b",
          "text": "Semua detail milik order_id 100 menjadi quantity 4."
        },
        {
          "id": "c",
          "text": "Semua detail produk Pulpen menjadi quantity 4."
        }
      ],
      "data": {
        "datasetId": "shop",
        "tables": [
          "order_items"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 10,
    "title": "Akademik: membatalkan satu pendaftaran",
    "prompt": "Danu membatalkan pendaftaran dengan `enrollment_id = 6`. Data mahasiswa Danu dan mata kuliahnya tetap diperlukan; hanya record pendaftaran itu yang harus dihapus.\n\nProsedur mana yang memeriksa target lalu menghapus record yang tepat?",
    "publicConfig": {
      "mode": "choice",
      "options": [
        {
          "id": "a",
          "text": "Periksa enrollment_id 6, lalu hapus mahasiswa student_id 4."
        },
        {
          "id": "b",
          "text": "Periksa enrollment_id 6, lalu hapus hanya enrollments dengan enrollment_id 6."
        },
        {
          "id": "c",
          "text": "Periksa enrollment_id 6, lalu hapus seluruh enrollments untuk course_id 10."
        }
      ],
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
    "slug": "post-test-basis-data-sql-v2",
    "position": 11,
    "title": "Koperasi: dua produk untuk etalase",
    "prompt": "Koperasi kampus akan menampilkan dua produk pada etalase promosi. Pengelola meminta produk berharga minimal Rp5.000 dan memprioritaskan yang paling mahal.\n\n### Tugas\nTulis **satu query SELECT** menggunakan data `products`.\n\n### Kriteria hasil\n- Tampilkan kolom `name` lalu `price`.\n- Pilih produk dengan harga minimal 5000, termasuk harga tepat 5000.\n- Urutkan harga dari terbesar. Jika harga sama, dahulukan `product_id` yang lebih kecil.\n- Tampilkan paling banyak dua record. Data produk tidak boleh berubah.",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "shop",
      "operation": "SELECT",
      "data": {
        "datasetId": "shop",
        "tables": [
          "products"
        ],
        "relations": false
      },
      "table": "products"
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 12,
    "title": "Perpustakaan: katalog beserta penulis",
    "prompt": "Perpustakaan ingin membuat katalog untuk pengunjung. Judul buku tersimpan di `books`, sedangkan nama penulis berada di `authors`. Setiap buku pada katalog merujuk satu penulis melalui `author_id`; seorang penulis boleh memiliki beberapa buku.\n\n### Tugas\nTulis **satu query SELECT** untuk menghasilkan daftar buku bersama nama penulisnya.\n\n### Kriteria hasil\n- Tampilkan `books.title` lalu `authors.name`.\n- Sertakan setiap buku yang memiliki penulis terkait; jangan menggabungkan baris berdasarkan urutan posisi.\n- Urutkan hasil menurut `book_id` dari kecil ke besar.\n- Alias tabel dan kolom boleh dipilih sendiri. Data awal tidak boleh berubah.",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "library",
      "operation": "SELECT",
      "data": {
        "datasetId": "library",
        "tables": [
          "authors",
          "books"
        ],
        "relations": true
      },
      "table": "books"
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 13,
    "title": "Akademik: ringkasan pendaftaran",
    "prompt": "Bagian akademik meminta laporan per mata kuliah untuk menilai jumlah pendaftaran dan rata-rata nilai. Tabel `enrollments` menyimpan satu record untuk setiap pendaftaran, termasuk `course_id` dan `score`.\n\n### Tugas\nTulis **satu query SELECT** yang membuat ringkasan dari `enrollments`.\n\n### Kriteria hasil\n- Satu baris hasil untuk setiap `course_id` yang memiliki pendaftaran.\n- Kolom berurutan: `course_id`, jumlah pendaftaran, rata-rata `score`.\n- Hitung seluruh pendaftaran pada tiap mata kuliah; jangan menggabungkan semuanya menjadi satu ringkasan.\n- Urutkan `course_id` dari kecil ke besar. Rata-rata tidak perlu dibulatkan; alias kolom bebas.",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "campus",
      "operation": "SELECT",
      "data": {
        "datasetId": "campus",
        "tables": [
          "enrollments"
        ],
        "relations": false
      },
      "table": "enrollments"
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 14,
    "title": "Koperasi: mendaftarkan Nisa",
    "prompt": "Nisa dari Solo menjadi pelanggan baru koperasi. Petugas telah menyediakan identitas `customer_id = 8`, yang belum digunakan pada data awal.\n\n### Tugas\nTulis **satu query INSERT** untuk menambahkan Nisa ke `customers`.\n\n### Data yang dicatat\n- `customer_id`: 8\n- `name`: Nisa\n- `city`: Solo\n\n### Kriteria perubahan\nGunakan daftar kolom eksplisit dan satu kelompok VALUES. Tepat satu pelanggan baru ditambahkan; semua nilai dan record sebelumnya tetap sama.",
    "publicConfig": {
      "mode": "sql",
      "table": "customers",
      "datasetId": "shop",
      "operation": "INSERT",
      "data": {
        "datasetId": "shop",
        "tables": [
          "customers"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 15,
    "title": "Koperasi: memperbarui status pembayaran",
    "prompt": "Pembayaran untuk pesanan `order_id = 200` telah diverifikasi. Petugas perlu memastikan status pesanan tersebut menjadi `paid`. Perubahan hanya berlaku pada pesanan itu, apa pun status sebelumnya.\n\n### Tugas\nTulis **satu query UPDATE** pada `orders`.\n\n### Kriteria perubahan\n- Target adalah primary key `order_id = 200`.\n- Ubah hanya kolom `status` menjadi teks `paid`.\n- Tepat satu record berubah; identitas pelanggan, pesanan lain, dan tabel lain tetap sama.\n\nKamu boleh mencoba query pada data awal dan meninjau perubahan sebelum mengirim tes.",
    "publicConfig": {
      "mode": "sql",
      "table": "orders",
      "datasetId": "shop",
      "operation": "UPDATE",
      "data": {
        "datasetId": "shop",
        "tables": [
          "orders"
        ],
        "relations": false
      }
    }
  },
  {
    "slug": "post-test-basis-data-sql-v2",
    "position": 16,
    "title": "Perpustakaan: menarik Logika Data",
    "prompt": "Perpustakaan menarik buku **Logika Data**, `book_id = 20`, dari katalog. Penulisnya tetap terdaftar dan buku lain masih digunakan, sehingga keduanya harus dipertahankan.\n\n### Tugas\nTulis **satu query DELETE** pada `books`.\n\n### Kriteria perubahan\n- Hapus hanya record dengan primary key `book_id = 20`.\n- Tepat satu buku dihapus.\n- Seluruh buku lain dan data pada `authors` tetap sama.\n\nKamu boleh memeriksa target dan mencoba perubahan pada data awal sebelum mengirim tes.",
    "publicConfig": {
      "mode": "sql",
      "table": "books",
      "datasetId": "library",
      "operation": "DELETE",
      "data": {
        "datasetId": "library",
        "tables": [
          "books",
          "authors"
        ],
        "relations": true
      }
    }
  }
];
