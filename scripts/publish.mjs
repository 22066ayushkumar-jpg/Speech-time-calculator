#!/usr/bin/env node
// Drip-publish system for the speech-length silo pages, in every supported language.
// A page/locale that is not published must never exist as HTML, be linked from the site, or appear in sitemap.xml.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, LOCALE_CODES } from './locales.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_PATH = join(ROOT, 'scripts', 'silo-data.json');
const SITE = 'https://speechtimercalculator.com';
const GUIDE_MARK_BEGIN = '<!-- BEGIN:popular-speech-guides -->';
const GUIDE_MARK_END = '<!-- END:popular-speech-guides -->';
const TODAY = localDate(new Date());
const AUTHOR = 'Chetan Kumar';
const AUTHOR_URL = 'https://github.com/22066ayushkumar-jpg';
const TRANSLATED_KEYS = ['title', 'metaDescription', 'h1', 'heroAnswer', 'anchorForms', 'faqs'];
const LANG_NAMES = { en: 'English', hi: 'हिन्दी', de: 'Deutsch', es: 'Español', pt: 'Português' };
const OG_LOCALE = { en: 'en_US', hi: 'hi_IN', de: 'de_DE', es: 'es_ES', pt: 'pt_BR' };

const STATIC_URLS = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/hi/', priority: '0.8', changefreq: 'weekly' },
  { path: '/de/', priority: '0.8', changefreq: 'weekly' },
  { path: '/es/', priority: '0.8', changefreq: 'weekly' },
  { path: '/pt/', priority: '0.8', changefreq: 'weekly' },
  { path: '/about.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact.html', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms.html', priority: '0.4', changefreq: 'monthly' }
];

/* ---------------------------------------------------------------- primitives */

function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function load() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf8'));
}
function save(db) {
  writeFileSync(DATA_PATH, `${JSON.stringify(db, null, 2)}\n`);
}
function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function jsonInScript(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}
function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}
function group(digits, separator) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
function num(value, loc) {
  return group(String(Math.round(value)), loc.thousands);
}
function dec(value, loc) {
  const [whole, fraction] = value.toFixed(1).split('.');
  return `${group(whole, loc.thousands)}${loc.decimal}${fraction}`;
}
function timeFromSeconds(seconds, loc) {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const u = loc.ui;
  const head = hours ? `${hours} ${u.tHr} ` : '';
  return `${head}${minutes} ${u.tMin} ${secs} ${u.tSec}`;
}

/* ---------------------------------------------------------------- page model */

function published(db) {
  return db.pages.filter((page) => page.published);
}
function bySlug(db, slug) {
  return db.pages.find((page) => page.slug === slug);
}
function missingTranslation(page, code) {
  const t = page.translations[code];
  if (!t) return TRANSLATED_KEYS;
  return TRANSLATED_KEYS.filter((key) => {
    const value = t[key];
    return value === undefined || value === null || (Array.isArray(value) && !value.length);
  });
}
// A (page, locale) pair is publishable only when the page is live and carries a complete translation,
// so a half-translated page never ships as a mixed-language URL.
function liveLocales(page, db) {
  return LOCALE_CODES.filter((code) => page.published && (code === 'en' || missingTranslation(page, code).length === 0));
}
function content(page, code) {
  if (code === 'en') {
    return {
      title: page.title, metaDescription: page.metaDescription, h1: page.h1,
      heroAnswer: page.heroAnswer, anchorForms: page.homepageAnchorForms, faqs: page.faqs
    };
  }
  const t = page.translations[code];
  return {
    title: t.title, metaDescription: t.metaDescription, h1: t.h1,
    heroAnswer: t.heroAnswer, anchorForms: t.anchorForms, faqs: t.faqs
  };
}
function urlFor(page, code) {
  const prefix = LOCALES[code].prefix;
  return prefix ? `/${prefix}${page.url.slice(1)}` : page.url;
}
function fileFor(page, code) {
  return join(ROOT, urlFor(page, code).replace(/^\/|\/$/g, ''), 'index.html');
}
function homeFor(code) {
  return LOCALES[code].homeUrl;
}
function trustLine(ui) {
  const anchor = `<a href="${AUTHOR_URL}" rel="me noopener" target="_blank">${escapeHtml(AUTHOR)}</a>`;
  return ui.footer.trust.split('{name}').map(escapeHtml).join(anchor);
}

