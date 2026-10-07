import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { chromium } from "playwright-core";
import { completeTestBaseline } from "./test-baseline-helper.mjs";

const site = "http://127.0.0.1:3223", failures = [], errors = [];
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const server = spawn("npm", ["run", "start", "--", "-p", "3223"], { stdio: "ignore", env: process.env });
let browser, userId;
async function fits(page, name) {
  const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  if (size.content > size.viewport) failures.push(`${name}: ${size.content}px content exceeds ${size.viewport}px viewport`);
}
try {
  let ready = false;
  for (let i = 0; i < 80; i++) { try { if ((await fetch(site)).ok) { ready = true; break; } } catch { /* Starting server */ } await new Promise(resolve => setTimeout(resolve, 500)); }
  assert.ok(ready, "Production server must start");
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 320, height: 800 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (/hydration|hydrated|didn't match|Minified React error #4(18|23|25)/i.test(message.text())) errors.push(message.text()); });
  await mkdir(".impeccable/review/ui-fixes", { recursive: true });
  for (const route of ["/", "/login"]) {
    await page.goto(site + route); await page.locator("main h1").waitFor();
    await page.getByRole("link", { name: /Quethink/ }).first().focus();
    if (route === "/") {
      const preview = page.getByRole("figure", { name: "Lab basis data", exact: true });
      await preview.getByText("cohort", { exact: true }).waitFor();
      await preview.getByText("Citra · Danu", { exact: true }).waitFor();
    }
  }
  const email = `quethink-uiregression-${randomUUID()}@example.invalid`, password = randomBytes(24).toString("base64url");
  const created = await db.auth.admin.createUser({ email, password, email_confirm: true }); assert.ifError(created.error); userId = created.data.user.id;
  await completeTestBaseline(db, userId);
  const jar = new Map();
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: cookies => cookies.forEach(cookie => jar.set(cookie.name, cookie.value)) } });
  assert.ifError((await auth.auth.signInWithPassword({ email, password })).error);
  await context.addCookies([...jar].map(([name, value]) => ({ name, value, url: site })));
  assert.ifError((await db.from("profiles").update({ display_name: "A".repeat(60) }).eq("id", userId)).error);
  await page.goto(site + "/dashboard"); await page.locator("main h1").waitFor();
  await fits(page, "Dashboard / valid 60-character name");
  assert.ifError((await db.from("profiles").update({ display_name: "Mahasiswa" }).eq("id", userId)).error);
  for (const width of [320, 360, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const [name, route] of [["landing", "/"], ["dashboard", "/dashboard"]]) {
      await page.goto(site + route); await page.locator("main h1").waitFor(); await page.evaluate(() => document.fonts.ready);
      for (const scale of [1, 2]) {
        await page.evaluate(value => { document.documentElement.style.fontSize = `${16 * value}px`; }, scale);
        await fits(page, `${name} / ${width}px / ${scale * 100}% text`);
        if (width === 320 && name === "dashboard") {
          const nav = page.getByRole("navigation", { name: "Navigasi utama", exact: true });
          const clipped = await nav.evaluate(element => [...element.querySelectorAll("li > a, li > button")].flatMap(control => {
            const label = control.querySelector("span"), bounds = control.getBoundingClientRect();
            const range = document.createRange(); range.selectNodeContents(label);
            return [...range.getClientRects()].some(rect => rect.left < bounds.left - 1 || rect.right > bounds.right + 1)
              ? [label.textContent] : [];
          }));
          if (clipped.length) failures.push(`Mobile labels overlap at ${scale * 100}% text: ${clipped.join(", ")}`);
          await nav.getByRole("button", { name: "Menu", exact: true }).click();
          const panel = page.getByRole("navigation", { name: "Fitur lainnya", exact: true }); await panel.waitFor();
          const bar = await nav.boundingBox(), expanded = await panel.boundingBox();
          if (expanded.y < 0 || expanded.y + expanded.height > bar.y) failures.push(`Menu overlaps bottom navigation at ${scale * 100}% text`);
          await page.keyboard.press("Escape");
        }
        await page.screenshot({ path: `.impeccable/review/ui-fixes/${name}-${width}-${scale}.png`, fullPage: false });
      }
    }
  }
  assert.deepEqual(errors, [], "Clean-browser hydration and client rendering must have no errors");
  assert.deepEqual(failures, [], "Landing and dashboard must support small viewports, valid profile names and enlarged text");
  console.log("PASS: landing/login/dashboard hydrate cleanly; 60-character profile; 320/360/768/1280px; 100/200% text; non-overlapping captions; mobile menu above navigation.");
} finally {
  await browser?.close(); server.kill("SIGTERM");
  if (userId) assert.ifError((await db.auth.admin.deleteUser(userId)).error);
}
