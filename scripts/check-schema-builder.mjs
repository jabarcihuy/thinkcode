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
  await context.addCookies([...jar].map(([name, value]) => ({ name, value, url: site })));
  const page = await context.newPage();
  const errors = [], mutationRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (request.method() === "POST" && /\/api\/(exercises|assessment)/.test(request.url())) mutationRequests.push(request.url()); });
  await page.goto(`${site}/schema-builder`);
  await page.getByRole("heading", { name: "Pembuat Skema", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Susun tabel" }).waitFor();
  await mkdir(".impeccable/review", { recursive: true });
  const entry = await page.getByLabel("Tabel baru", { exact: true }).boundingBox();
  assert.ok(entry && entry.y + entry.height < 730, "Table creation must be reachable above the fixed mobile navigation.");
  await page.getByLabel("Tabel baru", { exact: true }).fill("Invalid Name");
  await page.getByRole("button", { name: "Tambah tabel", exact: true }).click();
  await page.locator("#new-table-error").waitFor();
  assert.equal(await page.locator("#new-table-error").evaluate((element) => document.activeElement === element), true);
  async function addTable(name) {
    await page.getByLabel("Tabel baru", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Tambah tabel", exact: true }).click();
    await page.getByRole("heading", { name: `Tabel ${name}`, exact: true }).waitFor();
  }
  async function addColumn(name, type = "integer", primary = false) {
    await page.getByLabel("Nama kolom", { exact: true }).fill(name);
    await page.getByLabel("Tipe data", { exact: true }).selectOption(type);
    await page.getByRole("checkbox", { name: "Primary key", exact: true }).setChecked(primary);
    await page.getByRole("button", { name: "Tambah kolom", exact: true }).click();
    await page.getByRole("button", { name: `Edit kolom ${name}`, exact: true }).waitFor();
  }
  await addTable("members");
  await page.getByLabel("Nama kolom", { exact: true }).fill("Bad Column");
  await page.getByRole("button", { name: "Tambah kolom", exact: true }).click();
  await page.locator("#column-error").waitFor();
  assert.equal(await page.locator("#column-error").evaluate((element) => document.activeElement === element), true);
  await page.screenshot({ path: ".impeccable/review/schema-mobile-column-error.png" });
  await addColumn("member_id", "integer", true); await addColumn("name", "text");
  await addTable("books"); await addColumn("book_id", "integer", true); await addColumn("title", "text");
  await page.getByLabel("Foreign key sumber").selectOption({ label: "members.name (text)" });
  assert.equal(await page.getByRole("button", { name: "Tambah relasi", exact: true }).isDisabled(), true);
  await page.getByText(/Pilih kolom sumber lain/).waitFor();
  await addTable("loans"); await addColumn("loan_id", "integer", true); await addColumn("member_id"); await addColumn("book_id");
  for (const [fk, pk] of [["loans.member_id (integer)", "members.member_id (integer)"], ["loans.book_id (integer)", "books.book_id (integer)"]]) {
    await page.getByLabel("Foreign key sumber").selectOption({ label: fk });
    await page.getByLabel("Primary key tujuan").selectOption({ label: pk });
    await page.getByRole("button", { name: "Tambah relasi", exact: true }).click();
  }
  assert.equal(await page.locator("main").getByRole("alert").count(), 0);
  await page.reload();
  await page.getByLabel("Tabel yang diedit").selectOption({ label: "loans" });
  assert.equal(await page.getByRole("button", { name: /^Hapus relasi/ }).count(), 2);
  await page.getByLabel("Kasus latihan").selectOption("shop");
  assert.equal(await page.getByLabel("Tabel yang diedit").count(), 0);
  await page.getByLabel("Kasus latihan").selectOption("library");
  await page.getByLabel("Tabel yang diedit").selectOption({ label: "loans" });
  assert.equal(await page.getByRole("button", { name: /^Hapus relasi/ }).count(), 2);
  await page.getByRole("button", { name: "Mulai ulang", exact: true }).click();
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: /^Hapus relasi/ }).count(), 2);

  await mkdir(".impeccable/review", { recursive: true });
  async function noOverflow(label) {
    const widths = await page.evaluate(() => ({ view: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    assert.ok(widths.content <= widths.view, `${label} overflow: ${JSON.stringify(widths)}`);
  }
  async function capture(name) { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true }); }
  await noOverflow("360 edit"); await capture("schema-mobile-edit");
  await page.getByRole("tab", { name: "Diagram", exact: true }).click();
  await page.getByText("Hubungan antartabel (2)", { exact: true }).click();
  await page.getByText("Satu record members dapat dirujuk banyak record loans.", { exact: true }).waitFor();
  await page.getByLabel("Fokus tabel").selectOption({ label: "loans" });
  await page.getByRole("button", { name: "Perbesar diagram" }).click();
  await page.getByRole("button", { name: "Atur ulang", exact: true }).click();
  await noOverflow("360 diagram"); await capture("schema-mobile-diagram");
  await page.getByRole("tab", { name: "Periksa", exact: true }).click();
  await page.getByText("Bandingkan dengan contoh model", { exact: true }).click();
  await noOverflow("360 feedback"); await capture("schema-mobile-feedback");
  await page.getByRole("tab", { name: "Periksa", exact: true }).press("Home");
  assert.equal(await page.getByRole("tab", { name: "Susun", exact: true }).getAttribute("aria-selected"), "true");
  for (const width of [768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 768) await page.getByRole("tab", { name: "Diagram", exact: true }).click();
    await noOverflow(`${width} schema`); await capture(width === 768 ? "schema-tablet" : "schema-desktop");
  }
  const html = await page.content();
  for (const [name, value] of Object.entries(process.env).filter(([name, value]) => /SECRET_KEY|SERVICE_ROLE|AI.*KEY/.test(name) && value?.length > 20)) {
    assert.ok(!html.includes(value), `Private ${name} appeared in client page.`);
  }
  assert.deepEqual(mutationRequests, [], "Visual modeling must not mutate practice or assessment.");
  const progress = await privileged.from("lesson_progress").select("lesson_id").eq("user_id", userId);
  assert.ifError(progress.error); assert.equal(progress.data.length, 0);
  const unavailableStorage = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await unavailableStorage.addCookies([...jar].map(([name, value]) => ({ name, value, url: site })));
  await unavailableStorage.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error("unavailable"); }; });
  const memoryPage = await unavailableStorage.newPage();
  await memoryPage.goto(`${site}/schema-builder`);
  await memoryPage.getByLabel("Tabel baru", { exact: true }).fill("members");
  await memoryPage.getByRole("button", { name: "Tambah tabel", exact: true }).click();
  await memoryPage.getByText(/Draft belum tersimpan/).waitFor();
  assert.equal(await memoryPage.getByText("Draft tersimpan di browser.", { exact: true }).count(), 0);
  await memoryPage.evaluate(() => window.scrollTo(0, 0));
  await memoryPage.screenshot({ path: ".impeccable/review/schema-mobile-unsaved.png" });
  await unavailableStorage.close();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${site}/learn/database-fundamentals/lessons/membaca-bentuk-data`);
  await page.getByRole("button", { name: "Putar video", exact: true }).waitFor();
  assert.equal(await page.locator('iframe[src*="youtube"]').count(), 0);
  await page.getByRole("button", { name: "Putar video", exact: true }).click();
  const frame = page.locator('iframe[src*="youtube-nocookie.com/embed/5xIl5EblCLk"]');
  await frame.waitFor();
  await frame.scrollIntoViewIfNeeded();
  // External playback is optional; wait for the thumbnail when YouTube is reachable.
  await frame.contentFrame().locator(".ytp-large-play-button").waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
  await noOverflow("360 lesson video");
  await page.screenshot({ path: ".impeccable/review/lesson-video-mobile.png" });
  await page.getByRole("button", { name: "Tutup video", exact: true }).click();
  assert.equal(await frame.count(), 0);

  const assessment = await privileged.from("assessments").select("id").eq("is_published", true).limit(1).single();
  assert.ifError(assessment.error);
  assert.ifError((await privileged.from("assessment_sessions").insert({ assessment_id: assessment.data.id, user_id: userId, status: "IN_PROGRESS" })).error);
  await page.goto(`${site}/schema-builder`);
  await page.getByRole("heading", { name: "Latihan skema dijeda" }).waitFor();
  assert.equal(await page.getByLabel("Tabel baru").count(), 0);
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("; ")}`);
  console.log("PASS: guest/auth guard, PK/FK editing, local reload/case isolation, diagram controls, keyboard tabs, reset cancel, 360/768/1280 layout, deferred video embed, secret scan, no progress mutations, assessment pause.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  if (userId) assert.ifError((await privileged.auth.admin.deleteUser(userId)).error);
}
