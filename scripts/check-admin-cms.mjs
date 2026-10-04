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
const adminEmail = `quethink-admin-${randomUUID()}@example.invalid`;
const userEmail = `quethink-user-${randomUUID()}@example.invalid`;
const password = randomBytes(24).toString("base64url");
const httpOnly = process.argv.includes("--http-only");
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

  const activePath = await privileged.from("learning_paths").select("id").eq("slug", "database-fundamentals").single();
  assert.ifError(activePath.error);
  const activeChapters = await privileged.from("chapters").select("id").eq("learning_path_id", activePath.data.id);
  assert.ifError(activeChapters.error);
  const lockedLesson = await privileged.from("lessons").select("id,slug").in("chapter_id", activeChapters.data.map((chapter) => chapter.id)).eq("slug", "menghapus-record-dengan-delete").single();
  assert.ifError(lockedLesson.error);
  const lockedLearnerView = await fetch(`${site}/learn/database-fundamentals/lessons/${lockedLesson.data.slug}`, { headers: { Cookie: adminCookie() } });
  assert.ok((await lockedLearnerView.text()).includes("Lesson belum tersedia"), "Normal learner route must keep its prerequisites even for a new admin account.");
  const freeAdminView = await fetch(`${site}/admin/lessons/${lockedLesson.data.id}/preview`, { headers: { Cookie: adminCookie() } });
  assert.equal(freeAdminView.status, 200, "Admin preview must allow the final published lesson without completing earlier lessons.");
  assert.ok((await freeAdminView.text()).includes("Pratinjau admin"));

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
  result = await call(adminCookie(), "/api/admin/lessons", "POST", { chapter_id: chapterId, title: "Konsep", slug: lessonSlug, summary: "Satu konsep basis data.", content: "# Prediksi query\n\nBaca tabel dan jelaskan hasil query SELECT.", example_sql: "SELECT name FROM students;", position: 1, is_required: true, is_preview: true });
  assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  const lessonId = result.payload.item.id;
  assert.equal(result.payload.item.is_published, false, "New lessons must always start as drafts.");
  const previewUrl = `/admin/lessons/${lessonId}/preview`;
  const draftPreview = await fetch(`${site}${previewUrl}`, { headers: { Cookie: adminCookie() } });
  assert.equal(draftPreview.status, 200, "ADMIN must preview draft lessons without prerequisites.");
  assert.ok((await draftPreview.text()).includes("Pratinjau admin"));
  const userPreview = await fetch(`${site}${previewUrl}`, { headers: { Cookie: userCookie() }, redirect: "manual" });
  assert.equal(userPreview.status, 307, "USER must not open admin preview URLs.");
  const guestPreview = await fetch(`${site}${previewUrl}`, { redirect: "manual" });
  assert.equal(guestPreview.status, 307, "Guest must not open admin preview URLs.");
  for (const method of ["POST", "PATCH", "DELETE"]) {
    const route = method === "POST" ? "/api/admin/lessons" : `/api/admin/lessons/${lessonId}`;
    assert.equal((await call(userCookie(), route, method, {})).response.status, 403, `${method} must deny USER before mutation.`);
    assert.equal((await call("", route, method, {})).response.status, 401, `${method} must deny guest before mutation.`);
  }
  const noPreviewProgress = await privileged.from("lesson_progress").select("id").eq("user_id", ids[0]);
  assert.ifError(noPreviewProgress.error);
  assert.equal(noPreviewProgress.data.length, 0, "Preview must not create learner progress.");

  assert.equal((await call(adminCookie(), `/api/admin/lessons/${lessonId}`, "PATCH", { action: "publish" })).response.status, 200);
  result = await call(adminCookie(), "/api/admin/exercises", "POST", {
    lesson_id: lessonId, type: "PREDICT_OUTPUT", title: "Prediksi hasil query", prompt: "Tulis satu nama per baris.", starter_code: "SELECT name FROM students ORDER BY student_id;",
    config: { answer: { output: "Alya\nBima\nCitra\nDanu" } }, public_config: {}, position: 1, is_required: true,
  });
  assert.equal(result.response.status, 201, JSON.stringify(result.payload));
  const exerciseId = result.payload.item.id;
  assert.deepEqual(result.payload.item.config.public, {}, "Visible configuration must be stored through the generated public field.");
  assert.equal((await call(adminCookie(), `/api/admin/exercises/${exerciseId}`, "PATCH", { action: "publish" })).response.status, 200);

  const block = (id, text) => ({ id, text });
  const exerciseFixtures = [
    { type: "PREDICT_OUTPUT", title: "Prediksi nama mahasiswa", starter_code: "SELECT name FROM students;", config: { answer: { output: "Alya\nBima\nCitra\nDanu" } } },
    { type: "PSEUDOCODE", title: "Susun langkah membaca tabel", starter_code: null, config: { answer: { order: ["source", "columns", "result"] } }, public_config: { mode: "order", blocks: [block("source", "Pilih tabel sumber"), block("columns", "Pilih kolom"), block("result", "Periksa hasil")] } },
    { type: "FLOWCHART", title: "Pilih relasi key", starter_code: null, config: { answer: { choiceId: "foreign-key" } }, public_config: { mode: "choice", options: [block("foreign-key", "Pasangkan foreign key dengan primary key"), block("name", "Pasangkan nama dengan nama")] } },
  ];
  for (const [index, fixture] of exerciseFixtures.entries()) {
    const createdExercise = await call(adminCookie(), "/api/admin/exercises", "POST", { lesson_id: lessonId, prompt: "Baca data lalu tentukan jawabannya.", position: index + 2, is_required: false, ...fixture });
    assert.equal(createdExercise.response.status, 201, `${fixture.type}: ${JSON.stringify(createdExercise.payload)}`);
    const childId = createdExercise.payload.item.id;
    const published = await call(adminCookie(), `/api/admin/exercises/${childId}`, "PATCH", { action: "publish" });
    assert.equal(published.response.status, 200, `${fixture.type} publish failed: ${JSON.stringify(published.payload)}`);
  }
  const unsafeCode = await call(adminCookie(), "/api/admin/exercises", "POST", { lesson_id: lessonId, type: "CODE_COMPLETION", title: "Programming exercise", prompt: "Not allowed in the database course.", starter_code: "", position: 9, config: {} });
  assert.equal(unsafeCode.response.status, 422, "Programming exercises must be rejected for the active database curriculum.");

  const previewBefore = await privileged.from("lesson_progress").select("id").eq("user_id", ids[0]);
  const renderedPreview = await fetch(`${site}${previewUrl}`, { headers: { Cookie: adminCookie() } });
  assert.equal(renderedPreview.status, 200);
  const previewHtml = await renderedPreview.text();
  assert.ok(previewHtml.includes("Pemeriksaan nonaktif di pratinjau"));
  assert.ok(!previewHtml.includes("Alya\\nBima\\nCitra\\nDanu"), "Private answer keys must not enter preview payloads.");
  const previewAfter = await privileged.from("lesson_progress").select("id").eq("user_id", ids[0]);
  assert.ifError(previewBefore.error); assert.ifError(previewAfter.error);
  assert.deepEqual(previewAfter.data, previewBefore.data);

  const userLesson = await fetch(`${site}/learn/${pathSlug}/lessons/${lessonSlug}`, { headers: { Cookie: userCookie() } });
  assert.equal(userLesson.status, 200, "USER should read the published preview lesson from the new content.");
  assert.ok((await userLesson.text()).includes("Prediksi query"));
  const hiddenAdminRead = await call(userCookie(), `/api/admin/exercises`);
  assert.equal(hiddenAdminRead.response.status, 403, "Non-admin must not read hidden test configuration.");

  const checkpoint = await call(adminCookie(), "/api/admin/assessments", "POST", { learning_path_id: pathId, title: "Checkpoint", slug: "cms-checkpoint", type: "CHECKPOINT", instructions: "Review concepts.", gate_after_chapter: 1, passing_score: 75, position: 1 });
  assert.equal(checkpoint.response.status, 201, JSON.stringify(checkpoint.payload));
  const assessmentId = checkpoint.payload.item.id;
  assert.equal((await call(adminCookie(), `/api/admin/assessments/${assessmentId}`, "PATCH", { action: "publish" })).response.status, 422, "Empty assessments must not publish.");
  const item = await call(adminCookie(), "/api/admin/assessment-items", "POST", { assessment_id: assessmentId, type: "PREDICT_OUTPUT", title: "Prediksi hasil query", topic: "WHERE", prompt: "Tulis nama mahasiswa angkatan 2025.", position: 1, weight: 1, public_config: { query: "SELECT name FROM students WHERE cohort = '2025' ORDER BY name;" }, answer_config: { output: "Alya\nBima" } });
  assert.equal(item.response.status, 201, JSON.stringify(item.payload));
  assert.equal((await call(adminCookie(), `/api/admin/assessment-items/${item.payload.item.id}`, "PATCH", { action: "reorder", position: 2 })).response.status, 200);
  const unsupportedAssessmentItem = await call(adminCookie(), "/api/admin/assessment-items", "POST", { assessment_id: assessmentId, type: "PROBLEM_SOLVING", title: "Coding problem", topic: "JavaScript", prompt: "Write code.", position: 2, weight: 1, public_config: {}, answer_config: {} });
  assert.equal(unsupportedAssessmentItem.response.status, 422, "Programming assessment items must be rejected from the active database course.");
  const privateAdminOnly = await call(userCookie(), "/api/admin/assessment-items");
  assert.equal(privateAdminOnly.response.status, 403);
  assert.equal((await call(adminCookie(), `/api/admin/assessments/${assessmentId}`, "PATCH", { action: "publish" })).response.status, 200);
  assert.equal((await call(adminCookie(), `/api/admin/assessments/${assessmentId}`, "PATCH", { action: "unpublish" })).response.status, 200);

  if (!httpOnly) {
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const authContext = await browser.newContext({ viewport: { width: 1280, height: 820 } });
  const authPage = await authContext.newPage();
  const authErrors = [];
  authPage.on("pageerror", (error) => authErrors.push(error.message));
  await authPage.goto(`${site}/register`, { waitUntil: "domcontentloaded" });
  await authPage.getByRole("heading", { name: "Buat akun" }).waitFor();
  await authPage.getByLabel("Email").waitFor();
  assert.equal(await authPage.getByLabel(/role|peran/i).count(), 0, "Registration must not allow choosing an elevated role.");
  await authPage.goto(`${site}/login`, { waitUntil: "domcontentloaded" });
  await authPage.getByLabel("Email").fill(adminEmail);
  await authPage.getByLabel("Password").fill(password);
  await authPage.getByRole("button", { name: "Masuk" }).click();
  await authPage.waitForURL("**/dashboard", { timeout: 10_000 });
  await authPage.goto(`${site}/admin`, { waitUntil: "domcontentloaded" });
  await authPage.getByRole("heading", { name: "Ringkasan" }).waitFor();
  await authPage.goto(`${site}/login`, { waitUntil: "domcontentloaded" });
  await authPage.getByLabel("Email").fill(userEmail);
  await authPage.getByLabel("Password").fill(password);
  await authPage.getByRole("button", { name: "Masuk" }).click();
  await authPage.waitForURL("**/dashboard", { timeout: 10_000 });
  await authPage.goto(`${site}/admin`, { waitUntil: "domcontentloaded" });
  await authPage.waitForURL("**/dashboard", { timeout: 10_000 });
  assert.deepEqual(authErrors, [], `Auth UI errors: ${authErrors.join("; ")}`);
  await authContext.close();

  const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
  await context.addCookies(adminCookie().split("; ").map((part) => { const [name, ...value] = part.split("="); return { name, value: decodeURIComponent(value.join("=")), url: site }; }));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${site}/admin`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Ringkasan" }).waitFor();
  await page.getByRole("navigation", { name: "CMS sections" }).getByRole("button", { name: "Manajemen pengguna" }).click();
  await page.getByText(adminEmail).first().waitFor();
  const downloadReady = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh rekap CSV" }).click();
  assert.equal((await downloadReady).suggestedFilename(), "quethink-rekap-nilai.csv");
  await page.getByRole("navigation", { name: "CMS sections" }).getByRole("button", { name: "Lesson", exact: true }).click();
  await page.getByRole("heading", { name: "Lesson", exact: true }).waitFor();
  await page.setViewportSize({ width: 360, height: 780 });
  const mobileWidths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  assert.ok(mobileWidths.content <= mobileWidths.viewport, `Admin mobile layout overflows: ${JSON.stringify(mobileWidths)}`);
  const navigation = page.getByRole("navigation", { name: "Navigasi utama" });
  assert.equal(await navigation.isVisible(), true, "Mobile bottom navigation should be visible.");
  assert.equal(await navigation.getByRole("link").count(), 5);
  await navigation.getByRole("link", { name: "Profil dan Admin CMS" }).click();
  await page.waitForURL("**/profile");
  assert.equal(await page.getByRole("link", { name: "Admin CMS" }).isVisible(), true, "Admin remains accessible from Profile.");
  assert.deepEqual(errors, [], `Admin UI errors: ${errors.join("; ")}`);
  await context.close();
  }
  console.log(httpOnly ? "Admin HTTP flow passed: RBAC, draft preview without prerequisites, no preview progress, content CRUD/publish/reorder, private content denied, assessment setup." : "Admin RBAC, draft → preview → publish, content editing, assessment setup, and grade CSV export passed.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  if (pathId) await privileged.from("learning_paths").delete().eq("id", pathId);
  for (const id of ids.reverse()) await privileged.auth.admin.deleteUser(id);
}
