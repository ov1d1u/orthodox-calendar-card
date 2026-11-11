import { LitElement, html, nothing } from "lit";
import { localize, type StringKey } from "./localize";
import { DEFAULT_CONFIG, type HomeAssistant, type OrthodoxCalendarCardConfig } from "./types";

const SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "entity", required: true, selector: { entity: { domain: "calendar" } } },
  { name: "feasts_entity", selector: { entity: { domain: "calendar" } } },
  {
    name: "days_to_show",
    selector: { number: { min: 1, max: 60, mode: "box" } },
  },
  { name: "feast_color", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "feast_bold", selector: { boolean: {} } },
      { name: "show_description", selector: { boolean: {} } },
      { name: "highlight_today", selector: { boolean: {} } },
    ],
  },
];

export class OrthodoxCalendarCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: OrthodoxCalendarCardConfig;

  setConfig(config: OrthodoxCalendarCardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;
    const lang = this.hass.locale?.language ?? "en";
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ ...DEFAULT_CONFIG, ...this._config }}
        .schema=${SCHEMA}
        .computeLabel=${(s: { name: string }) => localize(s.name as StringKey, lang)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = { ...ev.detail.value } as Record<string, unknown>;
    // Keep YAML clean: drop values equal to defaults or empty.
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      if (config[key] === value) delete config[key];
    }
    if (!config.title) delete config.title;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (!customElements.get("orthodox-calendar-card-editor")) {
  customElements.define("orthodox-calendar-card-editor", OrthodoxCalendarCardEditor);
}
