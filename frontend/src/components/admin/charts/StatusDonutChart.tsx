import React from 'react';
import { PieChart, Pie, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * Shared interface for chart data across the app. 
 * We use 'fill' to leverage Recharts' modern data mapping and avoid deprecated 'Cell'.
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface StatusDonutChartProps {
  data: ChartDataPoint[];
  height?: number | string;
  onPieClick?: (data: ChartDataPoint) => void;
}

/**
 * StatusDonutChart - Reusable and future-proof donut chart.
 */
export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ 
  data, 
  height = 380,
  onPieClick 
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={105} outerRadius={130}
            paddingAngle={5} dataKey="value"
            label={(entry) => `${entry.name}: ${entry.value}`}
            // Safe click handler passing the payload
            onClick={(entry) => onPieClick?.(entry.payload)} 
            style={{ cursor: onPieClick ? 'pointer' : 'default', outline: 'none' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              color: 'var(--text-main)'
            }} 
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};