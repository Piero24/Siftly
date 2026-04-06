/**
 * TimeRangeFilter — Tab-style time range selector for the dashboard.
 */
import React from 'react';
import { TIME_RANGE_OPTIONS } from '../../../constants/dashboard';

type TimeRange = 'today' | 'total' | '7d' | '30d' | '1y';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({ value, onChange }) => (
  <div className="db-time-filter-row">
    <div className="db-time-filter-shell">
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
    </div>
  </div>
);
