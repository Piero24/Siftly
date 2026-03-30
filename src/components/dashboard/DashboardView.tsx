/**
 * DashboardView — Analytics overview of all job applications.
 *
 * Sections:
 *   1. KPI strip  — total + status counters
 *   2. Continent breakdown
 *   3. World map  — choropleth via react-simple-maps
 *   4. Bar charts — top companies by applications / by rejections
 */
import React, { useMemo, useState, useEffect } from 'react';
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from 'react-simple-maps';
import { LINKS } from '../../config/links';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Cell, LabelList,
  AreaChart, Area, PieChart, Pie,
} from 'recharts';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import { JobApplication } from '../../types/job';
import {
  CircleIcon, SendIcon, UsersIcon, GiftIcon, CheckCircleIcon, XCircleIcon, BriefcaseIcon, ClockIcon
} from '../common/Icons';
import {
  getStatusCounts,
  getContinentStats,
  getCountryStats,
  getTopCompaniesByApplications,
  getTopCompaniesByRejections,
  getTopCitiesByApplications,
  getWorkTypeStats,
  getCvStats,
  getEmploymentTypeStats,
  getApplicationTimeline,
  getStatusFunnel,
  getResponseRate,
  getSalaryDistribution,
} from '../../lib/analytics';
import { CompanyIcon } from './CompanyIcon';
import { WorkTypeBadge } from './WorkTypeBadge';
import { useSettings } from '../../context/SettingsContext';
import { FEATURES } from '../../config/features';

// Natural Earth 110m topojson hosted on jsDelivr (no bundling needed)
const GEO_URL = LINKS.geoData;

/**
 * Numeric ISO 3166-1 (as used in Natural Earth) → ISO alpha-2
 * Only countries likely to appear in a job tracker.
 */
const A3_TO_A2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '024': 'AO', '032': 'AR',
  '036': 'AU', '040': 'AT', '048': 'BH', '050': 'BD', '056': 'BE',
  '068': 'BO', '076': 'BR', '100': 'BG', '116': 'KH', '124': 'CA',
  '144': 'LK', '152': 'CL', '156': 'CN', '170': 'CO', '188': 'CR',
  '191': 'HR', '203': 'CZ', '208': 'DK', '214': 'DO', '218': 'EC',
  '818': 'EG', '222': 'SV', '233': 'EE', '246': 'FI', '250': 'FR',
  '268': 'GE', '276': 'DE', '288': 'GH', '300': 'GR', '320': 'GT',
  '340': 'HN', '348': 'HU', '356': 'IN', '360': 'ID', '364': 'IR',
  '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '388': 'JM',
  '392': 'JP', '400': 'JO', '398': 'KZ', '404': 'KE', '410': 'KR',
  '414': 'KW', '422': 'LB', '440': 'LT', '442': 'LU', '458': 'MY',
  '484': 'MX', '504': 'MA', '516': 'NA', '528': 'NL', '554': 'NZ',
  '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA', '608': 'PH',
  '616': 'PL', '620': 'PT', '630': 'PR', '604': 'PE', '634': 'QA',
  '642': 'RO', '643': 'RU', '682': 'SA', '688': 'RS', '703': 'SK',
  '705': 'SI', '710': 'ZA', '724': 'ES', '752': 'SE', '756': 'CH',
  '764': 'TH', '780': 'TT', '788': 'TN', '792': 'TR', '804': 'UA',
  '784': 'AE', '826': 'GB', '840': 'US', '858': 'UY', '862': 'VE',
  '704': 'VN',
};


const STATUS_CONFIG = [
  { key: 'total', label: 'Total', color: '#007AFF', bg: 'rgba(0,122,255,0.06)', Icon: BriefcaseIcon },
  { key: 'applied', label: 'Applied', color: '#007AFF', bg: 'rgba(0,122,255,0.06)', Icon: SendIcon },
  { key: 'interviewing', label: 'Interviewing', color: '#34C759', bg: 'rgba(52,199,89,0.07)', Icon: UsersIcon },
  { key: 'offer', label: 'Offers', color: '#AF52DE', bg: 'rgba(175,82,222,0.07)', Icon: GiftIcon },
  { key: 'accepted', label: 'Accepted', color: '#30D158', bg: 'rgba(48,209,88,0.07)', Icon: CheckCircleIcon },
  { key: 'rejected', label: 'Rejected', color: '#FF3B30', bg: 'rgba(255,59,48,0.07)', Icon: XCircleIcon },
  { key: 'pending', label: 'Pending', color: '#8E8E93', bg: 'rgba(142,142,147,0.07)', Icon: CircleIcon },
  { key: 'no-response', label: 'No Response', color: '#636366', bg: 'rgba(142,142,147,0.15)', Icon: ClockIcon },
];

