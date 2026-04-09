/**
 * DashboardCard - Dashboard defaults and counter behavior.
 */
import React from 'react';
import { LayoutIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';
import { OVERVIEW_SCOPE_OPTIONS } from '../../constants/dashboard';

export const DashboardCard: React.FC = () => {
  const { defaultTimeRange, setDefaultTimeRange, defaultOverviewScope, setDefaultOverviewScope } =
    useSettings();

  return (
    <SettingsCard icon={<LayoutIcon size={22} />} title="Dashboard">
      <div className="setting-item">
        <label>Default Overview Counter</label>
        <select
          value={defaultOverviewScope}
          onChange={(e) => setDefaultOverviewScope(e.target.value as 'total' | 'current')}
          className="apple-select"
        >
          {OVERVIEW_SCOPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-item">
        <label>Default Time Range</label>
        <select
          value={defaultTimeRange}
          onChange={(e) =>
            setDefaultTimeRange(e.target.value as 'today' | 'total' | '7d' | '30d' | '1y')
          }
          className="apple-select"
        >
          <option value="today">Today</option>
          <option value="7d">Last Week</option>
          <option value="30d">Last Month</option>
          <option value="1y">Last Year</option>
          <option value="total">All Time</option>
        </select>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
        Total mode shows cumulative pipeline counters and hides the Total card. Current mode shows
        direct status counters and includes the Total card. The selected time range always applies
        to both modes.
      </p>
    </SettingsCard>
  );
};