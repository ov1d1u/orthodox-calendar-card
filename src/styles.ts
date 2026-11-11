import { css } from "lit";

export const cardStyles = css`
  :host {
    --occ-feast-color: var(--red-color, #f44336);
    --occ-feast-weight: 700;
  }
  ha-card {
    padding: 8px 16px 12px;
  }
  .header {
    font-size: var(--ha-card-header-font-size, 24px);
    color: var(--ha-card-header-color, var(--primary-text-color));
    padding: 8px 0 4px;
  }
  .status {
    display: flex;
    justify-content: center;
    padding: 16px;
    color: var(--secondary-text-color);
  }
  .day {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 6px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-radius: 4px;
  }
  .day:first-child {
    border-top: none;
  }
  .day.clickable {
    cursor: pointer;
  }
  .day.today {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
    box-shadow: inset 3px 0 0 var(--primary-color);
  }
  .date {
    flex: 0 0 44px;
    text-align: center;
    line-height: 1.1;
    color: var(--primary-text-color);
  }
  .date .num {
    font-size: 1.6em;
    font-weight: 300;
  }
  .date .wday,
  .date .month {
    font-size: 0.8em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .body {
    flex: 1;
    min-width: 0;
    padding-top: 4px;
  }
  .summary {
    color: var(--primary-text-color);
    line-height: 1.35;
  }
  .description {
    margin-top: 4px;
    font-size: 0.85em;
    color: var(--secondary-text-color);
    white-space: pre-line;
  }
  .fasting {
    flex: 0 0 auto;
    align-self: center;
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
  }
  .highlighted .date,
  .highlighted .date .wday,
  .highlighted .date .month,
  .highlighted .summary {
    color: var(--occ-feast-color);
  }
  .highlighted.bold .date .num,
  .highlighted.bold .summary {
    font-weight: var(--occ-feast-weight);
  }
`;
