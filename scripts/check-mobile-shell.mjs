import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { createClient } from '@supabase/supabase-js';
const site='http://127.0.0.1:3230';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3230'],{stdio:['ignore','pipe','pipe'],env:process.env});
let browser,log='';
for(const stream of [server.stdout,server.stderr])stream.on('data',c=>{log=(log+c).slice(-1800)});
try {
 for(let i=0;i<80;i++){try{if((await fetch(site)).ok)break}catch{}await new Promise(r=>setTimeout(r,500))}
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const ctx=await browser.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await ctx.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(site+'/app');await page.waitForURL(site+'/login');
 assert.equal(await page.locator('link[rel=manifest]').getAttribute('href'),'/manifest.json');
 await page.goto(site+'/guest/start');await page.getByLabel('Nama',{exact:true}).fill('Uji mobile');await page.getByRole('button',{name:'Masuk sebagai tamu',exact:true}).click();await page.waitForURL(site+'/guest');
 await page.goto(site+'/app');await page.waitForURL(site+'/guest');
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
 const result=await db.from('lessons').select('id,slug,example_sql,chapters!inner(learning_paths!inner(slug))').eq('is_published',true).eq('chapters.learning_paths.slug','database-fundamentals').not('example_sql','is',null).order('position');assert.ifError(result.error);
 const lesson=result.data[0];assert.ok(lesson);
 // UI-only local fixture. It never creates official progress or bypasses server grading.
 const guestLessons=await db.from('lessons').select('id,chapters!inner(learning_paths!inner(slug))').eq('is_published',true).eq('chapters.learning_paths.slug','database-fundamentals');assert.ifError(guestLessons.error);
 const guestPre=await db.from('assessments').select('id,learning_paths!inner(slug)').eq('type','PRETEST').eq('is_published',true).eq('learning_paths.slug','database-fundamentals').single();assert.ifError(guestPre.error);
 const guestCore=await db.from('exercises').select('id').in('lesson_id',guestLessons.data.map(l=>l.id)).eq('is_required',true).eq('is_published',true);assert.ifError(guestCore.error);
 await page.evaluate(({lessonIds,preId,exerciseIds})=>localStorage.setItem('quethink:guest-local:v1:progress',JSON.stringify({version:1,signature:'guest-progress-v1',value:{name:'',read:Object.fromEntries(lessonIds.map(id=>[id,new Date().toISOString()])),passedExercises:exerciseIds,tests:{[preId]:{score:0,totalCorrect:0,totalItems:10,passed:false}}}})),{lessonIds:guestLessons.data.map(l=>l.id),preId:guestPre.data.id,exerciseIds:guestCore.data.map(e=>e.id)});
 let workers=0;page.on('worker',()=>workers++);
 await page.goto(site+'/guest/lab/'+lesson.slug);
 assert.equal(await page.getByText('Eksplorasi tabel dan query',{exact:true}).evaluate(e=>e.parentElement.open),false);
 assert.equal(await page.locator('#database-sql').count(),0);
 assert.ok(await page.locator('[id^=practice-]').count()>0,'Guest must render the published core exercise');
 const height=await page.evaluate(()=>document.documentElement.scrollHeight);assert.ok(height<3500,`Collapsed Lab height ${height}`);assert.equal(workers,0);
 const navigation=page.getByRole('navigation',{name:'Navigasi utama',exact:true});
 assert.equal(await navigation.locator('[aria-current=page]').count(),1);
 await page.getByRole('link',{name:'Query',exact:true}).click();
 const sql=page.locator('#database-sql');await sql.fill('SELECT COUNT(*) AS total FROM students;');
 await navigation.waitFor({state:'hidden'});await sql.blur();await navigation.waitFor({state:'visible'});
 await page.locator('#database-prediction').fill('1');await page.getByRole('button',{name:'Jalankan SELECT',exact:true}).click();await page.getByRole('table',{name:'Hasil query dari SQLite'}).waitFor();
 assert.ok(workers>0);
 await page.getByText('Eksplorasi tabel dan query',{exact:true}).click();await page.getByText('Eksplorasi tabel dan query',{exact:true}).click();assert.equal(await sql.inputValue(),'SELECT COUNT(*) AS total FROM students;');
 // Streaming fixture isolates scrolling behavior from provider availability/cost.
 await page.route('**/api/guest/tutor*',async route=>{await route.fulfill({json:{messages:Array.from({length:12},(_,i)=>({role:i%2?'ASSISTANT':'USER',content:'Pesan '+i+' '+ 'Penjelasan tabel. '.repeat(15)}))}})});
 await page.goto(site+'/guest?view=chatbot');
 const chat=page.getByRole('list',{name:'Percakapan tutor'});await chat.locator('li').last().waitFor();
 await page.waitForFunction(()=>{const e=document.querySelector('ol[aria-label="Percakapan tutor"]');return e&&e.scrollHeight-e.scrollTop-e.clientHeight<48});
 await page.evaluate(()=>{document.querySelector('ol[aria-label="Percakapan tutor"]').scrollTop=0});
 await page.route('**/api/guest/tutor',async route=>{
  if(route.request().method()==='POST')await route.fulfill({contentType:'text/plain',body:'Petunjuk baru. '.repeat(50)});
  else await route.continue();
 });
 await page.getByRole('button',{name:'Beri petunjuk',exact:true}).click();
 await page.getByRole('button',{name:'Lihat pesan terbaru',exact:true}).waitFor();
 assert.equal(await chat.evaluate(e=>e.scrollTop),0);
 await page.getByRole('button',{name:'Lihat pesan terbaru',exact:true}).click();
 await page.waitForFunction(()=>{const e=document.querySelector('ol[aria-label="Percakapan tutor"]');return e.scrollHeight-e.scrollTop-e.clientHeight<48});
 // Menu survives font scaling and a short viewport.
 await page.setViewportSize({width:320,height:420});await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 await navigation.getByRole('button',{name:'Menu'}).click();
 const bounds=await page.getByRole('navigation',{name:'Fitur lainnya'}).boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=420);
 await page.getByRole('button',{name:'Tutup menu'}).click();
 await page.evaluate(()=>document.documentElement.style.fontSize='');
 await page.setViewportSize({width:360,height:800});
 const transitionStarted=performance.now();
 await navigation.getByRole('link',{name:'Materi',exact:true}).click();
 await page.getByRole('heading',{name:'Basis Data dan SQL',exact:true}).waitFor();
 const navigationMs=Math.round(performance.now()-transitionStarted);
 // Only the public fallback may be cached, not authenticated pages or API payloads.
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const cached=await page.evaluate(async()=>{const keys=await caches.keys();return (await Promise.all(keys.map(async key=>(await (await caches.open(key)).keys()).map(r=>new URL(r.url).pathname)))).flat()});assert.deepEqual(cached,['/offline.html']);
 await ctx.setOffline(true);await page.goto(site+'/guest?view=materials');await page.getByRole('heading',{name:'Koneksi terputus'}).waitFor();
 await ctx.setOffline(false);await page.getByRole('button',{name:'Coba lagi'}).click();await page.getByRole('heading',{name:'Basis Data dan SQL',exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',labInitialHeight:height,navigationMs,checks:['app entry','single active navigation','lazy SQL startup','SQL execution','editor preserved','editing hides bar','chat auto-follow','font scaling','offline fallback','no private caches'],note:'Browser mobile emulation; Android OS keyboard is not emulated.'}));
} catch(error){console.error(error.message,log);process.exitCode=1}finally{await browser?.close();server.kill('SIGTERM')}
