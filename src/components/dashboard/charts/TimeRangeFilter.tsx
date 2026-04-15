/**
 * TimeRangeFilter — Tab-style time range selector for the dashboard.
 */
import React from 'react';
import {
  OVERVIEW_SCOPE_OPTIONS,
  OverviewScope,
  TIME_RANGE_OPTIONS,
} from '../../../constants/dashboard';

type TimeRange = 'today' | 'total' | '7d' | '30d' | '1y';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  overviewScope: OverviewScope;
  onOverviewScopeChange: (value: OverviewScope) => void;
}

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  value,
  onChange,
  overviewScope,
  onOverviewScopeChange,
}) => (
  <div className="db-time-filter-row">
    <div className="db-time-filter-shell">
      <div
        className="db-scope-nav"
        role="tablist"
        aria-label="Dashboard overview counter scope selector"
      >
        {OVERVIEW_SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`db-time-scope-btn ${overviewScope === opt.value ? 'active' : ''}`}
            onClick={() => onOverviewScopeChange(opt.value)}
            role="tab"
            aria-selected={overviewScope === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="db-time-spacer" aria-hidden="true" />

      <div className="db-time-nav" role="tablist" aria-label="Dashboard time range selector">
        {TIME_RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`db-time-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            role="tab"
            aria-selected={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <select
        className="db-time-select-mobile apple-select"
        aria-label="Dashboard time range selector"
        value={value}
        onChange={(e) => onChange(e.target.value as TimeRange)}
      >
        {TIME_RANGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);
