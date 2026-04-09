/**
 * AppearanceCard - Theme and icon style controls.
 */
import React from 'react';
import { SunIcon, MoonIcon, LaptopIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { SegmentedToggle } from '../common/SegmentedToggle';
import { useSettings } from '../../context/SettingsContext';

export const AppearanceCard: React.FC = () => {
  const {
    theme,
    setTheme,
    resolvedTheme,
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
    <SettingsCard icon={cardIcon} title="Appearance">
      <div className="setting-item">
        <label>Visual Theme</label>
        <SegmentedToggle value={theme} options={themeOptions} onChange={setTheme} />
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
        When enabled, table and chart icons use a soft background with inset favicon. Disable to use
        full favicon mode.
      </p>
    </SettingsCard>
  );
};
