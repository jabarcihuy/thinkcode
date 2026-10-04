import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
assert.ok(url && publishableKey && secretKey, "Supabase URL, publishable key, and secret key are required.");
const site = process.env.FLOW_TEST_SITE ?? "http://127.0.0.1:3219";
const pathSlug = "database-fundamentals";
const privileged = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const password = randomBytes(24).toString("base64url");
const userIds = [];
const server = spawn("npm", ["run", "start", "--", "-p", "3219"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
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

async function assertPrivateSafe(payload) {
  const serialized = JSON.stringify(payload);
  for (const name of ['answer_config','expected_output','assessment_test_cases','entry_function','solution_code']) assert.ok(!serialized.includes(name), `${name} leaked to client`);
}
async function snapshot(page, route, name) {
  for (const width of [360,768,1280]) {
    await page.setViewportSize({width,height:900});
    await page.goto(site+route); await page.locator('main h1').waitFor();
    const dimensions = await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
    assert.ok(dimensions.content <= dimensions.viewport, `${name} ${width}: page overflow`);
    await page.screenshot({path:`.impeccable/review/pretest-flow/${name}-${width}.png`,fullPage:true});
  }
}
try {
  await waitForSite(); await mkdir('.impeccable/review/pretest-flow',{recursive:true});
  const learner=await createAccount('USER'), other=await createAccount('USER'), admin=await createAccount('ADMIN');
  const path=await privileged.from('learning_paths').select('id').eq('slug',pathSlug).eq('is_published',true).single(); assert.ifError(path.error);
  const chapters=await privileged.from('chapters').select('id,position').eq('learning_path_id',path.data.id).eq('is_published',true);assert.ifError(chapters.error);
  const chapterOrder=new Map(chapters.data.map(c=>[c.id,c.position]));
  const content=await privileged.from('lessons').select('id,slug,chapter_id,position').in('chapter_id',[...chapterOrder.keys()]).eq('is_published',true);assert.ifError(content.error);
  const lessons=content.data.sort((a,b)=>chapterOrder.get(a.chapter_id)-chapterOrder.get(b.chapter_id)||a.position-b.position);assert.equal(lessons.length,11);
  const tests=await privileged.from('assessments').select('id,slug,type,course_weight_percent').eq('learning_path_id',path.data.id).eq('is_published',true);assert.ifError(tests.error);
  assert.equal(tests.data.length,2);const pre=tests.data.find(t=>t.type==='PRETEST'),post=tests.data.find(t=>t.type==='FINAL');assert.ok(pre&&post);assert.equal(pre.course_weight_percent,0);assert.equal(post.course_weight_percent,100);
  for(const route of ['/dashboard','/lab','/pre-test','/post-test']) assert.equal((await call(null,route)).response.status,307);
  assert.equal((await call(learner,'/admin')).response.status,307);
  assert.equal((await call(learner,'/api/admin/users')).response.status,403);
  assert.equal((await call(admin,'/api/admin/users')).response.status,200);
  assert.equal((await call(null,`/api/materials/${lessons[0].id}/read`,'POST')).response.status,401);
  assert.equal((await call(learner,`/api/materials/${lessons[1].id}/read`,'POST')).response.status,403);
  assert.equal((await call(learner,`/api/assessments/${post.slug}/start`,'POST')).response.status,403);

  browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:360,height:900}});
  await context.addCookies(learner.cookie().split('; ').map(part=>{const [name,...value]=part.split('=');return{name,value:decodeURIComponent(value.join('=')),url:site};}));
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await snapshot(page,'/dashboard','dashboard');await snapshot(page,'/pre-test','pre-test');await snapshot(page,'/post-test','post-test-locked');await snapshot(page,'/lab','lab');
  const [startOne,startTwo]=await Promise.all([call(learner,`/api/assessments/${pre.slug}/start`,'POST'),call(learner,`/api/assessments/${pre.slug}/start`,'POST')]);
  assert.equal(startOne.response.status,200);assert.equal(startTwo.payload.sessionId,startOne.payload.sessionId);const preId=startOne.payload.sessionId;
  const preSession=await call(learner,`/api/assessment-sessions/${preId}`);await assertPrivateSafe(preSession.payload);assert.equal(preSession.payload.items.length,10);
  assert.equal((await call(other,`/api/assessment-sessions/${preId}`)).response.status,404);
  const paused=await call(learner,'/api/ai/tutor','POST',{lessonId:lessons[0].id,action:'hint',message:'Beri petunjuk.'});assert.equal(paused.response.status,403);
  assert.equal((await call(learner,`/api/materials/${lessons[0].id}/read`,'POST')).response.status,409);
  await snapshot(page,`/assessments/sessions/${preId}`,'pre-test-session');
  const baseline=await call(learner,`/api/assessment-sessions/${preId}/submit`,'POST',{answers:preSession.payload.items.map(item=>({itemId:item.id,answer:{choiceId:'unknown'}}))});
  assert.equal(baseline.response.status,200);assert.equal(baseline.payload.score,0);assert.equal(baseline.payload.passed,false);await assertPrivateSafe(baseline.payload);
  assert.equal((await call(learner,`/api/assessments/${pre.slug}/start`,'POST')).response.status,403,'Baseline cannot be retaken');
  await snapshot(page,`/assessments/sessions/${preId}/result`,'pre-test-result');assert.equal(await page.getByText('Belum lulus',{exact:true}).count(),0);
  const history=await call(learner,`/api/ai/tutor?lessonId=${lessons[0].id}`);assert.equal(history.response.status,200,'AI resumes after diagnostic');
  const exercises=await privileged.from('exercises').select('id,lesson_id,type,config,is_required').in('lesson_id',lessons.map(l=>l.id)).eq('is_published',true);assert.ifError(exercises.error);assert.ok(exercises.data.every(e=>!e.is_required));
  const exercise=exercises.data.find(e=>e.lesson_id===lessons[0].id);assert.ok(exercise);
  const checked=await call(learner,`/api/exercises/${exercise.id}/check`,'POST',{pathSlug,answer:exercise.config.answer});assert.equal(checked.response.status,200);assert.equal(checked.payload.passed,true);assert.equal(checked.payload.lessonCompleted,false);
  const before=await privileged.from('lesson_progress').select('id').eq('user_id',learner.id);assert.ifError(before.error);assert.equal(before.data.length,0,'Optional lab never completes reading');
  const reading=`/learn/${pathSlug}/lessons/${lessons[0].slug}`;
  await snapshot(page,reading,'reading');assert.equal(await page.locator('main textarea,#lesson-practice,#database-sql').count(),0);
  await page.getByRole('button',{name:'Selesai dibaca',exact:true}).click();await page.getByText('Materi sudah selesai dibaca.',{exact:true}).waitFor();
  for(const lesson of lessons.slice(1)) assert.equal((await call(learner,`/api/materials/${lesson.id}/read`,'POST')).response.status,200,`Read ${lesson.slug}`);
  const own=await privileged.from('lesson_progress').select('lesson_id').eq('user_id',learner.id).eq('status','COMPLETED');assert.ifError(own.error);assert.equal(own.data.length,11);
  const untouched=await privileged.from('lesson_progress').select('id').eq('user_id',other.id);assert.ifError(untouched.error);assert.equal(untouched.data.length,0);
  for(const lesson of lessons){const pdf=await fetch(`${site}/learn/${pathSlug}/lessons/${lesson.slug}/pdf`,{headers:{Cookie:learner.cookie()}});assert.equal(pdf.status,200);assert.match(Buffer.from(await pdf.arrayBuffer()).subarray(0,8).toString(),/%PDF/);}
  await snapshot(page,'/post-test','post-test-ready');
  const postStarted=await call(learner,`/api/assessments/${post.slug}/start`,'POST');assert.equal(postStarted.response.status,200);const postId=postStarted.payload.sessionId;
  assert.equal((await call(learner,`/api/ai/tutor?lessonId=${lessons[0].id}`)).response.status,403);
  assert.equal((await call(learner,`/api/exercises/${exercise.id}/check`,'POST',{pathSlug,answer:exercise.config.answer})).response.status,403);
  assert.equal((await call(learner,`/api/assessments/${pre.slug}/start`,'POST')).response.status,403,'Cannot create another active test');
  const postSession=await call(learner,`/api/assessment-sessions/${postId}`);await assertPrivateSafe(postSession.payload);assert.equal(postSession.payload.items.length,10);
  const forged=await call(learner,`/api/assessment-sessions/${postId}/submit`,'POST',{score:100,passed:true,answers:postSession.payload.items.map(item=>({itemId:item.id,answer:{choiceId:'not-a-valid-answer'}}))});
  assert.equal(forged.response.status,400,'Client score fields are rejected by strict validation');
  const wrongAnswer = await call(learner,`/api/assessment-sessions/${postId}/submit`,'POST',{answers:postSession.payload.items.map(item=>({itemId:item.id,answer:{choiceId:'not-a-valid-answer'}}))});
  assert.equal(wrongAnswer.response.status,200);assert.equal(wrongAnswer.payload.score,0);assert.equal(wrongAnswer.payload.passed,false,'Wrong answers cannot earn a passing score');
  const retry=await call(learner,`/api/assessments/${post.slug}/start`,'POST');assert.equal(retry.response.status,200);
  const privateItems=await privileged.from('assessment_items').select('id,answer_config').eq('assessment_id',post.id);assert.ifError(privateItems.error);
  const passed=await call(learner,`/api/assessment-sessions/${retry.payload.sessionId}/submit`,'POST',{answers:privateItems.data.map(item=>({itemId:item.id,answer:item.answer_config}))});assert.equal(passed.response.status,200);assert.equal(passed.payload.score,100);assert.equal(passed.payload.passed,true);await assertPrivateSafe(passed.payload);
  await snapshot(page,`/assessments/sessions/${retry.payload.sessionId}/result`,'post-test-result');
  await page.goto(site+'/dashboard');await page.getByRole('heading',{name:'Jalur belajar selesai',exact:true}).waitFor();
  // Real browser SQL smoke stays independent of assessment scoring.
  await page.setViewportSize({width:360,height:900});await page.goto(site+'/playground');
  const lab=page.getByRole('region',{name:'Praktik query basis data'});await lab.locator('#database-sql').fill("SELECT name FROM students ORDER BY name;");await lab.locator('#database-prediction').fill('4');await lab.getByRole('button',{name:'Jalankan SELECT'}).click();await page.locator('#lab-results').getByRole('cell',{name:'Alya'}).waitFor();
  const userClient=createClient(url,publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});assert.ifError((await userClient.auth.signInWithPassword({email:other.email,password})).error);
  const privateRead=await userClient.from('assessment_results').select('*').eq('user_id',learner.id);assert.ifError(privateRead.error);assert.deepEqual(privateRead.data,[]);
  assert.ok((await userClient.from('assessment_results').update({latest_score:100}).eq('user_id',other.id)).error,'Direct score writes forbidden');
  assert.ok((await userClient.from('assessment_items').select('answer_config')).error,'Private test keys not readable');
  assert.ok((await userClient.rpc('acknowledge_material_read',{p_lesson_id:lessons[1].id})).error,'RPC cannot skip prerequisite');
  const results=await privileged.from('assessment_results').select('assessment_id,passed,attempt_count').eq('user_id',learner.id);assert.ifError(results.error);assert.equal(results.data.find(r=>r.assessment_id===pre.id).passed,false);assert.equal(results.data.find(r=>r.assessment_id===post.id).attempt_count,2);
  assert.deepEqual(errors,[]);
  console.log('PASS: pre-test baseline/immutable/neutral result; pure material/PDF; explicit reading unlocks all 11; optional lab does not complete; trusted post-test/retry; forged score/hidden keys/other-user/RBAC denied; AI blocked in both test modes; SQLite browser smoke; 360/768/1280 screenshots.');
} finally {
  await browser?.close();server.kill('SIGTERM');
  for(const id of userIds) assert.ifError((await privileged.auth.admin.deleteUser(id)).error);
}
