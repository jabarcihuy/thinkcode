import "server-only";
import type { PrivateAssessmentItem } from "../types";

/** Private seed blueprint; never import from client code. */
export const SQL_POST_TEST_ITEMS: PrivateAssessmentItem[] = [
  {
    "type": "PROBLEM_SOLVING",
    "title": "Memilih dua produk",
    "topic": "Read",
    "prompt": "Tulis satu SELECT untuk menampilkan name lalu price dari products dengan price >= 5000. Urutkan price menurun, product_id menaik jika harga sama, lalu ambil dua record. Query harus mengikuti isi tabel, bukan mengisi hasil secara manual.",
    "starterCode": "",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "shop",
      "operation": "SELECT"
    },
    "answerConfig": {
      "referenceQuery": "SELECT name, price FROM products WHERE price >= 5000 ORDER BY price DESC, product_id ASC LIMIT 2;",
      "ordered": true,
      "fixtures": [
        {
          "rows": {},
          "isHidden": false
        },
        {
          "rows": {
            "products": [
              {
                "product_id": 10,
                "name": "Buku Baru",
                "price": 5000
              },
              {
                "product_id": 20,
                "name": "Pena Baru",
                "price": 5000
              },
              {
                "product_id": 30,
                "name": "Map Baru",
                "price": 4000
              }
            ]
          },
          "isHidden": true
        }
      ]
    },
    "entryFunction": null,
    "weight": 5,
    "tests": [],
    "position": 11,
    "id": "sql-seed-11"
  },
  {
    "type": "PROBLEM_SOLVING",
    "title": "Menghubungkan buku dan penulis",
    "topic": "Read",
    "prompt": "Tampilkan title dari books lalu name dari authors untuk seluruh buku. Gunakan pasangan author_id untuk menghubungkan kedua tabel dan urutkan menurut book_id menaik.",
    "starterCode": "",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "library",
      "operation": "SELECT"
    },
    "answerConfig": {
      "referenceQuery": "SELECT b.title, a.name FROM books b INNER JOIN authors a ON b.author_id = a.author_id ORDER BY b.book_id;",
      "ordered": true,
      "fixtures": [
        {
          "rows": {},
          "isHidden": false
        },
        {
          "rows": {
            "books": [
              {
                "book_id": 10,
                "title": "Data Terapan",
                "author_id": 2,
                "stock": 5
              },
              {
                "book_id": 20,
                "title": "Relasi Baru",
                "author_id": 3,
                "stock": 0
              },
              {
                "book_id": 30,
                "title": "Buku SQL",
                "author_id": 1,
                "stock": 3
              },
              {
                "book_id": 40,
                "title": "Praktik Data",
                "author_id": 2,
                "stock": 2
              }
            ]
          },
          "isHidden": true
        }
      ]
    },
    "entryFunction": null,
    "weight": 5,
    "tests": [],
    "position": 12,
    "id": "sql-seed-12"
  },
  {
    "type": "PROBLEM_SOLVING",
    "title": "Merangkum setiap mata kuliah",
    "topic": "Read",
    "prompt": "Dari enrollments, tampilkan course_id, jumlah pendaftaran, lalu rata-rata score untuk tiap course_id yang memiliki pendaftaran. Gunakan COUNT, AVG dan GROUP BY; urutkan course_id menaik. Alias kolom bebas.",
    "starterCode": "",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "campus",
      "operation": "SELECT"
    },
    "answerConfig": {
      "referenceQuery": "SELECT course_id, COUNT(*), AVG(score) FROM enrollments GROUP BY course_id ORDER BY course_id;",
      "ordered": true,
      "fixtures": [
        {
          "rows": {},
          "isHidden": false
        },
        {
          "rows": {
            "enrollments": [
              {
                "enrollment_id": 1,
                "student_id": 1,
                "course_id": 10,
                "score": 0
              },
              {
                "enrollment_id": 2,
                "student_id": 1,
                "course_id": 20,
                "score": 80
              },
              {
                "enrollment_id": 3,
                "student_id": 2,
                "course_id": 10,
                "score": 100
              },
              {
                "enrollment_id": 4,
                "student_id": 2,
                "course_id": 30,
                "score": 60
              },
              {
                "enrollment_id": 5,
                "student_id": 3,
                "course_id": 20,
                "score": 40
              },
              {
                "enrollment_id": 6,
                "student_id": 4,
                "course_id": 10,
                "score": 50
              }
            ]
          },
          "isHidden": true
        }
      ]
    },
    "entryFunction": null,
    "weight": 5,
    "tests": [],
    "position": 13,
    "id": "sql-seed-13"
  },
  {
    "type": "PROBLEM_SOLVING",
    "title": "Menambahkan pelanggan",
    "topic": "Write",
    "prompt": "Tambahkan satu record ke customers: customer_id 8, name Nisa, city Solo. Gunakan daftar kolom eksplisit dan VALUES. Seluruh record lama harus tetap sama.",
    "starterCode": "",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "shop",
      "operation": "INSERT",
      "table": "customers"
    },
    "answerConfig": {
      "referenceQuery": "INSERT INTO customers (customer_id, name, city) VALUES (8, 'Nisa', 'Solo');",
      "ordered": true,
      "fixtures": [
        {
          "rows": {},
          "isHidden": false
        },
        {
          "rows": {
            "customers": [
              {
                "customer_id": 1,
                "name": "Nadia",
                "city": "Surabaya"
              },
              {
                "customer_id": 2,
                "name": "Raka",
                "city": "Bandung"
              },
              {
                "customer_id": 3,
                "name": "Lina",
                "city": "Solo"
              },
              {
                "customer_id": 4,
                "name": "Reno",
                "city": "Jakarta"
              }
            ]
          },
          "isHidden": true
        }
      ]
    },
    "entryFunction": null,
    "weight": 5,
    "tests": [],
    "position": 14,
    "id": "sql-seed-14"
  },
  {
    "type": "PROBLEM_SOLVING",
    "title": "Mengubah satu pesanan",
    "topic": "Write",
    "prompt": "Ubah status hanya record orders dengan order_id 200 menjadi paid. Gunakan WHERE pada primary key; seluruh nilai dan record lainnya harus tetap sama.",
    "starterCode": "",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "shop",
      "operation": "UPDATE",
      "table": "orders"
    },
    "answerConfig": {
      "referenceQuery": "UPDATE orders SET status = 'paid' WHERE order_id = 200;",
      "ordered": true,
      "fixtures": [
        {
          "rows": {},
          "isHidden": false
        },
        {
          "rows": {
            "orders": [
              {
                "order_id": 100,
                "customer_id": 1,
                "status": "pending"
              },
              {
                "order_id": 200,
                "customer_id": 2,
                "status": "cancelled"
              },
              {
                "order_id": 300,
                "customer_id": 1,
                "status": "pending"
              }
            ]
          },
          "isHidden": true
        }
      ]
    },
    "entryFunction": null,
    "weight": 5,
    "tests": [],
    "position": 15,
    "id": "sql-seed-15"
  },
  {
    "type": "PROBLEM_SOLVING",
    "title": "Menghapus satu buku",
    "topic": "Write",
    "prompt": "Hapus hanya record books dengan book_id 20. Gunakan WHERE pada primary key. Seluruh buku dan data penulis lainnya harus tetap sama.",
    "starterCode": "",
    "publicConfig": {
      "mode": "sql",
      "datasetId": "library",
      "operation": "DELETE",
      "table": "books"
    },
    "answerConfig": {
      "referenceQuery": "DELETE FROM books WHERE book_id = 20;",
      "ordered": true,
      "fixtures": [
        {
          "rows": {},
          "isHidden": false
        },
        {
          "rows": {
            "books": [
              {
                "book_id": 10,
                "title": "Data Baru",
                "author_id": 2,
                "stock": 0
              },
              {
                "book_id": 20,
                "title": "Buku Pindah",
                "author_id": 1,
                "stock": 8
              },
              {
                "book_id": 30,
                "title": "Latihan Relasi",
                "author_id": 3,
                "stock": 0
              },
              {
                "book_id": 40,
                "title": "Query Baru",
                "author_id": 1,
                "stock": 0
              }
            ]
          },
          "isHidden": true
        }
      ]
    },
    "entryFunction": null,
    "weight": 5,
    "tests": [],
    "position": 16,
    "id": "sql-seed-16"
  }
];
