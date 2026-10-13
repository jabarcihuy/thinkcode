import assert from 'node:assert/strict';
import { randomBytes,randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
const authOptions={persistSession:false,autoRefreshToken:false};
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:authOptions});
const site='http://127.0.0.1:3241',created=[];
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3241'],{stdio:'ignore'});
async function account(){const email=`quethink-native-${randomUUID()}@example.invalid`,password=randomBytes(24).toString('base64url');const result=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{role:'ADMIN'}});assert.ifError(result.error);created.push(result.data.user.id);const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:authOptions});const signed=await client.auth.signInWithPassword({email,password});assert.ifError(signed.error);return{id:result.data.user.id,token:signed.data.session.access_token,client};}
async function call(user,path,body,status=200,locale='en'){const response=await fetch(site+'/api/mobile/v1/'+path,{method:body===undefined?'GET':'POST',headers:{...(user?{authorization:`Bearer ${user.token}`} : {}),'x-quethink-locale':locale,...(body===undefined?{}:{'content-type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});const value=await response.json();assert.equal(response.status,status,`${path}: ${response.status} ${value.error??''}`);return value;}
function safe(value){const serialized=JSON.stringify(value);for(const field of ['answer_config','expected_output','hiddenTests','referenceQuery','service_role','sb_secret_'])assert.ok(!serialized.includes(field),`Private field leaked: ${field}`);}
function modelAnswer(model){return{schema:{version:1,tables:Object.entries(model.tables).map(([name,columns])=>({id:name,name,columns:Object.entries(columns).map(([column,spec])=>({id:`${name}-${column}`,name:column,...spec}))})),relations:model.relations.map(([pt,pc,ct,cc],i)=>({id:`edge-${i}`,parentTable:pt,parentColumn:`${pt}-${pc}`,childTable:ct,childColumn:`${ct}-${cc}`}))}};}
try{
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(site)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert.ok(ready,'Server unavailable');
 await call(null,'course',undefined,401);
 const user=await account(),other=await account();let course=await call(user,'course');safe(course);assert.equal(course.profile.role,'USER');assert.equal(course.metrics.percentage,0);assert.equal(course.lessons.length,11);
 const locked=course.lessons.find(x=>x.state==='LOCKED');assert.ok(locked);await call(user,`materials/${locked.id}`,undefined,403);await call(user,`materials/${locked.id}/read`,{},403);
 const translation=await call(user,'course',undefined,200,'id');assert.equal(translation.lessons[0].id,course.lessons[0].id);assert.notEqual(translation.lessons[0].title,course.lessons[0].title);
 for(const lesson of course.lessons){
  const reading=await call(user,`materials/${lesson.id}`);safe(reading);assert.ok(reading.content.length>30);
  await call(user,`materials/${lesson.id}/lab`,undefined,403);
  await call(user,`materials/${lesson.id}/read`,{});
  const lab=await call(user,`materials/${lesson.id}/lab`);safe(lab);assert.ok(lab.exercises.length);assert.equal(lab.sqlEnabled,lesson.chapterPosition>1);
  for(const exercise of lab.exercises){const privateRow=await admin.from('exercises').select('config').eq('id',exercise.id).single();assert.ifError(privateRow.error);const key=privateRow.data.config.answer;if(key.model){assert.deepEqual(exercise.modeling.tables.map(t=>t.name).sort(),Object.keys(key.model.tables).sort(),'Native schema blueprint differs from graded model');}const answer=key.model?modelAnswer(key.model):key;
   await call(user,`exercises/${exercise.id}/check`,{pathSlug:course.path.slug,answer,score:100,userId:other.id},400);
   const graded=await call(user,`exercises/${exercise.id}/check`,{pathSlug:course.path.slug,answer});safe(graded);assert.equal(graded.passed,true);assert.equal(graded.lessonCompleted,true);
  }
  console.log(`Verified material ${course.lessons.indexOf(lesson)+1}/${course.lessons.length}`);
  const refreshed=await call(user,'course');assert.equal(refreshed.lessons.find(x=>x.id===lesson.id).state,'COMPLETED');
 }
 course=await call(user,'course');assert.equal(course.metrics.percentage,100);assert.equal((await call(other,'course')).metrics.percentage,0);
 const ownAttempts=await user.client.from('exercise_attempts').select('user_id');assert.ifError(ownAttempts.error);assert.ok(ownAttempts.data.every(x=>x.user_id===user.id));
 const assessment=await admin.from('assessments').select('id').eq('slug','post-test-basis-data-sql-v2').single();assert.ifError(assessment.error);
 const session=await admin.from('assessment_sessions').insert({user_id:user.id,assessment_id:assessment.data.id,status:'IN_PROGRESS'}).select('id').single();assert.ifError(session.error);
 assert.equal((await call(user,'course')).activeAssessment,true);
 await call(user,`materials/${course.lessons[0].id}/lab`,undefined,403);
 await call(user,`materials/${course.lessons[0].id}/read`,{},403);
 await call(user,`materials/${course.lessons[0].id}`);
 console.log('PASS: bearer auth, DB role, EN/ID, 11 reading/core completions, locked URLs, forged score rejection, owner-only attempts, 100% material progress, active-assessment gates, safe projections.');
}finally{for(const id of created){const result=await admin.auth.admin.deleteUser(id);assert.ifError(result.error);}server.kill('SIGTERM');console.log('Temporary native integration accounts cleaned up.');}
