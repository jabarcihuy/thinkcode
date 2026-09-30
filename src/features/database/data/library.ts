import type { PracticeDataset } from "./dataset-types";

export const LIBRARY_DATASET: PracticeDataset = {
  id: "library", title: "Katalog Buku", description: "Satu penulis dapat menulis beberapa buku.",
  starterSql: "SELECT title, stock\nFROM books\nWHERE stock > 0\nORDER BY book_id;",
  tables: [
    { name: "authors", labelColumn: "name", columns: [{ name: "author_id", type: "integer", key: "PK" }, { name: "name", type: "text" }, { name: "city", type: "text" }], rows: [
      { author_id: 1, name: "Rani", city: "Bandung" }, { author_id: 2, name: "Budi", city: "Surabaya" }, { author_id: 3, name: "Sinta", city: "Bandung" },
    ] },
    { name: "books", labelColumn: "title", columns: [{ name: "book_id", type: "integer", key: "PK" }, { name: "title", type: "text" }, { name: "author_id", type: "integer", key: "FK" }, { name: "stock", type: "integer" }], rows: [
      { book_id: 10, title: "Dasar Basis Data", author_id: 1, stock: 5 }, { book_id: 20, title: "Logika Data", author_id: 1, stock: 0 },
      { book_id: 30, title: "Algoritma Ringkas", author_id: 2, stock: 3 }, { book_id: 40, title: "Pengantar SQL", author_id: 3, stock: 2 },
    ] },
  ],
  relations: [{ id: "author-books", parent: "authors", parentColumn: "author_id", child: "books", childColumn: "author_id", explanation: "Satu penulis dapat memiliki banyak buku; setiap buku pada katalog ini merujuk satu penulis." }],
};
