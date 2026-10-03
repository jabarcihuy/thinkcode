import type { SchemaDraft } from "../domain/schema-draft";

export interface ModelingScenario {
  id: "library" | "shop";
  title: string;
  prompt: string;
  questions: readonly string[];
  expectedTables: number;
  expectedRelations: number;
  reference: SchemaDraft;
  explanation: string;
}

export const MODELING_SCENARIOS: readonly ModelingScenario[] = [
  {
    id: "library", title: "Peminjaman buku",
    prompt: "Perpustakaan mencatat anggota, buku, dan peminjaman. Satu anggota bisa meminjam banyak buku. Setiap peminjaman mencatat satu anggota dan satu buku.",
    questions: ["Fakta apa yang disimpan oleh setiap tabel?", "Kolom mana yang mengenali satu record?", "Bagaimana peminjaman menunjuk anggota dan buku?"],
    expectedTables: 3, expectedRelations: 2,
    reference: {
      version: 1,
      tables: [
        { id: "members", name: "members", columns: [{ id: "member-id", name: "member_id", type: "integer", primary: true }, { id: "member-name", name: "name", type: "text", primary: false }] },
        { id: "books", name: "books", columns: [{ id: "book-id", name: "book_id", type: "integer", primary: true }, { id: "book-title", name: "title", type: "text", primary: false }] },
        { id: "loans", name: "loans", columns: [{ id: "loan-id", name: "loan_id", type: "integer", primary: true }, { id: "loan-member", name: "member_id", type: "integer", primary: false }, { id: "loan-book", name: "book_id", type: "integer", primary: false }] },
      ],
      relations: [
        { id: "members-loans", parentTable: "members", parentColumn: "member-id", childTable: "loans", childColumn: "loan-member" },
        { id: "books-loans", parentTable: "books", parentColumn: "book-id", childTable: "loans", childColumn: "loan-book" },
      ],
    },
    explanation: "Anggota dan buku menyimpan identitas masing-masing. Peminjaman menyimpan rujukan keduanya agar nama anggota atau judul buku tidak diulang sebagai identitas. Setiap anggota/buku bisa dirujuk banyak peminjaman; relasinya satu-ke-banyak.",
  },
  {
    id: "shop", title: "Pesanan toko",
    prompt: "Toko mencatat pelanggan, pesanan, produk, dan rincian pesanan. Satu pesanan milik satu pelanggan dan dapat memuat beberapa produk. Produk yang sama bisa muncul pada pesanan berbeda.",
    questions: ["Bagaimana pesanan menunjuk pelanggan?", "Di mana jumlah produk per pesanan disimpan?", "Mengapa produk dan pesanan memerlukan tabel penghubung?"],
    expectedTables: 4, expectedRelations: 3,
    reference: {
      version: 1,
      tables: [
        { id: "customers", name: "customers", columns: [{ id: "customer-id", name: "customer_id", type: "integer", primary: true }, { id: "customer-name", name: "name", type: "text", primary: false }] },
        { id: "orders", name: "orders", columns: [{ id: "order-id", name: "order_id", type: "integer", primary: true }, { id: "order-customer", name: "customer_id", type: "integer", primary: false }] },
        { id: "products", name: "products", columns: [{ id: "product-id", name: "product_id", type: "integer", primary: true }, { id: "product-name", name: "name", type: "text", primary: false }] },
        { id: "items", name: "order_items", columns: [{ id: "item-id", name: "item_id", type: "integer", primary: true }, { id: "item-order", name: "order_id", type: "integer", primary: false }, { id: "item-product", name: "product_id", type: "integer", primary: false }, { id: "item-quantity", name: "quantity", type: "integer", primary: false }] },
      ],
      relations: [
        { id: "customer-orders", parentTable: "customers", parentColumn: "customer-id", childTable: "orders", childColumn: "order-customer" },
        { id: "order-items", parentTable: "orders", parentColumn: "order-id", childTable: "items", childColumn: "item-order" },
        { id: "product-items", parentTable: "products", parentColumn: "product-id", childTable: "items", childColumn: "item-product" },
      ],
    },
    explanation: "Pesanan menunjuk satu pelanggan. Rincian pesanan menjadi tabel penghubung pesanan dan produk; quantity merupakan fakta pasangan itu, bukan fakta produk. Dua relasi satu-ke-banyak membentuk hubungan banyak-ke-banyak antara pesanan dan produk.",
  },
];
