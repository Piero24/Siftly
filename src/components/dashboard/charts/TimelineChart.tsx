/**
 * TimelineChart — Application timeline area chart.
 */
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

interface TimelineBucket {
  week: string;
  count: number;
}

interface TimelineChartProps {
  data: TimelineBucket[];
  isDark: boolean;
  isMobile: boolean;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data, isDark, isMobile }) => {
  const height = Math.max(isMobile ? 200 : 260, 1);

  return (
    <section className="db-section">
      <div className="db-chart-card glass-container">
        <h3 className="db-chart-title">Application Timeline</h3>
        {data.every(b => b.count === 0) ? (
          <div className="db-empty-chart">
            <span className="db-empty-chart-text">No timeline data yet</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? '#5AC8FA' : '#007AFF'} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={isDark ? '#5AC8FA' : '#007AFF'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={isDark ? '#5AC8FA' : '#007AFF'}
                strokeWidth={2.5}
                fill="url(#timelineGrad)"
                dot={{ r: 3, fill: isDark ? '#5AC8FA' : '#007AFF', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--surface-solid)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};
