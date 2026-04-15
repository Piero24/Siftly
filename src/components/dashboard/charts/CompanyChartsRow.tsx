/**
 * CompanyChartsRow — Bar charts for top companies (applications, rejections) and top cities.
 */
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { CompanyIcon } from '../CompanyIcon';

interface CompanyStat {
  name: string;
  count: number;
  logo?: string;
  website?: string;
  linkedin?: string;
}

interface CityStat {
  name: string;
  count: number;
}

interface CompanyChartsRowProps {
  topApps: CompanyStat[];
  topRejections: CompanyStat[];
  topCities: CityStat[];
  isDark: boolean;
  isMobile: boolean;
  useSoftIconBackground: boolean;
}

export const CompanyChartsRow: React.FC<CompanyChartsRowProps> = ({
  topApps,
  topRejections,
  topCities,
  isDark,
  isMobile,
  useSoftIconBackground,
}) => {
  const chartHeight = Math.max(isMobile ? 220 : 280, 1);

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    if (!payload?.value) return null;
    const stat =
      topApps.find((a) => a.name === payload.value) ||
      topRejections.find((a) => a.name === payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-90} y={-12} width={112} height={24}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CompanyIcon
                name={payload.value}
                logo={stat?.logo}
                website={stat?.website}
                linkedin={stat?.linkedin}
                size={20}
                useAverageBg={useSoftIconBackground}
              />
            </div>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'left',
                maxWidth: '84px',
              }}
            >
              {payload.value}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <section className="db-section">
      <div className="db-charts-row">
        <div className="db-chart-card glass-container">
          <h3 className="db-chart-title">Most Applications</h3>
          {topApps.length === 0 ? (
            <div className="db-empty-chart">
              <span className="db-empty-chart-text">No data available</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={topApps}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-strong)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={<CustomYAxisTick />}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {topApps.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        isDark
                          ? `rgba(90,200,250,${0.88 - i * 0.08})`
                          : `rgba(0,122,255,${0.9 - i * 0.09})`
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="db-chart-card glass-container">
          <h3 className="db-chart-title">Most Rejections</h3>
          {topRejections.length === 0 ? (
            <div className="db-empty-chart">
              <span className="db-empty-chart-text">No rejections yet 🎉</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={topRejections}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-strong)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={<CustomYAxisTick />}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {topRejections.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        isDark
                          ? `rgba(255,105,97,${0.92 - i * 0.08})`
                          : `rgba(255,59,48,${0.9 - i * 0.09})`
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="db-chart-card glass-container">
          <h3 className="db-chart-title">Top Cities</h3>
          {topCities.length === 0 ? (
            <div className="db-empty-chart">
              <span className="db-empty-chart-text">No city data available</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={topCities}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-strong)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--text-primary)' }}
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {topCities.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        isDark
                          ? `rgba(48,209,88,${0.9 - i * 0.08})`
                          : `rgba(52,199,89,${0.92 - i * 0.08})`
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};
