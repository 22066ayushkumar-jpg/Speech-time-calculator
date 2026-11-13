#!/usr/bin/env node
// Build all 15 programmatic silo pages into scripts/silo-data.json.
//
// Run from the repo root:
//   node scripts/build-all-silo-pages.mjs            # write silo-data.json
//   node scripts/build-all-silo-pages.mjs --dry-run   # report without writing
//
// This script only produces DATA. It deliberately does not set `published`, and it
// does not touch HTML, sitemap.xml or index.html — `scripts/publish.mjs` owns all
// of that. Keeping the split means a page can be fully authored and still hold as
// a draft until it is deliberately published.
//
// Every number is recomputed from the canonical rate constants in core.mjs, so a
// change to the 130 WPM baseline or the 85% buffer propagates everywhere instead
// of leaving stale hardcoded figures in 15 records.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LOCALES, LOCALE_CODES } from './locales.mjs';
import {
  MINUTE_PAGES, WORD_PAGES, RATES, BUFFER_PERCENT, BUSINESS_WPM,
  SINGLE_WPP, DOUBLE_WPP,
  wordsForMinutes, bufferFor, secondsForWords, stageSecondsFor, clock
} from '../silo-build/core.mjs';
import { PHRASES, fill } from '../silo-build/phrases.mjs';
import { setLocales } from '../silo-build/content-i18n.mjs';
import { buildContent } from '../silo-build/content-i18n.mjs';
import {
  SCRIPTS, CALIBRATION, OUTLINES, outlineTime, wantsFullScript
} from '../silo-build/scripts-content.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_PATH = join(ROOT, 'scripts', 'silo-data.json');
const DRY = process.argv.includes('--dry-run');

setLocales(LOCALES);

