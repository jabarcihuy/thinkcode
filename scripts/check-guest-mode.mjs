import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright-core';
const site = 'http://127.0.0.1:3225';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3225'], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
let browser, logs = '';
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-2000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-2000); });
try {
  for (let i = 0; i < 80; i++) { try { if ((await fetch(site)).ok) break; } catch {} await new Promise(resolve => setTimeout(resolve, 500)); }
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const request = {
    post: async (url, options = {}) => context.request.post(url, { ...options, headers: { cookie: (await context.cookies()).map(cookie => `${cookie.name}=${cookie.value}`).join('; '), ...options.headers } }),
    get: async url => context.request.get(url, { headers: { cookie: (await context.cookies()).map(cookie => `${cookie.name}=${cookie.value}`).join('; ') } }),
  };
  await context.addCookies([{ name: 'quethink_locale', value: 'id', url: site }]);
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(site + '/guest/start');
  await page.getByLabel('Nama', { exact: true }).fill('Uji Tamu Lokal');
  await page.getByRole('button', { name: 'Masuk sebagai tamu', exact: true }).click();
  await page.waitForURL(site + '/guest');
  await page.getByRole('heading', { name: 'Kenali titik awalmu', exact: true }).waitFor();
  const cookie = (await context.cookies()).find(cookie => cookie.name === 'quethink_guest');
  assert.ok(cookie?.httpOnly);
  const guest = JSON.parse(Buffer.from(cookie.value.split('.')[0], 'base64url').toString());
  assert.equal((await request.post(site + '/api/ai/tutor', { data: { lessonId: '00000000-0000-4000-8000-000000000001', action: 'hint' } })).status(), 401);
  assert.ok((await request.get(site + '/admin')).url().includes('/login'));
  const { data: path, error: pathError } = await db.from('learning_paths').select('id').eq('slug', 'database-fundamentals').single(); assert.ifError(pathError);
  const { data: pre, error: preError } = await db.from('assessments').select('id').eq('learning_path_id', path.id).eq('type', 'PRETEST').eq('is_published', true).single(); assert.ifError(preError);
  const { data: chapters, error: chapterError } = await db.from('chapters').select('id,position').eq('learning_path_id', path.id).eq('is_published', true); assert.ifError(chapterError);
  const { data: lessons, error: lessonError } = await db.from('lessons').select('id,slug,title,content,chapter_id,position').in('chapter_id', chapters.map(chapter => chapter.id)).eq('is_published', true); assert.ifError(lessonError);
  const positions = new Map(chapters.map(chapter => [chapter.id, chapter.position]));
  lessons.sort((a,b) => positions.get(a.chapter_id) - positions.get(b.chapter_id) || a.position - b.position);
  await page.getByRole('link', { name: 'Mulai tes awal', exact: true }).click();
  await page.getByRole('button', { name: 'Mulai tes awal', exact: true }).click();
  await page.waitForURL(site + '/guest/tests/' + pre.id);
  assert.equal((await request.post(site + '/api/guest/tutor', { data: {} })).status(), 403);
  await page.locator('input[type=radio]').first().check();
  await page.getByRole('button', { name: 'Berikutnya', exact: true }).click();
  await page.reload();
  await page.locator('input[type=radio]').first().waitFor();
  const { count } = await db.from('assessment_items').select('id', { count: 'exact', head: true }).eq('assessment_id', pre.id);
  // The saved active index is 1; answer all remaining questions through the real UI.
  for (let i = 1; i < count; i++) {
    await page.locator('input[type=radio]').first().check();
    if (i < count - 1) await page.getByRole('button', { name: 'Berikutnya', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Kirim tes awal', exact: true }).click();
  const submitted = page.waitForResponse(response => response.url().includes('/api/guest/tests/') && response.request().method() === 'POST');
  await page.getByRole('dialog').getByRole('button', { name: 'Kirim jawaban', exact: true }).click();
  const submittedResponse = await submitted;
  assert.equal(submittedResponse.status(), 200, 'Guest submit: ' + await submittedResponse.text());
  await page.getByText('Pemahaman awal tercatat', { exact: true }).waitFor();
  const progressKey = 'quethink:guest-local:v1:progress';
  const progress = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).value, progressKey);
  assert.ok(progress.tests[pre.id]);
  assert.ok(Array.isArray(progress.tests[pre.id].topicSummary));
  assert.ok(!(await page.content()).includes('answer_config'));
  await page.getByRole('link', { name: 'Mulai membaca materi', exact: true }).click();
  const first = lessons[0];
  await page.getByRole('link', { name: new RegExp(first.title) }).first().click();
  await page.getByRole('heading', { name: `Materi 1. ${first.title}`, exact: true }).waitFor();
  await page.getByRole('button', { name: 'Selesai membaca, lanjut ke Lab', exact: true }).click();
  await page.waitForURL(site + '/guest/lab/' + first.slug + '#lesson-practice');
  const { data: exercise, error: exerciseError } = await db.from('exercises').select('id,config,public_config').eq('lesson_id', first.id).eq('is_required', true).eq('is_published', true).order('position').limit(1).single(); assert.ifError(exerciseError);
  // Submit the maintained reference answer to the real grader, through the UI check hook.
  await page.route('**/api/guest/check/' + exercise.id, route => route.continue({ postData: JSON.stringify({ pathSlug: 'database-fundamentals', answer: exercise.config.answer }) }));
  const section = page.locator('#practice-' + exercise.id);
  if (exercise.public_config.mode === 'schema') {
    await section.getByLabel('Tabel baru').fill('books');
    await section.getByRole('button', { name: 'Tambah tabel', exact: true }).click();
    await section.getByRole('tab', { name: 'Periksa', exact: true }).click();
    await section.getByRole('button', { name: 'Periksa model', exact: true }).click();
  } else if (exercise.public_config.mode === 'choice') {
    await section.locator('input[type=radio]').first().check();
    await section.getByRole('button', { name: /Periksa/ }).click();
  } else {
    await section.getByRole('button', { name: /Periksa/ }).click();
  }
  await section.getByText('Jawaban benar', { exact: true }).waitFor();
  await page.unroute('**/api/guest/check/' + exercise.id);
  await page.getByRole('heading', { name: 'Materi tuntas', exact: true }).waitFor();
  await page.goto(site + '/guest');
  await page.getByText('1 dari ' + lessons.length + ' selesai', { exact: true }).waitFor();
  await page.reload(); await page.getByText('1 dari ' + lessons.length + ' selesai', { exact: true }).waitFor();
  // SQLab draft must survive reload and a new signed guest session.
  await page.goto(site + '/guest?view=sqlab');
  await page.getByLabel('Nama tabel baru').fill('books'); await page.getByRole('button', { name: 'Tambah', exact: true }).click();
  await page.getByLabel('Nama kolom', { exact: true }).fill('id'); await page.getByLabel('Tipe data', { exact: true }).selectOption('integer'); await page.getByRole('checkbox', { name: 'Primary key', exact: true }).check(); await page.getByRole('button', { name: 'Tambah kolom', exact: true }).click();
  await page.reload(); await page.getByRole('heading', { name: 'Tabel books', exact: true }).waitFor();
  await page.goto(site + '/guest?view=profile');
  await page.getByLabel('Nama tampilan', { exact: true }).fill('Nama Lokal'); await page.getByRole('button', { name: 'Simpan profil', exact: true }).click();
  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await page.waitForURL(site + '/');
  await page.goto(site + '/guest/start'); await page.getByLabel('Nama', { exact: true }).fill('Sesi Baru'); await page.getByRole('button', { name: 'Masuk sebagai tamu', exact: true }).click(); await page.waitForURL(site + '/guest');
  await page.getByRole('heading', { name: 'Halo, Nama Lokal.', exact: true }).waitFor(); await page.getByText('1 dari ' + lessons.length + ' selesai', { exact: true }).waitFor();
  await page.goto(site + '/guest?view=sqlab'); await page.getByRole('heading', { name: 'Tabel books', exact: true }).waitFor();
  // No guest database writes, unchanged account/admin authorization.
  for (const table of ['profiles','lesson_progress','exercise_attempts','ai_sessions','assessment_sessions','assessment_results']) {
    const column = table === 'profiles' ? 'id' : 'user_id';
    const result = await db.from(table).select(column, { count: 'exact', head: true }).eq(column, guest.id); assert.ifError(result.error); assert.equal(result.count, 0, table);
  }
  await mkdir('.impeccable/review', { recursive: true });
  for (const width of [360,768,1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [view,name] of [['','dashboard'],['materials','materials'],['lab','lab'],['tests','tests'],['post-test','post-test'],['chatbot','chatbot'],['sqlab','sqlab'],['profile','profile']]) {
      await page.goto(site + '/guest' + (view ? '?view=' + view : ''));
      await page.locator('main h1').waitFor();
      if (view === 'sqlab') await page.getByRole('tab', { name: 'Skema', exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${view} ${width} overflow`);
      if (process.env.GUEST_CAPTURE !== '0' && (width === 360 || width === 1280)) await page.screenshot({ path: `.impeccable/review/guest-local-${name}-${width}.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  assert.equal(await page.getByRole('navigation', { name: 'Fitur lainnya', exact: true }).getByRole('link').count(), 5);
  // Reset only the guest namespace. Account drafts must survive.
  await page.evaluate(() => localStorage.setItem('quethink:practice-draft:v1:account:sample', 'preserve'));
  await page.goto(site + '/guest?view=profile'); await page.getByRole('button', { name: 'Reset progres tamu', exact: true }).click(); await page.getByRole('button', { name: 'Hapus data tamu', exact: true }).click();
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(key => key.includes('quethink:guest-local:'))), []);
  assert.equal(await page.evaluate(() => localStorage.getItem('quethink:practice-draft:v1:account:sample')), 'preserve');
  await page.goto(site + '/guest'); await page.getByRole('heading', { name: 'Kenali titik awalmu', exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: shared learner views, local pre-test draft/results, reading/core progression, reload/new-session recovery, local SQLab, profile/reset account isolation, 360/768/1280 layouts, active-test AI block, RBAC and no guest DB writes.');
} catch (error) { console.error('Guest check failed:', error.message); console.error(logs); throw error; }
finally { await browser?.close(); server.kill('SIGTERM'); }
