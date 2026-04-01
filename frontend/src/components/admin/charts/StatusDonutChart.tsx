import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

//  We define the shape of the data that the chart receives
interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

interface StatusDonutChartProps {
  data: ChartDataPoint[];
  height?: number | string;
  // We type the event: Recharts typically returns the data object on click
  onPieClick?: (data: ChartDataPoint) => void; 
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ 
  data, 
  height = 380,
  onPieClick 
}) => {
  if (!data || data.length === 0) return null;

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
            // We pass the clicked slice's data to the parent handler
            onClick={(entry) => onPieClick?.(entry.payload)} 
            style={{ cursor: onPieClick ? 'pointer' : 'default', outline: 'none' }}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
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