import type { PracticeDataset } from "./dataset-types";

export const SHOP_DATASET: PracticeDataset = {
  id: "shop", title: "Toko Mini", description: "Pesanan milik pelanggan; detail pesanan menghubungkan pesanan dan produk.",
  starterSql: "SELECT name, price\nFROM products\nORDER BY price DESC, product_id ASC;",
  tables: [
    { name: "customers", labelColumn: "name", columns: [{ name: "customer_id", type: "integer", key: "PK" }, { name: "name", type: "text" }, { name: "city", type: "text" }], rows: [
      { customer_id: 1, name: "Nadia", city: "Bandung" }, { customer_id: 2, name: "Raka", city: "Jakarta" }, { customer_id: 3, name: "Lina", city: "Bandung" },
    ] },
    { name: "orders", labelColumn: "status", columns: [{ name: "order_id", type: "integer", key: "PK" }, { name: "customer_id", type: "integer", key: "FK" }, { name: "status", type: "text" }], rows: [
      { order_id: 100, customer_id: 1, status: "paid" }, { order_id: 200, customer_id: 2, status: "pending" }, { order_id: 300, customer_id: 1, status: "paid" },
    ] },
    { name: "products", labelColumn: "name", columns: [{ name: "product_id", type: "integer", key: "PK" }, { name: "name", type: "text" }, { name: "price", type: "integer" }], rows: [
      { product_id: 10, name: "Buku Catatan", price: 15000 }, { product_id: 20, name: "Pulpen", price: 5000 }, { product_id: 30, name: "Tas", price: 80000 },
    ] },
    { name: "order_items", labelColumn: "quantity", columns: [{ name: "item_id", type: "integer", key: "PK" }, { name: "order_id", type: "integer", key: "FK" }, { name: "product_id", type: "integer", key: "FK" }, { name: "quantity", type: "integer" }], rows: [
      { item_id: 1, order_id: 100, product_id: 10, quantity: 2 }, { item_id: 2, order_id: 100, product_id: 20, quantity: 3 },
      { item_id: 3, order_id: 200, product_id: 30, quantity: 1 }, { item_id: 4, order_id: 300, product_id: 20, quantity: 2 },
    ] },
  ],
  relations: [
    { id: "customer-orders", parent: "customers", parentColumn: "customer_id", child: "orders", childColumn: "customer_id", explanation: "Satu pelanggan dapat memiliki banyak pesanan." },
    { id: "order-items", parent: "orders", parentColumn: "order_id", child: "order_items", childColumn: "order_id", explanation: "Satu pesanan dapat memiliki beberapa detail produk." },
    { id: "product-items", parent: "products", parentColumn: "product_id", child: "order_items", childColumn: "product_id", explanation: "Produk yang sama dapat muncul pada detail pesanan yang berbeda." },
  ],
};
