import { describe, expect, it, vi } from "vitest";
import { addDays, dateKey } from "../src/date-utils";
import { loadDays, mergeEvents } from "../src/merge";
import type { HaCalendarEvent } from "../src/types";

const ev = (date: string, summary: string, description?: string): HaCalendarEvent => ({
  start: { date },
  end: { date },
  summary,
  description,
});

// 2026-11-11 is a Wednesday; 2026-11-15 is a Sunday.
const start = new Date(2026, 10, 11);

describe("mergeEvents", () => {
  const regular = [
    ev("2026-11-11", "Sf. Mina"),
    ev("2026-11-12", "Sf. Ioan cel Milostiv"),
    ev("2026-11-13", "Sf. Ioan Gură de Aur"),
    ev("2026-11-14", "Sf. Ap. Filip"),
    ev("2026-11-15", "Duminica a 25-a după Rusalii"),
    ev("2026-11-21", "Intrarea în Biserică a Maicii Domnului"),
  ];
  const feasts = [ev("2026-11-13", "(†) Feast version", "Praznic Mare")];

  it("returns one entry per day, sorted", () => {
    const days = mergeEvents(regular, feasts, start, 5);
    expect(days.map((d) => d.key)).toEqual([
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ]);
  });

  it("replaces the regular day with the feast day", () => {
    const day = mergeEvents(regular, feasts, start, 5).find((d) => d.key === "2026-11-13")!;
    expect(day.summary).toBe("(†) Feast version");
    expect(day.description).toBe("Praznic Mare");
    expect(day.isFeast).toBe(true);
    expect(day.highlighted).toBe(true);
  });

  it("does not depend on input order", () => {
    const a = mergeEvents([...regular].reverse(), feasts, start, 5);
    const b = mergeEvents(regular, feasts, start, 5);
    expect(a).toEqual(b);
  });

  it("highlights Sundays and nothing else", () => {
    const days = mergeEvents(regular, [], start, 5);
    expect(days.filter((d) => d.highlighted).map((d) => d.key)).toEqual(["2026-11-15"]);
    expect(days.find((d) => d.key === "2026-11-15")!.isSunday).toBe(true);
  });

  it("drops events outside the requested days", () => {
    const days = mergeEvents(regular, [ev("2026-11-30", "Sf. Andrei")], start, 7);
    expect(days.map((d) => d.key)).not.toContain("2026-11-21");
    expect(days.map((d) => d.key)).not.toContain("2026-11-30");
  });

  it("keeps a feast even if the regular calendar has no event that day", () => {
    const days = mergeEvents([], [ev("2026-11-12", "Feast")], start, 3);
    expect(days).toHaveLength(1);
    expect(days[0].isFeast).toBe(true);
  });

  it("handles timed events by their local date", () => {
    const local = new Date(2026, 10, 12, 10, 0);
    const days = mergeEvents(
      [{ start: { dateTime: local.toISOString() }, end: {}, summary: "Timed" }],
      [],
      start,
      3,
    );
    expect(days[0].key).toBe("2026-11-12");
  });

  it("treats empty descriptions as missing", () => {
    const days = mergeEvents([ev("2026-11-11", "X", "  ")], [], start, 1);
    expect(days[0].description).toBeUndefined();
  });
});

describe("date helpers", () => {
  it("adds calendar days across DST changes", () => {
    // Covers the late-October DST switch in Europe.
    let d = new Date(2026, 9, 20);
    const keys: string[] = [];
    for (let i = 0; i < 15; i++) keys.push(dateKey(addDays(d, i)));
    expect(new Set(keys).size).toBe(15);
    expect(keys[14]).toBe("2026-11-03");
    d = addDays(d, 0);
    expect(d.getHours()).toBe(0);
  });
});

describe("loadDays", () => {
  it("fetches both calendars for the right range", async () => {
    const fetcher = vi.fn(async (entity: string) =>
      entity === "calendar.feasts" ? [ev("2026-11-11", "Feast")] : [ev("2026-11-11", "Regular")],
    );
    const days = await loadDays(fetcher, "calendar.all", "calendar.feasts", start, 7);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const [, s, e] = fetcher.mock.calls[0] as unknown as [string, Date, Date];
    expect(dateKey(s)).toBe("2026-11-11");
    expect(dateKey(e)).toBe("2026-11-18");
    expect(days[0].summary).toBe("Feast");
  });

  it("works without a feasts calendar", async () => {
    const fetcher = vi.fn(async () => [ev("2026-11-11", "Regular")]);
    const days = await loadDays(fetcher, "calendar.all", undefined, start, 1);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(days[0].summary).toBe("Regular");
  });
});
