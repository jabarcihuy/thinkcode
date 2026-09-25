import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
assert.ok(url && publishableKey && secretKey, "Supabase URL, publishable key, and secret key are required.");

const privileged = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `javascript-flow-${randomUUID()}@example.invalid`;
const password = randomBytes(24).toString("base64url");
const { data: created, error: createError } = await privileged.auth.admin.createUser({ email, password, email_confirm: true });
assert.ifError(createError);
const userId = created.user?.id;
assert.ok(userId);

const pathSlug = "programming-logic-fundamentals";
const lessonUrl = (slug) => `${site}/learn/${pathSlug}/lessons/${slug}`;

async function replaceEditor(page, container, source) {
  const editor = page.locator(`${container} .monaco-editor`).first();
  await editor.waitFor({ timeout: 25_000 }).catch(async () => {
    await page.screenshot({ path: "/tmp/thinkcode-editor-debug.png" });
    throw new Error(`Editor unavailable at ${page.url()}: ${(await page.locator("body").innerText()).slice(0, 700)}`);
  });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(source);
}

try {
  const jar = new Map();
  const user = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const { error: signInError } = await user.auth.signInWithPassword({ email, password });
  assert.ifError(signInError);
  const cookie = () => [...jar].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; ");

  async function passAssessment(slug, answerForTitle) {
    const start = await fetch(`${site}/api/assessments/${slug}/start`, { method: "POST", headers: { Cookie: cookie() } });
    const started = await start.json();
    assert.equal(start.status, 200, JSON.stringify(started));
    const repeatedStart = await fetch(`${site}/api/assessments/${slug}/start`, { method: "POST", headers: { Cookie: cookie() } });
    const repeated = await repeatedStart.json();
    assert.equal(repeatedStart.status, 200, JSON.stringify(repeated));
    assert.equal(repeated.sessionId, started.sessionId, "Starting the same assessment again must reuse its active session.");
    const sessionResponse = await fetch(`${site}/api/assessment-sessions/${started.sessionId}`, { headers: { Cookie: cookie() } });
    const session = await sessionResponse.json();
    assert.equal(sessionResponse.status, 200, JSON.stringify(session));
    const anonymousRead = await fetch(`${site}/api/assessment-sessions/${started.sessionId}`);
    assert.equal(anonymousRead.status, 401, "Guests cannot read an assessment session.");
    const serialized = JSON.stringify(session);
    assert.ok(!serialized.includes("answer_config") && !serialized.includes("expected_output") && !serialized.includes("is_hidden"), "Private answers or tests reached the assessment client payload.");
    const { data: hiddenCases, error: hiddenError } = await privileged.from("assessment_test_cases")
      .select("args, expected_output").eq("is_hidden", true)
      .in("assessment_item_id", session.items.map((item) => item.id));
    assert.ifError(hiddenError);
    const hiddenMarkers = (hiddenCases ?? []).flatMap((test) => [test.expected_output, JSON.stringify(test.args)])
      .filter((marker) => marker.length >= 6);
    assert.ok(hiddenMarkers.every((marker) => !serialized.includes(marker)), "A hidden value reached the assessment session response.");
    if (slug === "checkpoint-1") {
      const aiAttempt = await fetch(`${site}/api/ai/tutor`, {
        method: "POST", headers: { Cookie: cookie(), "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: firstLesson.id, exerciseId: firstExercise.id, action: "hint" }),
      });
      assert.equal(aiAttempt.status, 403, "AI must be blocked during an active assessment.");
    }
    const answers = session.items.map((item) => ({ itemId: item.id, answer: answerForTitle(item.title) }));
    const submitted = await fetch(`${site}/api/assessment-sessions/${started.sessionId}/submit`, {
      method: "POST", headers: { Cookie: cookie(), "Content-Type": "application/json" }, body: JSON.stringify({ answers }),
    });
    const result = await submitted.json();
    assert.equal(submitted.status, 200, JSON.stringify(result));
    assert.equal(result.score, 100, `${slug} should receive a trusted passing score: ${JSON.stringify(result)}`);
    assert.equal(result.passed, true);
    assert.ok(!JSON.stringify(result).includes("expected_output") && !JSON.stringify(result).includes("args"), "Hidden grader data reached the submit response.");
    assert.ok(hiddenMarkers.every((marker) => !JSON.stringify(result).includes(marker)), "A hidden value reached the assessment result response.");
    return { result, sessionId: started.sessionId };
  }

  const dashboard = await fetch(`${site}/dashboard`, { headers: { Cookie: cookie() }, redirect: "manual" });
  assert.equal(dashboard.status, 200, "Authenticated dashboard should remain available.");
  const learningPath = await fetch(`${site}/learn/${pathSlug}`, { headers: { Cookie: cookie() }, redirect: "manual" });
  assert.equal(learningPath.status, 200, "Learning path should remain available.");
  const guestDashboard = await fetch(`${site}/dashboard`, { redirect: "manual" });
  assert.equal(guestDashboard.status, 307, "Guest dashboard should remain protected.");

  const lockedBefore = await fetch(lessonUrl("decomposition"), { headers: { Cookie: cookie() }, redirect: "manual" });
  assert.equal(lockedBefore.status, 404, "Second lesson should initially be locked.");
  const adminDenied = await fetch(`${site}/admin`, { headers: { Cookie: cookie() }, redirect: "manual" });
  assert.equal(adminDenied.status, 307, "USER should be redirected away from admin.");
  assert.ok(adminDenied.headers.get("location")?.endsWith("/dashboard"));
  const { data: firstLesson, error: firstLessonError } = await privileged.from("lessons").select("id").eq("slug", "what-is-computational-thinking").single();
  assert.ifError(firstLessonError);
  const { data: firstExercise, error: firstExerciseError } = await privileged.from("exercises").select("id").eq("lesson_id", firstLesson.id).single();
  assert.ifError(firstExerciseError);
  if (process.env.AI_SMOKE === "1") {
    const aiResponse = await fetch(`${site}/api/ai/tutor`, {
      method: "POST", headers: { Cookie: cookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: firstLesson.id, exerciseId: firstExercise.id, action: "hint", message: "Beri satu petunjuk singkat.", sourceCode: "let total = 2;", visibleOutput: "", visibleTestResults: [], traceSummary: "total: 2" }),
    });
    assert.equal(aiResponse.status, 200, `Practice AI should stream successfully: ${await aiResponse.clone().text()}`);
    assert.equal(aiResponse.headers.get("x-ai-hint-level"), "1");
    assert.equal(await aiResponse.text(), "Mocked tutor hint.");
    const historyResponse = await fetch(`${site}/api/ai/tutor?lessonId=${firstLesson.id}&exerciseId=${firstExercise.id}`, { headers: { Cookie: cookie() } });
    const history = await historyResponse.json();
    assert.equal(historyResponse.status, 200);
    assert.ok(history.messages.some((message) => message.content.includes("Beri satu petunjuk singkat.")));
    assert.ok(history.messages.some((message) => message.content === "Mocked tutor hint."));
    assert.ok(!JSON.stringify(history).includes("let total = 2"), "Source code should not be persisted in tutor history.");
  }
  const guestCheck = await fetch(`${site}/api/exercises/${firstExercise.id}/check`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathSlug, answer: { order: ["split", "solve", "combine"] } }) });
  assert.equal(guestCheck.status, 401);
  const check = await fetch(`${site}/api/exercises/${firstExercise.id}/check`, {
    method: "POST", headers: { Cookie: cookie(), "Content-Type": "application/json" },
    body: JSON.stringify({ pathSlug, answer: { order: ["split", "solve", "combine"] } }),
  });
  const checked = await check.json();
  assert.equal(check.status, 200, JSON.stringify(checked));
  assert.equal(checked.passed, true);
  assert.equal(checked.lessonCompleted, true);
  const unlockedAfter = await fetch(lessonUrl("decomposition"), { headers: { Cookie: cookie() }, redirect: "manual" });
  assert.equal(unlockedAfter.status, 200);

  const { data: chapters, error: chaptersError } = await privileged.from("chapters").select("id, position");
  assert.ifError(chaptersError);
  const chapterPosition = new Map(chapters.map((chapter) => [chapter.id, chapter.position]));
  const { data: lessons, error: lessonsError } = await privileged.from("lessons").select("id, slug, chapter_id, position");
  assert.ifError(lessonsError);
  const beforeVariables = lessons.filter((lesson) => chapterPosition.get(lesson.chapter_id) < 4 && lesson.id !== firstLesson.id)
    .sort((a, b) => chapterPosition.get(a.chapter_id) - chapterPosition.get(b.chapter_id) || a.position - b.position);
  for (const lesson of beforeVariables) {
    const { data: exercises, error } = await privileged.from("exercises").select("id").eq("lesson_id", lesson.id).order("position");
    assert.ifError(error);
    for (const exercise of exercises) {
      const { error: recordError } = await privileged.rpc("phase3_record_attempt", {
        p_user_id: userId, p_exercise_id: exercise.id, p_source_code: "", p_answer: { fixture: true },
        p_score: 100, p_passed: true, p_feedback: { fixture: true },
      });
      assert.ifError(recordError);
    }
  }
  const checkpoint1 = await passAssessment("checkpoint-1", (title) => {
    if (title === "Nilai berubah") return { output: "6" };
    if (title === "Rancang langkah") return { choiceId: "b" };
    if (title === "Buat fungsi sapaan") return { sourceCode: 'function greet(name) { return "Halo, " + name + "!"; }' };
    throw new Error(`Unexpected checkpoint question: ${title}`);
  });
  assert.equal(checkpoint1.result.hiddenPassed, 1);

  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addCookies([...jar].map(([name, value]) => ({ name, value, url: site })));
    const page = await context.newPage();
    const browserErrors = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("requestfailed", (request) => {
      if (request.failure()?.errorText !== "net::ERR_ABORTED" && request.url().includes("/_next/static/")) browserErrors.push(`Asset failed: ${request.url()}`);
    });
    page.on("response", (response) => { if (response.status() >= 400 && response.url().includes("/_next/static/")) browserErrors.push(`HTTP ${response.status()}: ${response.url()}`); });
    async function assertResponsive(route) {
      await page.goto(`${site}${route}`, { waitUntil: "domcontentloaded" });
      for (const width of [360, 768, 1280]) {
        await page.setViewportSize({ width, height: 820 });
        await page.waitForTimeout(100);
        const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
        assert.ok(dimensions.content <= dimensions.viewport, `Horizontal overflow at ${width}px on ${route}: ${JSON.stringify(dimensions)}`);
      }
    }
    await assertResponsive("/");
    await assertResponsive("/dashboard");
    await assertResponsive(`/learn/${pathSlug}`);
    await assertResponsive(new URL(lessonUrl("first-javascript-program")).pathname);
    await assertResponsive("/assessments");
    await page.setViewportSize({ width: 1440, height: 900 });
    assert.equal((await page.goto(lessonUrl("first-javascript-program"), { waitUntil: "domcontentloaded" }))?.status(), 200);
    assert.ok(page.url().includes("first-javascript-program"), `Unexpected route ${page.url()}`);
    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', "let a = 2;\nlet b = 3;\nconsole.log(a + b);").catch((error) => { throw new Error(`${error.message}\nBrowser errors: ${browserErrors.join("; ")}`); });
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await page.locator('section[aria-label="JavaScript Lab"] section[aria-label="Hasil eksekusi"]').getByText("5", { exact: true }).waitFor({ timeout: 10_000 });
    await page.getByRole("button", { name: "Visualize Execution" }).click();
    await page.getByRole("region", { name: "Visualisasi eksekusi" }).getByText("a", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Langkah berikutnya" }).click();
    await page.getByRole("button", { name: "Reset visualisasi" }).click();

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'console.log(typeof document, typeof window, typeof localStorage, typeof parent, typeof process);');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    const isolationOutput = page.locator('section[aria-label="JavaScript Lab"] section[aria-label="Hasil eksekusi"] pre').last();
    await isolationOutput.getByText("undefined undefined undefined undefined undefined").waitFor();

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'let x = 2;\nx = 5;\nconst values = [5, 8, 3];\nif (x > 3) { console.log(values[1]); }\nfor (let i = 0; i < 2; i++) { x += i; }\nfunction add(n) { return n + 1; }\nconsole.log(add(x));');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    const mixedPanel = page.locator('section[aria-label="JavaScript Lab"] section[aria-label="Hasil eksekusi"]');
    await mixedPanel.getByText("Berhasil dijalankan").waitFor({ timeout: 10_000 }).catch(async () => { throw new Error(`Mixed program failed: ${await mixedPanel.innerText()}`); });
    assert.ok((await mixedPanel.locator("pre").allTextContents()).some((text) => text.includes("8") && text.includes("7")), await mixedPanel.innerText());
    await page.getByRole("button", { name: "Visualize Execution" }).click();
    const traceRegion = page.getByRole("region", { name: "Visualisasi eksekusi" });
    const seen = [];
    const nextStep = page.getByRole("button", { name: "Langkah berikutnya" });
    for (let index = 0; index < 35; index++) {
      seen.push(await traceRegion.innerText());
      if (await nextStep.isDisabled()) break;
      await nextStep.click();
    }
    assert.ok(seen.some((text) => text.includes("Kondisi benar")), "Condition missing from trace.");
    assert.ok(seen.some((text) => text.includes("Iterasi")), "Loop missing from trace.");
    assert.ok(seen.some((text) => text.includes("Panggil add")), `Function call missing from trace: ${seen.map((text) => text.split("\n").find((line) => /Panggil|Kondisi|Iterasi|Baca|Return/.test(line)) ?? "").join(" | ")}`);
    assert.ok(seen.some((text) => text.includes("Baca values[1]")), "Array access missing from trace.");

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'console.log("one"); console.log("two"); console.error("warning");');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await page.waitForFunction(() => {
      const panel = document.querySelector('section[aria-label="JavaScript Lab"] section[aria-label="Hasil eksekusi"]');
      return panel?.textContent?.includes("one") && panel.textContent.includes("two") && panel.textContent.includes("warning");
    }, undefined, { timeout: 10_000 }).catch(async () => { throw new Error(`Multiple log result: ${await mixedPanel.innerText()}`); });

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'let = ;');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await mixedPanel.getByText("Syntax Error").waitFor();

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'throw new Error("boom");');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await mixedPanel.getByText("boom").waitFor();

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'let x = 1;');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await mixedPanel.getByText("Program selesai tanpa menghasilkan output.").waitFor();

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'for (let i = 0; i < 150; i++) { console.log("x".repeat(100)); }');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await mixedPanel.getByText("Output dibatasi agar halaman tetap responsif.").waitFor();

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', 'for (let i = 0; i < 300; i++) { let x = i; }');
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await mixedPanel.getByText("Berhasil dijalankan").waitFor();
    await page.getByRole("button", { name: "Visualize Execution" }).click();
    await page.getByText("Trace limited to 200 steps").waitFor();

    await replaceEditor(page, 'section[aria-label="JavaScript Lab"]', "while (true) {}");
    await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).click();
    await page.getByText("Execution stopped: time limit exceeded.").waitFor({ timeout: 10_000 });
    assert.equal(await page.locator('section[aria-label="JavaScript Lab"]').getByRole("button", { name: "Run", exact: true }).isEnabled(), true, "Main UI froze after infinite loop.");

    assert.equal((await page.goto(lessonUrl("variables-and-types"), { waitUntil: "domcontentloaded" }))?.status(), 200);
    await replaceEditor(page, 'section[aria-label="Jumlah dua angka"]', "const [a, b] = input.trim().split(/\\s+/).map(Number);\nconsole.log(a + b);");
    await page.locator('section[aria-label="Jumlah dua angka"]').getByRole("button", { name: "Check Answer" }).click();
    await page.locator('section[aria-label="Jumlah dua angka"]').getByText("Jawaban benar").waitFor({ timeout: 15_000 });
    const { data: variableLesson } = await privileged.from("lessons").select("id").eq("slug", "variables-and-types").single();
    const { data: codingExercise } = await privileged.from("exercises").select("id").eq("lesson_id", variableLesson.id).eq("position", 1).single();
    const { data: attempts, error: attemptsError } = await privileged.from("exercise_attempts").select("passed, score").eq("user_id", userId).eq("exercise_id", codingExercise.id);
    assert.ifError(attemptsError);
    assert.equal(attempts?.at(-1)?.passed, true);
    await page.locator('section[aria-label="Nilai variabel berubah"] textarea').fill("5");
    await page.locator('section[aria-label="Nilai variabel berubah"]').getByRole("button", { name: "Check Answer" }).click();
    await page.locator('section[aria-label="Nilai variabel berubah"]').getByText("Jawaban benar").waitFor({ timeout: 10_000 });
    assert.equal((await fetch(lessonUrl("basic-operators"), { headers: { Cookie: cookie() }, redirect: "manual" })).status, 200, "Chapters 4–6 remain available so the learner can complete Checkpoint 2 prerequisites.");

    const beforeCheckpoint2 = lessons.filter((lesson) => {
      const position = chapterPosition.get(lesson.chapter_id);
      return position >= 4 && position <= 6 && lesson.slug !== "variables-and-types";
    }).sort((a, b) => chapterPosition.get(a.chapter_id) - chapterPosition.get(b.chapter_id) || a.position - b.position);
    for (const lesson of beforeCheckpoint2) {
      const { data: exercises, error } = await privileged.from("exercises").select("id").eq("lesson_id", lesson.id).order("position");
      assert.ifError(error);
      for (const exercise of exercises) {
        const { error: recordError } = await privileged.rpc("phase3_record_attempt", {
          p_user_id: userId, p_exercise_id: exercise.id, p_source_code: "", p_answer: { fixture: true },
          p_score: 100, p_passed: true, p_feedback: { fixture: true },
        });
        assert.ifError(recordError);
      }
    }
  const checkpoint2 = await passAssessment("checkpoint-2", (title) => {
      if (title === "Perbaiki kategori nilai") return { sourceCode: 'function classifyScore(score) { return score >= 75 ? "Pass" : "Retry"; }' };
      if (title === "Evaluasi ekspresi") return { output: "14" };
      if (title === "Pilih cabang") return { choiceId: "b" };
      throw new Error(`Unexpected checkpoint question: ${title}`);
  });
  assert.equal(checkpoint2.result.hiddenPassed, 1);
  assert.equal((await fetch(lessonUrl("basic-operators"), { headers: { Cookie: cookie() }, redirect: "manual" })).status, 200);

  const checkpoint3 = await passAssessment("checkpoint-3", (title) => {
    if (title === "Jumlahkan isi array") return { sourceCode: "function sumArray(values) { return values.reduce((sum, value) => sum + value, 0); }" };
    if (title === "Telusuri loop") return { output: "6" };
    if (title === "Urutkan pencarian nilai") return { order: ["init", "compare", "update", "return"] };
    throw new Error(`Unexpected checkpoint question: ${title}`);
  });
  assert.equal(checkpoint3.result.hiddenPassed, 2);

  const final = await passAssessment("final-assessment", (title) => {
    if (title === "Jumlahkan angka genap") return { sourceCode: "function sumEven(values) { return values.filter(value => value % 2 === 0).reduce((sum, value) => sum + value, 0); }" };
    if (title === "Perbaiki pencarian maksimum") return { sourceCode: "function findMax(values) { return Math.max(...values); }" };
    if (title === "Pilih urutan keputusan") return { choiceId: "a" };
    throw new Error(`Unexpected final assessment question: ${title}`);
  });
  assert.equal(final.result.hiddenPassed, 3);

    const uiRetry = await fetch(`${site}/api/assessments/checkpoint-1/start`, { method: "POST", headers: { Cookie: cookie() } });
    const uiRetryPayload = await uiRetry.json();
    assert.equal(uiRetry.status, 200, JSON.stringify(uiRetryPayload));
    const uiSessionResponse = await fetch(`${site}/api/assessment-sessions/${uiRetryPayload.sessionId}`, { headers: { Cookie: cookie() } });
    const uiSession = await uiSessionResponse.json();
    assert.equal(uiSessionResponse.status, 200, JSON.stringify(uiSession));
    await page.goto(`${site}/assessments/sessions/${uiRetryPayload.sessionId}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
    for (const [index, item] of uiSession.items.entries()) {
      if (index > 0) await page.getByRole("button", { name: `Soal ${index + 1}` }).click();
      if (item.type === "PREDICT_OUTPUT") await page.getByLabel("Prediksi output").fill("6");
      else if (["CODE_COMPLETION", "DEBUGGING", "PROBLEM_SOLVING"].includes(item.type)) {
        await replaceEditor(page, 'article[aria-labelledby^="question-title-"]', 'function greet(name) { return "Halo, " + name + "!"; }');
      } else if (item.type === "PSEUDOCODE" || item.type === "FLOWCHART") {
        const config = item.publicConfig;
        const radio = page.getByRole("radio");
        if (await radio.count()) await radio.nth(1).check();
        else if (config.mode === "order") {
          const blocks = config.blocks;
          const privateConfig = await privileged.from("assessment_items").select("answer_config").eq("id", item.id).single();
          assert.ifError(privateConfig.error);
          const desired = privateConfig.data.answer_config.order;
          for (let position = 0; position < desired.length; position++) {
            const currentOrder = await page.locator('article[aria-labelledby^="question-title-"] ol li').allTextContents();
            const currentId = blocks.find((block) => currentOrder[position]?.includes(block.text))?.id;
            const targetIndex = currentOrder.findIndex((text, foundIndex) => foundIndex >= position && text.includes(blocks.find((block) => block.id === desired[position]).text));
            if (currentId !== desired[position] && targetIndex > position) await page.getByRole("button", { name: `Pindahkan langkah ${targetIndex + 1} ke atas` }).click();
          }
        }
      }
      const questionStatus = page.getByRole("button", { name: new RegExp(`Soal ${index + 1}.*Terisi`) });
      await questionStatus.waitFor({ timeout: 3_000 }).catch(async () => {
        const status = await page.getByRole("button", { name: new RegExp(`Soal ${index + 1}`) }).innerText();
        throw new Error(`Assessment answer ${index + 1} was not recorded (${item.type}): ${status}; ${await page.locator('article[aria-labelledby^="question-title-"]').innerText()}`);
      });
      if (index < uiSession.items.length - 1) await page.getByRole("button", { name: "Berikutnya" }).click();
    }
    await page.getByRole("button", { name: "Submit Assessment" }).click();
    await page.getByRole("dialog", { name: "Kirim jawaban assessment?" }).getByRole("button", { name: "Kirim jawaban" }).click();
    await page.waitForURL(`**/assessments/sessions/${uiRetryPayload.sessionId}/result`, { timeout: 20_000 });
    await page.getByRole("heading", { name: /Checkpoint 1/ }).waitFor({ timeout: 10_000 });

    if (process.env.CAPTURE_UI === "1") {
      await page.locator('section[aria-label="JavaScript Lab"]').screenshot({ path: "/tmp/thinkcode-javascript-workspace-desktop.png" });
      await page.locator('section[aria-label="Jumlah dua angka"]').screenshot({ path: "/tmp/thinkcode-javascript-practice-desktop.png" });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: "/tmp/thinkcode-javascript-lesson-mobile.png", fullPage: true });
    }
    assert.deepEqual(browserErrors, [], `Browser errors: ${browserErrors.join("; ")}`);
    await context.close();
  } finally { await browser.close(); }
  console.log("JavaScript browser Run, timeout, trace, Check, attempt, and unlock flow passed.");
} finally {
  const { error } = await privileged.auth.admin.deleteUser(userId);
  assert.ifError(error);
}
