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
const site = process.env.FLOW_TEST_SITE ?? "http://127.0.0.1:3212";
const pathSlug = "database-fundamentals";
const privileged = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const password = randomBytes(24).toString("base64url");
const userIds = [];
const server = spawn("npm", ["run", "start", "--", "-p", "3212"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
let serverLog = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { serverLog = (serverLog + chunk.toString()).slice(-4000); });
let browser;

async function waitForSite() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(site)).ok) return; } catch { /* production server is starting */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Production server did not become ready. ${serverLog}`);
}

async function createAccount(role) {
  const email = `quethink-db-flow-${randomUUID()}@example.invalid`;
  const created = await privileged.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(created.error);
  const id = created.data.user?.id;
  assert.ok(id);
  userIds.push(id);
  if (role === "ADMIN") assert.ifError((await privileged.from("profiles").update({ role }).eq("id", id)).error);
  const jar = new Map();
  const client = createServerClient(url, publishableKey, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)),
  } });
  assert.ifError((await client.auth.signInWithPassword({ email, password })).error);
  return {
    id, email,
    cookie: () => [...jar].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; "),
  };
}

async function call(user, route, method = "GET", body) {
  const response = await fetch(`${site}${route}`, {
    method,
    redirect: "manual",
    headers: { Cookie: user?.cookie() ?? "", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, payload: await response.json().catch(() => ({})) };
}

async function passPractice(user, exercise) {
  const expected = exercise.config?.answer;
  let answer;
  if (exercise.type === "PREDICT_OUTPUT" && typeof expected?.output === "string") {
    answer = { output: expected.output };
  } else if (["PSEUDOCODE", "FLOWCHART"].includes(exercise.type) && typeof expected?.choiceId === "string") {
    answer = { choiceId: expected.choiceId };
  } else if (["PSEUDOCODE", "FLOWCHART"].includes(exercise.type) && Array.isArray(expected?.order)) {
    answer = { order: expected.order };
  } else {
    assert.fail(`${exercise.title} has no supported deterministic answer fixture.`);
  }
  let result;
  for (let retry = 0; retry < 2; retry++) {
    result = await call(user, `/api/exercises/${exercise.id}/check`, "POST", { pathSlug, answer });
    if (result.response.status !== 429 || retry === 1) break;
    await new Promise((resolve) => setTimeout(resolve, 65_000));
  }
  assert.equal(result.response.status, 200, `${exercise.title}: ${JSON.stringify(result.payload)}`);
  assert.equal(result.payload.passed, true, `${exercise.title} was not accepted.`);
  assert.equal(result.payload.lessonCompleted, true, `${exercise.title} did not complete its lesson.`);
}

async function passAssessment(user, assessment, lessonId, exerciseId) {
  const started = await call(user, `/api/assessments/${assessment.slug}/start`, "POST");
  assert.equal(started.response.status, 200, `${assessment.slug}: ${JSON.stringify(started.payload)}`);
  const session = await call(user, `/api/assessment-sessions/${started.payload.sessionId}`);
  assert.equal(session.response.status, 200, JSON.stringify(session.payload));
  const serialized = JSON.stringify(session.payload);
  for (const privateField of ["answer_config", "expected_output", "is_hidden", "assessment_test_cases"]) {
    assert.ok(!serialized.includes(privateField), `Private ${privateField} reached the learner payload.`);
  }

  const blockedTutor = await call(user, "/api/ai/tutor", "POST", {
    lessonId, exerciseId, action: "hint", message: "Tolong beri petunjuk.",
  });
  assert.equal(blockedTutor.response.status, 403, "AI Tutor must be blocked during an active assessment.");
  const blockedTutorHistory = await call(user, `/api/ai/tutor?lessonId=${lessonId}&exerciseId=${exerciseId}`);
  assert.equal(blockedTutorHistory.response.status, 403, "Chatbot history must also be blocked during an active assessment.");
  const pausedPlayground = await fetch(`${site}/playground`, { headers: { Cookie: user.cookie() } });
  assert.equal(pausedPlayground.status, 200);
  assert.match(await pausedPlayground.text(), /Playground dijeda/, "Standalone SQL Playground must pause during an active assessment.");

  const { data: privateItems, error } = await privileged.from("assessment_items")
    .select("id, answer_config").eq("assessment_id", assessment.id);
  assert.ifError(error);
  const answers = session.payload.items.map((item) => {
    const answer = privateItems.find((entry) => entry.id === item.id)?.answer_config;
    assert.ok(answer && typeof answer === "object", `Missing private test fixture for ${item.title}.`);
    return { itemId: item.id, answer };
  });
  const submitted = await call(user, `/api/assessment-sessions/${started.payload.sessionId}/submit`, "POST", { answers });
  assert.equal(submitted.response.status, 200, JSON.stringify(submitted.payload));
  assert.equal(submitted.payload.score, 100, `${assessment.slug} trusted grading failed.`);
  assert.equal(submitted.payload.passed, true);
  for (const privateField of ["answer_config", "expected_output", "assessment_test_cases"]) {
    assert.ok(!JSON.stringify(submitted.payload).includes(privateField), `Private ${privateField} reached assessment feedback.`);
  }
}

try {
  await waitForSite();
  const learner = await createAccount("USER");
  const admin = await createAccount("ADMIN");
  const path = await privileged.from("learning_paths").select("id").eq("slug", pathSlug).eq("is_published", true).single();
  assert.ifError(path.error);
  const chaptersResult = await privileged.from("chapters").select("id, position").eq("learning_path_id", path.data.id).eq("is_published", true).order("position");
  assert.ifError(chaptersResult.error);
  const chapterOrder = new Map(chaptersResult.data.map((chapter) => [chapter.id, chapter.position]));
  const lessonsResult = await privileged.from("lessons").select("id, chapter_id, slug, title, is_preview, position")
    .in("chapter_id", [...chapterOrder.keys()]).eq("is_published", true).order("position");
  assert.ifError(lessonsResult.error);
  const lessons = [...lessonsResult.data].sort((a, b) => chapterOrder.get(a.chapter_id) - chapterOrder.get(b.chapter_id) || a.position - b.position);
  assert.equal(lessons.length, 11, "The published course should contain eleven lessons in three main topics.");
  assert.deepEqual(chaptersResult.data.map((chapter) => chapter.position), [1, 2, 3]);
  const lessonIds = lessons.map((lesson) => lesson.id);
  const exercisesResult = await privileged.from("exercises").select("id, lesson_id, type, title, config, position")
    .in("lesson_id", lessonIds).eq("is_published", true).eq("is_required", true).order("position");
  assert.ifError(exercisesResult.error);
  const exercisesByLesson = new Map();
  for (const exercise of exercisesResult.data) {
    const rows = exercisesByLesson.get(exercise.lesson_id) ?? [];
    rows.push(exercise);
    exercisesByLesson.set(exercise.lesson_id, rows);
  }
  assert.ok(lessons.every((lesson) => (exercisesByLesson.get(lesson.id) ?? []).length === 1), "Every required material needs exactly one mandatory practice check.");

  const { data: assessments, error: assessmentsError } = await privileged.from("assessments")
    .select("id, slug, type, gate_after_chapter, position").eq("learning_path_id", path.data.id).eq("is_published", true).order("position");
  assert.ifError(assessmentsError);
  assert.equal(assessments.length, 4, "The database course should have three checkpoints and a final assessment.");

  assert.equal((await call(null, "/dashboard")).response.status, 307);
  assert.equal((await call(null, "/chatbot")).response.status, 307, "Chatbot must require a signed-in account.");
  assert.equal((await call(null, "/playground")).response.status, 307, "SQL Playground must require a signed-in account.");
  assert.equal((await call(learner, "/dashboard")).response.status, 200);
  assert.equal((await call(learner, "/chatbot")).response.status, 200);
  assert.equal((await call(learner, "/playground")).response.status, 200);
  assert.equal((await call(learner, "/admin")).response.status, 307);
  assert.equal((await call(learner, "/api/admin/users")).response.status, 403);
  const blockedBeforePrerequisite = await call(learner, `/api/assessments/${assessments[0].slug}/start`, "POST");
  assert.equal(blockedBeforePrerequisite.response.status, 403, "A checkpoint must remain unavailable before its lesson requirements.");

  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await context.addCookies(learner.cookie().split("; ").map((part) => {
    const [name, ...value] = part.split("=");
    return { name, value: decodeURIComponent(value.join("=")), url: site };
  }));
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(60_000);
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto(`${site}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /Selamat datang kembali/ }).waitFor();
  await page.locator('summary[aria-label="Lainnya"]').click();
  await page.getByRole("navigation", { name: "Navigasi utama", exact: true }).getByRole("link", { name: "Chatbot", exact: true }).waitFor();
  await page.getByRole("navigation", { name: "Navigasi utama", exact: true }).getByRole("link", { name: "SQL Playground", exact: true }).waitFor();
  await page.locator('summary[aria-label="Lainnya"]').click();
  await page.getByRole("link", { name: "Mulai belajar" }).click();
  await page.waitForURL(`${site}/learn/${pathSlug}`);
  await page.locator(`a[href="/learn/${pathSlug}/lessons/${lessons[0].slug}"]`).first().click();
  await page.waitForURL(new RegExp(`/learn/${pathSlug}/lessons/${lessons[0].slug}$`));
  await page.locator("main h1").filter({ hasText: lessons[0].title }).waitFor();
  const dataPreview = page.getByRole("region", { name: "Jelajahi tabel dan relasi", exact: true });
  await dataPreview.waitFor();
  assert.equal(await dataPreview.getByRole("table").count(), 1, "Relasi shows one selectable record table at a time.");
  const tableChoices = dataPreview.getByRole("group", { name: "Pilih tabel untuk melihat record", exact: true });
  await tableChoices.getByRole("button", { name: /^enrollments/ }).click();
  await tableChoices.getByRole("button", { name: /^courses/ }).click();
  await tableChoices.getByRole("button", { name: /^students/ }).click();
  assert.equal(await page.locator("#database-sql").count(), 0, "Relasi should not show a SQL editor.");
  await page.getByRole("heading", { name: "Latihan per submateri" }).waitFor();
  await page.getByRole("heading", { name: exercisesByLesson.get(lessons[0].id)[0].title }).waitFor();
  await page.getByRole("button", { name: "Mulai lesson" }).click();
  await page.getByText("Sedang berjalan").waitFor();
  const tutorHistory = await call(learner, `/api/ai/tutor?lessonId=${lessons[0].id}`);
  assert.equal(tutorHistory.response.status, 200, `Contextual chatbot history failed: ${JSON.stringify(tutorHistory.payload)}`);
  await page.goto(`${site}/chatbot`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Chatbot", exact: true }).waitFor();
  await page.getByText(lessons[0].title, { exact: true }).waitFor();
  await page.getByRole("link", { name: "Buka lesson" }).waitFor();
  const chatbotWidths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  assert.ok(chatbotWidths.content <= chatbotWidths.viewport, `Chatbot overflowed mobile width: ${JSON.stringify(chatbotWidths)}.`);
  await page.goto(`${site}/playground`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "SQL Playground" }).waitFor();
  const standaloneLab = page.getByRole("region", { name: "Praktik query basis data" });
  await standaloneLab.locator("#database-sql").fill("SELECT name, cohort FROM students WHERE cohort = '2025' ORDER BY name;");
  await standaloneLab.locator("#database-prediction").fill("2");
  await standaloneLab.getByRole("button", { name: "Jalankan SELECT" }).click();
  await page.locator("#lab-results").getByRole("cell", { name: "Alya" }).waitFor();
  const playgroundWidths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  assert.ok(playgroundWidths.content <= playgroundWidths.viewport, `SQL Playground overflowed mobile width: ${JSON.stringify(playgroundWidths)}.`);
  await page.goto(`${site}/learn/${pathSlug}/lessons/${lessons[0].slug}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Atur ulang" }).waitFor();
  const relationCanvas = page.getByRole("group", { name: "Canvas struktur tabel basis data" });
  const tableCanvas = relationCanvas.getByRole("group", { name: /^Area skema\./ });
  await tableCanvas.waitFor();
  await tableCanvas.scrollIntoViewIfNeeded();
  const canvasWorkspace = tableCanvas.locator(":scope > div");
  await relationCanvas.getByRole("button", { name: "Perbesar canvas" }).click();
  assert.ok(parseInt(await relationCanvas.locator("span[aria-live]").innerText()) > 0);
  await tableCanvas.press("ArrowRight");
  assert.match(await canvasWorkspace.getAttribute("style"), /translate/, "Keyboard pan should move the schema workspace.");
  await relationCanvas.getByRole("button", { name: "Atur ulang" }).click();
  assert.ok(parseInt(await relationCanvas.locator("span[aria-live]").innerText()) > 0);
  const mobileWidths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  assert.ok(mobileWidths.content <= mobileWidths.viewport, `Lesson overflowed mobile width: ${JSON.stringify(mobileWidths)}.`);
  const exerciseData = page.locator("details > summary", { hasText: "Jelajahi tabel dan relasinya" }).first();
  await exerciseData.scrollIntoViewIfNeeded();
  await exerciseData.click();
  await exerciseData.locator("xpath=..").getByRole("group", { name: "Canvas struktur tabel basis data" }).waitFor();

  for (let index = 0; index < lessons.length; index++) {
    const lesson = lessons[index];
    for (const exercise of exercisesByLesson.get(lesson.id) ?? []) await passPractice(learner, exercise);
    const chapterEndsHere = lessons[index + 1]?.chapter_id !== lesson.chapter_id;
    if (chapterEndsHere) {
      const gate = assessments.find((assessment) => assessment.type === "CHECKPOINT" && assessment.gate_after_chapter === chapterOrder.get(lesson.chapter_id));
      if (gate) {
        const trigger = exercisesByLesson.get(lesson.id)?.[0];
        await passAssessment(learner, gate, lesson.id, trigger.id);
      }
    }
  }
  const finalAssessment = assessments.find((assessment) => assessment.type === "FINAL");
  assert.ok(finalAssessment);
  await passAssessment(learner, finalAssessment, lessons.at(-1).id, exercisesByLesson.get(lessons.at(-1).id)[0].id);

  const readLesson = lessons.find((lesson) => lesson.slug === "memilih-sumber-dan-kolom");
  assert.ok(readLesson, "The first Read material should be present.");
  await page.goto(`${site}/learn/${pathSlug}/lessons/${readLesson.slug}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Praktik di lab" }).waitFor();
  const labRegion = page.getByRole("region", { name: "Praktik query basis data" });
  const sqlEditor = labRegion.locator("#database-sql");
  await sqlEditor.fill("SELECT name, cohort FROM students WHERE cohort = '2025' ORDER BY name;");
  await labRegion.locator("#database-prediction").fill("2");
  await labRegion.getByRole("button", { name: "Jalankan SELECT" }).click();
  await page.locator("#lab-results").getByRole("cell", { name: "Alya" }).waitFor();

  const guestLesson = lessons.find((lesson) => lesson.is_preview);
  assert.ok(guestLesson, "At least one preview lesson should remain readable to guests.");
  const guestRequest = await fetch(`${site}/learn/${pathSlug}/lessons/${guestLesson.slug}`);
  assert.equal(guestRequest.status, 200);
  const oldPath = await fetch(`${site}/learn/programming-logic-fundamentals`);
  const oldPathBody = await oldPath.text();
  assert.match(oldPathBody, /Lesson belum tersedia/, "Retired course routes must render the unavailable state.");
  assert.doesNotMatch(oldPathBody, /Programming Logic Fundamentals|What is Computational Thinking\?/i, "Retired programming material must not be public.");
  assert.deepEqual(browserErrors, [], `Database lesson browser errors: ${browserErrors.join("; ")}`);
  await context.close();

  const dashboard = await call(learner, "/dashboard");
  assert.equal(dashboard.response.status, 200);
  const grades = await call(admin, "/api/admin/users");
  assert.equal(grades.response.status, 200, JSON.stringify(grades.payload));
  const row = grades.payload.items.find((item) => item.id === learner.id);
  assert.equal(row.completed_lessons, 11);
  assert.equal(row.assessments_passed, 4);
  console.log("Protected Chatbot/context history, standalone browser SQL Playground, Relasi/Read/Write learning flow, practice, checkpoint gates, assessment AI block, hidden-answer payload, and admin gradebook passed.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  for (const id of userIds) assert.ifError((await privileged.auth.admin.deleteUser(id)).error);
}
