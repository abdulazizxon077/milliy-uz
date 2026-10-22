/**
 * A small reader for the OpenStreetMap `opening_hours` format.
 *
 * Supported: `24/7`, day lists and ranges (`Mo-Fr`, `Su-Mo, We`), several
 * time ranges per rule (`09:00-13:00, 14:00-18:00`), rules separated by `;`
 * (a later rule replaces earlier ones for its days), `off`/`closed`, and
 * ranges that end after midnight (`18:00-02:00`). Uzbek (`Du-Ya`) and
 * Russian (`Пн-Вс`) day abbreviations are accepted as well.
 * Anything else (public holidays, months, week numbers) makes the whole
 * value unreadable, and callers treat the hours as unknown.
 */

export const DAY_KEYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const DAY_NAMES = [
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
  'Yakshanba',
];

const DAY_ALIASES = {
  du: 'Mo',
  se: 'Tu',
  ch: 'We',
  pa: 'Th',
  ju: 'Fr',
  sh: 'Sa',
  ya: 'Su',
  пн: 'Mo',
  вт: 'Tu',
  ср: 'We',
  чт: 'Th',
  пт: 'Fr',
  сб: 'Sa',
  вс: 'Su',
};

const DAY_TOKEN = /^(Mo|Tu|We|Th|Fr|Sa|Su)$/;
const TIME = /^(\d{1,2}):(\d{2})$/;

function normalize(value) {
  return (
    String(value ?? '')
      .trim()
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\s*-\s*/g, '-')
      .replace(/\s*,\s*/g, ',')
      .replace(
        /(?<![A-Za-zА-Яа-я])[A-Za-zА-Яа-я]{2}(?![A-Za-zА-Яа-я])/g,
        (word) => DAY_ALIASES[word.toLowerCase()] ?? word,
      )
      .replace(/\s+/g, ' ')
      // "Mo-Sa 09:00-18:00 Su 10:00-14:00" is a common slip for two rules.
      .replace(/(\d) (?=(Mo|Tu|We|Th|Fr|Sa|Su)\b)/g, '$1; ')
  );
}

function parseTime(text) {
  const match = TIME.exec(text);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 48 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function parseDays(selector) {
  const days = new Set();
  for (const part of selector.split(',')) {
    const [from, to] = part.split('-');
    if (!DAY_TOKEN.test(from) || (to !== undefined && !DAY_TOKEN.test(to))) return null;
    const start = DAY_KEYS.indexOf(from);
    const end = to === undefined ? start : DAY_KEYS.indexOf(to);
    for (let i = start; ; i = (i + 1) % 7) {
      days.add(i);
      if (i === end) break;
    }
  }
  return days;
}

function parseRanges(text) {
  const ranges = [];
  for (const part of text.split(',')) {
    const [from, to] = part.split('-');
    const start = parseTime(from);
    let end = parseTime(to ?? '');
    if (start === null || end === null || start >= 1440) return null;
    if (end <= start) end += 1440;
    ranges.push([start, end]);
  }
  return ranges;
}

/**
 * Returns `{ always: true }`, `{ week }` where `week[0..6]` (Monday first)
 * holds `[startMinute, endMinute]` pairs, or `null` when the value is empty
 * or cannot be read.
 */
export function parseOpeningHours(value) {
  const text = normalize(value);
  if (!text) return null;
  if (text === '24/7') return { always: true };
  const week = Array.from({ length: 7 }, () => []);
  for (const raw of text.split(';')) {
    let rule = raw.trim();
    if (!rule) continue;
    let days = new Set([0, 1, 2, 3, 4, 5, 6]);
    const space = rule.indexOf(' ');
    const head = space === -1 ? rule : rule.slice(0, space);
    if (/^(Mo|Tu|We|Th|Fr|Sa|Su)/.test(head)) {
      days = parseDays(head);
      if (!days) return null;
      rule = space === -1 ? '' : rule.slice(space + 1).trim();
    }
    if (!rule) return null;
    let ranges;
    if (rule === 'off' || rule === 'closed') ranges = [];
    else if (rule === '24/7' || rule === '00:00-24:00') ranges = [[0, 1440]];
    else ranges = parseRanges(rule);
    if (!ranges) return null;
    for (const day of days) week[day] = ranges;
  }
  return { week };
}

const dayIndex = (date) => (date.getDay() + 6) % 7;

export const formatMinutes = (minutes) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/**
 * Works out whether a schedule is open at `now`.
 * Returns `{ open: true, always }`, `{ open: true, closesIn }` or
 * `{ open: false, opensIn, opensAt, opensDay }` (minutes from now; the day
 * offset is 0 for today, 1 for tomorrow). `opensIn` is null when the place
 * never opens.
 */
export function scheduleStatus(schedule, now = new Date()) {
  if (schedule.always) return { open: true, always: true };
  const today = dayIndex(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  // Ranges from the previous days can run past midnight into today.
  for (let back = 1; back >= 0; back--) {
    const day = (today - back + 7) % 7;
    const offset = back * 1440;
    for (const [start, end] of schedule.week[day]) {
      const at = minute + offset;
      if (at >= start && at < end) {
        // Merge with a range on the next day that starts right at midnight.
        let closes = end;
        const nextDay = schedule.week[(day + 1) % 7];
        if (end >= 1440 && nextDay.some(([s]) => s === end - 1440)) closes = 2880;
        if (end === 1440 && nextDay.some(([s]) => s === 0)) {
          const next = nextDay.find(([s]) => s === 0);
          closes = 1440 + next[1];
        }
        return { open: true, closesIn: closes - at, closesAt: formatMinutes(closes) };
      }
    }
  }
  for (let ahead = 0; ahead <= 7; ahead++) {
    const day = (today + ahead) % 7;
    const starts = schedule.week[day]
      .map(([start]) => start + ahead * 1440)
      .filter((start) => start > minute)
      .sort((a, b) => a - b);
    if (starts.length) {
      return {
        open: false,
        opensIn: starts[0] - minute,
        opensAt: formatMinutes(starts[0]),
        opensDay: ahead,
        opensWeekday: day,
      };
    }
  }
  return { open: false, opensIn: null };
}

/** Rows for a weekly table: `[{ day, name, text }]`, Monday first. */
export function describeWeek(schedule) {
  return DAY_NAMES.map((name, day) => {
    let text;
    if (schedule.always) text = '24 soat';
    else {
      const ranges = schedule.week[day];
      if (!ranges.length) text = 'Dam olish kuni';
      else if (ranges.length === 1 && ranges[0][0] === 0 && ranges[0][1] >= 1440) text = '24 soat';
      else text = ranges.map(([s, e]) => `${formatMinutes(s)}–${formatMinutes(e)}`).join(', ');
    }
    return { day, name, text };
  });
}

/** Normalised OSM text for a value, or '' when it cannot be read. */
export function normalizeOpeningHours(value) {
  return parseOpeningHours(value) ? normalize(value) : '';
}

export const todayIndex = dayIndex;
