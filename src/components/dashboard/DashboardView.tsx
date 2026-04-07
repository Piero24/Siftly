/**
 * DashboardView — Analytics overview of all job applications.
 *
 * Composed from focused chart section components:
 *   1. TimeRangeFilter
 *   2. KpiStrip
 *   3. WorldMapSection (map + continent/work-type/CV/employment breakdowns)
 *   4. CompanyChartsRow (top companies, rejections, cities)
 *   5. TimelineChart
 *   6. InsightsRow (funnel, response rate, salary distribution)
 */
import React, { useEffect, useMemo, useState } from 'react';
import 'flag-icons/css/flag-icons.min.css';

import { JobApplication } from '../../types/job';
import { useSettings } from '../../context/SettingsContext';
import { useWindowSize } from '../../hooks/useWindowSize';
import { FEATURES } from '../../config/features';
import { OverviewScope } from '../../constants/dashboard';
import {
  getOverviewStatusCounts,
  getContinentStats,
  getCountryStats,
  getTopCompaniesByApplications,
  getTopCompaniesByRejections,
  getTopCitiesByApplications,
  getWorkTypeStats,
  getCvStats,
  getEmploymentTypeStats,
  getReferralStats,
  getApplicationTimeline,
  getStatusFunnel,
  getResponseRate,
  getSalaryDistribution,
} from '../../lib/analytics';

import { TimeRangeFilter } from './charts/TimeRangeFilter';
import { KpiStrip } from './charts/KpiStrip';
import { WorldMapSection } from './charts/WorldMapSection';
import { CompanyChartsRow } from './charts/CompanyChartsRow';
import { TimelineChart } from './charts/TimelineChart';
import { InsightsRow } from './charts/InsightsRow';

interface DashboardViewProps {
  applications: JobApplication[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ applications }) => {
  const {
    cvProfiles,
    defaultTimeRange,
    defaultOverviewScope,
    resolvedTheme,
    useSoftIconBackground,
  } = useSettings();
  const { width: windowWidth, isMobile } = useWindowSize();
  const [timeRange, setTimeRange] = useState<'today' | 'total' | '7d' | '30d' | '1y'>(
    defaultTimeRange
  );
  const [overviewScope, setOverviewScope] = useState<OverviewScope>(defaultOverviewScope);
  const isDark = resolvedTheme === 'dark';

  // Keep dashboard selectors connected to user-configured defaults from Settings.
  useEffect(() => {
    setTimeRange(defaultTimeRange);
  }, [defaultTimeRange]);

  useEffect(() => {
    setOverviewScope(defaultOverviewScope);
  }, [defaultOverviewScope]);

  // ── Time-filtered applications ──
  const filteredApplications = useMemo(() => {
    if (timeRange === 'total') return applications;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return applications.filter((app) => {
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

  // ── Analytics data ──
  const stats = useMemo(
    () => getOverviewStatusCounts(filteredApplications, overviewScope),
    [filteredApplications, overviewScope]
  );
  const continents = useMemo(() => getContinentStats(filteredApplications), [filteredApplications]);
  const workTypes = useMemo(() => getWorkTypeStats(filteredApplications), [filteredApplications]);
  const cvStats = useMemo(
    () => getCvStats(filteredApplications, cvProfiles),
    [filteredApplications, cvProfiles]
  );
  const employmentTypes = useMemo(
    () => getEmploymentTypeStats(filteredApplications),
    [filteredApplications]
  );
  const referralStats = useMemo(
    () => getReferralStats(filteredApplications),
    [filteredApplications]
  );
  const countryMap = useMemo(() => {
    const m = new Map<string, number>();
    getCountryStats(filteredApplications).forEach(({ code, count }) =>
      m.set(code.toUpperCase(), count)
    );
    return m;
  }, [filteredApplications]);
  const topApps = useMemo(
    () => getTopCompaniesByApplications(filteredApplications, 8),
    [filteredApplications]
  );
  const topRej = useMemo(
    () => getTopCompaniesByRejections(filteredApplications, 8),
    [filteredApplications]
  );
  const topCities = useMemo(
    () => getTopCitiesByApplications(filteredApplications, 8),
    [filteredApplications]
  );
  const timeline = useMemo(
    () => getApplicationTimeline(filteredApplications, 12),
    [filteredApplications]
  );
  const funnel = useMemo(() => getStatusFunnel(filteredApplications), [filteredApplications]);
  const responseRate = useMemo(() => getResponseRate(filteredApplications), [filteredApplications]);
  const salaryDist = useMemo(
    () => getSalaryDistribution(filteredApplications),
    [filteredApplications]
  );

  const showMiddleRow =
    FEATURES.dashboard.worldMap ||
    FEATURES.dashboard.workTypes ||
    FEATURES.dashboard.cvProfiles ||
    FEATURES.dashboard.employmentTypes;
  const showInsights =
    FEATURES.dashboard.funnel || FEATURES.dashboard.responseRate || FEATURES.dashboard.salaryDist;

  return (
    <div className="db-root">
      <TimeRangeFilter
        value={timeRange}
        onChange={setTimeRange}
        overviewScope={overviewScope}
        onOverviewScopeChange={setOverviewScope}
      />

      {FEATURES.dashboard.kpiStrip && <KpiStrip stats={stats} overviewScope={overviewScope} />}

      {showMiddleRow && (
        <WorldMapSection
          countryMap={countryMap}
          continentStats={continents}
          workTypes={workTypes}
          cvStats={cvStats}
          employmentTypes={employmentTypes}
          referralStats={referralStats}
          isDark={isDark}
          windowWidth={windowWidth}
        />
      )}

      {FEATURES.dashboard.companyCharts && (
        <CompanyChartsRow
          topApps={topApps}
          topRejections={topRej}
          topCities={topCities}
          isDark={isDark}
          isMobile={isMobile}
          useSoftIconBackground={useSoftIconBackground}
        />
      )}

      {FEATURES.dashboard.timeline && (
        <TimelineChart data={timeline} isDark={isDark} isMobile={isMobile} />
      )}

      {showInsights && (
        <InsightsRow
          funnel={funnel}
          responseRate={responseRate}
          salaryDist={salaryDist}
          isDark={isDark}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};
