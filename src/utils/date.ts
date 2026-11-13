/**
 * Display + form helpers. Week boundaries are computed by the API;
 * these helpers only format dates in the user's local timezone.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** YYYY-MM-DD for a Date in local time. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse a YYYY-MM-DD key as a local calendar date. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(now = new Date()): string {
  return toDateKey(now);
}

export function addDaysKey(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/**
 * Monday of the week containing `key`. Only used to navigate the day strip;
 * grouping and counts always come from the API.
 */
export function startOfWeekKey(key: string): string {
  const d = parseDateKey(key);
  return addDaysKey(key, -((d.getDay() + 6) % 7));
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysKey(weekStart, i));
}

export function formatMonthYear(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatDayLabel(key: string, today = todayKey()): string {
  if (key === today) return 'Today';
  if (key === addDaysKey(today, 1)) return 'Tomorrow';
  if (key === addDaysKey(today, -1)) return 'Yesterday';
  return parseDateKey(key).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Split an ISO instant into local <input type="date"> / <input type="time"> values. */
export function toLocalInputs(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return { date: toDateKey(d), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** Combine local date + time inputs into an ISO instant. Returns null if invalid. */
export function fromLocalInputs(date: string, time: string): string | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dm || !tm) return null;
  const [y, mo, d] = dm.slice(1).map(Number);
  const [h, mi] = tm.slice(1).map(Number);
  const result = new Date(y, mo - 1, d, h, mi);
  if (Number.isNaN(result.getTime()) || result.getMonth() !== mo - 1 || result.getDate() !== d || h > 23 || mi > 59) {
    return null;
  }
  return result.toISOString();
}

/** The next whole hour from now. Rolls over to tomorrow after 23:00. */
export function nextHourSlot(now = new Date()): { date: string; time: string } {
  const d = new Date(now);
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return { date: toDateKey(d), time: `${pad(d.getHours())}:00` };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatLongDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** e.g. "9 – 15 Nov 2026", "28 Dec 2026 – 3 Jan 2027" */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const s = parseDateKey(weekStart);
  const e = parseDateKey(weekEnd);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  const startStr = s.toLocaleDateString(undefined, {
    day: 'numeric',
    ...(sameMonth ? {} : { month: 'short' }),
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const endStr = e.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

type WeekRelation = 'past' | 'current' | 'upcoming';

export function getWeekRelation(weekStart: string, weekEnd: string, today = todayKey()): WeekRelation {
  if (today < weekStart) return 'upcoming';
  if (today > weekEnd) return 'past';
  return 'current';
}

/** Sensible default date when adding a task to a given week. */
export function defaultDateForWeek(weekStart: string, weekEnd: string, today = todayKey()): string {
  return getWeekRelation(weekStart, weekEnd, today) === 'current' ? today : weekStart;
}

export function isOverdue(scheduledAt: string, status: string, now = new Date()): boolean {
  return status !== 'Completed' && new Date(scheduledAt).getTime() < now.getTime();
}