/* ---------------------------------------------------------------- rendering */

function speakingSeconds(page) {
  const rate = page.calculations.find((row) => row.pace === 'Business')?.wpm ?? 130;
  return page.wordCount / rate * 60;
}
function pacingRows(page, loc) {
  const single = page.pageCounts.singleSpacedWordsPerPage;
  const double = page.pageCounts.doubleSpacedWordsPerPage;
  return page.calculations.map((row, index) => {
    const pace = loc.ui.paceNames[index] ?? row.pace;
    const label = `${escapeHtml(pace)}<br><span>${escapeHtml(fill(loc.ui.wpmUnit, { wpm: row.wpm }))}</span>`;
    return `<tr><th scope="row">${label}</th><td>${num(row.words, loc)}</td><td>${escapeHtml(timeFromSeconds(row.words / row.wpm * 60, loc))}</td><td>${dec(row.words / single, loc)}</td><td>${dec(row.words / double, loc)}</td></tr>`;
  }).join('\n');
}
function relatedLinks(page, code, db) {
  const loc = LOCALES[code];
  const others = livePagesFor(page, code, db);
  if (!others.length) return '';
  const items = others.map((other) => {
    const otherText = other.type === 'minutes'
      ? fill(loc.ui.relatedWords, { words: num(other.wordCount, loc) })
      : fill(loc.ui.relatedSpoken, { time: timeFromSeconds(speakingSeconds(other), loc) });
    return `<li><a href="${urlFor(other, code)}">${escapeHtml(content(other, code).h1)}</a><span>${escapeHtml(otherText)}</span></li>`;
  }).join('\n');
  return `<section class="stc-silo-related" aria-labelledby="related-heading"><h2 id="related-heading">${escapeHtml(loc.ui.relatedHeading)}</h2><ul class="stc-related-list">${items}</ul></section>`;
}
function livePagesFor(page, code, db) {
  return published(db).filter((other) => other.slug !== page.slug && liveLocales(other, db).includes(code));
}
function guideCard(page, code, index) {
  const loc = LOCALES[code];
  const text = content(page, code);
  const detail = page.type === 'minutes'
    ? fill(loc.ui.guideMetaMinutes, { minutes: page.durationMinutes, words: num(page.wordCount, loc) })
    : fill(loc.ui.guideMetaWords, { words: num(page.wordCount, loc), time: timeFromSeconds(speakingSeconds(page), loc) });
  return `<a class="stc-guide-card" href="${urlFor(page, code)}"><span class="stc-guide-kicker">${escapeHtml(`${loc.ui.guideKicker} ${String(index + 1).padStart(2, '0')}`)}</span><strong>${escapeHtml(text.h1)}</strong><span class="stc-guide-meta">${escapeHtml(detail)}</span></a>`;
}
function hreflangTags(page, code, db) {
  const locales = liveLocales(page, db);
  if (locales.length < 2) return '';
  const links = locales.map((other) => `  <link rel="alternate" hreflang="${other}" href="${SITE}${urlFor(page, other)}">`);
  links.push(`  <link rel="alternate" hreflang="x-default" href="${SITE}${urlFor(page, 'en')}">`);
  return '\n' + links.join('\n');
}
function jsonLd(page, code) {
  const loc = LOCALES[code];
  const text = content(page, code);
  const url = `${SITE}${urlFor(page, code)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Speech Time Calculator', item: `${SITE}${loc.homeUrl}` },
          { '@type': 'ListItem', position: 2, name: text.h1, item: url }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: text.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a }
        }))
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: text.title,
        description: text.metaDescription,
        inLanguage: loc.code,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#webapp` },
        breadcrumb: { '@id': `${url}#breadcrumb` }
      }
    ]
  };
}
function langMenu(page, code, db) {
  const loc = LOCALES[code];
  const items = LOCALE_CODES.map((other) => {
    const href = page ? (liveLocales(page, db).includes(other) ? urlFor(page, other) : homeFor(other)) : homeFor(other);
    const current = other === code ? ' aria-current="true"' : '';
    return `<a href="${href}"${current}>${LANG_NAMES[other]}</a>`;
  }).join('');
  return `<details class="stc-lang-menu"><summary aria-label="${escapeHtml(loc.ui.langAria)}"><span aria-hidden="true">🌐</span> ${loc.short} <span class="stc-lang-arrow" aria-hidden="true">▾</span></summary><div class="stc-lang-list">${items}</div></details>`;
}
function miniCalculatorScript(page, code) {
  const loc = LOCALES[code];
  const ui = loc.ui;
  return `<script>
  (function () {
    var root = document.documentElement;
    var toggle = document.getElementById('themeToggle');
    var meta = document.getElementById('themeColorMeta');
    var ui = ${jsonInScript({ dark: ui.darkLabel, light: ui.lightLabel, ariaDark: ui.ariaDark, ariaLight: ui.ariaLight })};
    function applyTheme(isDark) {
      root.dataset.theme = isDark ? 'dark' : 'light';
      root.style.colorScheme = isDark ? 'dark' : 'light';
      if (meta) meta.content = isDark ? '#000000' : '#f7f8f7';
      if (!toggle) return;
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? ui.ariaLight : ui.ariaDark);
      toggle.querySelector('.stc-theme-icon').textContent = isDark ? '☀' : '☾';
      toggle.querySelector('.stc-theme-label').textContent = isDark ? ui.light : ui.dark;
    }
    applyTheme(root.dataset.theme === 'dark');
    if (toggle) toggle.addEventListener('click', function () {
      var isDark = root.dataset.theme !== 'dark';
      applyTheme(isDark);
      try { localStorage.setItem('stc-theme', isDark ? 'dark' : 'light'); } catch (e) {}
    });

    var L10N = ${jsonInScript({ thousands: loc.thousands, decimal: loc.decimal, hr: ui.tHr, min: ui.tMin, sec: ui.tSec, wpm: ui.wpmUnit, length: ui.lengthFormat, single: page.pageCounts.singleSpacedWordsPerPage, double: page.pageCounts.doubleSpacedWordsPerPage })};
    var wordsInput = document.getElementById('siloWords');
    var wpmInput = document.getElementById('siloWpm');
    var wpmOut = document.getElementById('siloWpmOut');
    var timeOut = document.getElementById('siloTimeOut');
    var readOut = document.getElementById('siloReadOut');
    var pageOut = document.getElementById('siloPageOut');
    function fill(tpl, values) {
      return tpl.replace(/\\{(\\w+)\\}/g, function (m, k) { return k in values ? values[k] : m; });
    }
    function group(digits) { return digits.replace(/\\B(?=(\\d{3})+(?!\\d))/g, L10N.thousands); }
    function num(value) { return group(String(Math.round(value))); }
    function dec(value) {
      var parts = value.toFixed(1).split('.');
      return group(parts[0]) + L10N.decimal + parts[1];
    }
    function fmt(seconds) {
      var total = Math.max(0, Math.round(seconds));
      var h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
      return (h ? h + ' ' + L10N.hr + ' ' : '') + m + ' ' + L10N.min + ' ' + s + ' ' + L10N.sec;
    }
    function update() {
      var words = Math.max(0, parseInt(wordsInput.value, 10) || 0);
      var wpm = Math.min(250, Math.max(60, parseInt(wpmInput.value, 10) || 130));
      wpmOut.textContent = fill(L10N.wpm, { wpm: wpm });
      timeOut.textContent = fmt(words / wpm * 60);
      readOut.textContent = fmt(words / 230 * 60);
      pageOut.textContent = fill(L10N.length, { single: dec(words / L10N.single), double: dec(words / L10N.double) });
    }
    wordsInput.addEventListener('input', update);
    wpmInput.addEventListener('input', update);
    update();
  })();
</script>`;
}

