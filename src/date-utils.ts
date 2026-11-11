/** Local date as YYYY-MM-DD. */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD as a local date at midnight. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Add whole calendar days (DST-safe, works on local dates). */
export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

/** Local date key of an event start (all-day `date` or timed `dateTime`). */
export function eventDateKey(start: { date?: string; dateTime?: string }): string | undefined {
  if (start.date) return start.date;
  if (start.dateTime) return dateKey(new Date(start.dateTime));
  return undefined;
}

export function weekdayShort(d: Date, language: string): string {
  return new Intl.DateTimeFormat(language, { weekday: "short" }).format(d);
}

export function monthShort(d: Date, language: string): string {
  return new Intl.DateTimeFormat(language, { month: "short" }).format(d);
}
