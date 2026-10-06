import type { SqlAssessmentKey } from "../server/sql-assessment-key";
import { describe, expect, it } from "vitest";
import { SqliteAssessmentAdapter } from "./sqlite-assessment-adapter";
import type { SqlAssessmentConfig } from "../validation/sql-assessment";
const adapter = new SqliteAssessmentAdapter();
const config: SqlAssessmentConfig = { mode: "sql", datasetId: "shop", operation: "SELECT" };
const key: SqlAssessmentKey = { referenceQuery: "SELECT name, price FROM products WHERE price >= 5000 ORDER BY price DESC, product_id ASC LIMIT 2;", ordered: true, fixtures: [
  { rows: {}, isHidden: false },
  { rows: { products: [{ product_id: 10, name: "PRIVATE_ALPHA", price: 4000 }, { product_id: 20, name: "PRIVATE_BETA", price: 9000 }, { product_id: 30, name: "PRIVATE_GAMMA", price: 5000 }] }, isHidden: true },
] };
describe("trusted SQLite/WASM assessment", () => {
  it("executes real SQL and accepts equivalent queries / column aliases", async () => {
    expect(await adapter.grade("select p.name as produk, p.price as harga from products p where p.price > 4999 order by p.price desc, p.product_id limit 2", config, key)).toMatchObject({ passedTests: 2, hiddenPassed: 1 });
  });
  it("rejects hardcoded visible output on a hidden fixture", async () => {
    const result = await adapter.grade("SELECT 'Tas', 80000 UNION ALL SELECT 'Buku Catatan', 15000", config, key);
    expect(result).toMatchObject({ passedTests: 1, hiddenPassed: 0 });
    expect(JSON.stringify(result)).not.toMatch(/PRIVATE_|referenceQuery|rows|expected/);
  });
  it.each(["SELEC name FROM products", "SELECT missing FROM products", "SELECT * FROM sqlite_master", "SELECT * FROM profiles", "SELECT load_extension('/tmp/x')", "SELECT readfile('/etc/passwd')", "SELECT randomblob(1000000000)", "SELECT getenv('SECRET')", "SELECT * FROM products; DROP TABLE products;", "ATTACH DATABASE '/tmp/x' AS x", "PRAGMA database_list", "DELETE FROM products", "console.log(process.env)", "x".repeat(4097)])("denies unsupported or invalid query: %s", async (query) => {
    expect((await adapter.grade(query, config, key)).passedTests).toBe(0);
  });
  it("interrupts expensive SQL without blocking the main event loop", async () => {
    let responsive = false; const timer = setTimeout(() => { responsive = true; }, 10);
    const result = await adapter.grade("SELECT COUNT(*) FROM products a, products b, products c, products d, products e, products f, products g, products h, products i, products j, products k, products l, products m, products n", config, key);
    clearTimeout(timer); expect(responsive).toBe(true); expect(result.passedTests).toBe(0);
  });
  it("rejects large result sets and preserves duplicate rows", async () => {
    expect((await adapter.grade("SELECT a.name FROM products a, products b, products c, products d, products e", config, key)).passedTests).toBe(0);
  });
  it.each([
    ["INSERT", "customers", "INSERT INTO customers (customer_id,name,city) VALUES (8,'Nisa','Solo')", "INSERT INTO customers (city,name,customer_id) VALUES ('Solo','Nisa',8)"],
    ["UPDATE", "orders", "UPDATE orders SET status='paid' WHERE order_id=200", "UPDATE orders SET status = 'paid' WHERE order_id = 200;"],
    ["DELETE", "books", "DELETE FROM books WHERE book_id=20", "DELETE FROM books WHERE book_id = 20;"],
  ] as const)("compares full fresh post-state for %s", async (operation, table, referenceQuery, query) => {
    const mutationConfig: SqlAssessmentConfig = { mode:"sql", datasetId: table === "books" ? "library" : "shop", operation, table };
    const mutationKey: SqlAssessmentKey = { referenceQuery, ordered: true, fixtures:[{rows:{},isHidden:false},{rows:{},isHidden:true}] };
    expect((await adapter.grade(query,mutationConfig,mutationKey)).passedTests).toBe(2);
    expect((await adapter.grade(operation === "UPDATE" ? "UPDATE orders SET status='paid' WHERE order_id=300" : operation === "DELETE" ? "DELETE FROM books WHERE book_id=30" : "INSERT INTO customers (customer_id,name,city) VALUES (9,'Nisa','Solo')",mutationConfig,mutationKey)).passedTests).toBe(0);
  });
  it("does not grade a broken reference as a learner error", async () => {
    await expect(adapter.grade("SELECT name FROM products",config,{...key,referenceQuery:"SELECT absent FROM products"})).rejects.toThrow("unavailable");
  });
  it("enforces foreign keys and the configured operation", async () => {
    const c: SqlAssessmentConfig = {mode:"sql",datasetId:"shop",operation:"INSERT",table:"orders"};
    const k: SqlAssessmentKey = { referenceQuery:"INSERT INTO orders (order_id,customer_id,status) VALUES (400,1,'pending')",ordered:true,fixtures:[{rows:{},isHidden:false},{rows:{},isHidden:true}] };
    expect((await adapter.grade("INSERT INTO orders (order_id,customer_id,status) VALUES (400,999,'pending')",c,k)).passedTests).toBe(0);
    expect((await adapter.grade("UPDATE orders SET status='paid' WHERE order_id=200",c,k)).passedTests).toBe(0);
  });
});