function renderPage(page, code, db) {
  const loc = LOCALES[code];
  const ui = loc.ui;
  const text = content(page, code);
  const url = `${SITE}${urlFor(page, code)}`;
  const home = loc.homeUrl;
  const speakingTime = timeFromSeconds(speakingSeconds(page), loc);
  const usableTime = timeFromSeconds(page.stageBuffer.usableWords / 130 * 60, loc);
  const pacingHeading = page.type === 'minutes'
    ? fill(ui.tableHeadingMinutes, { n: page.durationMinutes, words: num(page.wordCount, loc) })
    : fill(ui.tableHeadingWords, { n: page.durationMinutes, words: num(page.wordCount, loc) });
  const bufferBody = fill(ui.bufferBody, {
    usable: `<strong>${num(page.stageBuffer.usableWords, loc)}</strong>`,
    full: num(page.wordCount, loc),
    fullTime: speakingTime,
    usableTime
  });
  const heroTail = fill(ui.heroTail, {
    calc: `<a href="${home}">${escapeHtml(ui.heroCalcLink)}</a>`,
    anchor: `<a class="stc-silo-hero-link" href="${home}">${escapeHtml(text.anchorForms[0])}</a>`
  });
  const ctaBody = fill(ui.ctaBody, {
    calc: `<a href="${home}">${escapeHtml(ui.ctaCalcLink)}</a>`,
    prompt: `<a href="${home}">${escapeHtml(ui.ctaPromptLink)}</a>`
  });
  const faqSubject = code === 'en' ? text.h1.toLowerCase() : text.h1;
  const faqs = text.faqs.map((faq) => `<details open><summary><h3 class="stc-faq-q">${escapeHtml(faq.q)}</h3></summary><p>${escapeHtml(faq.a)}</p></details>`).join('\n');
  const crumb = page.type === 'minutes' ? ui.guidesCrumb : ui.wordsCrumb;
  const silentTime = timeFromSeconds(page.wordCount / 230 * 60, loc);
  const pageCount = fill(ui.lengthFormat, {
    single: dec(page.wordCount / page.pageCounts.singleSpacedWordsPerPage, loc),
    double: dec(page.wordCount / page.pageCounts.doubleSpacedWordsPerPage, loc)
  });

  return `<!doctype html>
<html lang="${code}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f8f7" id="themeColorMeta">
  <title>${escapeHtml(text.title)}</title>
  <meta name="description" content="${escapeHtml(text.metaDescription)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">${hreflangTags(page, code, db)}
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${OG_LOCALE[code]}">
  <meta property="og:site_name" content="Speech Time Calculator">
  <meta property="og:title" content="${escapeHtml(text.title)}">
  <meta property="og:description" content="${escapeHtml(text.metaDescription)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(text.title)}">
  <meta name="twitter:description" content="${escapeHtml(text.metaDescription)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script>try{if(localStorage.getItem('stc-theme')==='dark'||(!localStorage.getItem('stc-theme')&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark';document.querySelector('#themeColorMeta').content='#000000'}}catch{}</script>
  <link rel="stylesheet" href="/style.css">
  <script type="application/ld+json">
  ${jsonInScript(jsonLd(page, code))}
  </script>
</head>
<body class="stc-app">
  <header class="stc-header">
    <a class="stc-brand" href="${home}" aria-label="${escapeHtml(ui.brandAria)}"><span class="stc-brand-mark" aria-hidden="true">S</span><span>speechtimercalculator<span class="stc-brand-light">.com</span></span></a>
    <div class="stc-header-actions">${langMenu(page, code, db)}<button class="stc-theme-toggle" id="themeToggle" type="button" aria-label="${escapeHtml(ui.ariaDark)}" aria-pressed="false"><span class="stc-theme-icon" aria-hidden="true">☾</span><span class="stc-theme-label">${escapeHtml(ui.darkLabel)}</span></button></div>
  </header>

  <main class="stc-page">
    <nav class="stc-breadcrumb" aria-label="Breadcrumb"><a href="${home}">${escapeHtml(ui.home)}</a><span aria-hidden="true">/</span><a href="${home}">${escapeHtml(crumb)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(text.h1)}</span></nav>
    <h1 id="page-title">${escapeHtml(text.h1)}</h1>
    <p class="stc-updated">${escapeHtml(ui.updatedLine)}</p>
    <p class="stc-silo-hero">${escapeHtml(text.heroAnswer)} ${heroTail}</p>

    <section class="stc-card stc-silo-calc" aria-labelledby="calc-heading">
      <div class="stc-card-heading"><h2 id="calc-heading">${escapeHtml(ui.calcHeading)}</h2><span class="stc-private-tag"><span aria-hidden="true">●</span> ${escapeHtml(ui.privateTag)}</span></div>
      <div class="stc-silo-calc-grid">
        <label class="stc-silo-field" for="siloWords"><span>${escapeHtml(ui.wordsLabel)}</span><input id="siloWords" type="number" min="1" max="20000" step="10" value="${page.wordCount}" inputmode="numeric"></label>
        <label class="stc-silo-field" for="siloWpm"><span>${escapeHtml(ui.paceLabel)} <output id="siloWpmOut" for="siloWpm">${escapeHtml(fill(ui.wpmUnit, { wpm: 130 }))}</output> <em>${escapeHtml(ui.paceHint)}</em></span><input class="stc-range" id="siloWpm" type="range" min="60" max="250" step="5" value="130"></label>
      </div>
      <p class="stc-silo-readout">${escapeHtml(ui.readoutSpeaking)}: <strong id="siloTimeOut">${escapeHtml(speakingTime)}</strong> · ${escapeHtml(ui.readoutReading)}: <strong id="siloReadOut">${escapeHtml(silentTime)}</strong> · ${escapeHtml(ui.readoutLength)}: <strong id="siloPageOut">${escapeHtml(pageCount)}</strong></p>
    </section>

    <section class="stc-silo-table" aria-labelledby="pacing-heading">
      <h2 id="pacing-heading">${escapeHtml(pacingHeading)}</h2>
      <div class="stc-table-wrap"><table class="stc-reference-table stc-silo-table-el"><thead><tr><th scope="col">${escapeHtml(ui.colPace)}</th><th scope="col">${escapeHtml(ui.colWords)}</th><th scope="col">${escapeHtml(ui.colTime)}</th><th scope="col">${escapeHtml(ui.colPages)}<br><span>${escapeHtml(ui.colSingle)}</span></th><th scope="col">${escapeHtml(ui.colPages)}<br><span>${escapeHtml(ui.colDouble)}</span></th></tr></thead>
<tbody>
${pacingRows(page, loc)}
</tbody></table></div>
      <p class="stc-silo-footnote">${escapeHtml(fill(ui.footnote, { single: page.pageCounts.singleSpacedWordsPerPage, double: page.pageCounts.doubleSpacedWordsPerPage }))}</p>
    </section>

    <section class="stc-info-card stc-silo-buffer" aria-labelledby="buffer-heading">
      <div class="stc-section-kicker">${escapeHtml(ui.bufferKicker)}</div>
      <h2 id="buffer-heading">${escapeHtml(ui.bufferHeading)}</h2>
      <p>${bufferBody}</p>
    </section>

    <section class="stc-faq stc-silo-faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">${escapeHtml(fill(ui.faqHeading, { h1: faqSubject }))}</h2>
${faqs}
    </section>

    ${relatedLinks(page, code, db)}

    <section class="stc-page-card stc-silo-cta">
      <h2>${escapeHtml(ui.ctaHeading)}</h2>
      <p>${ctaBody}</p>
    </section>
  </main>

  <footer class="stc-footer"><a class="stc-brand" href="${home}"><span class="stc-brand-mark" aria-hidden="true">S</span><span>speechtimercalculator<span class="stc-brand-light">.com</span></span></a><nav class="stc-footer-links" aria-label="${escapeHtml(ui.footer.aria)}"><a href="/about.html">${escapeHtml(ui.footer.about)}</a><a href="/contact.html">${escapeHtml(ui.footer.contact)}</a><a href="/terms.html">${escapeHtml(ui.footer.terms)}</a></nav><span>${escapeHtml(ui.footer.tagline)}</span><a class="stc-footer-top" href="#page-title">${escapeHtml(ui.footer.backToTop)}</a><span class="stc-footer-trust">${trustLine(ui)}</span></footer>

  ${miniCalculatorScript(page, code)}
</body>
</html>
`;
}

