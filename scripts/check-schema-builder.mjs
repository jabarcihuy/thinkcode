import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { chromium } from "playwright-core";

const site = "http://127.0.0.1:3216";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
assert.ok(url && key && secret, "Supabase test credentials must be configured locally.");
const privileged = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const server = spawn("npm", ["run", "start", "--", "-p", "3216"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
let serverLog = "", userId, browser;
server.stdout.on("data", (chunk) => { serverLog = (serverLog + chunk.toString()).slice(-3000); });
server.stderr.on("data", (chunk) => { serverLog = (serverLog + chunk.toString()).slice(-3000); });
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(site)).ok) { ready = true; break; } } catch { /* server starting */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, `Production test server failed to start: ${serverLog}`);
  const guest = await fetch(`${site}/schema-builder`, { redirect: "manual" });
  assert.equal(guest.status, 307);
  assert.ok(guest.headers.get("location").includes("/login"));

  const email = `quethink-schema-test-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString("base64url");
  const created = await privileged.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(created.error);
  userId = created.data.user.id;
  const jar = new Map();
  const user = createServerClient(url, key, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)) } });
  assert.ifError((await user.auth.signInWithPassword({ email, password })).error);
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await context.addCookies([{ name: "quethink_locale", value: "id", url: site }]);
  await context.addCookies([...jar].map(([name, value]) => ({ name, value, url: site })));
  const page = await context.newPage();
  const errors = [], mutationRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (request.method() === "POST" && /\/api\/(exercises|assessment)/.test(request.url())) mutationRequests.push(request.url()); });
  const guestAi = await fetch(`${site}/api/sqlab/generate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: "Buat database buku" }) });
  assert.equal(guestAi.status, 401);
  await page.goto(`${site}/schema-builder`);
  await page.getByRole("heading", { name: "SQLab", exact: true }).waitFor();
  assert.ok(page.url().endsWith("/playground"));
  await page.getByRole("tab", { name: "Perancang AI", exact: true }).waitFor();
  await page.getByRole("tab", { name: "Skema", exact: true }).click();
  async function addTable(name) {
    await page.getByLabel("Nama tabel baru").fill(name);
    await page.getByRole("button", { name: "Tambah", exact: true }).click();
    await page.getByRole("heading", { name: `Tabel ${name}`, exact: true }).waitFor();
  }
  async function addColumn(name, type = "integer", primary = false) {
    await page.getByLabel("Nama kolom", { exact: true }).fill(name);
    await page.getByLabel("Tipe data", { exact: true }).selectOption(type);
    await page.getByRole("checkbox", { name: "Primary key", exact: true }).setChecked(primary);
    await page.getByRole("button", { name: "Tambah kolom", exact: true }).click();
    await page.getByRole("button", { name: `Edit kolom ${name}`, exact: true }).waitFor();
  }
  await addTable("books"); await addColumn("id", "integer", true); await addColumn("title", "text");
  await page.getByRole("tab", { name: "Data", exact: true }).click();
  await page.getByLabel("id (PK)", { exact: true }).fill("1");
  await page.getByLabel("title", { exact: true }).fill("Belajar Data");
  await page.getByRole("button", { name: "Simpan record", exact: true }).click();
  await page.getByRole("cell", { name: "Belajar Data", exact: true }).waitFor();
  await page.getByRole("tab", { name: "Query", exact: true }).click();
  async function query(sql, mutation = false) {
    await page.getByLabel("SQL", { exact: true }).fill(sql);
    await page.getByRole("button", { name: "Jalankan query", exact: true }).click();
    if (mutation) await page.getByRole("button", { name: "Ya, jalankan perubahan", exact: true }).click();
    try { await page.getByRole("heading", { name: "Hasil query", exact: true }).waitFor({ timeout: 20000 }); } catch (error) { console.log("Query failure:", sql, await page.getByRole("alert").allTextContents()); throw error; }
  }
  await query("SELECT * FROM books;");
  await page.getByRole("region", { name: "Hasil query", exact: true }).getByRole("cell", { name: "Belajar Data", exact: true }).waitFor();
  await query("INSERT INTO books VALUES (2, 'SQL Asik');", true);
  await query("UPDATE books SET title='Baru' WHERE id=2;", true);
  await query("SELECT title FROM books WHERE id=2;");
  await page.getByRole("region", { name: "Hasil query", exact: true }).getByRole("cell", { name: "Baru", exact: true }).waitFor();
  await query("DELETE FROM books WHERE id=2;", true);
  const bulk = Array.from({length:99}, (_, i) => `(${i + 2}, 'Buku')`).join(",");
  await query(`INSERT INTO books VALUES ${bulk};`, true);
  await page.getByLabel("SQL", { exact: true }).fill("SELECT count(*) FROM books a CROSS JOIN books b CROSS JOIN books c CROSS JOIN books d CROSS JOIN books e CROSS JOIN books f CROSS JOIN books g CROSS JOIN books h;");
  await page.getByRole("button", { name: "Jalankan query", exact: true }).click();
  await page.getByRole("alert").filter({hasText:"Query terlalu lama"}).waitFor({timeout:20000});
  await page.getByLabel("SQL", { exact: true }).fill("SELECT a.id FROM books a CROSS JOIN books b;");
  await page.getByRole("button", { name: "Jalankan query", exact: true }).click();
  await page.getByRole("alert").filter({hasText:"Hasil terlalu besar"}).waitFor({timeout:20000});
  await query("DELETE FROM books WHERE id > 1;", true);
  await page.getByLabel("SQL", { exact: true }).fill("SELECT * FROM sqlite_master;");
  await page.getByRole("button", { name: "Jalankan query", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "Query ditolak" }).waitFor();
  await page.reload();
  await page.getByRole("tab", { name: "Data", exact: true }).click();
  await page.getByRole("cell", { name: "Belajar Data", exact: true }).waitFor();
  await page.getByRole("tab", { name: "Skema", exact: true }).click();
  await page.getByText("Mulai dari contoh database", { exact: true }).click();
  await page.getByRole("button", { name: "Katalog Buku", exact: true }).click();
  await page.getByRole("button", { name: "Ya, gunakan contoh", exact: true }).click();
  await page.getByRole("tab", { name: "Query", exact: true }).click();
  await query("SELECT books.title, authors.name FROM books INNER JOIN authors ON books.author_id=authors.author_id;");
  await page.getByRole("region", {name:"Hasil query",exact:true}).getByRole("cell", {name:"Rani",exact:true}).first().waitFor();
  await page.getByLabel("SQL", {exact:true}).fill("INSERT INTO books VALUES (99, 'Orphan', 999, 1);");
  await page.getByRole("button", {name:"Jalankan query",exact:true}).click();
  await page.getByRole("button", {name:"Ya, jalankan perubahan",exact:true}).click();
  await page.getByRole("alert").filter({hasText:"Foreign key tidak cocok"}).waitFor();
  await mkdir(".impeccable/review", { recursive: true });
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const label of ["Skema", "Data", "Query", "Perancang AI"]) {
      await page.getByRole("tab", { name: label, exact: true }).click();
      const sizes = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      assert.ok(sizes[0] <= sizes[1], `${width} ${label} overflow`);
    }
    await page.getByRole("tab", { name: "Skema", exact: true }).click();
    await page.screenshot({ path: `.impeccable/review/sqlab-${width}.png`, fullPage: true });
  }
  // Deterministic UI smoke for draft review; provider contract covered separately.
  const draft = { version: 1, name: "Toko AI", schema: { version: 1, tables: [{ id: "products", name: "products", columns: [{ id: "pid", name: "id", type: "integer", primary: true }] }], relations: [] }, rows: { products: [{ id: 1 }] } };
  await page.route("**/api/sqlab/generate", route => route.fulfill({ json: { draft } }));
  await page.getByRole("tab", { name: "Perancang AI", exact: true }).click();
  await page.getByLabel("Database apa yang ingin dibuat?").fill("Buat database produk toko");
  await page.getByRole("button", { name: "Buat rancangan", exact: true }).click();
  await page.getByRole("heading", { name: "Draf: Toko AI", exact: true }).waitFor();
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `AI draft ${width} overflow`);
    await page.screenshot({ path: `.impeccable/review/sqlab-ai-draft-${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Terapkan rancangan", exact: true }).click();
  await page.getByRole("heading", { name: "Tabel products", exact: true }).waitFor();
  await page.unroute("**/api/sqlab/generate");
  if (process.env.SQLAB_LIVE_AI === "1") {
    const generated = await page.request.post(`${site}/api/sqlab/generate`, { data: { prompt: "Buat database perpustakaan sederhana: dua tabel books dan loans, PK dan FK, dua contoh record sintetis per tabel." }, timeout: 65000 });
    assert.equal(generated.status(), 200, "Live AI must generate a validated draft");
    const payload = await generated.json();
    assert.ok(payload.draft.schema.tables.length >= 2);
    console.log("PASS: live AI provider generated a validated synthetic database draft.");
  }
  const html = await page.content();
  for (const [name, value] of Object.entries(process.env).filter(([name, value]) => /SECRET_KEY|SERVICE_ROLE|AI.*KEY/.test(name) && value?.length > 20)) assert.ok(!html.includes(value), `Private ${name} appeared in client page.`);
  const scripts = await page.locator('script[src^="/_next/"]').evaluateAll(elements => elements.map(e => e.src));
  const privateValues = Object.entries(process.env).filter(([name,value]) => /SECRET_KEY|SERVICE_ROLE|AI.*KEY/.test(name) && value?.length > 20);
  for (const asset of scripts) {
    const text = await (await page.request.get(asset)).text();
    for (const [name, value] of privateValues) assert.ok(!text.includes(value), `Private ${name} appeared in client bundle.`);
  }
  const progress = await privileged.from("lesson_progress").select("lesson_id").eq("user_id", userId);
  assert.ifError(progress.error); assert.equal(progress.data.length, 0);
  const assessment = await privileged.from("assessments").select("id").eq("is_published", true).limit(1).single();
  assert.ifError(assessment.error);
  assert.ifError((await privileged.from("assessment_sessions").insert({ assessment_id: assessment.data.id, user_id: userId, status: "IN_PROGRESS" })).error);
  const blocked = await page.request.post(`${site}/api/sqlab/generate`, { data: { prompt: "Buat database buku" } });
  assert.equal(blocked.status(), 403);
  await page.goto(`${site}/playground`);
  await page.getByRole("heading", { name: "SQLab dijeda" }).waitFor();
  assert.equal(await page.getByRole("tab").count(), 0);
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("; ")}`);
  console.log("PASS: custom schema/data, SQLite read/write, timeout/output caps, forbidden system table, persistence, AI draft review/apply, guest/assessment guard, 360/768/1280 layouts, secrets, no progress mutations.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  if (userId) assert.ifError((await privileged.auth.admin.deleteUser(userId)).error);
}
