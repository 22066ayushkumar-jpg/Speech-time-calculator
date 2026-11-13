/* ---------------------------------------------------------------- samples */
// This snippet is applied to scripts/publish.mjs by apply-template-patch.mjs.
// It is kept separate so the original renderer stays readable and the diff
// against upstream is auditable.

function countWords(value) {
  return (String(value).match(/[\p{L}\p{N}]+(?:[’'\-‐‑‒–—][\p{L}\p{N}]+)*/gu) || []).length;
}

/* Spec §5: short pages get a timestamped script; long pages get a scaled
   outline plus a calibration passage. Both end in a teleprompter handoff that
   writes into the same localStorage key index.html already reads. */
function scriptBlock(page, code, ctx) {
  const s = ctx.sections && ctx.sections.script;
  if (!s) return '';
  const ui = ctx.ui;
  const label = (value) =>
    `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ctx.loc.thousands)} ${value === 1 ? ui.wordUnitOne : ui.wordsUnit}`;

  const parts = page.sampleScript || [];
  const isOutline = page.sampleScriptIsComplete === false;
  const heading = isOutline ? s.outlineHeading : s.heading;

  const rows = parts.map((part) => {
    const words = part.words || countWords(part.text);
    return `<li class="stc-script-step"><span class="stc-script-mark">[${escapeHtml(part.at)}]</span><p>${rich(part.text, ctx.loc.homeUrl)}</p><span class="stc-script-words">${escapeHtml(label(words))}</span></li>`;
  }).join('\n');

  const total = parts.reduce((sum, part) => sum + (part.words || countWords(part.text)), 0);

  return `<section class="stc-page-card stc-silo-script" aria-labelledby="script-heading">
      <h2 id="script-heading">${escapeHtml(heading)}</h2>
      ${parts.length ? `<ol class="stc-script-list">\n${rows}\n</ol>` : ''}
      ${total ? `<p class="stc-silo-footnote">${escapeHtml(label(total))}</p>` : ''}
      <div class="stc-rehearse">
        <button type="button" class="stc-btn stc-btn-primary" data-load-teleprompter>${escapeHtml(s.rehearseButton)}</button>
        <p class="stc-rehearse-note">${escapeHtml(s.rehearseNote)}</p>
      </div>
      <script type="application/json" class="stc-script-payload">${jsonInScript(parts.map((part) => part.text).join('\n\n'))}</script>
    </section>`;
}

/* Spec §7: every page links to all live siblings, grouped by type, with the
   current page marked aria-current="page". */
function hubBlock(page, code, db, ctx) {
  const s = ctx.sections && ctx.sections.hub;
  if (!s) return '';
  const live = published(db).filter((other) => liveLocales(other, db).includes(code));
  const minutes = live.filter((other) => other.type === 'minutes');
  const words = live.filter((other) => other.type === 'words');
  const item = (other) => {
    const name = escapeHtml(labelFor(other, code));
    if (other.slug === page.slug) return `<li><span aria-current="page">${name}</span></li>`;
    return `<li><a href="${urlFor(other, code)}">${name}</a></li>`;
  };
  const column = (heading, list) => (list.length
    ? `<div class="stc-hub-col"><h3>${escapeHtml(heading)}</h3><ul class="stc-hub-list">${list.map(item).join('')}</ul></div>`
    : '');
  return `<section class="stc-silo-hub" aria-labelledby="hub-heading">
      <h2 id="hub-heading">${escapeHtml(s.heading)}</h2>
      <div class="stc-hub-grid">${column(s.minutesHeading, minutes)}${column(s.wordsHeading, words)}</div>
    </section>`;
}

/* Scenario preset buttons (spec §3). The <select> stays for no-JS and for
   long option labels; the buttons are the fast path. */
function presetButtons(page, code, ctx) {
  const s = ctx.sections && ctx.sections.calculator;
  if (!s || !Array.isArray(s.scenarios)) return '';
  const current = businessWpm(page);
  return `<div class="stc-preset-row" role="group" aria-label="${escapeHtml(s.scenarioLabel)}">${s.scenarios
    .map((item) => `<button type="button" class="stc-preset${item.wpm === current ? ' stc-preset-active' : ''}" data-wpm="${item.wpm}" aria-pressed="${item.wpm === current}">${escapeHtml(item.label)}</button>`)
    .join('')}</div>`;
}

/* Teleprompter handoff: writes the sample script into the key app.js reads,
   then navigates home. Uses the exact key names confirmed in app.js. */
function teleprompterHandoffScript(page) {
  const wpm = businessWpm(page);
  return `<script>
  (function () {
    var SCRIPT_KEY = 'speech-timer-script-v1';
    var SETTINGS_KEY = 'speech-timer-settings-v1';
    var WPM = ${wpm};
    var buttons = document.querySelectorAll('[data-load-teleprompter]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (event) {
        var section = event.currentTarget.closest('.stc-silo-script');
        var payload = section && section.querySelector('.stc-script-payload');
        var text = payload ? JSON.parse(payload.textContent) : '';
        try {
          if (text) localStorage.setItem(SCRIPT_KEY, text);
          var settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {};
          settings.speakWpm = WPM;
          settings.readMode = 'aloud';
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) { /* Storage can be disabled. */ }
        window.location.href = '/';
      });
    }
  })();
</script>`;
}
