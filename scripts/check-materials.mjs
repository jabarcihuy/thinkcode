import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";
import { PDFDocument } from "pdf-lib";

const site = "http://127.0.0.1:3218";
const path = "/learn/database-fundamentals";
const reading = `${path}/lessons/membaca-bentuk-data`;
const locked = `${path}/lessons/key-dan-hubungan-antar-tabel`;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const server = spawn("npm", ["run", "start", "--", "-p", "3218"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
let log = "", userId, browser;
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { log = (log + chunk).slice(-2000); });
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(site)).ok) { ready = true; break; } } catch { /* starting */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, log);
  const guestPdf = await fetch(`${site}${reading}/pdf`);
  assert.equal(guestPdf.status, 200);
  assert.equal(guestPdf.headers.get("cache-control"), "private, no-store");
  const firstBytes = Buffer.from(await guestPdf.arrayBuffer());
  assert.match(firstBytes.subarray(0, 8).toString(), /%PDF/);
  await mkdir("/tmp/quethink-material-pdfs", { recursive: true });
  await writeFile("/tmp/quethink-material-pdfs/materi-1.pdf", firstBytes);
  assert.equal((await PDFDocument.load(firstBytes)).getTitle(), "Materi 1 — Membaca Bentuk Data");
  assert.equal((await fetch(`${site}${locked}/pdf`)).status, 404, "Guest cannot download a non-preview material.");
  assert.equal((await fetch(`${site}${reading}/practice`, { redirect: "manual" })).status, 307, "Practice requires login.");
  const email = `quethink-materials-${randomUUID()}@example.invalid`, password = randomBytes(24).toString("base64url");
  const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(created.error); userId = created.data.user.id;
  const jar = new Map();
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)) } });
  assert.ifError((await client.auth.signInWithPassword({ email, password })).error);
  const headers = { Cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; ") };
  for (const suffix of ["", "/practice", "/pdf"]) {
    const denied = await fetch(`${site}${locked}${suffix}`, { headers });
    if (suffix === "/pdf") assert.equal(denied.status, 404, "Locked PDF denied.");
    else {
      const html = await denied.text();
      // Next streams its notFound fallback with 200 once root loading has flushed.
      assert.ok(denied.status === 404 || html.includes("NEXT_HTTP_ERROR_FALLBACK;404"), `Locked ${suffix} must render the server notFound fallback.`);
      assert.ok(!html.includes('<h1 class="mt-6 text-3xl'), "Locked practice controls must not render.");
    }
  }
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await context.addCookies([...jar].map(([name, value]) => ({ name, value, url: site })));
  const page = await context.newPage(), errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir(".impeccable/review/material-reading", { recursive: true });
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, route] of [["list", path], ["reading", reading], ["practice", `${reading}/practice`]]) {
      await page.goto(site + route); await page.locator("main h1").waitFor();
      if (name === "list") {
        assert.equal(await page.getByRole("heading", { level: 2 }).count(), 11);
        assert.equal(await page.getByRole("link", { name: /Lihat chapter/ }).count(), 0);
      }
      if (name === "reading") {
        assert.equal(await page.locator("main textarea, #database-sql, #lesson-practice").count(), 0);
        await page.getByRole("button", { name: "Unduh PDF", exact: true }).waitFor();
        if (width === 360) {
        const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Unduh PDF", exact: true }).click()]);
        assert.equal(download.suggestedFilename(), "quethink-materi-1.pdf");
        assert.equal(await download.failure(), null);
        }
      }
      if (name === "practice") await page.getByRole("heading", { name: "Latihan materi 1", exact: true }).waitFor();
      const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      assert.ok(size.content <= size.viewport, `${name} ${width} overflow: ${JSON.stringify(size)}`);
      await page.screenshot({ path: `.impeccable/review/material-reading/${name}-${width}.png`, fullPage: true });
    }
  }
  await page.goto(site + reading);
  await page.route(`**${reading}/pdf`, (route) => route.fulfill({ status: 503, contentType: "application/json", body: '{"message":"unavailable"}' }));
  await page.getByRole("button", { name: "Unduh PDF", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "PDF belum bisa diunduh" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Unduh PDF", exact: true }).isEnabled(), true);
  const progress = await db.from("lesson_progress").select("lesson_id").eq("user_id", userId);
  assert.ifError(progress.error); assert.deepEqual(progress.data, [], "Reading/downloading/opening practice do not mark completion.");
  assert.deepEqual(errors, []);
  console.log("PASS: flat list, reading-only pages, guest/PDF/practice/locked authorization, download/error state, no progress writes, mobile/tablet/desktop layouts.");
} finally {
  await browser?.close();
  if (userId) assert.ifError((await db.auth.admin.deleteUser(userId)).error);
  server.kill("SIGTERM");
}
