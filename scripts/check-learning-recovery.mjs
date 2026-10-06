import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";

const site = "http://127.0.0.1:3219";
const path = "/learn/database-fundamentals";
const reading = `${path}/lessons/membaca-bentuk-data`;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const server = spawn("npm", ["run", "start", "--", "-p", "3219"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
let log = "", browser;
const userIds = [];
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { log = (log + chunk).slice(-2000); });
async function checked(response) { assert.equal(response.status(), 200, `Request failed: ${response.status()}`); return response.json(); }
async function noOverflow(page, name) {
  const size = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollWidth]);
  assert.ok(size[1] <= size[0], `${name} has horizontal overflow at ${size[0]}px`);
}
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(site)).ok) { ready = true; break; } } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, log);
  const email = `quethink-recovery-${randomUUID()}@example.invalid`, password = randomBytes(24).toString("base64url");
  const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(created.error); const userId = created.data.user.id; userIds.push(userId);
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await context.newPage(), pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await mkdir(".impeccable/review/learning-recovery", { recursive: true });
  await page.goto(`${site}/login`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL("**/dashboard");
  assert.equal((await page.request.get(`${site}/api/admin/users`)).status(), 403);
  await page.goto(`${site}/pre-test`);
  await page.getByRole("button", { name: /Mulai pre-test/i }).click();
  await page.waitForURL("**/assessments/sessions/*");
  const sessionUrl = page.url(), sessionId = sessionUrl.split("/").at(-1);
  const session = await checked(await page.request.get(`${site}/api/assessment-sessions/${sessionId}`));
  for (const field of ["answer_config", "expected_output", "assessment_test_cases"]) assert.ok(!JSON.stringify(session).includes(field));
  await page.getByLabel("Belum tahu", { exact: true }).check();
  await page.getByRole("button", { name: "Berikutnya", exact: true }).click();
  await page.reload();
  await page.getByRole("heading", { name: session.items[1].title, exact: true }).waitFor();
  await page.getByRole("status").filter({ hasText: "Jawaban dipulihkan" }).waitFor();
  await page.getByRole("button", { name: "Sebelumnya", exact: true }).click();
  assert.equal(await page.getByLabel("Belum tahu", { exact: true }).isChecked(), true);
  const draftKey = `quethink:assessment-draft:v1:${userId}:${sessionId}`;
  assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).value.activeIndex, draftKey), 0);

  // Offline input still persists; loading the app itself requires connectivity.
  await context.setOffline(true);
  await page.getByRole("button", { name: "Berikutnya", exact: true }).click();
  await page.getByLabel("Belum tahu", { exact: true }).check();
  await context.setOffline(false);
  await page.reload();
  await page.getByRole("heading", { name: session.items[1].title, exact: true }).waitFor();
  assert.equal(await page.getByLabel("Belum tahu", { exact: true }).isChecked(), true);

  // A denied write must not claim success or discard current input.
  await page.evaluate(() => { window.__restoreDraftStorage = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key.startsWith("quethink:assessment-draft:")) throw new DOMException("Quota exceeded", "QuotaExceededError"); window.__restoreDraftStorage.call(this, key, value); }; });
  await page.getByRole("button", { name: "Berikutnya", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Belum tersimpan" }).waitFor();
  await page.evaluate(() => { Storage.prototype.setItem = window.__restoreDraftStorage; delete window.__restoreDraftStorage; });
  await page.getByRole("button", { name: "Coba simpan lagi" }).click();
  await page.reload();
  await page.getByRole("heading", { name: session.items[2].title, exact: true }).waitFor();
  await page.evaluate((key) => localStorage.setItem(key, "invalid-json"), draftKey);
  await page.reload();
  await page.getByRole("status").filter({ hasText: "Draf lama tidak cocok" }).waitFor();
  await page.getByRole("button", { name: "Buang draf lama" }).click();
  for (let i = 0; i < session.items.length; i++) {
    await page.getByRole("heading", { name: session.items[i].title, exact: true }).waitFor();
    await page.getByLabel("Belum tahu", { exact: true }).check();
    if (i < session.items.length - 1) await page.getByRole("button", { name: "Berikutnya", exact: true }).click();
  }
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page, "assessment");
    await page.screenshot({ path: `.impeccable/review/learning-recovery/assessment-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole("button", { name: "Kirim pre-test", exact: true }).click();
  await page.route(`**/api/assessment-sessions/${sessionId}/submit`, (route) => route.fulfill({ status: 401, contentType: "application/json", body: '{"error":"Login required"}' }));
  await page.getByRole("button", { name: "Kirim jawaban", exact: true }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Masuk kembali", exact: true }).click();
  await page.waitForURL("**/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL("**/dashboard");
  await page.getByRole("link", { name: "Lanjutkan tes", exact: true }).click();
  await page.waitForURL(sessionUrl);
  await page.getByRole("heading", { name: session.items.at(-1).title, exact: true }).waitFor();
  assert.equal(await page.getByLabel("Belum tahu", { exact: true }).isChecked(), true, "Re-login keeps the current answer");
  await page.unroute(`**/api/assessment-sessions/${sessionId}/submit`);
  await page.getByRole("button", { name: "Kirim pre-test", exact: true }).click();
  await page.route(`**/api/assessment-sessions/${sessionId}/submit`, (route) => route.abort("failed"));
  await page.getByRole("button", { name: "Kirim jawaban", exact: true }).click();
  await page.getByRole("dialog").getByRole("alert").waitFor();
  assert.ok(await page.evaluate((key) => localStorage.getItem(key), draftKey), "Failed submission retains draft");
  await page.unroute(`**/api/assessment-sessions/${sessionId}/submit`);
  // Grade once on the server, but simulate a conflict reply to exercise lost-response recovery.
  await page.route(`**/api/assessment-sessions/${sessionId}/submit`, async (route) => {
    const accepted = await route.fetch(); assert.equal(accepted.status(), 200);
    await route.fulfill({ status: 409, contentType: "application/json", body: '{"error":"Assessment ini sudah dikirim."}' });
  });
  await page.getByRole("button", { name: "Kirim jawaban", exact: true }).click();
  await page.waitForURL("**/result");
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), draftKey), null, "Successful submission clears its draft");

  await page.goto(site + reading);
  assert.equal(await page.locator("main textarea, #database-sql").count(), 0);
  await page.route("**/api/materials/*/read", (route) => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"Bacaan belum tersimpan. Coba lagi."}' }));
  await page.getByRole("button", { name: "Selesai membaca, lanjut ke Lab", exact: true }).click();
  await page.locator("main").getByRole("alert").waitFor();
  assert.equal(page.url(), site + reading, "Do not navigate when reading acknowledgement fails");
  await page.unroute("**/api/materials/*/read");
  await page.getByRole("button", { name: "Selesai membaca, lanjut ke Lab", exact: true }).click();
  await page.waitForURL("**/practice#lesson-practice");
  const firstCore = await db.from("exercises").select("id,config").eq("lesson_id", (await db.from("lessons").select("id").eq("slug", "membaca-bentuk-data").single()).data.id).eq("is_required", true).single();
  assert.ifError(firstCore.error);
  const section = page.locator(`#practice-${firstCore.data.id}`);
  const correctId = firstCore.data.config.answer.choiceId;
  await section.locator(`input[type=radio]:not([value="${correctId}"])`).first().check();
  await section.getByRole("button", { name: "Periksa jawaban", exact: true }).click();
  await section.getByText("Belum berhasil", { exact: true }).waitFor();
  await section.getByRole("link", { name: "Baca kembali konsepnya" }).waitFor();
  await page.reload();
  await section.getByRole("status").filter({ hasText: "Jawaban dipulihkan" }).waitFor();
  assert.equal(await section.locator("input[type=radio]:checked").count(), 1, "Practice answer restored");
  await section.locator(`input[value="${correctId}"]`).check();
  await section.getByRole("button", { name: "Periksa jawaban", exact: true }).click();
  await page.getByRole("heading", { name: "Materi tuntas", exact: true }).waitFor();
  assert.equal(await page.locator("#lesson-practice").evaluate((element) => element.nextElementSibling?.textContent?.includes("Materi tuntas")), true, "Next CTA directly follows core");
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page, "practice");
    await page.screenshot({ path: `.impeccable/review/learning-recovery/practice-${width}.png`, fullPage: true });
  }
  await page.getByRole("link", { name: "Baca materi berikutnya", exact: true }).click();
  await page.waitForURL("**/key-dan-hubungan-antar-tabel");
  await page.goto(`${site}/playground`);
  await page.locator("#database-sql").fill("SELECT name FROM students WHERE cohort = 2025;");
  await page.locator("#database-prediction").fill("2");
  await page.reload();
  await page.getByRole("status").filter({ hasText: "Jawaban dipulihkan" }).waitFor();
  assert.equal(await page.locator("#database-sql").inputValue(), "SELECT name FROM students WHERE cohort = 2025;");
  assert.equal(await page.locator("#database-prediction").inputValue(), "2");
  await page.getByRole("button", { name: "Jalankan SELECT" }).click();
  await page.getByRole("table", { name: "Hasil query dari SQLite", exact: true }).waitFor();
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page, "query");
    await page.screenshot({ path: `.impeccable/review/learning-recovery/query-${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Reset data", exact: true }).click();
  assert.equal(await page.locator("#database-prediction").inputValue(), "");
  assert.deepEqual(pageErrors, []);
  console.log("PASS: login; assessment refresh/offline/storage failure/retry/corruption/submit recovery; reading failure and direct Lab transition; practice draft and feedback; core completion/next unlock; query recovery/run/reset; no private fields; USER admin denial; 360/768/1280 layouts.");
} finally {
  await browser?.close();
  for (const userId of userIds) assert.ifError((await db.auth.admin.deleteUser(userId)).error);
  server.kill("SIGTERM");
}
