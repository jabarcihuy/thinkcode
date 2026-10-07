import {PDFDocument,PDFName} from 'pdf-lib';import {writeFile,mkdir} from 'node:fs/promises';
import {spawn}from'node:child_process';import assert from'node:assert/strict';import{chromium}from'playwright-core';
const site='http://localhost:3232';const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3232'],{stdio:['ignore','pipe','pipe']});let logs='',browser;server.stdout.on('data',c=>logs+=c);server.stderr.on('data',c=>logs+=c);
try{await mkdir('.impeccable/review',{recursive:true});for(let i=0;i<80;i++){try{if((await fetch(site)).ok)break;}catch{}await new Promise(r=>setTimeout(r,500));}
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:360,height:800}});const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error'&&/hydration|hydrated|didn't match/i.test(message.text()))errors.push(message.text());});
 for(const width of [360,1280]){
 await page.setViewportSize({width,height:800});
 await context.clearCookies();await page.goto(site);await page.locator('html[lang=en]').waitFor();
 for(const lang of ['en','id']){
  await page.getByRole('combobox').selectOption(lang);await page.locator('html[lang='+lang+']').waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(process.env.CAPTURE!=='0')await page.screenshot({path:'.impeccable/review/language-landing-'+lang+'-'+width+'.png',fullPage:true});
  await page.goto(site+'/login');await page.locator('html[lang='+lang+']').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(process.env.CAPTURE!=='0')await page.screenshot({path:'.impeccable/review/language-login-'+lang+'-'+width+'.png',fullPage:true});await page.goto(site);
 }
 }
 await page.setViewportSize({width:360,height:800});await page.goto(site+'/guest/start');await page.getByRole('combobox').selectOption('en');await page.locator('html[lang=en]').waitFor();
 await page.getByLabel('Name',{exact:true}).fill('Locale Test');await page.getByRole('button',{name:'Log in as guest',exact:true}).click();await page.waitForURL(site+'/guest');
 for(const lang of ['en','id']){
  await page.getByRole('combobox').selectOption(lang);await page.locator('html[lang='+lang+']').waitFor();await page.goto(site+'/guest?view=materials');
  await page.getByRole('heading',{name:lang==='en'?'Databases and SQL':'Basis Data dan SQL',exact:true}).waitFor();
  if(process.env.CAPTURE!=='0')await page.screenshot({path:'.impeccable/review/language-materials-'+lang+'-360.png',fullPage:true});
  await page.goto(site+'/guest?view=tests');await page.getByRole('link',{name:lang==='en'?'Pre-test':'Tes Awal',exact:true}).waitFor();
  if(process.env.CAPTURE!=='0')await page.screenshot({path:'.impeccable/review/language-test-'+lang+'-360.png',fullPage:true});
 }
 await page.getByRole('combobox').selectOption('en');await page.locator('html[lang=en]').waitFor();
 await page.getByRole('button',{name:'Start the Pre-test',exact:true}).click();await page.waitForURL('**/guest/tests/**');
 const first=page.locator('input[type=radio]').first();await first.check();const choice=await first.getAttribute('value');
 await page.getByRole('combobox').selectOption('id');await page.locator('html[lang=id]').waitFor();assert.ok(await page.locator('input[type=radio]:checked').getAttribute('value')===choice);
 const cookies=()=>context.cookies().then(a=>a.map(x=>x.name+'='+x.value).join('; '));
 assert.equal((await context.request.post(site+'/api/guest/tutor',{data:{},headers:{cookie:await cookies()}})).status(),403);
 const total=Number(await page.getByRole('progressbar').getAttribute('aria-valuemax'));assert.equal(total,10);
 for(let i=0;i<total;i++){await page.locator('input[type=radio]').first().check();if(i<total-1)await page.getByRole('button',{name:'Berikutnya',exact:true}).click();}
 await page.getByRole('button',{name:'Kirim tes awal',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Kirim jawaban',exact:true}).click();await page.waitForURL('**/guest?view=pre-result');
 await page.goto(site+'/guest/materials/membaca-bentuk-data');await page.getByRole('combobox').selectOption('en');await page.locator('html[lang=en]').waitFor();
 const prose=await page.locator('article').innerText();assert.ok(prose.includes('Reading the Shape of Data'));await writeFile('.impeccable/i18n/material-en.txt',prose);
 if(process.env.CAPTURE!=='0')await page.screenshot({path:'.impeccable/review/language-reading-en-360.png',fullPage:true});
 const pdf=await context.request.get(site+'/api/guest/pdf/membaca-bentuk-data',{headers:{cookie:await cookies()}});assert.equal(pdf.status(),200);const doc=await PDFDocument.load(await pdf.body());assert.ok(doc.getTitle().startsWith('Material 1'));assert.equal(doc.catalog.get(PDFName.of('Lang')).decodeText(),'en-US');
 assert.deepEqual(errors,[]);console.log('PASS: English default, Indonesian/English switch, persistence, SSR language, mobile/desktop public/login and guest material/test labels, draft retention during a test, backend AI block, trusted guest submission, translated reading and English PDF.');
} catch(e){console.error(logs.slice(-1800));throw e;}finally{await browser?.close();server.kill();}