const CONTINENT_COLOR: Record<string, string> = {
  'North America': '#007AFF',
  'South America': '#30D158',
  'Europe': '#AF52DE',
  'Africa': '#FF9500',
  'Asia': '#FF3B30',
  'Oceania': '#5AC8FA',
  'Antarctica': '#C7C7CC',
};

const CONTINENT_ORDER = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Oceania',
] as const;

const EMPLOYMENT_LABEL: Record<'permanent' | 'intern' | 'fixed-term', string> = {
  permanent: 'Permanent',
  intern: 'Intern',
  'fixed-term': 'Fixed Term',
};

const EMPLOYMENT_COLOR: Record<'permanent' | 'intern' | 'fixed-term', string> = {
  permanent: '#007AFF',
  intern: '#AF52DE',
  'fixed-term': '#5AC8FA',
};

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="db-section-header">
    <h2 className="db-section-title">{title}</h2>
    {subtitle && <p className="db-section-subtitle">{subtitle}</p>}
  </div>
);

interface DashboardViewProps {
  applications: JobApplication[];
}

const TIME_RANGE_OPTIONS: Array<{ value: 'today' | 'total' | '7d' | '30d' | '1y'; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'total', label: 'Total' },
  { value: '7d', label: 'Last Week' },
  { value: '30d', label: 'Last Month' },
  { value: '1y', label: 'Last Year' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  applications,
}) => {
  const { cvProfiles, defaultTimeRange, resolvedTheme } = useSettings();
  const [tooltipContent, setTooltipContent] = useState('');
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'total' | '7d' | '30d' | '1y'>(defaultTimeRange);
  const isDark = resolvedTheme === 'dark';

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;
  const chartHeight = isMobile ? 220 : 280;
  const timelineHeight = isMobile ? 200 : 260;
  const mapHeight = isMobile ? (isSmallMobile ? 300 : 380) : 470;

  const filteredApplications = useMemo(() => {
    if (timeRange === 'total') return applications;

    const now = new Date();
    // Normalize `now` to start of day for 'today' comparison if we just want today's apps.
    // Or just check diffDays <= 0 or diffDays < 1. Let's use start of day logic:
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return applications.filter(app => {
      if (!app.date) return false;
      const appDate = new Date(app.date);

      if (timeRange === 'today') {
        const appDay = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
        return appDay.getTime() === today.getTime();
      }

      const diffTime = Math.abs(now.getTime() - appDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeRange === '7d') return diffDays <= 7;
      if (timeRange === '30d') return diffDays <= 30;
      if (timeRange === '1y') return diffDays <= 365;
      return true;
    });
  }, [applications, timeRange]);

  const activeStats = useMemo(() => getStatusCounts(filteredApplications), [filteredApplications]);
  const continents = useMemo(() => getContinentStats(filteredApplications), [filteredApplications]);
  const allContinentStats = useMemo(() => {
    const counts = new Map(continents.map((stat) => [stat.name, stat.count]));
    return CONTINENT_ORDER.map((name) => ({
      name,
      count: counts.get(name as any) ?? 0,
    }));
  }, [continents]);
  const workTypes = useMemo(() => getWorkTypeStats(filteredApplications), [filteredApplications]);
  const cvStats = useMemo(() => getCvStats(filteredApplications, cvProfiles), [filteredApplications, cvProfiles]);
  const employmentTypes = useMemo(() => getEmploymentTypeStats(filteredApplications), [filteredApplications]);
  const countryMap = useMemo(() => {
    const m = new Map<string, number>();
    getCountryStats(filteredApplications).forEach(({ code, count }) => m.set(code.toUpperCase(), count));
    return m;
  }, [filteredApplications]);
  const topApps = useMemo(() => getTopCompaniesByApplications(filteredApplications, 8), [filteredApplications]);
  const topRej = useMemo(() => getTopCompaniesByRejections(filteredApplications, 8), [filteredApplications]);
  const topCities = useMemo(() => getTopCitiesByApplications(filteredApplications, 8), [filteredApplications]);

  // New analytics
  const timeline = useMemo(() => getApplicationTimeline(filteredApplications, 12), [filteredApplications]);
  const funnel = useMemo(() => getStatusFunnel(filteredApplications), [filteredApplications]);
  const responseRate = useMemo(() => getResponseRate(filteredApplications), [filteredApplications]);
  const salaryDist = useMemo(() => getSalaryDistribution(filteredApplications), [filteredApplications]);
  const responseData = useMemo(() => [
    { name: 'Responded', value: responseRate.responded, color: '#34C759' },
    { name: 'No Response', value: responseRate.noResponse, color: '#8E8E93' },
    { name: 'Pending', value: responseRate.pending, color: '#007AFF' },
  ].filter(d => d.value > 0), [responseRate]);
  const totalForRate = responseRate.responded + responseRate.noResponse + responseRate.pending || 1;

  const CustomYAxisTick = ({ x, y, payload }: any) => {
    if (!payload?.value) return null;
    const stat = topApps.find((a: any) => a.name === payload.value) || topRej.find((a: any) => a.name === payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-90} y={-12} width={112} height={24}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
            <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CompanyIcon name={payload.value} logo={stat?.logo} website={stat?.website} linkedin={stat?.linkedin} size={20} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', maxWidth: '84px' }}>
              {payload.value}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  const maxCount = Math.max(...[...countryMap.values()], 1);
  const heatOpacity = (code: string) => {
    const n = countryMap.get(code) ?? 0;
    return n === 0 ? 0 : 0.15 + (n / maxCount) * 0.75;
  };

  return (
    <div className="db-root">

      {/* ── Dashboard Time Filter ── */}
      <div className="db-time-filter-row">
        <div className="db-time-filter-shell">
          <div className="db-time-nav" role="tablist" aria-label="Dashboard time range selector">
            {TIME_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`db-time-btn ${timeRange === opt.value ? 'active' : ''}`}
                onClick={() => setTimeRange(opt.value)}
                role="tab"
                aria-selected={timeRange === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 1. KPI Overview Card ── */}
      {FEATURES.dashboard.kpiStrip && (
        <section className="db-section">
          <div className="db-chart-card db-overview-card glass-container" style={{ padding: '12px 20px' }}>
            <div className="db-kpi-grid" style={{ padding: 0, justifyContent: 'center', gap: '12px', overflowX: 'auto', flexWrap: 'nowrap' }}>
              {STATUS_CONFIG.map(({ key, label, color, Icon }) => (
                <div key={key} className="db-kpi-item">
                  <div className="db-kpi-item-content">
                    <Icon size={12} color={color} />
                    <span className="db-kpi-label">{label}</span>
                  </div>
                  <span className="db-kpi-number" style={{ color, fontSize: '18px' }}>
                    {(activeStats as unknown as Record<string, number>)[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 2. World Map & Continent Breakdown ── */}
      {(FEATURES.dashboard.worldMap || FEATURES.dashboard.workTypes || FEATURES.dashboard.cvProfiles || FEATURES.dashboard.employmentTypes) && (
        <section className="db-section">
          <div className="db-middle-row">
            {FEATURES.dashboard.worldMap && (
              <div className="db-map-column">
                {/* ── World Map ── */}
                <div className="db-map-card glass-container" onMouseLeave={() => setIsMapInteractive(false)}>
                  <div className="db-map-interactive-area">
                    {!isMapInteractive && (
                      <div
                        className="db-map-overlay"
                        onClick={() => setIsMapInteractive(true)}
                      />
                    )}
                    <div className="db-map-viewport" style={{ height: mapHeight, minHeight: mapHeight }}>
                      <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: isMobile ? 120 : 186, center: [10, 20] }}
                        style={{ width: '100%', height: '100%', pointerEvents: isMapInteractive ? 'auto' : 'none', outline: 'none' }}
                      >
                        <ZoomableGroup zoom={1}>
                          <Geographies geography={GEO_URL}>
                            {(geoData: { geographies: Array<{ id: string; rsmKey: string; properties: { name: string } }> }) =>
                              geoData.geographies.map((geo) => {
                                const a2 = A3_TO_A2[geo.id] || '';
                                const count = countryMap.get(a2) || 0;
                                const opacity = heatOpacity(a2);
                                const neutralFill = isDark ? '#2a2d35' : '#EAEAEC';
                                const accentFill = isDark ? `rgba(90,200,250,${opacity})` : `rgba(0,122,255,${opacity})`;
                                const hoverFill = isDark ? '#5AC8FA' : '#007AFF';
                                const pressFill = isDark ? '#2f8fbf' : '#005bb5';
                                return (
                                  <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    data-tooltip-id="my-tooltip"
                                    onMouseEnter={() => {
                                      setTooltipContent(`${geo.properties.name}: ${count} application${count === 1 ? '' : 's'}`);
                                    }}
                                    onMouseLeave={() => {
                                      setTooltipContent('');
                                    }}
                                    style={{
                                      default: { fill: opacity > 0 ? accentFill : neutralFill, stroke: 'var(--border-subtle)', strokeWidth: 0.8, outline: 'none', transition: 'all 250ms' },
                                      hover: { fill: hoverFill, stroke: 'var(--border-strong)', strokeWidth: 0.8, outline: 'none', transition: 'all 250ms' },
                                      pressed: { fill: pressFill, stroke: 'var(--border-strong)', strokeWidth: 0.8, outline: 'none' }
                                    }}
                                  />
                                );
                              })
                            }
                          </Geographies>
                        </ZoomableGroup>
                      </ComposableMap>
                    </div>
                  </div>

                  <div className="db-map-continent-section">
                    <div className="db-continent-row db-continent-row-spaced">
                      {allContinentStats.map((stat) => (
                        <div key={stat.name} className="db-continent-pill" style={{ color: CONTINENT_COLOR[stat.name] || '#8E8E93' }}>
                          <div className="db-continent-dot" style={{ backgroundColor: CONTINENT_COLOR[stat.name] || '#8E8E93' }} />
                          <span className="db-continent-name">{stat.name}</span>
                          <span className="db-continent-count">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="db-breakdown-stack">
              {/* ── Work Type Breakdown ── */}
              {FEATURES.dashboard.workTypes && (
                <div className="db-chart-card glass-container">
                  {workTypes.length === 0 ? (
                    <div className="db-empty-chart">
                      <span className="db-empty-chart-text">No work types added yet</span>
                    </div>
                  ) : (
                    <div className="db-continent-row db-worktype-row db-pill-row-spaced">
                      {workTypes.map(stat => (
                        <div key={stat.name} className="db-continent-pill" style={{ color: 'var(--border-strong)' }}>
                          <WorkTypeBadge type={stat.name as any} />
                          <span className="db-continent-count" style={{ color: 'var(--text-primary)' }}>{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── CV Breakdown ── */}
              {FEATURES.dashboard.cvProfiles && (
                <div className="db-chart-card glass-container">
                  {cvStats.length === 0 ? (
                    <div className="db-empty-chart">
                      <span className="db-empty-chart-text">No CV profiles used yet</span>
                    </div>
                  ) : (
                    <div className="db-continent-row db-pill-row-spaced">
                      {cvStats.map((stat) => (
                        <div key={stat.id} className="db-continent-pill" style={{ color: stat.color }}>
                          <div className="db-continent-dot" style={{ backgroundColor: stat.color }} />
                          <span className="db-continent-name">{stat.name}</span>
                          <span className="db-continent-count">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Employment Type Breakdown ── */}
              {FEATURES.dashboard.employmentTypes && (
                <div className="db-chart-card glass-container">
                  {employmentTypes.every((stat) => stat.count === 0) ? (
                    <div className="db-empty-chart">
                      <span className="db-empty-chart-text">No applications added yet</span>
                    </div>
                  ) : (
                    <div className="db-continent-row db-pill-row-spaced">
                      {employmentTypes.map((stat) => (
                        <div key={stat.name} className="db-continent-pill" style={{ color: EMPLOYMENT_COLOR[stat.name] }}>
                          <div className="db-continent-dot" style={{ backgroundColor: EMPLOYMENT_COLOR[stat.name] }} />
                          <span className="db-continent-name">{EMPLOYMENT_LABEL[stat.name]}</span>
                          <span className="db-continent-count">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Company Charts ── */}
      {FEATURES.dashboard.companyCharts && (
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
                  <BarChart data={topApps} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={<CustomYAxisTick />} tickLine={false} axisLine={false} width={120} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                      {topApps.map((_, i) => (
                        <Cell key={i} fill={isDark ? `rgba(90,200,250,${0.88 - i * 0.08})` : `rgba(0,122,255,${0.9 - i * 0.09})`} />
                      ))}
                      <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="db-chart-card glass-container">
              <h3 className="db-chart-title">Most Rejections</h3>
              {topRej.length === 0 ? (
                <div className="db-empty-chart">
                  <span className="db-empty-chart-text">No rejections yet 🎉</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={topRej} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={<CustomYAxisTick />} tickLine={false} axisLine={false} width={120} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                      {topRej.map((_, i) => (
                        <Cell key={i} fill={isDark ? `rgba(255,105,97,${0.92 - i * 0.08})` : `rgba(255,59,48,${0.9 - i * 0.09})`} />
                      ))}
                      <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }} />
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
                  <BarChart data={topCities} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-primary)' }} tickLine={false} axisLine={false} width={96} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                      {topCities.map((_, i) => (
                        <Cell key={i} fill={isDark ? `rgba(48,209,88,${0.9 - i * 0.08})` : `rgba(52,199,89,${0.92 - i * 0.08})`} />
                      ))}
                      <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Application Timeline ── */}
      {FEATURES.dashboard.timeline && (
        <section className="db-section">
          <div className="db-chart-card glass-container">
            <h3 className="db-chart-title">Application Timeline</h3>
            {timeline.every(b => b.count === 0) ? (
              <div className="db-empty-chart">
                <span className="db-empty-chart-text">No timeline data yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={timelineHeight}>
                <AreaChart data={timeline} margin={{ top: 8, right: 24, bottom: 4, left: 0 }}>
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
      )}

      {/* ── 6. Insights Row: Funnel + Donut + Salary ── */}
      {(FEATURES.dashboard.funnel || FEATURES.dashboard.responseRate || FEATURES.dashboard.salaryDist) && (
        <section className="db-section">
          <div className="db-charts-row">
            {/* Status Funnel */}
            {FEATURES.dashboard.funnel && (
              <div className="db-chart-card glass-container">
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
              <div className="db-chart-card glass-container">
                <h3 className="db-chart-title">Response Rate</h3>
                {totalForRate === 0 ? (
                  <div className="db-empty-chart">
                    <span className="db-empty-chart-text">No response data</span>
                  </div>
                ) : (
                  <>
                    <div style={{ position: 'relative', height: isMobile ? 180 : 200 }}>
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
                      <div className="db-donut-center" style={{ height: isMobile ? 180 : 200 }}>
                        <span className="db-donut-value" style={{ fontSize: isMobile ? '22px' : '28px' }}>
                          {Math.round((responseRate.responded / totalForRate) * 100)}%
                        </span>
                        <span className="db-donut-label">Responded</span>
                      </div>
                    </div>
                    <div className="db-donut-legend" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                      {responseData.map((entry, i) => (
                        <div key={i} className="db-donut-legend-item">
                          <div className="db-continent-dot" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}: <strong>{entry.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Salary Distribution */}
            {FEATURES.dashboard.salaryDist && (
              <div className="db-chart-card glass-container">
                <h3 className="db-chart-title">Salary Distribution</h3>
                {salaryDist.length === 0 ? (
                  <div className="db-empty-chart">
                    <span className="db-empty-chart-text">No salary data</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={chartHeight}>
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
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <Tooltip id="my-tooltip">
        {tooltipContent}
      </Tooltip>
    </div>
  );
};
