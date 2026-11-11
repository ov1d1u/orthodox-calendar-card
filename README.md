# Orthodox Calendar Card

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/ov1d1u/orthodox-calendar-card)](https://github.com/ov1d1u/orthodox-calendar-card/releases/latest)
[![Validate](https://github.com/ov1d1u/orthodox-calendar-card/actions/workflows/validate.yml/badge.svg)](https://github.com/ov1d1u/orthodox-calendar-card/actions/workflows/validate.yml)

A Home Assistant Lovelace card for the
[Calendar Ortodox](https://github.com/ov1d1u/homeassistant-calendar-crestin-ortodox) integration.
Styled after the event list of
[atomic-calendar-revive](https://github.com/totaldebug/atomic-calendar-revive).

- Combines the daily calendar and the feasts calendar into one list, one row per day.
- When the feasts calendar has an event on a day, it replaces that day's regular entry.
- Feast days and Sundays are shown in a configurable color, optionally in bold.
- Fasting days are marked with an icon (fish icon on fish days).
- Click a day to show its description (fasting rules, readings, …).
- Visual editor, Romanian and English labels.

## Installation

### HACS

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ov1d1u&repository=orthodox-calendar-card&category=plugin)

1. HACS → ⋮ → **Custom repositories** → add `https://github.com/ov1d1u/orthodox-calendar-card`, type **Dashboard**.
2. Install **Orthodox Calendar Card** and reload the browser.

### Manual

1. Copy `dist/orthodox-calendar-card.js` to `/config/www/`.
2. Settings → Dashboards → ⋮ → **Resources** → add `/local/orthodox-calendar-card.js` as a **JavaScript module**.

## Configuration

```yaml
type: custom:orthodox-calendar-card
title: Calendar Ortodox
entity: calendar.calendar_ortodox
feasts_entity: calendar.calendar_ortodox_sarbatori
days_to_show: 7
```

| Option | Default | Description |
| --- | --- | --- |
| `entity` | `calendar.calendar_ortodox` | Calendar with an event for every day. |
| `feasts_entity` | `calendar.calendar_ortodox_sarbatori` | Feasts calendar; its events replace the regular day. |
| `title` | – | Card title. |
| `days_to_show` | `7` | Number of days shown, starting with today. |
| `show_description` | `false` | Always show descriptions (otherwise click a day to expand it). |
| `feast_color` | `var(--red-color, #f44336)` | Color of feast days and Sundays. Any CSS color. |
| `feast_bold` | `true` | Render feast days and Sundays in bold. |
| `highlight_today` | `true` | Mark today's row. |
| `show_fasting_icons` | `true` | Show a fasting icon: <code>mdi:fish</code> on fish days (“Dezlegare la pește”), <code>mdi:food-drumstick-off</code> on other fasting days. |

> Fasting icons are read from the event description, so the integration option
> **“Include informații despre post”** must be enabled.

## Development

```bash
npm install
npm test          # unit tests (merge logic)
npm run build     # -> dist/orthodox-calendar-card.js
python3 -m http.server   # then open http://localhost:8000/demo/ for a mock preview
```
