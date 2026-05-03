import { useTheme } from './useTheme';

/**
 * Returns Recharts-compatible axis/grid colors based on the current theme.
 * Centralises the two values that were duplicated in every chart component.
 *
 * Usage:
 *   const { labelColor, gridColor } = useChartColors();
 */
export const useChartColors = () => {
  const { isDark } = useTheme();
  return {
    labelColor: isDark ? '#a7b6c2' : '#5c7080',
    gridColor:  isDark ? '#394b59' : '#dbe3e8',
    cursorFill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };
};
