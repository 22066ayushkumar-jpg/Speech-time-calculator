(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const scriptInput = $('#scriptInput');
  const STORAGE_KEY = 'speech-timer-script-v1';
  const COUNT_KEY = 'speech-timer-count-v1';
  const INPUTMODE_KEY = 'speech-timer-inputmode-v1';
  const DEFAULT_WPM = 130;
  const READ_WPM = 230;
  const CJK_RATES = { cjk: 300, japanese: 300, korean: 350 };
  const CJK_CHARACTERS = /[\u3400-\u4dbf\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/gu;
  const EN = {
    emptyTarget: 'Enter text to check your timing.',
    underTarget: (left) => `Under target · ${left} to spare.`,
    optimalRange: (mins) => `Optimal range · within 5% of your ${mins}-minute target.`,
    overTarget: (n, unit) => `Over target · trim about ${n} ${unit}.`,
    unitWords: 'words',
    unitChars: 'characters',
    unitWordsShort: 'words',
    unitCharsShort: 'chars',
    wordBudget: 'Word budget',
    charBudget: 'Character budget',
    noteAloud: 'Estimates are a guide; pauses and delivery affect your actual time.',
    noteSilent: (rate) => `Silent reading estimate at ${rate} WPM; actual pace varies by reader.`,
    noteCjk: 'Character-based estimate; actual pace varies by language and speaker.',
    modeWords: 'Words per minute',
    modeChars: 'Characters per minute',
    kickerSpeak: 'SPEAKING PACE',
    kickerRead: 'READING PACE',
    kickerCjk: 'CHARACTER PACE',
    scenarioAloud: 'Scenario',
    scenarioSilent: 'Reading style',
    labelAloud: 'Speaking aloud',
    labelSilent: 'Silent reading',
    paceDeliberate: 'A deliberate, easy-to-follow pace',
    paceComfortable: 'A comfortable, conversational pace',
    paceEnergetic: 'An energetic, confident pace',
    paceFast: 'A fast pace — remember to breathe',
    paceCjk: 'Character-based speaking pace',
    readLeisurely: 'A relaxed, leisurely reading pace',
    readAverage: 'A comfortable, average reading pace',
    readBrisk: 'A brisk, focused reading pace',
    readSkim: 'Skimming pace — for scanning key points',
    toastEmpty: 'There is no text to copy yet.',
    toastCopyFail: 'Copy is unavailable in this browser.',
    toastClearEmpty: 'Your script is already clear.',
    toastCleared: 'Script cleared.',
    toastCopied: 'Script copied to clipboard.',
    toastNoSummary: 'Add some text to create a time summary.',
    toastNoSummaryCount: 'Enter a word count to create a time summary.',
    toastSummaryCopied: 'Time summary copied.',
    toastNoExport: 'Add a script before exporting.',
    toastExported: 'Timed script downloaded.',
    toastCountEmpty: 'The word count is already empty.',
    toastCountCleared: 'Word count cleared.',
    toastCopyTextCount: 'Nothing to copy in word-count mode. Use “Copy time summary” instead.',
    toastExportCount: 'Switch to “Paste text” to download a timed script.',
    timerStart: 'Start',
    timerPause: 'Pause',
    timerResume: 'Resume',
    copyAloud: (words, dur, rate) => `My ${words}-word speech will take approximately ${dur} at ${rate} WPM.`,
    copySilent: (words, dur, rate) => `My ${words}-word text will take approximately ${dur} to read at ${rate} WPM.`,
    copyCjk: (units, dur, rate) => `My ${units}-character script will take approximately ${dur} at ${rate} CPM.`,
    focusEmpty: 'Your script will appear here.',
    focusCount: 'Word-count mode is active. Switch to “Paste text” to rehearse with the teleprompter.',
    scrollStart: 'Start scrolling',
    scrollPause: 'Pause scrolling',
    ariaElapsed: (dur) => `Elapsed practice time: ${dur}`,
    ariaToLight: 'Switch to light mode',
    ariaToDark: 'Switch to dark mode',
    themeLight: 'Light',
    themeDark: 'Dark',
    ariaProgressWords: 'Number of words spoken during practice',
    ariaProgressChars: 'Number of characters spoken during practice',
    progressWords: 'Words spoken',
    progressChars: 'Characters spoken',
    wordsLabel: 'Words',
    charsLabel: 'Characters',
    ariaPaceW: (pace) => `${pace} pace in words per minute`,
    ariaPaceC: (pace) => `${pace} pace in characters per minute`,
    ariaSliderW: (pace) => `Adjust ${pace.toLowerCase()} pace, 60 to 400 words per minute`,
    ariaSliderC: (pace) => `Adjust ${pace.toLowerCase()} pace, 60 to 400 characters per minute`,
    paceNameSpeak: 'Speaking',
    paceNameRead: 'Reading',
    paceNameCjk: 'Character',
    tableWords: (n) => `${n} words`,
    lap: (n) => `Lap ${n}`,
    minShort: 'min',
    secShort: 'sec',
    tHr: 'hr',
    tMin: 'min',
    tSec: 'sec',
    customPace: 'Custom pace…',
    scenariosAloud: [['TED Talk · 150 WPM', 150], ['Business Presentation · 130 WPM', 130], ['Academic Lecture · 115 WPM', 115], ['Wedding Toast · 100 WPM', 100], ['Podcast / Storytelling · 140 WPM', 140], ['Elevator Pitch · 160 WPM', 160], ['Commercial Voice-Over · 1 word/sec', 60]],
    scenariosSilent: [['Casual Reading · 200 WPM', 200], ['Average Reader · 230 WPM', 230], ['Fast Reader · 300 WPM', 300], ['Skimming · 400 WPM', 400]]
  };
  const T = Object.assign({}, EN, window.STC_STRINGS || {});
  const SETTINGS_KEY = 'speech-timer-settings-v1';
  const state = { mode: 'words', readMode: 'aloud', speakWpm: DEFAULT_WPM, readWpm: READ_WPM, cjkWpm: 300, inputMode: 'text', timerStartedAt: 0, timerElapsed: 0, timerInterval: 0, laps: [], toastTimeout: 0, renderTimeout: 0, scrollFrame: 0, scrollLast: 0, scrollActive: false };

  function scheduleRender() {
    window.clearTimeout(state.renderTimeout);
    state.renderTimeout = window.setTimeout(render, 100);
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        readMode: state.readMode, speakWpm: state.speakWpm, readWpm: state.readWpm,
        cjkWpm: state.cjkWpm, target: $('#targetMinutes').value, custom: $('#customMinutes').value,
        lang: $('#languageMode').value
      }));
    } catch { /* Settings are optional. */ }
  }

  function restoreSettings() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null'); } catch { saved = null; }
    if (!saved || typeof saved !== 'object') return;
    if (saved.readMode === 'aloud' || saved.readMode === 'silent') state.readMode = saved.readMode;
    [['speakWpm', 60, 400], ['readWpm', 60, 400], ['cjkWpm', 60, 400]].forEach(([key, min, max]) => {
      const value = Number(saved[key]);
      if (Number.isFinite(value)) state[key] = Math.min(max, Math.max(min, Math.round(value)));
    });
    if (['words', 'cjk', 'japanese', 'korean'].includes(saved.lang)) {
      state.mode = saved.lang;
      $('#languageMode').value = saved.lang;
    }
    if (['3', '5', '10', '15', '20', 'custom'].includes(saved.target)) $('#targetMinutes').value = saved.target;
    const customMinutes = Number(saved.custom);
    if (Number.isFinite(customMinutes)) $('#customMinutes').value = String(Math.min(180, Math.max(1, Math.round(customMinutes))));
    const slot = state.mode !== 'words' ? state.cjkWpm : (state.readMode === 'aloud' ? state.speakWpm : state.readWpm);
    $('#wpmSlider').value = String(slot);
    $('#wpmInput').value = String(slot);
    document.querySelectorAll('.stc-readmode-btn').forEach((button) => {
      const active = button.dataset.readmode === state.readMode;
      button.classList.toggle('stc-readmode-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  const safeStorage = {
    get() { try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; } },
    set(value) { try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Storage can be disabled or full. */ } },
    clear() { try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be disabled. */ } }
  };

  function analyzeText(text) {
    const words = text.trim() ? (text.match(/[\p{L}\p{N}]+(?:[’'\-‐‑‒–—][\p{L}\p{N}]+)*/gu) || []).length : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/u).filter((part) => part.trim()).length : 0;
    const sentences = text.trim() ? (text.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/gu) || []).filter((part) => /[\p{L}\p{N}]/u.test(part)).length : 0;
    const cjkChars = (text.match(CJK_CHARACTERS) || []).length;
    const spokenUnits = state.mode === 'words' ? words : cjkChars || [...text.replace(/\s/gu, '')].length;
    return { words, paragraphs, sentences, cjkChars, spokenUnits, chars: [...text].length, charsNoSpaces: [...text.replace(/\s/gu, '')].length, lines: words ? Math.ceil(words / 13) : 0 };
  }

  function formatDuration(seconds, includeHours = false) {
    const total = Math.max(0, Math.round(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = total % 60;
    if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    if (includeHours) return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    return `${minutes} <small>${T.minShort}</small> ${String(remainder).padStart(2, '0')} <small>${T.secShort}</small>`;
  }

  function plainDuration(seconds) {
    const total = Math.max(0, Math.round(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h) return s ? `${h} ${T.tHr} ${m} ${T.tMin} ${s} ${T.tSec}` : (m ? `${h} ${T.tHr} ${m} ${T.tMin}` : `${h} ${T.tHr}`);
    if (m) return s ? `${m} ${T.tMin} ${s} ${T.tSec}` : `${m} ${T.tMin}`;
    return `${s} ${T.tSec}`;
  }

  function activeSlotRate() {
    if (state.mode !== 'words') return state.cjkWpm;
    return state.readMode === 'aloud' ? state.speakWpm : state.readWpm;
  }

  function currentRate() {
    return Number($('#wpmInput').value) || activeSlotRate() || DEFAULT_WPM;
  }

  function buildScenarioOptions() {
    const select = $('#scenarioSelect');
    const list = state.readMode === 'aloud' ? T.scenariosAloud : T.scenariosSilent;
    select.replaceChildren();
    list.forEach(([label, value]) => {
      const option = document.createElement('option');
      option.value = String(value);
      option.textContent = label;
      select.append(option);
    });
    const custom = document.createElement('option');
    custom.value = 'custom';
    custom.textContent = T.customPace;
    select.append(custom);
    syncScenarioSelect();
  }

  function syncScenarioSelect() {
    const select = $('#scenarioSelect');
    if (!select) return;
    const list = state.readMode === 'aloud' ? T.scenariosAloud : T.scenariosSilent;
    const rate = Math.round(currentRate());
    const match = list.find(([, value]) => value === rate);
    select.value = match ? String(match[1]) : 'custom';
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('stc-toast-visible');
    window.clearTimeout(state.toastTimeout);
    state.toastTimeout = window.setTimeout(() => toast.classList.remove('stc-toast-visible'), 2200);
  }

  function updateLineNumbers() {
    const count = Math.max(1, scriptInput.value.split('\n').length);
    $('#lineNumbers').textContent = Array.from({ length: count }, (_, index) => index + 1).join('\n');
    $('#lineNumbers').scrollTop = scriptInput.scrollTop;
  }

  function readingPaceDescription(wpm) {
    if (wpm < 210) return T.readLeisurely;
    if (wpm <= 260) return T.readAverage;
    if (wpm <= 330) return T.readBrisk;
    return T.readSkim;
  }

  function updateTarget(metrics) {
    const selected = $('#targetMinutes').value;
    const custom = selected === 'custom';
    $('#customTimeWrap').hidden = !custom;
    const minutes = Math.min(180, Math.max(1, Number(custom ? $('#customMinutes').value : selected) || 5));
    const rate = currentRate();
    const budget = Math.round(minutes * rate);
    $('#budgetPace').textContent = `${rate} ${state.mode === 'words' ? 'WPM' : 'CPM'}`;
    $('#wordBudget').textContent = `${budget.toLocaleString()} ${state.mode === 'words' ? T.unitWords : T.unitChars}`;
    $('#budgetUnitLabel').textContent = state.mode === 'words' ? T.wordBudget : T.charBudget;
    const used = metrics.spokenUnits;
    const ratio = budget ? used / budget : 0;
    const fill = $('#targetMeterFill');
    fill.style.width = `${Math.min(100, ratio * 100)}%`;
    fill.classList.toggle('stc-meter-over', ratio > 1.05);
    const status = $('#targetStatus');
    let message = T.emptyTarget;
    let statusClass = '';
    let symbol = '●';
    if (used && ratio < 0.95) {
      const seconds = used / rate * 60;
      message = T.underTarget(plainDuration(minutes * 60 - seconds));
      statusClass = 'stc-status-under'; symbol = '✓';
    } else if (used && ratio <= 1.05) {
      message = T.optimalRange(minutes);
      statusClass = 'stc-status-optimal'; symbol = '●';
    } else if (used) {
      const overBy = Math.max(0, Math.ceil(used - budget));
      message = T.overTarget(overBy.toLocaleString(), state.mode === 'words' ? T.unitWords : T.unitChars);
      statusClass = 'stc-status-over'; symbol = '!';
    }
    status.className = `stc-target-status ${statusClass}`.trim();
    status.querySelector('.stc-status-symbol').textContent = symbol;
    status.lastElementChild.textContent = message;
  }

  function render() {
    const effRead = state.mode === 'words' ? state.readMode : 'aloud';
    const countMode = state.inputMode === 'count';
    const rawCount = Math.max(0, Math.min(1000000, Math.floor(Number($('#wordCountInput').value) || 0)));
    const text = scriptInput.value;
    const analyzed = analyzeText(text);
    const metrics = countMode
      ? { words: state.mode === 'words' ? rawCount : 0, paragraphs: 0, sentences: 0, cjkChars: 0, spokenUnits: rawCount, chars: 0, charsNoSpaces: 0, lines: state.mode === 'words' ? Math.ceil(rawCount / 13) : 0 }
      : analyzed;
    const speakRate = state.mode === 'words' ? state.speakWpm : state.cjkWpm;
    const readRate = state.mode === 'words' ? state.readWpm : 300;
    const readUnits = state.mode === 'words' ? metrics.words : metrics.cjkChars || metrics.charsNoSpaces;
    const speakSecs = metrics.spokenUnits / speakRate * 60;
    const readSecs = readUnits / readRate * 60;
    const dash = '—';
    $('#wordCount').textContent = (countMode ? rawCount : metrics.words).toLocaleString();
    $('#wordsMetricLabel').textContent = state.mode === 'words' ? T.wordsLabel : T.charsLabel;
    $('#mobileWordCount').textContent = (countMode ? rawCount : (state.mode === 'words' ? metrics.words : metrics.spokenUnits)).toLocaleString();
    $('#mobileUnitLabel').textContent = state.mode === 'words' ? T.unitWordsShort : T.unitCharsShort;
    $('#charCount').textContent = countMode ? dash : metrics.chars.toLocaleString();
    $('#charNoSpaceCount').textContent = countMode ? dash : metrics.charsNoSpaces.toLocaleString();
    $('#sentenceCount').textContent = countMode ? dash : metrics.sentences.toLocaleString();
    $('#paragraphCount').textContent = countMode ? dash : metrics.paragraphs.toLocaleString();
    $('#lineCount').textContent = countMode ? (state.mode === 'words' ? Math.ceil(rawCount / 13).toLocaleString() : dash) : metrics.lines.toLocaleString();
    const primaryIsRead = effRead === 'silent';
    $('#speakingTime').innerHTML = formatDuration(primaryIsRead ? readSecs : speakSecs);
    $('#readingTime').innerHTML = formatDuration(primaryIsRead ? speakSecs : readSecs);
    $('#mobileSpeakingTime').textContent = formatDuration(speakSecs, true);
    $('#mobileReadingTime').textContent = formatDuration(readSecs, true);
    $('#primaryLabel').textContent = primaryIsRead ? T.labelSilent : T.labelAloud;
    $('#primaryIcon').className = `stc-result-icon ${primaryIsRead ? 'stc-book-icon' : 'stc-mic-icon'}`;
    $('#primaryIcon').textContent = primaryIsRead ? '▤' : '◖';
    $('#secondaryIcon').className = `stc-result-icon ${primaryIsRead ? 'stc-mic-icon' : 'stc-book-icon'}`;
    $('#secondaryIcon').textContent = primaryIsRead ? '◖' : '▤';
    const secondaryLabel = $('#secondaryLabel');
    if (primaryIsRead) {
      secondaryLabel.textContent = T.labelAloud;
    } else {
      secondaryLabel.innerHTML = `${T.labelSilent} <em id="readingRateLabel">· ${readRate} ${state.mode === 'words' ? 'WPM' : 'CPM'}</em>`;
    }
    $('#estimateNote').textContent = state.mode === 'words'
      ? (primaryIsRead ? T.noteSilent(readRate) : T.noteAloud)
      : T.noteCjk;
    $('#modeNote').textContent = state.mode === 'words' ? T.modeWords : T.modeChars;
    $('#paceUnit').textContent = state.mode === 'words' ? 'WPM' : 'CPM';
    const paceName = state.mode === 'words' ? (primaryIsRead ? T.paceNameRead : T.paceNameSpeak) : T.paceNameCjk;
    if (state.mode === 'words') {
      $('#wpmInput').setAttribute('aria-label', T.ariaPaceW(paceName));
      $('#wpmSlider').setAttribute('aria-label', T.ariaSliderW(paceName));
    } else {
      $('#wpmInput').setAttribute('aria-label', T.ariaPaceC(paceName));
      $('#wpmSlider').setAttribute('aria-label', T.ariaSliderC(paceName));
    }
    $('#paceKicker').textContent = state.mode === 'words' ? (primaryIsRead ? T.kickerRead : T.kickerSpeak) : T.kickerCjk;
    $('#scenarioLabel').textContent = primaryIsRead ? T.scenarioSilent : T.scenarioAloud;
    $('#progressLabel').textContent = state.mode === 'words' ? T.progressWords : T.progressChars;
    $('#progressUnits').setAttribute('aria-label', state.mode === 'words' ? T.ariaProgressWords : T.ariaProgressChars);
    if (state.mode !== 'words') {
      $('#paceCaption').textContent = T.paceCjk;
    } else if (primaryIsRead) {
      $('#paceCaption').textContent = readingPaceDescription(readRate);
    } else {
      $('#paceCaption').textContent = paceDescription(state.speakWpm);
    }
    $('#scenarioRow').hidden = state.mode !== 'words';
    $('#readModeWrap').hidden = state.mode !== 'words';
    updateLineNumbers();
    updateTarget(metrics);
    if ($('#focusDialog').open) {
      $('#focusText').textContent = countMode ? T.focusCount : (text || T.focusEmpty);
    }
    if (state.timerStartedAt) updateTimerDisplay();
  }

  function applyTheme(theme, persist = true) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    $('#themeToggle').setAttribute('aria-pressed', String(isDark));
    $('#themeToggle').setAttribute('aria-label', isDark ? T.ariaToLight : T.ariaToDark);
    $('#themeToggle .stc-theme-icon').textContent = isDark ? '☀' : '☾';
    $('#themeToggle .stc-theme-label').textContent = isDark ? T.themeLight : T.themeDark;
    $('#themeColorMeta').content = isDark ? '#000000' : '#f7f8f7';
    if (persist) { try { localStorage.setItem('stc-theme', isDark ? 'dark' : 'light'); } catch { /* Theme still works if storage is disabled. */ } }
  }

  function paceDescription(wpm) {
    if (wpm < 110) return T.paceDeliberate;
    if (wpm <= 145) return T.paceComfortable;
    if (wpm <= 180) return T.paceEnergetic;
    return T.paceFast;
  }

  function timerButton(icon, label) {
    return `<span aria-hidden="true">${icon}</span> ${label}`;
  }

  function setWpm(value) {
    const wpm = Math.min(400, Math.max(60, Math.round(Number(value) || DEFAULT_WPM)));
    if (state.mode !== 'words') {
      state.cjkWpm = wpm;
    } else if (state.readMode === 'aloud') {
      state.speakWpm = wpm;
    } else {
      state.readWpm = wpm;
    }
    $('#wpmSlider').value = String(wpm);
    $('#wpmInput').value = String(wpm);
    syncScenarioSelect();
    saveSettings();
    render();
  }

  async function copyText(value, message) {
    if (!value) { showToast(T.toastEmpty); return; }
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const temporary = document.createElement('textarea');
      temporary.value = value;
      temporary.style.position = 'fixed'; temporary.style.opacity = '0';
      document.body.append(temporary); temporary.select();
      const copied = document.execCommand('copy'); temporary.remove();
      if (!copied) { showToast(T.toastCopyFail); return; }
    }
    showToast(message);
  }

  function updateTimerDisplay() {
    const elapsed = state.timerElapsed + (state.timerStartedAt ? Date.now() - state.timerStartedAt : 0);
    const display = formatDuration(elapsed / 1000, true);
    const spokenUnits = Math.max(0, Number($('#progressUnits').value) || 0);
    $('#stopwatch').setAttribute('aria-label', T.ariaElapsed(plainDuration(elapsed / 1000)));
    $('#stopwatch').textContent = display;
    $('#focusClock').textContent = display;
    const elapsedMinutes = elapsed / 60000;
    const speed = elapsedMinutes >= .05 && spokenUnits > 0 ? Math.round(spokenUnits / elapsedMinutes) : null;
    $('#liveSpeed').innerHTML = `${speed === null ? '—' : speed.toLocaleString()} <small>${state.mode === 'words' ? 'WPM' : 'CPM'}</small>`;
  }

  function startTimer() {
    if (state.timerStartedAt) {
      state.timerElapsed += Date.now() - state.timerStartedAt;
      state.timerStartedAt = 0;
      window.clearInterval(state.timerInterval);
      $('#timerStartBtn').innerHTML = timerButton('▶', T.timerResume);
      return;
    }
    state.timerStartedAt = Date.now();
    state.timerInterval = window.setInterval(updateTimerDisplay, 100);
    $('#timerStartBtn').innerHTML = timerButton('Ⅱ', T.timerPause);
    $('#timerLapBtn').disabled = false;
    updateTimerDisplay();
  }

  function resetTimer() {
    window.clearInterval(state.timerInterval);
    state.timerStartedAt = 0; state.timerElapsed = 0; state.laps = [];
    $('#timerStartBtn').innerHTML = timerButton('▶', T.timerStart);
    $('#timerLapBtn').disabled = true;
    $('#lapList').replaceChildren();
    $('#progressUnits').value = '0';
    $('#liveSpeed').innerHTML = `— <small>${state.mode === 'words' ? 'WPM' : 'CPM'}</small>`;
    updateTimerDisplay();
  }

  function addLap() {
    const elapsed = state.timerElapsed + (state.timerStartedAt ? Date.now() - state.timerStartedAt : 0);
    state.laps.push(elapsed);
    const row = document.createElement('div');
    row.className = 'stc-lap-row';
    row.innerHTML = `<span>${T.lap(state.laps.length)}</span><span>${formatDuration(elapsed / 1000, true)}</span>`;
    $('#lapList').prepend(row);
  }

  function buildTimedScript() {
    const text = scriptInput.value.trim();
    if (!text) return '';
    let elapsedUnits = 0;
    return text.split(/\n\s*\n/u).map((paragraph) => {
      const units = state.mode === 'words' ? analyzeText(paragraph).words : (paragraph.match(CJK_CHARACTERS) || []).length || [...paragraph.replace(/\s/gu, '')].length;
      const timestamp = formatDuration(elapsedUnits / currentRate() * 60, true);
      elapsedUnits += units;
      return `[${timestamp}]\n${paragraph.trim()}`;
    }).join('\n\n');
  }

  function openFocusMode() {
    $('#focusText').textContent = state.inputMode === 'count' ? T.focusCount : (scriptInput.value || T.focusEmpty);
    $('#focusDialog').showModal();
    document.body.style.overflow = 'hidden';
    $('#scrollToggleBtn').textContent = T.scrollStart;
  }

  function stopAutoScroll() {
    state.scrollActive = false;
    window.cancelAnimationFrame(state.scrollFrame);
    state.scrollLast = 0;
    $('#scrollToggleBtn').textContent = T.scrollStart;
  }

  function autoScrollFrame(timestamp) {
    if (!state.scrollActive) return;
    if (state.scrollLast) {
      const elapsed = Math.min(50, timestamp - state.scrollLast);
      const speed = Number($('#scrollSpeed').value);
      $('#focusDialog .stc-focus-content').scrollTop += speed * (currentRate() / 130) * elapsed / 1000;
    }
    state.scrollLast = timestamp;
    state.scrollFrame = window.requestAnimationFrame(autoScrollFrame);
  }

  function renderReferenceTable() {
    const counts = [100, 250, 500, 750, 1000, 1250, 1500, 2000, 3000, 5000];
    const body = $('#referenceTableBody');
    counts.forEach((count) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${T.tableWords(count.toLocaleString())}</td><td>${plainDuration(count / 100 * 60)}</td><td>${plainDuration(count / 130 * 60)}</td><td>${plainDuration(count / 160 * 60)}</td><td>${plainDuration(count / 230 * 60)}</td>`;
      body.append(row);
    });
  }

  scriptInput.value = safeStorage.get();
  try {
    const savedCount = localStorage.getItem(COUNT_KEY);
    if (savedCount !== null) $('#wordCountInput').value = savedCount;
    const savedInputMode = localStorage.getItem(INPUTMODE_KEY);
    if (savedInputMode === 'text' || savedInputMode === 'count') state.inputMode = savedInputMode;
  } catch { /* Saved drafts are optional. */ }
  if (state.inputMode === 'count') {
    $('#editorWrap').hidden = true;
    $('#countWrap').hidden = false;
    document.querySelectorAll('.stc-input-toggle-btn').forEach((button) => button.classList.toggle('stc-toggle-active', button.dataset.inputmode === 'count'));
  }
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light', false);
  restoreSettings();
  $('#themeToggle').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  document.addEventListener('click', (event) => {
    const openMenu = document.querySelector('.stc-lang-menu[open]');
    if (openMenu && !openMenu.contains(event.target)) openMenu.removeAttribute('open');
  });
  $('#mobileDockCopy').addEventListener('click', () => $('#copySummaryBtn').click());
  buildScenarioOptions();
  scriptInput.addEventListener('input', () => { safeStorage.set(scriptInput.value); scheduleRender(); });
  scriptInput.addEventListener('scroll', () => { $('#lineNumbers').scrollTop = scriptInput.scrollTop; });
  $('#wpmSlider').addEventListener('input', (event) => {
    const wpm = Math.min(400, Math.max(60, Math.round(Number(event.target.value) || DEFAULT_WPM)));
    if (state.mode !== 'words') state.cjkWpm = wpm;
    else if (state.readMode === 'aloud') state.speakWpm = wpm;
    else state.readWpm = wpm;
    $('#wpmInput').value = String(wpm);
    syncScenarioSelect();
    saveSettings();
    scheduleRender();
  });
  $('#wpmInput').addEventListener('change', (event) => setWpm(event.target.value));
  $('#wpmInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') { setWpm(event.target.value); event.target.blur(); } });
  $('#wpmInput').addEventListener('input', (event) => {
    const wpm = Number(event.target.value);
    if (!Number.isFinite(wpm) || wpm < 60 || wpm > 400) return;
    if (state.mode !== 'words') state.cjkWpm = wpm;
    else if (state.readMode === 'aloud') state.speakWpm = wpm;
    else state.readWpm = wpm;
    $('#wpmSlider').value = String(Math.round(wpm));
    syncScenarioSelect();
    saveSettings();
    scheduleRender();
  });
  $('#scenarioSelect').addEventListener('change', (event) => {
    if (event.target.value === 'custom') return;
    setWpm(event.target.value);
  });
  document.querySelectorAll('.stc-readmode-btn').forEach((button) => button.addEventListener('click', () => {
    if (state.readMode === button.dataset.readmode) return;
    state.readMode = button.dataset.readmode;
    document.querySelectorAll('.stc-readmode-btn').forEach((other) => {
      const active = other === button;
      other.classList.toggle('stc-readmode-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    const slot = state.readMode === 'aloud' ? state.speakWpm : state.readWpm;
    $('#wpmSlider').value = String(slot);
    $('#wpmInput').value = String(slot);
    buildScenarioOptions();
    saveSettings();
    render();
  }));
  document.querySelectorAll('.stc-input-toggle-btn').forEach((button) => button.addEventListener('click', () => {
    if (state.inputMode === button.dataset.inputmode) return;
    state.inputMode = button.dataset.inputmode;
    document.querySelectorAll('.stc-input-toggle-btn').forEach((other) => other.classList.toggle('stc-toggle-active', other === button));
    const count = state.inputMode === 'count';
    $('#editorWrap').hidden = count;
    $('#countWrap').hidden = !count;
    try { localStorage.setItem(INPUTMODE_KEY, state.inputMode); } catch { /* Preference saving is optional. */ }
    if (count) $('#wordCountInput').focus();
    render();
  }));
  $('#wordCountInput').addEventListener('input', (event) => {
    try { localStorage.setItem(COUNT_KEY, event.target.value); } catch { /* Draft saving is optional. */ }
    scheduleRender();
  });
  $('#languageMode').addEventListener('change', (event) => {
    state.mode = event.target.value;
    if (state.mode !== 'words') {
      state.cjkWpm = CJK_RATES[state.mode];
      $('#wpmSlider').value = String(state.cjkWpm);
      $('#wpmInput').value = String(state.cjkWpm);
    } else {
      const slot = state.readMode === 'aloud' ? state.speakWpm : state.readWpm;
      $('#wpmSlider').value = String(slot);
      $('#wpmInput').value = String(slot);
      buildScenarioOptions();
    }
    saveSettings();
    render();
  });
  $('#targetMinutes').addEventListener('change', () => { saveSettings(); render(); });
  $('#customMinutes').addEventListener('input', () => { saveSettings(); scheduleRender(); });
  $('#clearBtn').addEventListener('click', () => {
    if (state.inputMode === 'count') {
      if (!$('#wordCountInput').value) { showToast(T.toastCountEmpty); return; }
      $('#wordCountInput').value = '';
      try { localStorage.removeItem(COUNT_KEY); } catch { /* Storage can be disabled. */ }
      render(); $('#wordCountInput').focus(); showToast(T.toastCountCleared);
      return;
    }
    if (!scriptInput.value) { showToast(T.toastClearEmpty); return; }
    scriptInput.value = ''; safeStorage.clear(); render(); scriptInput.focus(); showToast(T.toastCleared);
  });
  $('#copyTextBtn').addEventListener('click', () => {
    if (state.inputMode === 'count') { showToast(T.toastCopyTextCount); return; }
    copyText(scriptInput.value, T.toastCopied);
  });
  $('#copySummaryBtn').addEventListener('click', () => {
    const countValue = Math.max(0, Math.min(1000000, Math.floor(Number($('#wordCountInput').value) || 0)));
    const metrics = state.inputMode === 'count'
      ? { words: state.mode === 'words' ? countValue : 0, spokenUnits: countValue }
      : analyzeText(scriptInput.value);
    if (!metrics.spokenUnits) { showToast(state.inputMode === 'count' ? T.toastNoSummaryCount : T.toastNoSummary); return; }
    const rate = currentRate();
    const duration = plainDuration(metrics.spokenUnits / rate * 60);
    const effRead = state.mode === 'words' ? state.readMode : 'aloud';
    if (state.mode !== 'words') {
      copyText(T.copyCjk(metrics.spokenUnits.toLocaleString(), duration, rate), T.toastSummaryCopied);
    } else if (effRead === 'silent') {
      copyText(T.copySilent(metrics.words.toLocaleString(), duration, rate), T.toastSummaryCopied);
    } else {
      copyText(T.copyAloud(metrics.words.toLocaleString(), duration, rate), T.toastSummaryCopied);
    }
  });
  $('#exportBtn').addEventListener('click', () => {
    if (state.inputMode === 'count') { showToast(T.toastExportCount); return; }
    const content = buildTimedScript();
    if (!content) { showToast(T.toastNoExport); return; }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'timed-speech-script.txt';
    document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    showToast(T.toastExported);
  });
  $('#timerStartBtn').addEventListener('click', startTimer);
  $('#timerResetBtn').addEventListener('click', resetTimer);
  $('#timerLapBtn').addEventListener('click', addLap);
  $('#progressUnits').addEventListener('input', updateTimerDisplay);
  $('#focusBtn').addEventListener('click', openFocusMode);
  $('#focusCloseBtn').addEventListener('click', () => $('#focusDialog').close());
  $('#focusDialog').addEventListener('close', () => { document.body.style.overflow = ''; stopAutoScroll(); });
  $('#focusDialog').addEventListener('click', (event) => { if (event.target === $('#focusDialog')) $('#focusDialog').close(); });
  $('#fontSizeControl').addEventListener('input', (event) => { $('#focusText').style.fontSize = `${event.target.value}px`; });
  $('#scrollToggleBtn').addEventListener('click', () => {
    state.scrollActive = !state.scrollActive;
    if (state.scrollActive) { $('#scrollToggleBtn').textContent = T.scrollPause; state.scrollFrame = window.requestAnimationFrame(autoScrollFrame); }
    else stopAutoScroll();
  });
  $('#focusDialog .stc-focus-content').addEventListener('wheel', () => { if (state.scrollActive) stopAutoScroll(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.scrollActive) stopAutoScroll(); });

  document.querySelectorAll('.stc-faq-tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.stc-faq-tab').forEach((other) => {
      const active = other === tab;
      other.classList.toggle('stc-faq-tab-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    const category = tab.dataset.faqtab;
    document.querySelectorAll('.stc-faq [data-cat]').forEach((item) => {
      item.hidden = category !== 'all' && item.dataset.cat !== category;
    });
  }));

  renderReferenceTable();
  render();
})();