/* ---------------------------------------------------------------- site sync */

function liveTargets(db) {
  const targets = [];
  for (const page of published(db)) {
    for (const code of liveLocales(page, db)) targets.push({ page, code });
  }
  return targets;
}

function syncPages(db) {
  const written = [];
  const removed = [];
  const missing = [];
  for (const page of db.pages) {
    const locales = liveLocales(page, db);
    if (page.published && locales.length < LOCALE_CODES.length) {
      missing.push({ slug: page.slug, locales: LOCALE_CODES.filter((code) => !locales.includes(code)) });
    }
    for (const code of LOCALE_CODES) {
      const file = fileFor(page, code);
      if (locales.includes(code)) {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, renderPage(page, code, db));
        written.push(urlFor(page, code));
      } else if (existsSync(file)) {
        rmSync(dirname(file), { recursive: true, force: true });
        removed.push(urlFor(page, code));
      }
    }
  }
  for (const code of LOCALE_CODES) {
    for (const group of ['minutes', 'words']) {
      const dir = join(ROOT, LOCALES[code].prefix, group);
      if (existsSync(dir) && readdirSync(dir).length === 0) rmSync(dir, { recursive: true, force: true });
    }
  }
  return { written, removed, missing };
}

// Homepage tables reference guides by the number of words in the cell, which is locale-specific.
function linkifyWordCounts(html, code, db) {
  const loc = LOCALES[code];
  const targets = new Map(
    liveTargets(db).filter((target) => target.code === code && target.page.type === 'words').map((target) => [target.page.wordCount, urlFor(target.page, code)])
  );
  const unit = escapeRegExp(loc.ui.wordsUnit);
  const cell = new RegExp(`<td>(?:<a[^>]*>)?([\\d.,]+) ${unit}(?:</a>)?</td>`, 'g');
  return html.replace(/<tbody id="referenceTableBody">([\s\S]*?)<\/tbody>/, (whole, body) => {
    const rows = body.replace(cell, (match, digits) => {
      const count = Number(digits.replace(/[^0-9]/g, ''));
      const href = targets.get(count);
      const label = `${digits} ${escapeHtml(loc.ui.wordsUnit)}`;
      return href ? `<td><a class="stc-table-guide" href="${href}">${label}</a></td>` : `<td>${label}</td>`;
    });
    return `<tbody id="referenceTableBody">${rows}</tbody>`;
  });
}

