import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";
import { completeTestBaseline } from "./test-baseline-helper.mjs";

const site = "http://127.0.0.1:3220", userIds = [];
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const server = spawn("npm", ["run", "start", "--", "-p", "3220"], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
let browser, log = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { log = (log + chunk).slice(-2000); });
async function checked(response) { assert.equal(response.status(),200,`HTTP ${response.status()}`); return response.json(); }
function assertPublic(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  for (const field of ["answer_config", "referenceQuery", "fixtures", "expected_output", "Buku Pindah", "Data Terapan", "Relasi Baru"]) assert.ok(!text.includes(field), `Private field ${field} serialized`);
}
async function makeUser() {
  const email=`quethink-sql-${randomUUID()}@example.invalid`, password=randomBytes(24).toString("base64url");
  const result=await db.auth.admin.createUser({email,password,email_confirm:true}); assert.ifError(result.error);
  userIds.push(result.data.user.id); return {id:result.data.user.id,email,password};
}
try {
  let ready=false;
  for(let i=0;i<80;i++) { try { if((await fetch(site)).ok) {ready=true;break;} } catch { /* starting */ } await new Promise((r)=>setTimeout(r,500)); }
  assert.ok(ready,log);
  const user=await makeUser(), other=await makeUser();
  await completeTestBaseline(db,user.id);
  const baseline=await db.from("assessments").select("id").eq("slug","pre-test-basis-data").single(); assert.ifError(baseline.error);
  assert.ifError((await db.from("assessment_results").insert({user_id:user.id,assessment_id:baseline.data.id,attempt_count:1,latest_score:0,highest_score:0,passed:false})).error);
  // Isolated integration fixture: other tests exercise all reading/core APIs in sequence.
  const path=await db.from("learning_paths").select("id").eq("slug","database-fundamentals").single(); assert.ifError(path.error);
  const chapters=await db.from("chapters").select("id").eq("learning_path_id",path.data.id).eq("is_published",true); assert.ifError(chapters.error);
  const lessons=await db.from("lessons").select("id").in("chapter_id",chapters.data.map((row)=>row.id)).eq("is_published",true); assert.ifError(lessons.error);
  const now=new Date().toISOString();
  assert.ifError((await db.from("lesson_progress").insert(lessons.data.map((lesson)=>({user_id:user.id,lesson_id:lesson.id,status:"COMPLETED",read_at:now,started_at:now,completed_at:now})))).error);
  const assessment=await db.from("assessments").select("id,slug").eq("slug","post-test-basis-data-sql-v2").eq("is_published",true).single(); assert.ifError(assessment.error);
  const keys=await db.from("assessment_items").select("id,answer_config,public_config").eq("assessment_id",assessment.data.id).order("position"); assert.ifError(keys.error);
  assert.equal(keys.data.length,16);
  const correct=keys.data.map((item)=>({itemId:item.id,answer:item.public_config.mode === "sql" ? {sourceCode:item.answer_config.referenceQuery} : item.answer_config}));
  browser=await chromium.launch({executablePath:"/usr/bin/chromium",headless:true,args:["--no-sandbox"]});
  const context=await browser.newContext({viewport:{width:360,height:800}}), page=await context.newPage(), errors=[];
  page.on("pageerror",(e)=>errors.push(e.message));
  await page.goto(`${site}/login`); await page.getByLabel("Email",{exact:true}).fill(user.email); await page.getByLabel("Password",{exact:true}).fill(user.password); await page.getByRole("button",{name:"Masuk",exact:true}).click(); await page.waitForURL("**/dashboard");
  await page.goto(`${site}/post-test`); await page.getByRole("button",{name:"Mulai post-test",exact:true}).click(); await page.waitForURL("**/assessments/sessions/*");
  const sessionId=page.url().split("/").at(-1), endpoint=`${site}/api/assessment-sessions/${sessionId}`;
  const session=await checked(await page.request.get(endpoint)); assert.equal(session.items.length,16); assertPublic(session);
  assertPublic(await page.content());
  assert.equal((await page.request.post(`${site}/api/ai/tutor`,{data:{lessonId:lessons.data[0].id,action:"hint",message:"Tolong beri hint"}})).status(),403);
  assert.equal((await page.request.get(`${site}/api/admin/users`)).status(),403);
  assert.equal((await page.request.post(`${endpoint}/submit`,{data:{answers:correct,score:100}})).status(),400);
  const oversized=correct.map((entry)=>entry.itemId === correct[10].itemId ? {...entry,answer:{sourceCode:"x".repeat(4097)}} : entry);
  assert.equal((await page.request.post(`${endpoint}/submit`,{data:{answers:oversized}})).status(),400);
  const invalid=correct.map((entry)=>entry.itemId === correct[10].itemId ? {...entry,answer:{output:"forged browser result"}} : entry);
  assert.equal((await page.request.post(`${endpoint}/submit`,{data:{answers:invalid}})).status(),400);
  assert.equal((await page.request.post(`${endpoint}/submit`,{data:{answers:invalid}})).status(),400);
  assert.equal((await page.request.post(`${endpoint}/submit`,{data:{answers:correct}})).status(),429);
  // Reset only this synthetic user's quota before the independent UI scenario.
  assert.ifError((await db.from("code_request_limits").delete().eq("user_id",user.id).eq("kind","assessment")).error);
  assert.equal((await fetch(`${endpoint}/submit`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({answers:correct})})).status,401);
  const own=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
  assert.ifError((await own.auth.signInWithPassword({email:user.email,password:user.password})).error);
  const privateRead=await own.from("assessment_items").select("answer_config"); assert.ok(privateRead.error || privateRead.data.length === 0);
  const forged=await own.from("assessment_sessions").update({score:100,status:"COMPLETED"}).eq("id",sessionId); assert.ok(forged.error);
  const otherContext=await browser.newContext(), otherPage=await otherContext.newPage();
  await otherPage.goto(`${site}/login`); await otherPage.getByLabel("Email",{exact:true}).fill(other.email); await otherPage.getByLabel("Password",{exact:true}).fill(other.password); await otherPage.getByRole("button",{name:"Masuk",exact:true}).click(); await otherPage.waitForURL("**/dashboard");
  assert.equal((await otherPage.request.get(endpoint)).status(),404);
  assert.equal((await otherPage.request.post(`${endpoint}/submit`,{data:{answers:correct}})).status(),404);
  await otherContext.close();

  await page.getByRole("button",{name:"Soal 11",exact:true}).click();
  await page.getByLabel("Jawaban SQL",{exact:true}).fill(correct[10].answer.sourceCode);
  await page.getByRole("button",{name:"Coba query",exact:true}).click();
  await page.getByRole("table",{name:"Hasil percobaan query",exact:true}).waitFor();
  assert.ok((await page.getByRole("table",{name:"Hasil percobaan query",exact:true}).innerText()).includes("Tas"));
  await page.reload(); assert.equal(await page.getByLabel("Jawaban SQL",{exact:true}).inputValue(),correct[10].answer.sourceCode);
  await mkdir(".impeccable/review/sql-post-test",{recursive:true});
  for(const width of [360,768,1280]) {
    await page.setViewportSize({width,height:900});
    const sizes=await page.evaluate(()=>[document.documentElement.clientWidth,document.documentElement.scrollWidth]); assert.ok(sizes[1] <= sizes[0]);
    await page.screenshot({path:`.impeccable/review/sql-post-test/query-${width}.png`,fullPage:true});
  }
  await page.getByRole("button",{name:"Soal 15",exact:true}).click();
  await page.getByLabel("Jawaban SQL",{exact:true}).fill(correct[14].answer.sourceCode);
  await page.getByRole("button",{name:"Coba query",exact:true}).click();
  await page.getByRole("button",{name:"Terapkan pada data percobaan",exact:true}).waitFor();
  await page.getByRole("button",{name:"Terapkan pada data percobaan",exact:true}).click();
  await page.getByText("Perubahan diterapkan · 1 record",{exact:true}).waitFor();
  for(const width of [360,768,1280]) {
    await page.setViewportSize({width,height:900});
    const sizes=await page.evaluate(()=>[document.documentElement.clientWidth,document.documentElement.scrollWidth]);assert.ok(sizes[1] <= sizes[0]);
    await page.screenshot({path:`.impeccable/review/sql-post-test/write-${width}.png`,fullPage:true});
  }
  // Complete the real UI and submit through its confirmation dialog.
  for(let i=0;i<session.items.length;i++) {
    await page.getByRole("button",{name:new RegExp(`^Soal ${i+1}(?:\\s*Terisi)?$`)}).click();
    if("sourceCode" in correct[i].answer) await page.getByLabel("Jawaban SQL",{exact:true}).fill(correct[i].answer.sourceCode);
    else await page.locator(`input[value="${correct[i].answer.choiceId}"]`).check();
  }
  await page.getByRole("button",{name:"Kirim post-test",exact:true}).click();
  await page.getByRole("button",{name:"Kirim jawaban",exact:true}).click(); await page.waitForURL("**/result");
  await page.getByRole("heading",{name:"Post-test Basis Data",exact:true}).waitFor();
  const saved=await db.from("assessment_sessions").select("score,status,safe_feedback").eq("id",sessionId).single(); assert.ifError(saved.error); assert.equal(saved.data.status,"COMPLETED");assert.equal(Number(saved.data.score),100);assertPublic(saved.data.safe_feedback);
  assert.equal(await page.evaluate((key)=>localStorage.getItem(key),`quethink:assessment-draft:v1:${user.id}:${sessionId}`),null);
  await page.goto(`${site}/dashboard`); await page.getByText("Lulus · jalur belajar selesai",{exact:true}).waitFor();
  const retry=await checked(await page.request.post(`${site}/api/assessments/${assessment.data.slug}/start`));
  const duplicate=await checked(await page.request.post(`${site}/api/assessments/${assessment.data.slug}/start`));assert.equal(retry.sessionId,duplicate.sessionId);
  assert.ifError((await db.from("code_request_limits").delete().eq("user_id",user.id).eq("kind","assessment")).error);
  const wrong=correct.map((entry)=>"sourceCode" in entry.answer ? {...entry,answer:{sourceCode:"SELECT 1"}} : entry);
  const failed=await checked(await page.request.post(`${site}/api/assessment-sessions/${retry.sessionId}/submit`,{data:{answers:wrong}}));assert.equal(failed.score,25);assert.equal(failed.passed,false);assertPublic(failed);
  const retained=await db.from("assessment_results").select("highest_score,latest_score,passed,attempt_count").eq("user_id",user.id).eq("assessment_id",assessment.data.id).single(); assert.ifError(retained.error);assert.equal(Number(retained.data.highest_score),100);assert.equal(Number(retained.data.latest_score),25);assert.equal(retained.data.passed,true);assert.equal(retained.data.attempt_count,2);
  assert.deepEqual(errors,[]);
  // Scan all production client chunks against actual configured secrets and private fixture text.
  async function scan(dir) { for(const entry of await readdir(dir,{withFileTypes:true})) {const file=`${dir}/${entry.name}`;if(entry.isDirectory()) await scan(file); else {const text=await readFile(file,"utf8");for(const value of ["Buku Pindah","Data Terapan","Relasi Baru","referenceQuery","fixtures"]){assert.ok(!text.includes(value), `Private grading blueprint in client asset`);}for(const name of ["SUPABASE_SECRET_KEY","AI_API_KEY","AI_AGENT_API_KEY","BYNARA_API_KEY"]) {const secret=process.env[name];if(secret && secret.length > 16) assert.ok(!text.includes(secret),`Private ${name} in client asset`);} } } }
  await scan(".next/static");
  console.log("PASS: real SQL post-test UI/Run/preview/confirm/restore/submit/result; server score 100 and wrong SQL 25; retry idempotent/highest score retained; ownership/AI/admin/forged score/input size/rate-limit guards; hidden JSON/HTML/bundle scan; 360/768/1280 layouts.");
} finally {
  await browser?.close();
  for(const id of userIds) assert.ifError((await db.auth.admin.deleteUser(id)).error);
  server.kill("SIGTERM");
}
