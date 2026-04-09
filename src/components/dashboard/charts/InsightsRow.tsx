/**
 * InsightsRow — Funnel, response rate donut, and salary distribution charts.
 */
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Cell, LabelList, PieChart, Pie,
} from 'recharts';
import { FEATURES } from '../../../config/features';

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

interface ResponseRate {
  responded: number;
  noResponse: number;
  pending: number;
}

interface SalaryBucket {
  range: string;
  count: number;
}

interface InsightsRowProps {
  funnel: FunnelStage[];
  responseRate: ResponseRate;
  salaryDist: SalaryBucket[];
  isDark: boolean;
  isMobile: boolean;
}

export const InsightsRow: React.FC<InsightsRowProps> = ({
  funnel, responseRate, salaryDist, isDark, isMobile,
}) => {
  const donutHeight = isMobile ? 180 : 200;
  const minSalaryChartHeight = Math.max(isMobile ? 220 : 280, 1);

  const totalResponses = responseRate.responded + responseRate.noResponse + responseRate.pending;
  const totalForRate = totalResponses || 1;
  const responseData = [
    { name: 'Responded', value: responseRate.responded, color: '#34C759' },
    { name: 'No Response', value: responseRate.noResponse, color: '#8E8E93' },
    { name: 'Pending', value: responseRate.pending, color: '#007AFF' },
  ].filter(d => d.value > 0);

  return (
    <section className="db-section">
      <div className="db-charts-row">
        {/* Status Funnel */}
        {FEATURES.dashboard.funnel && (
          <div className="db-chart-card db-chart-card-funnel glass-container">
            <h3 className="db-chart-title">Application Funnel</h3>
            {funnel.every(s => s.count === 0) ? (
              <div className="db-empty-chart">
                <span className="db-empty-chart-text">No funnel data</span>
              </div>
            ) : (
              <div className="db-funnel">
                {funnel.map((stage) => (
                  <div key={stage.stage} className="db-funnel-stage">
                    <div className="db-funnel-bar-wrapper">
                      <div
                        className="db-funnel-bar"
                        style={{
                          width: `${Math.max(stage.percentage, 8)}%`,
                          backgroundColor: stage.color,
                        }}
                      >
                        <span className="db-funnel-count">{stage.count}</span>
                      </div>
                    </div>
                    <span className="db-funnel-label">{stage.stage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Response Rate Donut */}
        {FEATURES.dashboard.responseRate && (
          <div className="db-chart-card db-chart-card-response glass-container">
            <h3 className="db-chart-title">Response Rate</h3>
            {totalResponses === 0 ? (
              <div className="db-empty-chart">
                <span className="db-empty-chart-text">No response data</span>
              </div>
            ) : (
              <div className="db-donut-block">
                <div className="db-donut-chart-area" style={{ minHeight: donutHeight }}>
                  <div className="db-donut-chart-shell" style={{ height: donutHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={responseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 50 : 60}
                          outerRadius={isMobile ? 80 : 90}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {responseData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="db-donut-center" style={{ height: donutHeight }}>
                      <span className="db-donut-value" style={{ fontSize: isMobile ? '22px' : '28px' }}>
                        {Math.round((responseRate.responded / totalForRate) * 100)}%
                      </span>
                      <span className="db-donut-label">Responded</span>
                    </div>
                  </div>
                </div>
                <div className="db-donut-legend">
                  {responseData.map((entry, i) => (
                    <div key={i} className="db-donut-legend-item">
                      <div className="db-continent-dot" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}: <strong>{entry.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Salary Distribution */}
        {FEATURES.dashboard.salaryDist && (
          <div className="db-chart-card db-chart-card-salary glass-container">
            <h3 className="db-chart-title">Salary Distribution</h3>
            {salaryDist.length === 0 ? (
              <div className="db-empty-chart">
                <span className="db-empty-chart-text">No salary data</span>
              </div>
            ) : (
              <div className="db-salary-chart-area" style={{ minHeight: minSalaryChartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryDist} margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" horizontal={false} />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
                      {salaryDist.map((_, i) => (
                        <Cell key={i} fill={isDark ? `rgba(175,82,222,${0.9 - i * 0.1})` : `rgba(175,82,222,${0.85 - i * 0.1})`} />
                      ))}
                      <LabelList dataKey="count" position="top" style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
