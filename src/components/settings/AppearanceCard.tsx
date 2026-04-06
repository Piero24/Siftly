/**
 * AppearanceCard — Theme, default dashboard time range, and icon style settings.
 */
import React from 'react';
import { SunIcon, MoonIcon, LaptopIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { SegmentedToggle } from '../common/SegmentedToggle';
import { useSettings } from '../../context/SettingsContext';

export const AppearanceCard: React.FC = () => {
  const {
    theme, setTheme, resolvedTheme,
    defaultTimeRange, setDefaultTimeRange,
    useSoftIconBackground, setUseSoftIconBackground,
  } = useSettings();

  const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <SunIcon size={14} /> },
    { value: 'dark', label: 'Dark', icon: <MoonIcon size={14} /> },
    { value: 'system', label: 'System', icon: <LaptopIcon size={14} /> },
  ];

  const cardIcon = theme === 'system'
    ? <LaptopIcon size={22} />
    : resolvedTheme === 'light' ? <SunIcon size={22} /> : <MoonIcon size={22} />;

  return (
    <SettingsCard icon={cardIcon} title="Appearance & Dashboard">
      <div className="setting-item">
        <label>Visual Theme</label>
        <SegmentedToggle value={theme} options={themeOptions} onChange={setTheme} />
      </div>

      <div className="setting-item">
        <label>Default Time Range</label>
        <select
          value={defaultTimeRange}
          onChange={(e) => setDefaultTimeRange(e.target.value as 'today' | 'total' | '7d' | '30d' | '1y')}
          className="apple-select"
        >
          <option value="today">Today</option>
          <option value="total">Total</option>
          <option value="7d">Last Week</option>
          <option value="30d">Last Month</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

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
        When enabled, table and chart icons use a soft background with inset favicon. Disable to use full favicon mode.
      </p>
    </SettingsCard>
  );
};
