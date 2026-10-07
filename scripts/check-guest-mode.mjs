import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright-core';
const site = 'http://127.0.0.1:3225';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {auth:{persistSession:false}});
const server = spawn('npm', ['run','start','--','-p','3225'], {stdio:['ignore','pipe','pipe'],env:process.env});
let browser, logs='';
server.stdout.on('data', c=>{logs=(logs+c).slice(-2000)});
server.stderr.on('data', c=>{logs=(logs+c).slice(-2000)});
try {
  for(let i=0;i<80;i++){ try {if((await fetch(site)).ok)break;}catch{} await new Promise(r=>setTimeout(r,500)); }
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:360,height:800}});
  const page=await context.newPage();
  const request = {post: async (url, options={}) => context.request.post(url, {...options, headers:{cookie:(await context.cookies()).map(c=>`${c.name}=${c.value}`).join('; '), ...options.headers}}), get: async url => context.request.get(url,{headers:{cookie:(await context.cookies()).map(c=>`${c.name}=${c.value}`).join('; ')}})};
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  const missing=await request.post(site+'/api/guest/tutor',{data:{}}); assert.equal(missing.status(),401);
  await page.goto(site+'/guest/start');
  await page.getByLabel('Nama',{exact:true}).fill('Tamu Percobaan');
  await page.getByRole('button',{name:'Masuk sebagai tamu',exact:true}).click();
  await page.waitForURL(site+'/guest');
  const cookie=(await context.cookies()).find(c=>c.name==='quethink_guest'); assert.ok(cookie?.httpOnly);
  const guest=JSON.parse(Buffer.from(cookie.value.split('.')[0],'base64url').toString());
  const paths=await db.from('learning_paths').select('id').eq('slug','database-fundamentals').single(); assert.ifError(paths.error);
  const chapters=await db.from('chapters').select('id,position').eq('learning_path_id',paths.data.id).eq('is_published',true); assert.ifError(chapters.error);
  const lessons=await db.from('lessons').select('id,slug,title,chapter_id,position').in('chapter_id',chapters.data.map(c=>c.id)).eq('is_published',true); assert.ifError(lessons.error);
  const positions=new Map(chapters.data.map(c=>[c.id,c.position])); lessons.data.sort((a,b)=>positions.get(a.chapter_id)-positions.get(b.chapter_id)||a.position-b.position);
  assert.ok(lessons.data.length>=11);
  await page.goto(site+'/guest?view=materials');
  for(const lesson of lessons.data) assert.ok(await page.getByRole('link',{name:new RegExp(lesson.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).count());
  await page.goto(site+'/guest/materials/'+lessons.data.at(-1).slug);
  await page.getByRole('heading',{name:`Materi ${lessons.data.length}. ${lessons.data.at(-1).title}`,exact:true}).waitFor();
  const pdf=await request.get(site+'/api/guest/pdf/'+lessons.data[0].slug); assert.equal(pdf.status(),200); assert.ok((await pdf.body()).subarray(0,4).equals(Buffer.from('%PDF')));
  await page.goto(site+'/guest/lab/'+lessons.data[0].slug);
  const exercise=await db.from('exercises').select('id,config,type').eq('lesson_id',lessons.data[0].id).eq('is_required',true).eq('is_published',true).limit(1).single(); assert.ifError(exercise.error);
  const check=await request.post(site+'/api/guest/check/'+exercise.data.id,{data:{pathSlug:'database-fundamentals',answer:exercise.data.config.answer}}); assert.equal(check.status(),200); assert.equal((await check.json()).passed,true);
  assert.equal((await request.post(site+'/api/ai/tutor',{data:{lessonId:lessons.data[0].id,action:'hint'}})).status(),401);
  assert.equal((await request.post(site+'/api/guest/sqlab',{headers:{origin:'https://other.invalid'},data:{prompt:'Buat database buku'}})).status(),403);
  await page.goto(site+'/guest?view=sqlab');
  await page.getByLabel('Nama tabel baru').fill('books'); await page.getByRole('button',{name:'Tambah',exact:true}).click();
  await page.getByLabel('Nama kolom',{exact:true}).fill('id'); await page.getByLabel('Tipe data',{exact:true}).selectOption('integer'); await page.getByRole('checkbox',{name:'Primary key',exact:true}).check(); await page.getByRole('button',{name:'Tambah kolom',exact:true}).click();
  await page.getByRole('tab',{name:'Data',exact:true}).click(); await page.getByLabel('id (PK)',{exact:true}).fill('1'); await page.getByRole('button',{name:'Simpan record',exact:true}).click();
  await page.getByRole('tab',{name:'Query',exact:true}).click(); await page.getByLabel('SQL',{exact:true}).fill('SELECT * FROM books;'); await page.getByRole('button',{name:'Jalankan query',exact:true}).click(); await page.getByRole('heading',{name:'Hasil query',exact:true}).waitFor({timeout:20000});
  assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/quethink/i.test(k))),[]);
  await page.reload(); await page.getByRole('tab',{name:'Skema',exact:true}).waitFor(); assert.equal(await page.getByRole('heading',{name:'Tabel books',exact:true}).count(),0);
  const assessments=await db.from('assessments').select('id,type').eq('learning_path_id',paths.data.id).eq('is_published',true).order('position'); assert.ifError(assessments.error);
  for(const test of assessments.data){
    await page.goto(site+'/guest?view=tests');
    await page.locator('form').filter({has:page.locator(`input[name="testId"][value="${test.id}"]`)}).getByRole('button').click();
    await page.waitForURL(site+'/guest/tests/'+test.id);
    assert.equal((await request.post(site+'/api/guest/tutor',{data:{lessonId:lessons.data[0].id,action:'hint'}})).status(),403);
    const items=await db.from('assessment_items').select('id,answer_config').eq('assessment_id',test.id).order('position'); assert.ifError(items.error);
    const answers=items.data.map(i=>({itemId:i.id,answer:i.answer_config.referenceQuery?{sourceCode:i.answer_config.referenceQuery}:i.answer_config}));
    const result=await request.post(site+'/api/guest/tests/'+test.id+'/submit',{data:{answers}}); assert.equal(result.status(),200); const grade=await result.json(); assert.equal(grade.score,100); assert.equal(grade.saved,false); assert.deepEqual(Object.keys(grade).sort(),['passed','saved','score','totalCorrect','totalItems'].sort());
    assert.equal((await request.post(site+'/api/guest/tests/'+test.id+'/submit',{data:{answers}})).status(),409);
  }
  const ai=await request.post(site+'/api/guest/tutor',{data:{lessonId:lessons.data[0].id,action:'hint',message:'Jelaskan perbedaan tabel dan record singkat.'}}); assert.equal(ai.status(),200); assert.ok((await ai.text()).trim().length>0);
  for(const table of ['profiles','lesson_progress','exercise_attempts','ai_sessions','assessment_sessions','assessment_results']){
    const column=table==='profiles'?'id':'user_id'; const rows=await db.from(table).select(column,{count:'exact',head:true}).eq(column,guest.id); assert.ifError(rows.error); assert.equal(rows.count,0,table+' must not save guest data');
  }
  await mkdir('.impeccable/review',{recursive:true});
  for(const width of [360,768,1280]){
    await page.setViewportSize({width,height:900}); await page.goto(site+'/guest');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`.impeccable/review/guest-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:360,height:800}); await page.getByRole('button',{name:'Menu fitur tamu',exact:true}).click(); await page.getByRole('navigation',{name:'Alat tamu'}).getByRole('link',{name:'SQLab',exact:true}).waitFor();
  assert.equal((await request.get(site+'/admin')).url().includes('/login'),true);
  assert.deepEqual(errors,[]);
  console.log('PASS: name-only guest, live Supabase published content, PDF, Lab check, SQLab Worker, memory-only drafts, pre/post-test trusted grading, AI blocks, RBAC, no guest DB writes, mobile/tablet/desktop.');
}finally{await browser?.close(); server.kill('SIGTERM');}
