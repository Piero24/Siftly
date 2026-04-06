/**
 * AutomationCard — Auto no-response settings.
 */
import React from 'react';
import { ClockIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';

export const AutomationCard: React.FC = () => {
  const { autoNoResponse, setAutoNoResponse, autoNoResponseDays, setAutoNoResponseDays } = useSettings();

  return (
    <SettingsCard icon={<ClockIcon size={22} />} title="Automation">
      <div className="setting-item">
        <label>Auto-mark "No Response"</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={autoNoResponse}
            onChange={(e) => setAutoNoResponse(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
      {autoNoResponse && (
        <div className="setting-item">
          <label>Days until marked as No Response</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={autoNoResponseDays}
              onChange={(e) => setAutoNoResponseDays(Math.max(1, parseInt(e.target.value) || 60))}
              className="apple-select"
              style={{ width: '60px', textAlign: 'center' }}
              min={1}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>days</span>
          </div>
        </div>
      )}
    </SettingsCard>
  );
};
