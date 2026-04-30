import React from 'react';
import { PieChart, Pie, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TaskStatus } from '../../../types/task';

export interface ChartDataPoint {
  name: string;
  value: number;
  status?: TaskStatus; // Optional: only needed when onPieClick is used (DashboardView)
  fill: string;
}

interface StatusDonutChartProps {
  data: ChartDataPoint[];
  onPieClick?: (data: ChartDataPoint) => void;
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data, onPieClick }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          innerRadius="65%"
          outerRadius="85%"
          paddingAngle={10}
          dataKey="value"
          stroke="none"
          // Type-narrow the Recharts synthetic event before forwarding to parent
          onClick={(data: unknown) => {
            const entry = data as { payload: ChartDataPoint };
            if (entry?.payload) {
              onPieClick?.(entry.payload);
            }
          }}
          style={{ cursor: 'pointer', outline: 'none' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            color: 'var(--text-main)'
          }}
        />
        <Legend verticalAlign="bottom" height={6} />
      </PieChart>
    </ResponsiveContainer>
  );
};