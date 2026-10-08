import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {chromium} from 'playwright-core';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SECRET_KEY;
assert.ok(url&&key&&secret,'Supabase environment required');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const site='http://127.0.0.1:3246',password=randomBytes(24).toString('base64url'),ids=[];
const server=spawn('npm',['run','start','--','-p','3246'],{stdio:['ignore','pipe','pipe'],env:process.env});let log='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',c=>{log=(log+c).slice(-3000)});
async function account(role='USER'){
 const email=`quethink-forum-${randomUUID()}@example.invalid`;
 const result=await db.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(result.error);const id=result.data.user.id;ids.push(id);
 if(role==='ADMIN')assert.ifError((await db.from('profiles').update({role}).eq('id',id)).error);
 const jar=new Map(),client=createServerClient(url,key,{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:values=>values.forEach(c=>jar.set(c.name,c.value))}});
 assert.ifError((await client.auth.signInWithPassword({email,password})).error);
 return{id,email,client,cookie:()=>[...jar].map(([n,v])=>`${n}=${encodeURIComponent(v)}`).join('; '),cookies:()=>[...jar].map(([name,value])=>({name,value,url:site}))};
}
async function call(user,route,body,origin=site){
 const response=await fetch(site+route,{method:body?'POST':'GET',redirect:'manual',headers:{Cookie:user?.cookie()??'',...(body?{'content-type':'application/json',origin}: {})},...(body?{body:JSON.stringify(body)}:{})});
 const raw=await response.text();let payload;try{payload=JSON.parse(raw)}catch{payload=null}return{status:response.status,payload,raw};
}
const post={title:'Bagaimana memilih primary key?',body:'Contoh sintetis: tabel buku memiliki kode dan judul. Kolom mana yang tepat?',category:'DATABASE'};
try{
 for(let i=0;i<80;i++){try{if((await fetch(site+'/login')).ok)break}catch{}await new Promise(r=>setTimeout(r,500));if(i===79)throw new Error(log)}
 const learner=await account(),admin=await account('ADMIN');
 assert.ifError((await db.from('profiles').update({display_name:'A'.repeat(60)}).eq('id',learner.id)).error);
 assert.equal((await call(null,'/forum')).status,307);
 assert.equal((await call(null,'/api/forum/topics',post)).status,401);
 assert.equal((await call(learner,'/api/forum/topics',{...post,authorId:admin.id})).status,400);
 assert.equal((await call(learner,'/api/forum/topics',post,'https://other.example')).status,403);
 assert.equal((await call(learner,'/api/forum/topics',{...post,title:'x'})).status,400);
 const created=await call(learner,'/api/forum/topics',post);assert.equal(created.status,201);const topic=created.payload.id;assert.deepEqual(Object.keys(created.payload),['id']);
 const general=await call(learner,'/api/forum/topics',{...post,title:'Bagaimana cara belajar bersama?',category:'GENERAL'});assert.equal(general.status,201);
 assert.equal((await db.from('forum_topics').select('author_id').eq('id',topic).single()).data.author_id,learner.id);
 const reply=await call(learner,`/api/forum/topics/${topic}/replies`,{body:'Pilih kode yang unik dan stabil.'});assert.equal(reply.status,201);
 assert.ok((await learner.client.from('forum_topics').insert({author_id:admin.id,...post})).error,'Browser cannot write');
 assert.ok((await learner.client.rpc('forum_create_topic',{p_user_id:admin.id,p_title:post.title,p_body:post.body,p_category:'GENERAL'})).error,'Browser cannot call service mutation');
 assert.ok((await createClient(url,key).from('forum_topics').select('*')).error,'Anonymous database reads denied');
 const moderation=(user,action,targetId,value)=>call(user,'/api/forum/moderate',{action,targetId,value});
 assert.equal((await moderation(learner,'lock_topic',topic,true)).status,403);
 assert.equal((await moderation(admin,'lock_topic',topic,true)).status,200);
 assert.equal((await call(learner,`/api/forum/topics/${topic}/replies`,{body:'Tidak boleh masuk'})).status,403);
 assert.equal((await moderation(admin,'lock_topic',topic,false)).status,200);
 assert.equal((await moderation(admin,'hide_reply',reply.payload.id,true)).status,200);
 const hiddenReplies=await learner.client.from('forum_replies').select('id').eq('id',reply.payload.id);assert.ifError(hiddenReplies.error);assert.deepEqual(hiddenReplies.data,[]);
 assert.equal((await moderation(admin,'hide_reply',reply.payload.id,false)).status,200);
 assert.equal((await moderation(admin,'hide_topic',topic,true)).status,200);
 const hiddenPage=await call(learner,`/forum/${topic}`);assert.ok([200,404].includes(hiddenPage.status));assert.ok(!hiddenPage.raw.includes(post.title),'Hidden topic not serialized in streamed page');
 assert.equal((await call(admin,`/forum/${topic}`)).status,200);
 assert.equal((await moderation(admin,'hide_topic',topic,false)).status,200);
 for(let i=0;i<3;i++)assert.equal((await call(learner,'/api/forum/topics',{...post,title:`Topik sintetis kuota ${i}`})).status,201);
 assert.equal((await call(learner,'/api/forum/topics',post)).status,429);
 // Use synthetic account fixtures to check the assessment guard without touching real learners.
 const path=await db.from('learning_paths').select('id').eq('slug','database-fundamentals').single();assert.ifError(path.error);
 const chapters=await db.from('chapters').select('id').eq('learning_path_id',path.data.id).eq('is_published',true);assert.ifError(chapters.error);
 const lessons=await db.from('lessons').select('id').in('chapter_id',chapters.data.map(c=>c.id)).eq('is_published',true).eq('is_required',true);assert.ifError(lessons.error);
 const final=await db.from('assessments').select('id').eq('learning_path_id',path.data.id).eq('is_published',true).eq('type','FINAL').single();assert.ifError(final.error);
 assert.ifError((await db.from('lesson_progress').insert(lessons.data.map(l=>({user_id:learner.id,lesson_id:l.id,status:'COMPLETED',read_at:new Date().toISOString(),completed_at:new Date().toISOString()})))).error);
 const active=await learner.client.rpc('start_assessment_session',{p_assessment_id:final.data.id});assert.ifError(active.error);
 assert.equal((await call(learner,`/api/forum/topics/${topic}/replies`,{body:'Ditolak selama tantangan'})).status,403);
 const blockedRead=await learner.client.from('forum_topics').select('id');assert.ifError(blockedRead.error);assert.deepEqual(blockedRead.data,[]);
 assert.equal((await call(learner,'/api/ai/tutor',{lessonId:lessons.data[0].id,action:'hint',message:'Give me a hint'})).status,403);
 assert.ifError((await db.from('assessment_sessions').update({status:'ABANDONED'}).eq('user_id',learner.id).eq('status','IN_PROGRESS')).error);
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext();await context.addCookies(learner.cookies());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await mkdir('.impeccable/review/forum',{recursive:true});
 for(const width of [360,768,1280]){
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  for(const [route,name] of [['/forum','list'],[`/forum/${topic}`,'thread'],['/post-test','challenge']]){
   await page.goto(site+route);await page.locator('main h1').waitFor();await page.waitForLoadState('networkidle');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);assert.equal(overflow,false,`${name} ${width} overflow`);
   assert.equal(await page.getByText('Tes Awal',{exact:true}).count(),0);
   await page.screenshot({path:`.impeccable/review/forum/${name}-${width}.png`,fullPage:true});
  }
 }
 await page.setViewportSize({width:360,height:900});await page.goto(site+'/forum');await page.locator('summary').click();await page.getByRole('textbox',{name:'Discussion title'}).waitFor();
 await page.screenshot({path:'.impeccable/review/forum/form-360.png',fullPage:true});
 const guestContext=await browser.newContext({viewport:{width:360,height:900}});
 await guestContext.addCookies([{name:'quethink_locale',value:'id',url:site}]);const guestPage=await guestContext.newPage();
 await guestPage.goto(site+'/guest/start');await guestPage.getByLabel('Nama',{exact:true}).fill('Forum Guest');await guestPage.getByRole('button',{name:'Masuk sebagai tamu',exact:true}).click();await guestPage.waitForURL(site+'/guest');
 await guestPage.getByRole('button',{name:'Menu',exact:true}).click();assert.equal(await guestPage.getByRole('link',{name:'Forum',exact:true}).getAttribute('aria-current'),null,'Forum is not active on guest home');
 await guestPage.goto(site+`/guest/forum/${topic}`);await guestPage.getByRole('heading',{name:post.title,exact:true}).waitFor();
 assert.equal(await guestPage.getByRole('textbox').count(),0,'Guest sees no post/reply form');
 const guestWrite=await guestContext.request.post(site+'/api/forum/topics',{data:post});assert.equal(guestWrite.status(),401);
 await guestPage.screenshot({path:'.impeccable/review/forum/guest-360.png',fullPage:true});
 await guestContext.close();assert.deepEqual(errors,[]);await context.close();
 console.log('PASS: database/general topics, replies, strict validation, author integrity, guest/auth, admin moderation, RLS, hourly quota, active assessment and AI block, mobile/tablet/desktop without overflow. Temporary accounts removed.');
}finally{
 await browser?.close();server.kill('SIGTERM');
 for(const id of ids)assert.ifError((await db.auth.admin.deleteUser(id)).error);
}
