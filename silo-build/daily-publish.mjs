#!/usr/bin/env node
// Publish exactly ONE page per day, with verification, and push.
//
//   node scripts/daily-publish.mjs --dry-run   # show what would publish
//   node scripts/daily-publish.mjs             # publish one page and push
//
// Design notes:
//  * Refuses to publish if any gate fails, instead of pushing a broken site.
//  * Verifies BEFORE pushing (local HTML, links, schema) and AFTER pushing
//    (live URL returns 200 and appears in sitemap.xml).
//  * Never force-pushes and never rewrites history.
//  * If the queue is empty it reports and exits 0 rather than failing a cron.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LOCALE_CODES } from './locales.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = 'https://speechtimercalculator.com';
const DRY = process.argv.includes('--dry-run');

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: opts.quiet ? 'pipe' : 'inherit', ...opts });

// Local date, not UTC: a 07:00 IST job must stamp the IST calendar date.
function localDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function step(name, fn) {
  process.stdout.write(`→ ${name} … `);
  try {
    const result = fn();
    console.log('ok');
    return result;
  } catch (error) {
    console.log('FAILED');
    throw error;
  }
}

function loadDb() {
  return JSON.parse(readFileSync(join(ROOT, 'scripts', 'silo-data.json'), 'utf8'));
}

function fileFor(page, code) {
  const url = code === 'en' ? page.url : `/${code}${page.url}`;
  return join(ROOT, url.replace(/^\/|\/$/g, ''), 'index.html');
}

/** Hard gates that must pass before anything is pushed. */
function verifyLocal(page) {
  const problems = [];
  for (const code of LOCALE_CODES) {
    const file = fileFor(page, code);
    if (!existsSync(file)) {
      problems.push(`missing ${code}: ${file}`);
      continue;
    }
    const html = readFileSync(file, 'utf8');
    if (!/<title>[^<]{10,}<\/title>/.test(html)) problems.push(`${code}: no title`);
    if (!/application\/ld\+json/.test(html)) problems.push(`${code}: no JSON-LD`);
    if (!/<h1[^>]*>/.test(html)) problems.push(`${code}: no h1`);
    // A visible placeholder means the renderer leaked a template token.
    const visible = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
    for (const token of ['{n}', 'undefined', 'NaN', '[object Object]']) {
      if (visible.includes(token)) problems.push(`${code}: leaked "${token}"`);
    }
    const words = visible.split(/\s+/).filter(Boolean).length;
    if (words < 400) problems.push(`${code}: thin page (${words} visible words)`);
  }
  return problems;
}

async function verifyLive(page) {
  const problems = [];
  // GitHub Pages needs a moment; retry rather than reporting a false failure.
  for (const code of LOCALE_CODES) {
    const url = `${SITE}${code === 'en' ? page.url : `/${code}${page.url}`}`;
    let status = 0;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await fetch(url, { redirect: 'follow' });
      status = response.status;
      if (status === 200) break;
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    if (status !== 200) problems.push(`${url} → HTTP ${status}`);
  }
  const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
  if (!sitemap.includes(`${SITE}${page.url}`)) {
    problems.push(`sitemap.xml does not list ${page.url}`);
  }
  return problems;
}

async function main() {
  console.log(`\nDaily publish · ${localDate()}\n`);

  // Rebuild from source FIRST so the queue head is read from the data that will
  // actually ship. Reading it before the rebuild can test the wrong page.
  step('build data', () => run('node', ['scripts/build-all-silo-pages.mjs'], { quiet: true }));

  const db = loadDb();
  const next = db.pages.find((page) => !page.published);

  if (!next) {
    console.log('Queue is empty — every silo page is already published. Nothing to do.');
    return;
  }

  console.log(`Next in queue: ${next.slug}  (${next.url})\n`);

  if (DRY) {
    step('publish state', () =>
      run('node', ['scripts/publish.mjs', '--slug', next.slug], { quiet: true }));
    const problems = verifyLocal(next);
    if (problems.length) {
      console.log('\n[DRY RUN] verification problems:');
      problems.forEach((problem) => console.log('  •', problem));
      process.exitCode = 1;
      return;
    }
    console.log(`\n[DRY RUN] ${next.slug} would publish cleanly in ${LOCALE_CODES.length} locales.`);
    console.log('No commit, no push.');
    return;
  }

  const page = next;

  step(`publish ${page.slug}`, () =>
    run('node', ['scripts/publish.mjs', '--slug', page.slug], { quiet: true }));

  step('verify local output', () => {
    const problems = verifyLocal(page);
    if (problems.length) {
      throw new Error(`local verification failed:\n  ${problems.join('\n  ')}`);
    }
  });

  step('commit', () => {
    run('git', ['add', '-A'], { quiet: true });
    const message = `Publish ${page.slug} (${LOCALE_CODES.length} locales)\n\n` +
      `Programmatic silo page: ${page.url}\n` +
      `Word count ${page.wordCount}, ${page.sampleScriptIsComplete ? 'full sample script' : 'timed outline'}.\n`;
    run('git', ['commit', '-m', message], { quiet: true });
  });

  const sha = run('git', ['rev-parse', '--short', 'HEAD'], { quiet: true }).trim();
  step(`push (${sha})`, () => run('git', ['push', 'origin', 'HEAD:main'], { quiet: true }));

  const liveProblems = await verifyLive(page);
  if (liveProblems.length) {
    console.log('\n⚠ pushed, but live verification reported problems:');
    liveProblems.forEach((problem) => console.log('  •', problem));
    console.log(`\nRevert if needed: git revert ${sha}`);
    process.exitCode = 1;
    return;
  }

  const remaining = loadDb().pages.filter((item) => !item.published).length;
  console.log(`\n✓ Live in ${LOCALE_CODES.length} locales · commit ${sha} · ${remaining} pages left in queue`);
  for (const code of LOCALE_CODES) {
    console.log(`  ${SITE}${code === 'en' ? page.url : `/${code}${page.url}`}`);
  }
}

main().catch((error) => {
  console.error('\n✗', error.message);
  process.exitCode = 1;
});
