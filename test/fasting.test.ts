import { describe, expect, it } from "vitest";
import { parseFasting } from "../src/fasting";
import { mergeEvents } from "../src/merge";

describe("parseFasting", () => {
  it("detects fish days (Romanian and English)", () => {
    expect(parseFasting("Post: Dezlegare la pește")).toEqual({
      kind: "fish",
      text: "Dezlegare la pește",
    });
    expect(parseFasting("Post: Fish allowed").kind).toBe("fish");
  });

  it("detects other fasting days", () => {
    expect(parseFasting("Post: Post").kind).toBe("fast");
    expect(parseFasting("Post: Dezlegare la ulei și vin").kind).toBe("fast");
    expect(parseFasting("Post: Post negru").kind).toBe("fast");
    expect(parseFasting("Post: Strict fasting (no food)").kind).toBe("fast");
  });

  it("treats cheesefare (eggs, dairy and fish) as a fasting day, not a fish day", () => {
    expect(parseFasting("Post: Dezlegare la ouă, lactate și pește").kind).toBe("fast");
  });

  it("finds the Post line among other lines", () => {
    const description = "Praznic Mare\nPost: Dezlegare la pește\nNu se fac nunți\n\nApostol: ...";
    expect(parseFasting(description).kind).toBe("fish");
  });

  it("handles several items and ignores 'Zi aliturgică'", () => {
    expect(parseFasting("Post: Post | Zi aliturgică")).toEqual({ kind: "fast", text: "Post" });
    expect(parseFasting("Post: Zi aliturgică").kind).toBe("none");
    expect(parseFasting("Post: No liturgy").kind).toBe("none");
  });

  it("treats fast-free days as not fasting", () => {
    expect(parseFasting("Post: Harți").kind).toBe("none");
    expect(parseFasting("Post: Fast-free day").kind).toBe("none");
  });

  it("returns none without a Post line", () => {
    expect(parseFasting(undefined).kind).toBe("none");
    expect(parseFasting("").kind).toBe("none");
    expect(parseFasting("✝️ Sărbătoare\nNu se fac nunți").kind).toBe("none");
    // "Post" inside other text is not the fasting line.
    expect(parseFasting("Duminica după Postul Mare").kind).toBe("none");
  });
});

describe("mergeEvents fasting", () => {
  it("adds fasting info to each day", () => {
    const days = mergeEvents(
      [
        { start: { date: "2026-11-11" }, end: {}, summary: "A", description: "Post: Dezlegare la pește" },
        { start: { date: "2026-11-12" }, end: {}, summary: "B" },
      ],
      [],
      new Date(2026, 10, 11),
      2,
    );
    expect(days.map((d) => d.fasting.kind)).toEqual(["fish", "none"]);
  });
});
