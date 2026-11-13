// Verified numeric core for the 15 spec pages.
// Every figure here is independently recomputed, not copied.
//   minutes: words = 130 * minutes, buffer = round(0.85 * words),
//            single = words / 500, double = words / 250
//   words:   seconds = words / 130 * 60, stage = seconds * 1.15

export const RATES = [
  { pace: 'Slow', wpm: 100 },
  { pace: 'Academic', wpm: 115 },
  { pace: 'Business', wpm: 130 },
  { pace: 'Podcast', wpm: 145 },
  { pace: 'Fast TED', wpm: 160 },
  { pace: 'Silent reading', wpm: 230 }
];

export const SINGLE_WPP = 500;
export const DOUBLE_WPP = 250;
export const BUFFER_PERCENT = 85;
export const BUSINESS_WPM = 130;

/** Durations addressed by the spec's /minutes/ group, with their primary scenario. */
export const MINUTE_PAGES = [
  {
    slug: '1-minute-speech',
    minutes: 1,
    scenario: 'Elevator Pitch & 60s Intro',
    slides: '1–2',
    paragraphs: '1–2',
    useCase: 'an elevator pitch, a 60-second introduction, or a one-minute sponsor thank-you'
  },
  {
    slug: '2-minute-speech',
    minutes: 2,
    scenario: 'Interview Intro & Short Toast',
    slides: '2–3',
    paragraphs: '2–3',
    useCase: 'a job-interview introduction, a short toast, or a two-minute project update'
  },
  {
    slug: '3-minute-speech',
    minutes: 3,
    scenario: 'Wedding Toast, Best Man & 3MT',
    slides: '3–4',
    paragraphs: '3–4',
    useCase: 'a wedding toast, a best-man speech, or a three-minute thesis (3MT)'
  },
  {
    slug: '5-minute-speech',
    minutes: 5,
    scenario: 'Class Presentation & Lightning Talk',
    slides: '5–6',
    paragraphs: '5–6',
    useCase: 'a class presentation, a lightning talk, or a five-minute conference slot'
  },
  {
    slug: '10-minute-speech',
    minutes: 10,
    scenario: 'Business Update & Conference Talk',
    slides: '8–10',
    paragraphs: '9–11',
    useCase: 'a business update, a conference talk, or a ten-minute client pitch'
  },
  {
    slug: '15-minute-speech',
    minutes: 15,
    scenario: 'Academic Seminar & Workshop',
    slides: '12–15',
    paragraphs: '14–16',
    useCase: 'an academic seminar, a workshop segment, or a fifteen-minute keynote'
  },
  {
    slug: '20-minute-speech',
    minutes: 20,
    scenario: 'TED Talk & Mainstage Keynote',
    slides: '15–20',
    paragraphs: '18–22',
    useCase: 'a TED-style talk, a mainstage keynote, or a twenty-minute training session'
  }
];

/** Word counts addressed by the spec's /words/ group. */
export const WORD_PAGES = [
  { slug: '100-words-to-minutes', words: 100, useCase: 'a 45-second commercial voice-over or ad read' },
  { slug: '250-words-to-minutes', words: 250, useCase: 'one double-spaced page read aloud' },
  { slug: '300-words-to-minutes', words: 300, useCase: 'an event welcome or a short toast' },
  { slug: '500-words-to-minutes', words: 500, useCase: 'one single-spaced page read aloud' },
  { slug: '750-words-to-minutes', words: 750, useCase: 'three double-spaced pages or a five-to-six-minute talk' },
  { slug: '1000-words-to-minutes', words: 1000, useCase: 'a standard essay or an eight-minute presentation' },
  { slug: '1500-words-to-minutes', words: 1500, useCase: 'a podcast segment or a twelve-minute talk' },
  { slug: '2000-words-to-minutes', words: 2000, useCase: 'a full fifteen-minute keynote script' }
];

export const wordsForMinutes = (minutes) => BUSINESS_WPM * minutes;
export const bufferFor = (words) => Math.round(words * BUFFER_PERCENT / 100);
export const secondsForWords = (words) => words / BUSINESS_WPM * 60;
export const stageSecondsFor = (words) => secondsForWords(words) * 1.15;

/** "2 min 0 sec" style, matching locales.mjs ui.tHr/tMin/tSec shape used by publish.mjs. */
export function clock(totalSeconds, ui, { compact = false } = {}) {
  const total = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = [];
  if (h) parts.push(`${h} ${ui.tHr}`);
  if (m || h) parts.push(`${m} ${ui.tMin}`);
  if (s || !parts.length) parts.push(`${s} ${ui.tSec}`);
  if (compact && parts.length === 1) return parts[0];
  return parts.join(' ');
}

/** Number formatted with the locale separator. */
export function n(value, loc) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, loc.thousands);
}

/** One-decimal page count with the locale decimal mark. */
export function dec1(value, loc) {
  const [whole, frac] = value.toFixed(1).split('.');
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, loc.thousands)}${loc.decimal}${frac}`;
}
