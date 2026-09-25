import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
assert.ok(url && publishableKey && secretKey, "Supabase URL, publishable key, and secret key are required.");
const site = process.env.ADMIN_TEST_SITE ?? "http://127.0.0.1:3211";
const privileged = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const adminEmail = `thinkcode-admin-${randomUUID()}@example.invalid`;
const userEmail = `thinkcode-user-${randomUUID()}@example.invalid`;
const password = randomBytes(24).toString("base64url");
const ids = [];
let pathId = null;
const server = spawn("npm", ["run", "start", "--", "-p", "3211"], { stdio: "ignore", env: process.env });
let browser;

async function waitForSite() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try { const response = await fetch(`${site}/`); if (response.ok) return; } catch { /* server is starting */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Production server did not become ready.");
}

async function createAccount(email, role) {
  const result = await privileged.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(result.error);
  const id = result.data.user?.id;
  assert.ok(id);
  ids.push(id);
  if (role === "ADMIN") {
    const update = await privileged.from("profiles").update({ role: "ADMIN" }).eq("id", id);
    assert.ifError(update.error);
  }
  const jar = new Map();
  const auth = createServerClient(url, publishableKey, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)) } });
  const signIn = await auth.auth.signInWithPassword({ email, password });
  assert.ifError(signIn.error);
  return () => [...jar].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; ");
}

