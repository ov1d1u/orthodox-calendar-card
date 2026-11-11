import { addDays, dateKey, eventDateKey, parseDateKey } from "./date-utils";
import { parseFasting } from "./fasting";
import type { CalendarDay, HaCalendarEvent } from "./types";

export type EventFetcher = (entity: string, start: Date, end: Date) => Promise<HaCalendarEvent[]>;

/**
 * Merge regular and feast events into one entry per day.
 * A feast event replaces the regular event on the same date.
 * Only days in [start, start + days) are kept.
 */
export function mergeEvents(
  regular: HaCalendarEvent[],
  feasts: HaCalendarEvent[],
  start: Date,
  days: number,
): CalendarDay[] {
  const wanted = new Set<string>();
  for (let i = 0; i < days; i++) wanted.add(dateKey(addDays(start, i)));

  const byDate = new Map<string, CalendarDay>();
  const put = (ev: HaCalendarEvent, isFeast: boolean) => {
    const key = eventDateKey(ev.start);
    if (!key || !wanted.has(key)) return;
    // Keep the first regular event of a day; feasts always win.
    if (!isFeast && byDate.has(key)) return;
    const date = parseDateKey(key);
    const isSunday = date.getDay() === 0;
    const description = ev.description?.trim() || undefined;
    byDate.set(key, {
      key,
      date,
      summary: ev.summary,
      description,
      fasting: parseFasting(description),
      isFeast,
      isSunday,
      highlighted: isFeast || isSunday,
    });
  };

  regular.forEach((ev) => put(ev, false));
  feasts.forEach((ev) => put(ev, true));

  return [...byDate.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Fetch both calendars for `days` days starting at `start` and merge them. */
export async function loadDays(
  fetcher: EventFetcher,
  entity: string,
  feastsEntity: string | undefined,
  start: Date,
  days: number,
): Promise<CalendarDay[]> {
  const end = addDays(start, days);
  const [regular, feasts] = await Promise.all([
    fetcher(entity, start, end),
    feastsEntity ? fetcher(feastsEntity, start, end) : Promise.resolve([]),
  ]);
  return mergeEvents(regular, feasts, start, days);
}
