import type { FastingInfo } from "./fasting";

export interface OrthodoxCalendarCardConfig {
  type: string;
  entity?: string;
  feasts_entity?: string;
  title?: string;
  days_to_show?: number;
  show_description?: boolean;
  feast_color?: string;
  feast_bold?: boolean;
  highlight_today?: boolean;
  show_fasting_icons?: boolean;
}

export type ResolvedConfig = Required<Omit<OrthodoxCalendarCardConfig, "title">> & {
  title?: string;
};

export const DEFAULT_CONFIG: Omit<ResolvedConfig, "type"> = {
  entity: "calendar.calendar_ortodox",
  feasts_entity: "calendar.calendar_ortodox_sarbatori",
  days_to_show: 7,
  show_description: false,
  feast_color: "var(--red-color, #f44336)",
  feast_bold: true,
  highlight_today: true,
  show_fasting_icons: true,
};

/** Event as returned by GET /api/calendars/<entity_id>. */
export interface HaCalendarEvent {
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  summary: string;
  description?: string | null;
}

/** One merged day shown by the card. */
export interface CalendarDay {
  /** Local date as YYYY-MM-DD. */
  key: string;
  date: Date;
  summary: string;
  description?: string;
  isFeast: boolean;
  isSunday: boolean;
  /** Feast or Sunday: rendered with the feast color. */
  highlighted: boolean;
  fasting: FastingInfo;
}

/** Minimal slice of the Home Assistant frontend object used by the card. */
export interface HomeAssistant {
  states: Record<string, { entity_id: string; state: string; attributes: Record<string, unknown> }>;
  locale?: { language: string };
  language?: string;
  callApi<T>(method: "GET" | "POST", path: string): Promise<T>;
}
