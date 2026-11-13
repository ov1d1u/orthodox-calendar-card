import { LitElement, html, nothing, type PropertyValues } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { dateKey, monthShort, startOfDay, weekdayShort } from "./date-utils";
import { localize, type StringKey } from "./localize";
import { loadDays } from "./merge";
import { cardStyles } from "./styles";
import {
  DEFAULT_CONFIG,
  type CalendarDay,
  type HaCalendarEvent,
  type HomeAssistant,
  type OrthodoxCalendarCardConfig,
  type ResolvedConfig,
} from "./types";
import "./editor";

const CARD_VERSION = "1.2.0";
const REFRESH_MS = 60 * 60 * 1000;

console.info(
  `%c ORTHODOX-CALENDAR-CARD %c ${CARD_VERSION} `,
  "color: white; background: #b71c1c; font-weight: 700;",
  "color: #b71c1c; background: white; font-weight: 700;",
);

export class OrthodoxCalendarCard extends LitElement {
  static styles = cardStyles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _days: { state: true },
    _error: { state: true },
    _expanded: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedConfig;
  declare _days?: CalendarDay[];
  declare _error?: string;
  declare _expanded: Set<string>;

  private _loadedKey?: string;
  private _requestId = 0;
  private _timer?: number;

  constructor() {
    super();
    this._expanded = new Set();
  }

  static getConfigElement() {
    return document.createElement("orthodox-calendar-card-editor");
  }

  static getStubConfig(): Partial<OrthodoxCalendarCardConfig> {
    return {
      entity: DEFAULT_CONFIG.entity,
      feasts_entity: DEFAULT_CONFIG.feasts_entity,
      days_to_show: DEFAULT_CONFIG.days_to_show,
    };
  }

  setConfig(config: OrthodoxCalendarCardConfig): void {
    if (!config) throw new Error("Invalid configuration");
    const days = Number(config.days_to_show ?? DEFAULT_CONFIG.days_to_show);
    if (!Number.isInteger(days) || days < 1) {
      throw new Error("days_to_show must be a positive whole number");
    }
    this._config = { ...DEFAULT_CONFIG, ...config, days_to_show: days } as ResolvedConfig;
    this._loadedKey = undefined;
  }

  getCardSize(): number {
    return 1 + (this._config?.days_to_show ?? DEFAULT_CONFIG.days_to_show);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._timer = window.setInterval(() => {
      this._loadedKey = undefined;
      this._maybeLoad();
    }, REFRESH_MS);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has("hass") || changed.has("_config")) this._maybeLoad();
  }

  private get _lang(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  private _t(key: StringKey): string {
    return localize(key, this._lang);
  }

  /** Load only when the config or the current date changed (not on every hass update). */
  private _maybeLoad(): void {
    if (!this.hass || !this._config) return;
    const c = this._config;
    const key = [dateKey(new Date()), c.entity, c.feasts_entity, c.days_to_show].join("|");
    if (key === this._loadedKey) return;
    this._loadedKey = key;
    this._load();
  }

  private async _load(): Promise<void> {
    const hass = this.hass!;
    const c = this._config!;
    const id = ++this._requestId;
    const fetcher = (entity: string, start: Date, end: Date) =>
      hass.callApi<HaCalendarEvent[]>(
        "GET",
        `calendars/${entity}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`,
      );
    try {
      const days = await loadDays(
        fetcher,
        c.entity,
        c.feasts_entity || undefined,
        startOfDay(new Date()),
        c.days_to_show,
      );
      if (id !== this._requestId) return;
      this._days = days;
      this._error = undefined;
    } catch (err) {
      if (id !== this._requestId) return;
      console.error("orthodox-calendar-card:", err);
      this._error = this._t("error");
      // Allow a retry on the next hass update.
      this._loadedKey = undefined;
    }
  }

  private _toggle(day: CalendarDay): void {
    if (!day.description) return;
    const next = new Set(this._expanded);
    next.has(day.key) ? next.delete(day.key) : next.add(day.key);
    this._expanded = next;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const c = this._config;

    const missing = [c.entity, c.feasts_entity].filter((e) => e && !this.hass!.states[e]);

    return html`
      <ha-card style=${styleMap({ "--occ-feast-color": c.feast_color })}>
        ${c.title ? html`<div class="header">${c.title}</div>` : nothing}
        ${missing.map(
          (e) => html`<ha-alert alert-type="warning">${this._t("entity_missing")}: ${e}</ha-alert>`,
        )}
        ${this._error ? html`<ha-alert alert-type="error">${this._error}</ha-alert>` : nothing}
        ${this._renderDays()}
      </ha-card>
    `;
  }

  private _renderDays() {
    if (this._days === undefined) {
      return this._error ? nothing : html`<div class="status">${this._t("loading")}</div>`;
    }
    if (this._days.length === 0) {
      return html`<div class="status">${this._t("no_events")}</div>`;
    }
    const c = this._config!;
    const today = dateKey(new Date());
    return html`<div class="days">${this._days.map((day) => {
      const showDescription =
        !!day.description && (c.show_description || this._expanded.has(day.key));
      const isFirstOfMonth = day.date.getDate() === 1;
      return html`
        <div
          class=${classMap({
            day: true,
            highlighted: day.highlighted,
            bold: c.feast_bold,
            today: c.highlight_today && day.key === today,
            clickable: !!day.description && !c.show_description,
          })}
          @click=${() => !c.show_description && this._toggle(day)}
        >
          <div class="date">
            <div class="wday">${weekdayShort(day.date, this._lang)}</div>
            <div class="num">${day.date.getDate()}</div>
            ${isFirstOfMonth || day === this._days![0]
              ? html`<div class="month">${monthShort(day.date, this._lang)}</div>`
              : nothing}
          </div>
          <div class="body">
            <div class="summary">${day.summary}</div>
            ${showDescription ? html`<div class="description">${day.description}</div>` : nothing}
          </div>
          ${c.show_fasting_icons && day.fasting.kind !== "none"
            ? html`<ha-icon
                class="fasting"
                title=${day.fasting.text ?? ""}
                .icon=${day.fasting.kind === "fish"
                  ? c.fish_icon || DEFAULT_CONFIG.fish_icon
                  : c.fasting_icon || DEFAULT_CONFIG.fasting_icon}
              ></ha-icon>`
            : nothing}
        </div>
      `;
    })}</div>`;
  }
}

if (!customElements.get("orthodox-calendar-card")) {
  customElements.define("orthodox-calendar-card", OrthodoxCalendarCard);
}

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "orthodox-calendar-card")) {
  window.customCards.push({
    type: "orthodox-calendar-card",
    name: "Orthodox Calendar Card",
    description: "Calendar Ortodox: daily saints with feasts and Sundays highlighted.",
    preview: true,
  });
}
