/**
 * AppearanceCard — Theme and dashboard display defaults.
 */
import React from 'react';
import { SunIcon, MoonIcon, LaptopIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { SegmentedToggle } from '../common/SegmentedToggle';
import { useSettings } from '../../context/SettingsContext';
import { OVERVIEW_SCOPE_OPTIONS } from '../../constants/dashboard';

export const AppearanceCard: React.FC = () => {
  const {
    theme,
    setTheme,
    resolvedTheme,
    defaultTimeRange,
    setDefaultTimeRange,
    defaultOverviewScope,
    setDefaultOverviewScope,
    useSoftIconBackground,
    setUseSoftIconBackground,
  } = useSettings();

  const themeOptions: Array<{
    value: 'light' | 'dark' | 'system';
    label: string;
    icon: React.ReactNode;
  }> = [
    { value: 'light', label: 'Light', icon: <SunIcon size={14} /> },
    { value: 'dark', label: 'Dark', icon: <MoonIcon size={14} /> },
    { value: 'system', label: 'System', icon: <LaptopIcon size={14} /> },
  ];

  const cardIcon =
    theme === 'system' ? (
      <LaptopIcon size={22} />
    ) : resolvedTheme === 'light' ? (
      <SunIcon size={22} />
    ) : (
      <MoonIcon size={22} />
    );

  return (
    <SettingsCard icon={cardIcon} title="Appearance & Dashboard">
      <div className="setting-item">
        <label>Visual Theme</label>
        <SegmentedToggle value={theme} options={themeOptions} onChange={setTheme} />
      </div>

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

      <div className="setting-item">
        <label>Company Icon Style</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={useSoftIconBackground}
            onChange={(e) => setUseSoftIconBackground(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
        When enabled, table and chart icons use a soft background with inset favicon. Disable to use
        full favicon mode.
      </p>
    </SettingsCard>
  );
};
