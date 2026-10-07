import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";
import { completeTestBaseline } from "./test-baseline-helper.mjs";

const site = "http://127.0.0.1:3221", userIds = [];
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const server = spawn("npm", ["run", "start", "--", "-p", "3221"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
let browser, log = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", chunk => { log = (log + chunk).slice(-2000); });
async function account(role) {
  const email = `quethink-nav-${randomUUID()}@example.invalid`, password = randomBytes(24).toString("base64url");
  const created = await db.auth.admin.createUser({ email, password, email_confirm: true }); assert.ifError(created.error);
  const id = created.data.user.id; userIds.push(id);
  if (role === "ADMIN") assert.ifError((await db.from("profiles").update({ role }).eq("id", id)).error);
  await completeTestBaseline(db, id);
  return { email, password };
}
async function login(page, user) {
  await page.goto(`${site}/login`);
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click(); await page.waitForURL("**/dashboard");
  await trigger(page).waitFor();
}
const destinations = [["Lab Materi", "/lab"], ["SQLab", "/playground"], ["Chatbot", "/chatbot"], ["Pre-test", "/pre-test"], ["Post-test", "/post-test"]];
const nav = page => page.getByRole("navigation", { name: "Navigasi utama", exact: true });
const panel = page => page.getByRole("navigation", { name: "Fitur lainnya", exact: true });
const trigger = page => nav(page).getByRole("button", { name: "Menu", exact: true });
async function assertExpanded(page, open) {
  await page.waitForFunction(expected => [...document.querySelectorAll('button[popovertarget][aria-expanded]')].some(button => button.getAttribute("aria-expanded") === String(expected)), open);
  await panel(page).waitFor({ state: open ? "visible" : "hidden" });
}
async function openMenu(page) { await trigger(page).click(); await assertExpanded(page, true); }
async function fit(page) {
  const sizes = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollWidth]); assert.ok(sizes[1] <= sizes[0], "Page must not overflow");
  const bar = await nav(page).boundingBox(), expanded = await panel(page).boundingBox();
  assert.ok(expanded.y >= 0 && expanded.y + expanded.height <= bar.y, "Menu must open above the bottom bar inside the viewport");
  assert.ok(expanded.x >= 0 && expanded.x + expanded.width <= sizes[0]);
  for (const link of await panel(page).getByRole("link").all()) assert.ok((await link.boundingBox()).height >= 44, "Touch targets must be at least 44px");
}
try {
  let ready = false;
  for (let i = 0; i < 80; i++) { try { if ((await fetch(site)).ok) { ready = true; break; } } catch { /* starting */ } await new Promise(resolve => setTimeout(resolve, 500)); }
  assert.ok(ready, log);
  const learner = await account("USER"), admin = await account("ADMIN");
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 }, reducedMotion: "reduce" });
  const page = await context.newPage(), errors = []; page.on("pageerror", error => errors.push(error.message));
  await login(page, learner);
  assert.deepEqual(await nav(page).locator("li").allTextContents(), ["Beranda", "Materi", "Menu", "Tes", "Profil"]);
  await assertExpanded(page, false); await openMenu(page);
  for (const [label, href] of destinations) assert.equal(await panel(page).getByRole("link", { name: label, exact: true }).getAttribute("href"), href);
  assert.equal(await panel(page).getByRole("link", { name: "Admin CMS", exact: true }).count(), 0);
  assert.equal((await page.request.get(`${site}/api/admin/users`)).status(), 403);
  assert.equal(await panel(page).evaluate(element => getComputedStyle(element).animationName), "none");
  await page.keyboard.press("Escape"); await assertExpanded(page, false); assert.ok(await trigger(page).evaluate(element => element === document.activeElement));
  await page.keyboard.press("Space"); await assertExpanded(page, true);
  await page.keyboard.press("Tab"); assert.ok(await panel(page).getByRole("button", { name: "Tutup menu" }).evaluate(element => element === document.activeElement));
  await page.keyboard.press("Tab"); assert.ok(await panel(page).getByRole("link", { name: "Lab Materi", exact: true }).evaluate(element => element === document.activeElement));
  await page.keyboard.press("Escape"); await assertExpanded(page, false);
  await openMenu(page); await trigger(page).click(); await assertExpanded(page, false);
  await openMenu(page); await page.locator("main h1").click(); await assertExpanded(page, false);
  await openMenu(page); await panel(page).getByRole("button", { name: "Tutup menu" }).click(); await assertExpanded(page, false);
  await mkdir(".impeccable/review/mobile-navigation", { recursive: true });
  for (const width of [360, 768]) {
    await page.setViewportSize({ width, height: 800 }); await openMenu(page); await fit(page);
    await page.screenshot({ path: `.impeccable/review/mobile-navigation/open-${width}.png` });
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 360, height: 800 });
  for (const [label, href] of destinations) {
    await openMenu(page); await panel(page).getByRole("link", { name: label, exact: true }).click();
    await page.waitForURL(`${site}${href}`); await assertExpanded(page, false);
    if (["/lab", "/playground"].includes(href)) await page.getByRole("heading", { level: 1, name: label, exact: true }).waitFor();
  }
  await page.goto(`${site}/learn/database-fundamentals/lessons/membaca-bentuk-data`); await page.locator("main h1").waitFor();
  await openMenu(page); await fit(page); await panel(page).getByRole("link", { name: "Lab Materi", exact: true }).click(); await page.waitForURL(`${site}/lab`);
  await openMenu(page); await nav(page).getByRole("link", { name: "Profil", exact: true }).click(); await page.waitForURL(`${site}/profile`); await assertExpanded(page, false);
  await openMenu(page); await page.setViewportSize({ width: 1280, height: 800 });
  await nav(page).waitFor({ state: "hidden" }); await panel(page).waitFor({ state: "hidden" });
  await page.getByRole("navigation", { name: "Navigasi akun", exact: true }).waitFor();
  await page.locator("main h1").waitFor();
  await page.screenshot({ path: ".impeccable/review/mobile-navigation/desktop-1280.png" });
  await page.setViewportSize({ width: 360, height: 800 }); await assertExpanded(page, false);
  await openMenu(page); await panel(page).getByRole("button", { name: "Keluar", exact: true }).click(); await page.waitForURL(url => url.pathname === "/login");
  await page.goto(`${site}/dashboard`); await page.waitForURL(url => url.pathname === "/login");
  await login(page, admin); await page.setViewportSize({ width: 320, height: 420 });
  await openMenu(page); await fit(page);
  assert.equal(await panel(page).getByRole("link", { name: "Admin CMS", exact: true }).getAttribute("href"), "/admin");
  assert.ok(await panel(page).evaluate(element => element.scrollHeight > element.clientHeight), "Short screens must scroll inside the panel");
  await panel(page).getByRole("button", { name: "Keluar", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: ".impeccable/review/mobile-navigation/short-admin-320.png" });
  await page.setViewportSize({ width: 360, height: 800 });
  await panel(page).getByRole("link", { name: "Admin CMS", exact: true }).click(); await page.waitForURL(`${site}/admin`); await page.locator("main h1").waitFor();
  assert.deepEqual(errors, []);
  console.log("PASS: five ordered mobile items; upward feature panel; all tool destinations; keyboard/Escape/focus/outside/toggle/close; primary navigation and reading shell; reduced motion; scrollable short viewport; admin visibility and USER denial; logout; 360/768/1280 screenshots without overflow.");
} finally {
  await browser?.close(); server.kill("SIGTERM");
  for (const id of userIds) assert.ifError((await db.auth.admin.deleteUser(id)).error);
}
