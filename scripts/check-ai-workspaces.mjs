import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const site = 'http://127.0.0.1:3240';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3240'], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
let browser, logs = '';
server.stdout.on('data', chunk => { logs = (logs + chunk).slice(-3000); });
server.stderr.on('data', chunk => { logs = (logs + chunk).slice(-3000); });
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(site)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, logs);
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(site + '/guest/start');
  await page.getByLabel('Name', { exact: true }).fill('UI Review');
  await page.getByRole('button', { name: 'Log in as guest', exact: true }).click();
  await page.waitForURL(site + '/guest');
  await mkdir('.impeccable/review/ai-polish', { recursive: true });
  await page.goto(site + '/guest?view=sqlab');
  const ai = page.getByRole('tab', { name: 'AI Designer', exact: true });
  await ai.waitFor();
  assert.equal(await ai.getAttribute('aria-selected'), 'true');
  await ai.focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab', { name: 'Schema', exact: true }).getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Home');
  assert.equal(await ai.getAttribute('aria-selected'), 'true');
  await page.getByRole('button', { name: 'Online shop', exact: true }).click();
  assert.match(await page.getByLabel('What database do you want to create?').inputValue(), /customers/);
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `SQLab ${width} overflow`);
    await page.screenshot({ path: `.impeccable/review/ai-polish/sqlab-${width}.png`, fullPage: true });
  }
  let fail = true;
  const draft = { version: 1, name: 'Books', schema: { version: 1, tables: [{ id: 't', name: 'books', columns: [{ id: 'id', name: 'id', type: 'integer', primary: true }] }], relations: [] }, rows: { t: [{ id: 1 }] } };
  await page.route('**/api/guest/sqlab', route => route.fulfill(fail ? { status: 503, json: { error: 'AI sedang tidak tersedia.' } } : { json: { draft } }));
  await page.getByRole('button', { name: 'Create a design', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: /AI/ }).waitFor();
  fail = false;
  await page.getByRole('button', { name: 'Create a design', exact: true }).click();
  await page.getByRole('heading', { name: 'Draft: Books', exact: true }).waitFor();
  assert.equal(await ai.getAttribute('aria-selected'), 'true');
  await page.getByRole('button', { name: 'Apply the design', exact: true }).click();
  await page.getByRole('heading', { name: 'Table books', exact: true }).waitFor();
  let tutorFail = false;
  await page.route('**/api/guest/tutor**', route => route.fulfill(route.request().method() === 'GET' ? { json: { sessionId: null, messages: [] } } : tutorFail ? { status: 503, json: { error: 'AI Tutor belum dapat menjawab.' } } : { contentType: 'text/plain', body: 'Start with the source table.\n\n```sql\nSELECT name FROM students;\n```\n\nThen compare the visible rows.' }));
  await page.goto(site + '/guest?view=chatbot');
  await page.getByRole('button', { name: 'Give a hint', exact: true }).click();
  await page.getByText('Then compare the visible rows.', { exact: true }).waitFor();
  assert.equal(await page.locator('pre code').textContent(), 'SELECT name FROM students;\n');
  const textarea = page.getByLabel('Write a question for AI Tutor');
  await textarea.fill('Batal');
  await page.getByRole('button', { name: 'Submit question', exact: true }).click();
  await page.getByRole('list', { name: 'Tutor conversation' }).getByRole('listitem').filter({ hasText: 'Batal' }).waitFor();
  assert.ok((await page.getByRole('list', { name: 'Tutor conversation' }).innerText()).includes('Batal'));
  await page.waitForFunction(() => document.querySelector('ol[aria-busy]')?.getAttribute('aria-busy') === 'false');
  await textarea.blur();
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Chatbot ${width} overflow`);
    await page.screenshot({ path: `.impeccable/review/ai-polish/chatbot-${width}.png`, fullPage: false });
    await textarea.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.impeccable/review/ai-polish/chatbot-composer-${width}.png` });
  }
  await page.getByRole('button', { name: 'Submit question', exact: true }).waitFor({ state: 'visible' });
  tutorFail = true;
  await textarea.fill('Explain keys');
  await page.getByRole('button', { name: 'Submit question', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: /AI/ }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: AI-first SQLab, keyboard tabs, idea prompts, provider error recovery, explicit draft apply, safe chatbot Markdown, verbatim learner text, 360/768/1280 layouts. Provider responses mocked; no live AI cost.');
} finally { await browser?.close(); server.kill('SIGTERM'); }