function guidesBlock(code, db) {
  const loc = LOCALES[code];
  const pages = liveTargets(db).filter((target) => target.code === code).map((target) => target.page);
  if (!pages.length) return `      ${GUIDE_MARK_BEGIN}\n      ${GUIDE_MARK_END}`;
  const cards = pages.map((page, index) => guideCard(page, code, index)).join('\n');
  return [
    `      ${GUIDE_MARK_BEGIN}`,
    `      <h2 class="stc-matrix-heading">${escapeHtml(loc.ui.guidesHeading)}</h2>`,
    '      <div class="stc-guide-grid">',
    cards.split('\n').map((line) => `        ${line}`).join('\n'),
    '      </div>',
    `      ${GUIDE_MARK_END}`
  ].join('\n');
}

function syncHomepages(db) {
  const files = [];
  for (const code of LOCALE_CODES) {
    const file = join(ROOT, LOCALES[code].prefix, 'index.html');
    if (!existsSync(file)) continue;
    let html = readFileSync(file, 'utf8');
    const start = html.indexOf(GUIDE_MARK_BEGIN);
    const end = html.indexOf(GUIDE_MARK_END);
    if (start >= 0 && end > start) {
      const lineStart = html.lastIndexOf('\n', start) + 1;
      const afterEnd = html.indexOf('\n', end + GUIDE_MARK_END.length);
      const tail = afterEnd === -1 ? html.length : afterEnd;
      html = html.slice(0, lineStart) + guidesBlock(code, db) + html.slice(tail);
    } else {
      const anchor = '      <section class="stc-faq"';
      if (!html.includes(anchor)) throw new Error(`${file}: guides marker missing and no "<section class="stc-faq"" insert point found`);
      html = html.replace(anchor, `${guidesBlock(code, db)}\n${anchor}`);
    }
    html = linkifyWordCounts(html, code, db);
    writeFileSync(file, html);
    files.push(LOCALES[code].homeUrl);
  }
  return files;
}

