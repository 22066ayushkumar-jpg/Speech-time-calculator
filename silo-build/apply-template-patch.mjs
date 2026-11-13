#!/usr/bin/env node
// Splice the spec §3/§5/§7 template additions into scripts/publish.mjs.
//
// Idempotent: running it twice is a no-op. Each edit is anchored on an exact
// string from the current upstream file, so if upstream changes the anchor the
// script fails loudly instead of silently producing a half-patched renderer.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(ROOT, 'scripts', 'publish.mjs');
const additionsPath = join(ROOT, 'silo-build', 'template-additions.mjs');

let src = readFileSync(target, 'utf8');
const additions = readFileSync(additionsPath, 'utf8');
const MARK = '/* --- silo-build patch: spec §3/§5/§7 --- */';

if (src.includes(MARK)) {
  console.log('publish.mjs already patched — nothing to do.');
  process.exit(0);
}

let patched = 0;
function replaceOnce(from, to, why) {
  const index = src.indexOf(from);
  if (index === -1) {
    throw new Error(`anchor not found for: ${why}\n---\n${from.slice(0, 160)}`);
  }
  if (src.indexOf(from, index + 1) !== -1) {
    throw new Error(`anchor is ambiguous (appears more than once) for: ${why}`);
  }
  src = src.slice(0, index) + to + src.slice(index + from.length);
  patched += 1;
}

// 1. Insert the helpers immediately before enrichedMain.
replaceOnce(
  'function enrichedMain(ctx) {',
  `${MARK}\n${additions}\nfunction enrichedMain(ctx) {`,
  'insert helper block before enrichedMain'
);

// 2. Add the preset buttons under the scenario <select>.
replaceOnce(
  `        <option value="custom">\${escapeHtml(s.calculator.customOption)}</option>
      </select></div>`,
  `        <option value="custom">\${escapeHtml(s.calculator.customOption)}</option>
      </select></div>
      \${presetButtons(page, code, ctx)}`,
  'insert preset buttons after scenario select'
);

// 3. Render the script block + hub between the tips section and related links.
replaceOnce(
  `    \${ctx.related}

    \${ctx.faqBlock}`,
  `    \${scriptBlock(page, code, ctx)}

    \${ctx.related}

    \${hubBlock(page, code, (ctx.db || { pages: [] }), ctx)}

    \${ctx.faqBlock}`,
  'insert script block and hub'
);

// 4. Expose `db` and `code` on ctx so the new blocks can enumerate siblings
//    and resolve the active locale.
replaceOnce(
  '  const ctx = {\n    page, loc, ui, text, sections, breadcrumbHtml, heroTail, speakingTime, silentTime, pageCount,\n    pacingHeading, bufferBody, ctaBody, faqBlock, related: relatedLinks(page, code, db)\n  };',
  '  const ctx = {\n    page, code, loc, ui, text, sections, breadcrumbHtml, heroTail, speakingTime, silentTime, pageCount,\n    pacingHeading, bufferBody, ctaBody, faqBlock, related: relatedLinks(page, code, db), db\n  };',
  'expose db and code on ctx'
);

// 5. Emit the teleprompter handoff alongside the calculator script.
replaceOnce(
  '  ${sections ? budgetCalculatorScript(page, code) : miniCalculatorScript(page, code)}',
  '  ${sections ? budgetCalculatorScript(page, code) : miniCalculatorScript(page, code)}\n  ${sections ? teleprompterHandoffScript(page) : \'\'}',
  'emit teleprompter handoff'
);

writeFileSync(target, src);
console.log(`Patched scripts/publish.mjs (${patched} edits).`);
