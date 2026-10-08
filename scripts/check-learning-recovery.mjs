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
  await context.addCookies([{name:"quethink_locale",value:"id",url:site}]);
  const page = await context.newPage(), pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await mkdir(".impeccable/review/learning-recovery", { recursive: true });
  await page.goto(`${site}/login`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL("**/dashboard");
  assert.equal((await page.request.get(`${site}/api/admin/users`)).status(), 403);
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
  console.log("PASS: login; reading failure and direct Lab transition; practice draft and feedback; core completion/next unlock; query recovery/run/reset; no private fields; USER admin denial; 360/768/1280 layouts.");
} finally {
  await browser?.close();
  for (const userId of userIds) assert.ifError((await db.auth.admin.deleteUser(userId)).error);
  server.kill("SIGTERM");
}