const wordCount = (text) =>
  (String(text).match(/[\p{L}\p{N}]+(?:[’'\-‐‑‒–—][\p{L}\p{N}]+)*/gu) || []).length;

/* ────────────────────────────────────────────────────────── page assembly */

function calculations(kind, value) {
  return RATES.map(({ pace, wpm }) => {
    if (kind === 'minutes') {
      return { pace, wpm, words: wpm * value, time: clock(value * 60, LOCALES.en.ui) };
    }
    return { pace, wpm, words: value, time: clock(value / wpm * 60, LOCALES.en.ui) };
  });
}

function buildMinutesPage(spec) {
  const m = spec.minutes;
  const words = wordsForMinutes(m);
  const usable = bufferFor(words);

  return {
    slug: spec.slug,
    type: 'minutes',
    published: false,
    publishedAt: null,
    url: `/minutes/${spec.slug}/`,
    // English copy is authored per locale in content-i18n.mjs, so take en from there.
    ...(() => {
      const en = buildContent('en', { minutes: m, wordCount: words, scenario: spec.scenario, useCase: spec.useCase, paragraphCount: spec.paragraphs, slideCount: spec.slides, stageBuffer: { usableWords: usable } }, 'minutes');
      return { title: en.title, metaDescription: en.metaDescription, h1: en.h1, heroAnswer: en.heroAnswer, homepageAnchorForms: en.anchorForms, faqs: en.faqs };
    })(),
    durationMinutes: m,
    wordCount: words,
    sampleScriptWordCount: 0, // filled below
    sampleScriptIsComplete: wantsFullScript('minutes', m),
    sampleScriptNote: null,
    calculations: calculations('minutes', m),
    pageCounts: {
      singleSpaced: Number((words / SINGLE_WPP).toFixed(2)),
      doubleSpaced: Number((words / DOUBLE_WPP).toFixed(2)),
      singleSpacedWordsPerPage: SINGLE_WPP,
      doubleSpacedWordsPerPage: DOUBLE_WPP
    },
    stageBuffer: {
      percent: BUFFER_PERCENT,
      usableWords: usable,
      usableTime: clock(usable / BUSINESS_WPM * 60, LOCALES.en.ui),
      fullTime: clock(m * 60, LOCALES.en.ui)
    },
    sampleScript: [],
    wordsForTargetTime: { wpm: BUSINESS_WPM, words },
    guideLabel: null,
    translations: {},
    sections: null,
    homepageTableWords: [words]
  };
}

function buildWordsPage(spec) {
  const w = spec.words;
  const base = secondsForWords(w);
  const stage = stageSecondsFor(w);

  return {
    slug: spec.slug,
    type: 'words',
    useCase: spec.useCase,
    published: false,
    publishedAt: null,
    url: `/words/${spec.slug}/`,
    ...(() => {
      const en = buildContent('en', { words: w, baseSeconds: base, stageSeconds: stage, useCase: spec.useCase }, 'words');
      return { title: en.title, metaDescription: en.metaDescription, h1: en.h1, heroAnswer: en.heroAnswer, homepageAnchorForms: en.anchorForms, faqs: en.faqs };
    })(),
    durationMinutes: Number((base / 60).toFixed(2)),
    wordCount: w,
    sampleScriptWordCount: 0,
    sampleScriptIsComplete: wantsFullScript('words', w),
    sampleScriptNote: null,
    calculations: calculations('words', w),
    pageCounts: {
      singleSpaced: Number((w / SINGLE_WPP).toFixed(2)),
      doubleSpaced: Number((w / DOUBLE_WPP).toFixed(2)),
      singleSpacedWordsPerPage: SINGLE_WPP,
      doubleSpacedWordsPerPage: DOUBLE_WPP
    },
    stageBuffer: {
      percent: BUFFER_PERCENT,
      usableWords: w,
      usableTime: clock(stage, LOCALES.en.ui),
      fullTime: clock(base, LOCALES.en.ui)
    },
    sampleScript: [],
    speakingTimeAtBusinessPace: clock(base, LOCALES.en.ui),
    guideLabel: null,
    translations: {},
    sections: null
  };
}

/* ────────────────────────────────────────────── sections composition per locale */

function buildSections(code, page, kind, spec) {
  const ph = PHRASES[code];
  const L = LOCALES[code];
  const u = L.ui;
  const value = kind === 'minutes' ? page.durationMinutes : page.wordCount;
  const content = buildContent(code, {
    minutes: page.durationMinutes,
    words: page.wordCount,
    wordCount: page.wordCount,
    baseSeconds: secondsForWords(page.wordCount),
    stageSeconds: stageSecondsFor(page.wordCount),
    scenario: spec.scenario,
    useCase: spec.useCase,
    paragraphCount: spec.paragraphs,
    slideCount: spec.slides,
    stageBuffer: { usableWords: page.stageBuffer.usableWords }
  }, kind);

  const nLocal = kind === 'minutes'
    ? String(page.durationMinutes)
    : new Intl.NumberFormat(code === 'hi' ? 'en-IN' : code, { useGrouping: true }).format(page.wordCount).replace(/,/g, L.thousands);

  // Matrix rows, recomputed per locale so the numbers are identical but the
  // pace labels and scenario wording are native. `scenario` falls back through
  // spec → page → a per-kind default, because the /words/ path has no single
  // "best scenario" per pace and must not render `undefined`.
  const scenarioFor = (row) =>
    spec.scenario || page.scenario || page.useCase ||
    (kind === 'minutes' ? '' : ph.columns[5].label);

  const rows = page.calculations
    .filter((row) => row.wpm !== 230)
    .map((row) => {
      const base = {
        pace: ph.paceNames[[100, 115, 130, 145, 160].indexOf(row.wpm)] ?? row.pace,
        wpm: row.wpm,
        words: kind === 'minutes' ? row.words : page.wordCount,
        buffer: kind === 'minutes' ? bufferFor(row.words) : Math.round(row.words * 1.15),
        scenario: scenarioFor(row)
      };
      // /words/ pages vary time, not word count, so expose formatted time cells.
      if (kind === 'words') {
        base.time = clock(page.wordCount / row.wpm * 60, u);
        base.bufferTime = clock(page.wordCount / row.wpm * 60 * 1.15, u);
      }
      return base;
    });

  const columns = ph.columns.map((col) => {
    const label = fill(kind === 'words' && col.wordsLabel ? col.wordsLabel : col.label, { n: nLocal });
    const sub = kind === 'words' && col.wordsSub ? col.wordsSub : col.sub;
    return sub ? { label, sub } : { label };
  });

  return {
    crumbs: [
      `${u.home}`,
      ph.crumbsMiddle,
      fill(kind === 'minutes' ? ph.crumbMinutes : ph.crumbWords, { n: nLocal })
    ],
    answer: {
      heading: ph.answerHeading,
      paragraphs: content.answer
    },
    calculator: {
      heading: fill(kind === 'minutes' ? ph.calcHeadingMinutes : ph.calcHeadingWords, { n: nLocal }),
      privateTag: fill(kind === 'minutes' ? ph.privateTagMinutes : ph.privateTagWords, { n: nLocal }),
      scenarioLabel: ph.scenarioLabel,
      customOption: ph.customOption,
      paceLabel: ph.paceLabel,
      budgetLabel: fill(kind === 'minutes' ? ph.budgetLabelMinutes : ph.budgetLabelWords, { n: nLocal }),
      scenarios: ph.scenarios,
      readoutBefore: kind === 'minutes' ? fill(ph.readoutBeforeMinutes, { n: nLocal }) : ph.readoutBeforeWords,
      readoutAfter: kind === 'minutes' ? fill(ph.readoutAfterMinutes, { n: nLocal }) : ph.readoutAfterWords
    },
    matrix: {
      heading: fill(kind === 'minutes' ? ph.matrixHeadingMinutes : ph.matrixHeadingWords, { n: nLocal }),
      rows,
      footnote: ph.matrixFootnote,
      columns
    },
    tips: {
      // For /words/ pages the "how many pages" question must be about the word
      // count, not the minute count, so pass the value that matches the page type.
      heading: fill(
        kind === 'minutes' ? ph.pagesHeading : ph.pagesHeadingWords,
        { n: nLocal }
      ),
      items: content.tips
    },
    faqHeading: fill(kind === 'minutes' ? ph.faqHeadingMinutes : ph.faqHeadingWords, { n: nLocal }),
    cta: {
      heading: fill(kind === 'minutes' ? ph.ctaHeadingMinutes : ph.ctaHeadingWords, { n: nLocal }),
      body: ph.ctaBody
    },
    // §5 sample script / outline block labels.
    script: {
      heading: fill(kind === 'minutes' ? ph.sampleScriptHeading : ph.sampleScriptHeadingWords, { n: nLocal }),
      outlineHeading: fill(kind === 'minutes' ? ph.outlineHeading : ph.outlineHeadingWords, { n: nLocal }),
      calibrationHeading: ph.calibrationHeading,
      calibrationIntro: fill(ph.calibrationIntro, {
        label: kind === 'minutes'
          ? fill(kind === 'minutes' ? ph.crumbMinutes : ph.crumbWords, { n: nLocal })
          : `${page.wordCount}`
      }),
      rehearseButton: ph.rehearseButton,
      rehearseNote: ph.rehearseNote,
      wordsLabel: u.wordsUnit
    },
    // §7 full 15-link reference hub.
    hub: {
      heading: ph.hubHeading,
      minutesHeading: ph.hubMinutes,
      wordsHeading: ph.hubWords
    }
  };
}

/* ──────────────────────────────────────────────────────────────── main flow */

function attachScripts(page, kind, spec) {
  const value = kind === 'minutes' ? page.durationMinutes : page.wordCount;
  const full = wantsFullScript(kind, value);

  if (full) {
    const byLocale = SCRIPTS[page.slug];
    if (!byLocale) {
      // Short page without an authored script: fall back to the calibration
      // passage so the page still ships with something to rehearse.
      return {
        note: 'calibration-only',
        scripts: Object.fromEntries(
          LOCALE_CODES.map((code) => [code, [{ at: '0:00', text: CALIBRATION[code] }]])
        )
      };
    }
    return { note: null, scripts: byLocale };
  }
  return { note: 'calibration-only', scripts: Object.fromEntries(LOCALE_CODES.map((code) => [code, []])) };
}

function main() {
  const db = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

  const minutesPages = MINUTE_PAGES.map((spec) => {
    const page = buildMinutesPage(spec);
    const { note, scripts } = attachScripts(page, 'minutes', spec);

    const enScript = scripts.en || [];
    page.sampleScript = enScript.map((part) => ({ ...part, words: wordCount(part.text) }));
    page.sampleScriptWordCount = page.sampleScript.reduce((a, p) => a + p.words, 0);
    page.sampleScriptNote = note;

    page.sections = buildSections('en', page, 'minutes', spec);
    for (const code of LOCALE_CODES.filter((c) => c !== 'en')) {
      const content = buildContent(code, {
        minutes: page.durationMinutes, wordCount: page.wordCount,
        scenario: spec.scenario, useCase: spec.useCase,
        paragraphCount: spec.paragraphs, slideCount: spec.slides,
        stageBuffer: { usableWords: page.stageBuffer.usableWords }
      }, 'minutes');
      page.translations[code] = {
        title: content.title,
        metaDescription: content.metaDescription,
        h1: content.h1,
        guideLabel: content.h1,
        heroAnswer: content.heroAnswer,
        anchorForms: content.anchorForms,
        faqs: content.faqs,
        sections: buildSections(code, page, 'minutes', spec)
      };
    }
    page.guideLabel = content_en_label(page);
    return page;
  });

  const wordsPages = WORD_PAGES.map((spec) => {
    const page = buildWordsPage(spec);
    const { note, scripts } = attachScripts(page, 'words', spec);

    const enScript = scripts.en || [];
    page.sampleScript = enScript.map((part) => ({ ...part, words: wordCount(part.text) }));
    page.sampleScriptWordCount = page.sampleScript.reduce((a, p) => a + p.words, 0);
    page.sampleScriptNote = note;

    page.sections = buildSections('en', page, 'words', spec);
    for (const code of LOCALE_CODES.filter((c) => c !== 'en')) {
      const content = buildContent(code, {
        words: page.wordCount, baseSeconds: secondsForWords(page.wordCount),
        stageSeconds: stageSecondsFor(page.wordCount), useCase: spec.useCase
      }, 'words');
      page.translations[code] = {
        title: content.title,
        metaDescription: content.metaDescription,
        h1: content.h1,
        guideLabel: content.h1,
        heroAnswer: content.heroAnswer,
        anchorForms: content.anchorForms,
        faqs: content.faqs,
        sections: buildSections(code, page, 'words', spec)
      };
    }
    page.guideLabel = content_en_label(page);
    return page;
  });

  // A page that is already live must stay live. Rebuilding the data file must
  // never silently unpublish a URL that is already indexed and linked, so carry
  // `published` and `publishedAt` forward for any slug that exists in both the
  // old and new sets.
  const previous = new Map((db.pages || []).map((p) => [p.slug, p]));
  const carried = [...minutesPages, ...wordsPages].map((page) => {
    const old = previous.get(page.slug);
    if (old && old.published) {
      return { ...page, published: true, publishedAt: old.publishedAt ?? page.publishedAt };
    }
    return page;
  });

  // Preserve any page in the existing DB that is not in the spec set but is
  // already published — dropping a live URL would break the site.
  const specSlugs = new Set(carried.map((p) => p.slug));
  const preserved = (db.pages || []).filter(
    (p) => !specSlugs.has(p.slug) && p.published
  );

  const next = { ...db, pages: [...carried, ...preserved] };

  if (DRY) {
    console.log(`[dry-run] would write ${next.pages.length} pages to ${DATA_PATH}`);
    for (const p of next.pages) {
      console.log(`  ${p.slug.padEnd(24)} ${p.type.padEnd(8)} ${p.wordCount} words  script:${p.sampleScriptIsComplete ? 'full' : 'outline'}  locales:${LOCALE_CODES.length}`);
    }
    return;
  }

  writeFileSync(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Wrote ${next.pages.length} pages to scripts/silo-data.json`);
}

function content_en_label(page) {
  // Short label used for cross-link cards and the homepage hub.
  return page.type === 'minutes'
    ? `${page.durationMinutes}-Minute Speech`
    : `${new Intl.NumberFormat('en-US').format(page.wordCount)} Words`;
}

main();
