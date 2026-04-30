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
  pending:  get('--status-pending'),   // #D9822B
  progress: get('--status-progress'),  // #2B95D9
  done:     get('--status-done'),      // #0F9960
} as const;
