export type FastingKind = "none" | "fast" | "fish";

export interface FastingInfo {
  kind: FastingKind;
  /** Fasting rules as written by the integration, e.g. "Dezlegare la pește". */
  text?: string;
}

const PREFIX = "Post:";
// Items in the "Post:" line that are not fasting rules (Romanian and English).
const NOT_FASTING = new Set(["Zi aliturgică", "No liturgy", "Harți", "Fast-free day"]);
const FISH = new Set(["Dezlegare la pește", "Fish allowed"]);

/**
 * Read the fasting rule from a Calendar Ortodox event description.
 * The integration writes it as a line like "Post: Dezlegare la pește",
 * with several items joined by " | ".
 */
export function parseFasting(description?: string): FastingInfo {
  const line = description
    ?.split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith(PREFIX));
  if (!line) return { kind: "none" };

  const items = line
    .slice(PREFIX.length)
    .split("|")
    .map((i) => i.trim())
    .filter((i) => i && !NOT_FASTING.has(i));
  if (items.length === 0) return { kind: "none" };

  return {
    kind: items.some((i) => FISH.has(i)) ? "fish" : "fast",
    text: items.join(" | "),
  };
}