function lastMod(path) {
  const relative = path === '/' ? 'index.html' : (path.endsWith('/') ? join(path.slice(1, -1), 'index.html') : path.slice(1));
  const file = join(ROOT, relative);
  if (!existsSync(file)) return TODAY;
  return localDate(statSync(file).mtime);
}

function syncSitemap(db) {
  const siloUrls = liveTargets(db).map((target) => ({
    path: urlFor(target.page, target.code),
    priority: target.code === 'en' ? '0.7' : '0.6',
    changefreq: 'weekly'
  }));
  const entries = [...STATIC_URLS, ...siloUrls];
  const urls = entries.map((entry) => `  <url>\n    <loc>${SITE}${entry.path}</loc>\n    <lastmod>${lastMod(entry.path)}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`).join('\n');
  writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(join(ROOT, 'robots.txt'), '# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nAllow: /\n\nSitemap: https://speechtimercalculator.com/sitemap.xml\n');
  return entries.length;
}

function sync(db) {
  const { written, removed, missing } = syncPages(db);
  syncHomepages(db);
  const urls = syncSitemap(db);
  return {
    pagesPublished: published(db).length,
    drafts: db.pages.length - published(db).length,
    liveUrls: written,
    draftsRemoved: removed,
    sitemapUrls: urls,
    missingTranslations: missing.map((item) => `${item.slug}: ${item.locales.join(', ')}`)
  };
}