async function call(cookie, route, method = "GET", body) {
  const response = await fetch(`${site}${route}`, { method, headers: { Cookie: cookie, ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

try {
  await waitForSite();
  const adminCookie = await createAccount(adminEmail, "ADMIN");
  const userCookie = await createAccount(userEmail, "USER");

  const staleLesson = await privileged.from("lessons").select("id, chapter_id").eq("slug", "cms-concept").maybeSingle();
  if (staleLesson.data) {
    const staleChapter = await privileged.from("chapters").select("learning_path_id").eq("id", staleLesson.data.chapter_id).single();
    if (staleChapter.data) await privileged.from("learning_paths").delete().eq("id", staleChapter.data.learning_path_id);
  }

  const pageResponse = await fetch(`${site}/admin`, { headers: { Cookie: adminCookie() } });
  assert.equal(pageResponse.status, 200, "ADMIN should reach the CMS.");
  const userPage = await fetch(`${site}/admin`, { headers: { Cookie: userCookie() }, redirect: "manual" });
  assert.equal(userPage.status, 307, "USER should be redirected from the admin page.");
  const deniedApi = await call(userCookie(), "/api/admin/lessons");
  assert.equal(deniedApi.response.status, 403, "USER should be denied by the content API.");
  const deniedAssistant = await call(userCookie(), "/api/admin/assistant", "POST", { task: "summary", context: "test" });
  assert.equal(deniedAssistant.response.status, 403, "USER should be denied by the AI draft API.");

  const pathSlug = `cms-test-${randomUUID().slice(0, 8)}`;
  let result = await call(adminCookie(), "/api/admin/paths", "POST", { title: "CMS test path", slug: pathSlug, description: "Temporary integration content.", position: 9_999 });
  assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  pathId = result.payload.item.id;
  result = await call(adminCookie(), `/api/admin/paths/${pathId}`, "PATCH", { action: "publish" });
  assert.equal(result.response.status, 200, JSON.stringify(result.payload));
  result = await call(adminCookie(), "/api/admin/chapters", "POST", { learning_path_id: pathId, title: "Chapter", position: 1, is_required: true });
  assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  const chapterId = result.payload.item.id;
  assert.equal((await call(adminCookie(), `/api/admin/chapters/${chapterId}`, "PATCH", { action: "publish" })).response.status, 200);
  const lessonSlug = `cms-concept-${randomUUID().slice(0, 8)}`;
  result = await call(adminCookie(), "/api/admin/lessons", "POST", { chapter_id: chapterId, title: "Concept", slug: lessonSlug, summary: "A short concept.", content: "# Predict\n\nRead the code then describe its result.", position: 1, is_required: true, is_preview: true });
  assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  const lessonId = result.payload.item.id;
  assert.equal(result.payload.item.is_published, false, "New lessons must always start as drafts.");
  assert.equal((await call(adminCookie(), `/api/admin/lessons/${lessonId}`, "PATCH", { action: "publish" })).response.status, 200);
  result = await call(adminCookie(), "/api/admin/exercises", "POST", {
    lesson_id: lessonId, type: "PREDICT_OUTPUT", title: "Predict this output", prompt: "What will be printed?", starter_code: "console.log(2 + 2);",
    config: { answer: { output: "4" } }, public_config: {}, position: 1, is_required: true,
  });
  assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  const exerciseId = result.payload.item.id;
  assert.deepEqual(result.payload.item.config.public, {}, "Visible configuration must be stored through the generated public field.");
  assert.equal((await call(adminCookie(), `/api/admin/exercises/${exerciseId}`, "PATCH", { action: "publish" })).response.status, 200);

  const block = (id, text) => ({ id, text });
  const exerciseFixtures = [
    { type: "CODE_COMPLETION", title: "Complete a message", starter_code: 'console.log("ThinkCode");', config: {} },
    { type: "DEBUGGING", title: "Fix the loop", starter_code: "for (let i = 0; i < 3; i--) console.log(i);", config: {} },
    { type: "PROBLEM_SOLVING", title: "Sum two numbers", starter_code: "function sum(a, b) { return a + b; }", config: {} },
    { type: "PSEUDOCODE", title: "Order the steps", starter_code: null, config: { answer: { order: ["start", "finish"] } }, public_config: { mode: "order", blocks: [block("start", "Start"), block("finish", "Finish")] } },
    { type: "FLOWCHART", title: "Choose the path", starter_code: null, config: { answer: { choiceId: "yes" } }, public_config: { mode: "choice", options: [block("yes", "Yes"), block("no", "No")] } },
  ];
  for (const [index, fixture] of exerciseFixtures.entries()) {
    const createdExercise = await call(adminCookie(), "/api/admin/exercises", "POST", { lesson_id: lessonId, prompt: "Follow the prompt and check the result.", position: index + 2, is_required: false, ...fixture });
    assert.equal(createdExercise.response.status, 201, `${fixture.type}: ${JSON.stringify(createdExercise.payload)}`);
    const childId = createdExercise.payload.item.id;
    if (["CODE_COMPLETION", "DEBUGGING", "PROBLEM_SOLVING"].includes(fixture.type)) {
      const test = await call(adminCookie(), "/api/admin/test-cases", "POST", { exercise_id: childId, stdin: "", expected_output: fixture.type === "CODE_COMPLETION" ? "ThinkCode" : fixture.type === "DEBUGGING" ? "0\n1\n2" : "5", is_hidden: false, weight: 1, position: 1 });
      assert.equal(test.response.status, 201, JSON.stringify(test.payload));
    }
    const published = await call(adminCookie(), `/api/admin/exercises/${childId}`, "PATCH", { action: "publish" });
    assert.equal(published.response.status, 200, `${fixture.type} publish failed: ${JSON.stringify(published.payload)}`);
  }
  const unsafeCode = await call(adminCookie(), "/api/admin/exercises", "POST", { lesson_id: lessonId, type: "CODE_COMPLETION", title: "Hidden browser tests", prompt: "Implement the prompt.", starter_code: "console.log(1);", position: 9, config: {} });
  assert.equal(unsafeCode.response.status, 201);
  const unsafeTest = await call(adminCookie(), "/api/admin/test-cases", "POST", { exercise_id: unsafeCode.payload.item.id, stdin: "secret", expected_output: "private", is_hidden: true, weight: 1, position: 1 });
  assert.equal(unsafeTest.response.status, 201);
  const unsafePublish = await call(adminCookie(), `/api/admin/exercises/${unsafeCode.payload.item.id}`, "PATCH", { action: "publish" });
  assert.equal(unsafePublish.response.status, 422, "Hidden coding tests must not be published into browser practice.");

  const userLesson = await fetch(`${site}/learn/${pathSlug}/lessons/${lessonSlug}`, { headers: { Cookie: userCookie() } });
  assert.equal(userLesson.status, 200, "USER should read the published preview lesson from the new content.");
  assert.ok((await userLesson.text()).includes("Read the code"));
  const hiddenAdminRead = await call(userCookie(), `/api/admin/exercises`);
  assert.equal(hiddenAdminRead.response.status, 403, "Non-admin must not read hidden test configuration.");

  const checkpoint = await call(adminCookie(), "/api/admin/assessments", "POST", { learning_path_id: pathId, title: "Checkpoint", slug: "cms-checkpoint", type: "CHECKPOINT", instructions: "Review concepts.", gate_after_chapter: 1, passing_score: 75, position: 1 });
  assert.equal(checkpoint.response.status, 201, JSON.stringify(checkpoint.payload));
  const assessmentId = checkpoint.payload.item.id;
  assert.equal((await call(adminCookie(), `/api/admin/assessments/${assessmentId}`, "PATCH", { action: "publish" })).response.status, 422, "Empty assessments must not publish.");
  const item = await call(adminCookie(), "/api/admin/assessment-items", "POST", { assessment_id: assessmentId, type: "PREDICT_OUTPUT", title: "Read a trace", topic: "variables", prompt: "What prints?", position: 1, weight: 1, public_config: { sourceCode: "console.log(3);" }, answer_config: { output: "3" } });
  assert.equal(item.response.status, 201, JSON.stringify(item.payload));
  assert.equal((await call(adminCookie(), `/api/admin/assessment-items/${item.payload.item.id}`, "PATCH", { action: "reorder", position: 2 })).response.status, 200);
  const codingItem = await call(adminCookie(), "/api/admin/assessment-items", "POST", { assessment_id: assessmentId, type: "PROBLEM_SOLVING", title: "Add numbers", topic: "functions", prompt: "Write a sum function.", starter_code: "function sum(a, b) { return a + b; }", entry_function: "sum", position: 3, weight: 2, public_config: {}, answer_config: {} });
  assert.equal(codingItem.response.status, 201, JSON.stringify(codingItem.payload));
  assert.equal((await call(adminCookie(), `/api/admin/assessments/${assessmentId}`, "PATCH", { action: "publish" })).response.status, 422, "Coding assessment items require trusted grading tests.");
  const trustedTest = await call(adminCookie(), "/api/admin/assessment-test-cases", "POST", { assessment_item_id: codingItem.payload.item.id, args: [2, 3], stdin: "", expected_output: "5", is_hidden: true, weight: 1, position: 1 });
  assert.equal(trustedTest.response.status, 201, JSON.stringify(trustedTest.payload));
  const privateAdminOnly = await call(userCookie(), "/api/admin/assessment-items");
  assert.equal(privateAdminOnly.response.status, 403);
  assert.equal((await call(adminCookie(), `/api/admin/assessments/${assessmentId}`, "PATCH", { action: "publish" })).response.status, 200);
  assert.equal((await call(adminCookie(), `/api/admin/assessments/${assessmentId}`, "PATCH", { action: "unpublish" })).response.status, 200);

  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
  await context.addCookies(adminCookie().split("; ").map((part) => { const [name, ...value] = part.split("="); return { name, value: decodeURIComponent(value.join("=")), url: site }; }));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${site}/admin`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Ringkasan" }).waitFor();
  await page.getByRole("navigation", { name: "CMS sections" }).getByRole("button", { name: "Lessons" }).click();
  await page.getByRole("heading", { name: "Lessons", exact: true }).waitFor();
  await page.locator('select[aria-label="Color theme"]:visible').selectOption("dark");
  assert.equal(await page.locator("html").evaluate((element) => element.classList.contains("dark")), true, "Dark theme should apply to the document.");
  await page.locator('select[aria-label="Color theme"]:visible').selectOption("system");
  await page.setViewportSize({ width: 360, height: 780 });
  const mobileWidths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  assert.ok(mobileWidths.content <= mobileWidths.viewport, `Admin mobile layout overflows: ${JSON.stringify(mobileWidths)}`);
  const menu = page.getByRole("button", { name: "Buka navigasi" });
  await menu.click();
  assert.equal(await page.getByRole("navigation", { name: "Navigasi akun" }).isVisible(), true, "Mobile account navigation should open.");
  assert.deepEqual(errors, [], `Admin UI errors: ${errors.join("; ")}`);
  await context.close();
  console.log("Admin RBAC, draft → preview → publish, content editing, and assessment setup passed.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  if (pathId) await privileged.from("learning_paths").delete().eq("id", pathId);
  for (const id of ids.reverse()) await privileged.auth.admin.deleteUser(id);
}
