import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
assert.ok(url && publishableKey && secretKey, "Supabase URL, publishable key, and secret key are required.");
const site = process.env.FLOW_TEST_SITE ?? "http://127.0.0.1:3214";
const pathSlug = "database-fundamentals";
const privileged = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const password = randomBytes(24).toString("base64url");
const userIds = [];
const server = spawn("npm", ["run", "start", "--", "-p", "3214"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
let serverLog = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { serverLog = (serverLog + chunk.toString()).slice(-4000); });

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
    await new Promise((resolve) => setTimeout(resolve, 30_000));
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
  assert.equal(result.response.status, 200, `${exercise.title}: ${JSON.stringify(result.payload)}`);
  assert.equal(result.payload.passed, true, `${exercise.title} was not accepted.`);
  return result.payload;
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
  const other = await createAccount("USER");
  const path = await privileged.from("learning_paths").select("id").eq("slug", pathSlug).eq("is_published", true).single();
  assert.ifError(path.error);
  const chapters = await privileged.from("chapters").select("id,position").eq("learning_path_id", path.data.id).eq("is_published", true).order("position");
  assert.ifError(chapters.error);
  const positions = new Map(chapters.data.map((row) => [row.id, row.position]));
  const lessonResult = await privileged.from("lessons").select("id,slug,chapter_id,position,example_sql").in("chapter_id", [...positions.keys()]).eq("is_published", true);
  assert.ifError(lessonResult.error);
  const lessons = lessonResult.data.sort((a,b) => positions.get(a.chapter_id)-positions.get(b.chapter_id)||a.position-b.position);
  const exerciseResult = await privileged.from("exercises").select("id,lesson_id,type,title,position,is_required,config").in("lesson_id", lessons.map((row) => row.id)).eq("is_published", true).order("position");
  assert.ifError(exerciseResult.error);
  const exercises = exerciseResult.data;
  assert.equal(lessons.length,11);
  assert.equal(exercises.length,44);
  assert.equal(exercises.filter((row)=>row.is_required).length,11);
  const first = exercises.filter((row)=>row.lesson_id === lessons[0].id);
  const second = exercises.find((row)=>row.lesson_id === lessons[1].id && row.is_required);
  assert.equal((await call(null, `/api/exercises/${first[0].id}/check`, "POST", {pathSlug, answer:first[0].config.answer})).response.status,401);
  assert.equal((await call(learner, `/api/exercises/${second.id}/check`, "POST", {pathSlug, answer:second.config.answer})).response.status,403);
  assert.equal((await call(learner, "/api/admin/users")).response.status,403);
  for (const optional of first.filter((row)=>!row.is_required)) {
    const result = await passPractice(learner,optional);
    assert.equal(result.lessonCompleted,false,"Optional practice must not complete a lesson");
  }
  assert.equal((await call(learner, `/api/exercises/${second.id}/check`, "POST", {pathSlug, answer:second.config.answer})).response.status,403);
  const jarClient = createClient(url,publishableKey,{auth:{persistSession:false}});
  const signIn = await jarClient.auth.signInWithPassword({email:learner.email,password});
  assert.ifError(signIn.error);
  const ownAttempts = await jarClient.from("exercise_attempts").select("user_id,exercise_id");
  assert.ifError(ownAttempts.error); assert.equal(ownAttempts.data.length,first.filter((row)=>!row.is_required).length);
  assert.ok(ownAttempts.data.every((row)=>row.user_id===learner.id));
  const directPrivate = await jarClient.from("exercises").select("config");
  assert.ok(directPrivate.error || directPrivate.data.length===0,"Private exercise config must not be public");
  const catalog = await jarClient.from("published_exercise_catalog").select("id,public_config").eq("lesson_id",lessons[0].id);
  assert.ifError(catalog.error); assert.equal(catalog.data.length,first.length);
  for(const row of catalog.data) for(const key of ["answer","grading","feedback"]) assert.ok(!(key in row.public_config));
  const wrong = await call(learner,`/api/exercises/${first[2].id}/check`,"POST",{pathSlug,answer:{choiceId:"WRONG"}});
  assert.equal(wrong.response.status,200); assert.equal(wrong.payload.passed,false); assert.equal(wrong.payload.lessonCompleted,false);
  assert.equal(wrong.payload.visibleTests.length,0);
  const assessmentResult = await privileged.from("assessments").select("id,slug,type,gate_after_chapter,position").eq("learning_path_id",path.data.id).eq("is_published",true).order("position");
  assert.ifError(assessmentResult.error);
  for(let i=0;i<lessons.length;i++) {
    const lesson=lessons[i];
    const required=exercises.find((row)=>row.lesson_id===lesson.id&&row.is_required);
    const result = await passPractice(learner,required);
    assert.equal(result.lessonCompleted,true);
    const chapterEnded=lessons[i+1]?.chapter_id!==lesson.chapter_id;
    if(chapterEnded) {
      const checkpoint=assessmentResult.data.find((row)=>row.type==="CHECKPOINT"&&row.gate_after_chapter===positions.get(lesson.chapter_id));
      if(checkpoint) await passAssessment(learner,checkpoint,lesson.id,required.id);
    }
  }
  const final=assessmentResult.data.find((row)=>row.type==="FINAL");
  assert.ok(final);
  await passAssessment(learner,final,lessons.at(-1).id,exercises.find((row)=>row.lesson_id===lessons.at(-1).id&&row.is_required).id);
  const progress = await privileged.from("lesson_progress").select("lesson_id,status").eq("user_id",learner.id).eq("status","COMPLETED");
  assert.ifError(progress.error); assert.equal(progress.data.length,11);
  const resultRows = await privileged.from("assessment_results").select("passed").eq("user_id",learner.id);
  assert.ifError(resultRows.error); assert.equal(resultRows.data.filter((row)=>row.passed).length,4);
  const otherJar=createClient(url,publishableKey,{auth:{persistSession:false}});
  assert.ifError((await otherJar.auth.signInWithPassword({email:other.email,password})).error);
  const stolen=await otherJar.from("exercise_attempts").select("id").eq("user_id",learner.id);
  assert.ifError(stolen.error); assert.equal(stolen.data.length,0);
  console.log("PASS: 11 lessons / 44 checks; optional does not unlock; mandatory unlocks; 4 assessments pass; assessment AI/Playground blocked; private answers absent; attempts owner-only; guest/admin guards intact.");
} finally {
  server.kill("SIGTERM");
  for(const id of userIds) assert.ifError((await privileged.auth.admin.deleteUser(id)).error);
}
