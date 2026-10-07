/** Mobile UI audit: isolated synthetic accounts only; no production content mutations. */
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {chromium} from 'playwright-core';
import {completeTestBaseline} from './test-baseline-helper.mjs';
const site='http://127.0.0.1:3226', out='.impeccable/review/mobile-audit';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const ids=[], results=[], interactions=[];let browser,log='';
const server=spawn('npm',['run','start','--','-p','3226'],{stdio:['ignore','pipe','pipe'],env:process.env});
for(const stream of [server.stdout,server.stderr])stream.on('data',c=>{log=(log+c).slice(-1500)});
async function checked(query){const r=await query;assert.ifError(r.error);return r.data;}
async function fixture(role,complete,lessons){
  const email=`quethink-mobile-audit-${randomUUID()}@example.invalid`,password=randomBytes(24).toString('base64url');
  const user=(await checked(db.auth.admin.createUser({email,password,email_confirm:true}))).user;ids.push(user.id);
  if(role==='ADMIN')await checked(db.from('profiles').update({role}).eq('id',user.id));
  await completeTestBaseline(db,user.id);
  const baseline=await checked(db.from('assessments').select('id').eq('slug','pre-test-basis-data').single());
  await checked(db.from('assessment_results').upsert({user_id:user.id,assessment_id:baseline.id,attempt_count:1,latest_score:0,highest_score:0,passed:false}));
  if(complete){const now=new Date().toISOString();await checked(db.from('lesson_progress').insert(lessons.map(l=>({user_id:user.id,lesson_id:l.id,status:'COMPLETED',read_at:now,started_at:now,completed_at:now}))));}
  const jar=new Map();const auth=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:c=>c.forEach(({name,value})=>jar.set(name,value))}});
  assert.ifError((await auth.auth.signInWithPassword({email,password})).error);
  const ctx=await browser.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  await ctx.addCookies([...jar].map(([name,value])=>({name,value,url:site})));
  return {ctx,user};
}
async function capture(page,name,route,width=360,navigate=true){
  await page.setViewportSize({width,height:800});
  if(navigate)await page.goto(site+route,{waitUntil:'domcontentloaded'});
  await page.locator('body').waitFor();
  await page.waitForFunction(()=>!!document.querySelector('h1')||!!document.querySelector('main h2')||!!document.querySelector('main[aria-busy]'),{},{timeout:15000});
  // Allow client controls and font swaps to settle without waiting on external video/network.
  await page.waitForTimeout(250);
  const data=await page.evaluate(()=>{
    const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
    const target=e=>{if(e.matches('input[type=radio],input[type=checkbox]'))return e.closest('label')||e;return e};
    const controls=[...new Set([...document.querySelectorAll('a,button,input,textarea,select,[role=tab]')].filter(visible).map(target))];
    const small=controls.filter(e=>{const r=e.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName,label:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('name')||'').trim().slice(0,80),width:Math.round(r.width),height:Math.round(r.height)}});
    const fields=[...document.querySelectorAll('input:not([type=hidden]),textarea,select')].filter(visible).map(e=>({name:e.getAttribute('name')||e.id,font:getComputedStyle(e).fontSize,label:!!(e.labels?.length||e.getAttribute('aria-label')||e.getAttribute('aria-labelledby'))}));
    const bar=[...document.querySelectorAll('nav')].find(e=>visible(e)&&getComputedStyle(e).position==='fixed'&&getComputedStyle(e).bottom==='0px');
    const scrollers=[...document.querySelectorAll('main *')].filter(e=>visible(e)&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX==='auto').map(e=>({tag:e.tagName,role:e.getAttribute('role'),label:e.getAttribute('aria-label'),tabindex:e.getAttribute('tabindex')}));
    return{url:location.pathname+location.search,title:document.querySelector('main h1')?.textContent,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,smallTargets:small,fields,scrollers,bottomNavigation:!!bar,activeNavigation:bar?.querySelector('[aria-current]')?.textContent?.trim(),manifest:document.querySelector('link[rel=manifest]')?.getAttribute('href')||null,themeColor:document.querySelector('meta[name=theme-color]')?.content||null};
  });
  const shot=`${out}/${name}-${width}.png`;await page.screenshot({path:shot,fullPage:false});results.push({name,width,requested:route,...data,screenshot:shot});
  if(data.scrollWidth>width+1)console.log(`OVERFLOW ${name} ${width}: ${data.scrollWidth}`);
}
try{
  await mkdir(out,{recursive:true});for(let i=0;i<80;i++){try{if((await fetch(site)).ok)break}catch{}await new Promise(r=>setTimeout(r,500))}
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const path=await checked(db.from('learning_paths').select('id').eq('slug','database-fundamentals').single());
  const chapters=await checked(db.from('chapters').select('id,position').eq('learning_path_id',path.id).eq('is_published',true));
  const lessons=await checked(db.from('lessons').select('id,slug,title,chapter_id,position').in('chapter_id',chapters.map(c=>c.id)).eq('is_published',true));
  const chapterPositions=new Map(chapters.map(c=>[c.id,c.position]));lessons.sort((a,b)=>chapterPositions.get(a.chapter_id)-chapterPositions.get(b.chapter_id)||a.position-b.position);
  const errors=[];
  const publicCtx=await browser.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),publicPage=await publicCtx.newPage();publicPage.on('pageerror',e=>errors.push({scope:'public',error:e.message}));
  await capture(publicPage,'landing-desktop','/',1280);
  for(const width of [320,360,390])for(const [name,route]of [['landing','/'],['login','/login'],['register','/register'],['guest-start','/guest/start'],['not-found','/missing-audit-page']])await capture(publicPage,name,route,width);
  const {ctx}=await fixture('USER',true,lessons),page=await ctx.newPage();page.on('pageerror',e=>errors.push({scope:'user',error:e.message}));
  await capture(page,'dashboard-desktop','/dashboard',1280);
  for(const width of [320,360,390])for(const [name,route]of [['dashboard','/dashboard'],['materials','/learn/database-fundamentals'],['lab-index','/lab'],['sqlab','/playground'],['chatbot','/chatbot'],['pre-test','/pre-test'],['post-test','/post-test'],['assessments','/assessments'],['profile','/profile']])await capture(page,name,route,width);
  for(let i=0;i<lessons.length;i++){const l=lessons[i];await capture(page,`material-${i+1}`,`/learn/database-fundamentals/lessons/${l.slug}`);await capture(page,`lab-${i+1}`,`/learn/database-fundamentals/lessons/${l.slug}/practice`);}
  for(const c of chapters)await capture(page,`chapter-${c.position}`,`/learn/database-fundamentals/chapters/${c.id}`);
  for(const [name,route]of [['schema-builder-redirect','/schema-builder'],['old-lab-redirect','/lab/basis-data/select-where']])await capture(page,name,route);
  // Inspect every SQLab panel without saving/applying changes or calling AI.
  await page.goto(site+'/playground');
  for(const tab of ['Skema','Data','Query','AI']){await page.getByRole('tab',{name:tab,exact:true}).click();await capture(page,'sqlab-'+tab.toLowerCase(),'/playground',360,false);}
  await page.goto(site+'/dashboard');await page.getByRole('navigation',{name:'Navigasi utama',exact:true}).getByRole('button',{name:'Menu',exact:true}).click();await capture(page,'expanded-menu','/dashboard',360,false);
  await page.goBack();interactions.push({name:'Browser Back with menu open',url:page.url(),openPopovers:await page.locator(':popover-open').count()});
  // Full assessment screen and safe result, with server grading of synthetic account only.
  await page.goto(site+'/post-test');await page.getByRole('button',{name:'Mulai post-test',exact:true}).click();await page.waitForURL('**/assessments/sessions/*');const sessionId=page.url().split('/').at(-1);
  await capture(page,'assessment-choice',new URL(page.url()).pathname,360,false);
  await page.getByRole('button',{name:'Soal 11',exact:true}).click();await capture(page,'assessment-sql',new URL(page.url()).pathname,360,false);
  const aiBlocked=await page.request.post(site+'/api/ai/tutor',{data:{lessonId:lessons[0].id,action:'hint'}});interactions.push({name:'Assessment AI block',status:aiBlocked.status()});assert.equal(aiBlocked.status(),403);
  const test=await checked(db.from('assessments').select('id').eq('slug','post-test-basis-data-sql-v2').single());const keys=await checked(db.from('assessment_items').select('id,answer_config,public_config').eq('assessment_id',test.id).order('position'));
  const answers=keys.map(k=>({itemId:k.id,answer:k.public_config.mode==='sql'?{sourceCode:k.answer_config.referenceQuery}:k.answer_config}));
  const result=await page.request.post(`${site}/api/assessment-sessions/${sessionId}/submit`,{data:{answers}});assert.equal(result.status(),200);await capture(page,'assessment-result',`/assessments/sessions/${sessionId}/result`);
  const {ctx:adminCtx}=await fixture('ADMIN',false,lessons),admin=await adminCtx.newPage();admin.on('pageerror',e=>errors.push({scope:'admin',error:e.message}));await capture(admin,'admin-overview','/admin');
  for(const section of ['Jalur belajar','Chapter','Lesson','Latihan','Assessment','Soal assessment','Manajemen pengguna']){await admin.getByRole('navigation',{name:'CMS sections'}).getByRole('button',{name:section,exact:true}).click();await admin.waitForTimeout(900);await capture(admin,'admin-'+section.replaceAll(' ','-').toLowerCase(),'/admin',360,false);}
  await capture(admin,'admin-preview',`/admin/lessons/${lessons[0].id}/preview`);
  const {ctx:freshCtx}=await fixture('USER',false,lessons),fresh=await freshCtx.newPage();await capture(fresh,'new-user-dashboard','/dashboard');await capture(fresh,'locked-material',`/learn/database-fundamentals/lessons/${lessons.at(-1).slug}`);
  // Named guest routes and all published lesson/lab variants.
  await publicPage.goto(site+'/guest/start');await publicPage.getByLabel('Nama',{exact:true}).fill('Audit Mobile');await publicPage.getByRole('button',{name:'Masuk sebagai tamu'}).click();await publicPage.waitForURL(site+'/guest');
  // Local demo fixture for visual coverage only; no official progress is written.
  const guestPre=await checked(db.from('assessments').select('id').eq('type','PRETEST').eq('is_published',true).limit(1).single());
  const guestCore=await checked(db.from('exercises').select('id').in('lesson_id',lessons.map(l=>l.id)).eq('is_required',true).eq('is_published',true));
  await publicPage.evaluate(({ids,preId,exerciseIds})=>localStorage.setItem('quethink:guest-local:v1:progress',JSON.stringify({version:1,signature:'guest-progress-v1',value:{name:'',read:Object.fromEntries(ids.map(id=>[id,new Date().toISOString()])),passedExercises:exerciseIds,tests:{[preId]:{score:0,totalCorrect:0,totalItems:10,passed:false}}}})),{ids:lessons.map(l=>l.id),preId:guestPre.id,exerciseIds:guestCore.map(e=>e.id)});
  for(const view of ['', 'materials','sqlab','chatbot','tests','profile'])await capture(publicPage,'guest-'+(view||'dashboard'),'/guest'+(view?'?view='+view:''));
  for(let i=0;i<lessons.length;i++){await capture(publicPage,`guest-material-${i+1}`,'/guest/materials/'+lessons[i].slug);await capture(publicPage,`guest-lab-${i+1}`,'/guest/lab/'+lessons[i].slug);}
  await publicPage.goto(site+'/guest?view=tests');await publicPage.getByRole('button',{name:'Ulangi pre-test',exact:true}).first().click();await publicPage.waitForURL('**/guest/tests/*');await capture(publicPage,'guest-test',new URL(publicPage.url()).pathname,360,false);
  await writeFile(out+'/results.json',JSON.stringify({date:'2026-10-07',results,interactions,errors},null,2));
  const overflow=results.filter(r=>r.scrollWidth>r.viewport+1);console.log(JSON.stringify({captures:results.length,overflow:overflow.map(r=>r.name),pageErrors:errors,interactions},null,2));
}finally{
  await browser?.close();server.kill('SIGTERM');
  for(const id of ids)assert.ifError((await db.auth.admin.deleteUser(id)).error);
}