/* ---------------------------------------------------------------------- cli */

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const valueOf = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

function printList(db) {
  const live = published(db);
  console.log(`\nSilo pages: ${db.pages.length} total · ${live.length} published · ${db.pages.length - live.length} drafts`);
  console.log(`Languages: ${LOCALE_CODES.join(' ')} — drafts emit no HTML, links, or sitemap rows in any language\n`);
  console.log(`${'STATUS'.padEnd(16)}${'URL'.padEnd(28)}${'LANGUAGES'.padEnd(20)}${'EN TITLE'.padEnd(26)}WORDS`);
  for (const page of db.pages) {
    const locales = liveLocales(page, db);
    const state = page.published ? `LIVE ${page.publishedAt ?? ''}`.trim() : 'DRAFT';
    const langs = page.published ? locales.join('+') : '-';
    console.log(`${state.padEnd(16)}${page.url.padEnd(28)}${langs.padEnd(20)}${page.h1.padEnd(26)}${String(page.wordCount).padStart(5)}`);
  }
  const missing = live.filter((page) => liveLocales(page, db).length < LOCALE_CODES.length);
  if (missing.length) {
    console.log('\nPartial translations (page ships only in the languages it fully covers):');
    for (const page of missing) console.log(`  ${page.slug}: missing ${LOCALE_CODES.filter((code) => !liveLocales(page, db).includes(code)).join(', ')}`);
  }
  const next = db.pages.find((page) => !page.published);
  console.log(`\nNext in queue: ${next ? `${next.slug}  →  node scripts/publish.mjs --next` : 'nothing left to publish'}`);
}

function publishSlug(db, slug) {
  const page = bySlug(db, slug);
  if (!page) {
    const available = db.pages.filter((item) => !item.published).map((item) => item.slug).join(', ');
    throw new Error(`Unknown or already-published slug "${slug}". Drafts available: ${available || 'none'}`);
  }
  if (!page.published) {
    page.published = true;
    page.publishedAt = TODAY;
    save(db);
  }
  return page;
}

function report(result, page) {
  console.log(JSON.stringify(result, null, 2));
  if (page && liveLocales(page, load()).length < LOCALE_CODES.length) {
    const missingCodes = LOCALE_CODES.filter((code) => !liveLocales(page, load()).includes(code));
    console.log(`\n${page.slug} is missing translations for: ${missingCodes.join(', ')}.`);
    console.log('Add them to that page\'s "translations" object in scripts/silo-data.json, then run: npm run silo:sync');
  }
}

if (flag('--list') || !args.length) {
  printList(load());
} else if (flag('--next')) {
  const db = load();
  const next = db.pages.find((page) => !page.published);
  if (!next) throw new Error('Every silo page is already published.');
  publishSlug(db, next.slug);
  console.log(`Publishing ${next.slug} (${next.url})`);
  report(sync(load()), next);
} else if (flag('--slug')) {
  const db = load();
  const page = publishSlug(db, valueOf('--slug'));
  console.log(`Publishing ${page.slug} (${page.url})`);
  report(sync(load()), page);
} else if (flag('--sync')) {
  console.log(JSON.stringify(sync(load()), null, 2));
} else {
  console.log('Usage: node scripts/publish.mjs [--list | --next | --slug <slug> | --sync]');
}
