import type { DatasetId } from "../data/dataset-types";

export type QueryScenario = { datasetId: DatasetId; title: string; sql: string; prompt: string };
const TASKS: Record<string, Omit<QueryScenario, "prompt">> = {
  "memilih-sumber-dan-kolom": { datasetId: "library", title: "Judul dan stok buku", sql: "SELECT title, stock FROM books ORDER BY book_id;" },
  "menyaring-record": { datasetId: "library", title: "Buku yang masih tersedia", sql: "SELECT title, stock FROM books WHERE stock >= 3 ORDER BY book_id;" },
  "mengurutkan-dan-membatasi": { datasetId: "shop", title: "Dua produk termahal", sql: "SELECT name, price FROM products ORDER BY price DESC, product_id ASC LIMIT 2;" },
  "menghubungkan-tabel": { datasetId: "library", title: "Buku karya Rani", sql: "SELECT a.name, b.title FROM authors AS a JOIN books AS b ON b.author_id = a.author_id WHERE a.author_id = 1 ORDER BY b.book_id;" },
  "merangkum-data": { datasetId: "shop", title: "Berapa pesanan tiap pelanggan?", sql: "SELECT c.name, COUNT(o.order_id) AS order_count FROM customers AS c JOIN orders AS o ON o.customer_id = c.customer_id GROUP BY c.customer_id, c.name ORDER BY c.customer_id;" },
  "tantangan-query-kampus": { datasetId: "shop", title: "Jumlah produk pada pesanan lunas", sql: "SELECT p.name, SUM(i.quantity) AS total_quantity FROM products AS p JOIN order_items AS i ON i.product_id = p.product_id JOIN orders AS o ON o.order_id = i.order_id WHERE o.status = 'paid' GROUP BY p.product_id, p.name ORDER BY total_quantity DESC, p.product_id;" },
  "menambahkan-record-dengan-insert": { datasetId: "library", title: "Tambahkan buku karya Sinta", sql: "INSERT INTO books (book_id, title, author_id, stock) VALUES (50, 'Relasi Sehari-hari', 3, 4);" },
  "mengubah-record-dengan-update": { datasetId: "shop", title: "Perbarui jumlah pada satu detail pesanan", sql: "UPDATE order_items SET quantity = 4 WHERE item_id = 2;" },
  "menghapus-record-dengan-delete": { datasetId: "library", title: "Hapus satu buku dari katalog", sql: "DELETE FROM books WHERE book_id = 20;" },
};

export function lessonScenarios(slug: string, original: { title: string; sql: string; prompt: string }): QueryScenario[] {
  const alternate = TASKS[slug];
  return [{ datasetId: "campus", ...original }, ...(alternate ? [{ ...alternate, prompt: "Terapkan konsep yang sama pada skema ini. Amati record, prediksi, lalu bandingkan hasilnya." }] : [])];
}
