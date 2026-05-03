/**
 * Chart color tokens — reads from CSS design tokens at runtime.
 * Single source of truth: src/styles/variables.css
 *
 * Recharts requires JS string values (not CSS var() references),
 * so we resolve them once at module load time from the root element.
 */
const get = (v: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export const CHART_COLORS = {
  get pending()  { return get('--status-pending');  },  // #D9822B
  get progress() { return get('--status-progress'); },  // #2B95D9
  get done()     { return get('--status-done');     },  // #0F9960
};
