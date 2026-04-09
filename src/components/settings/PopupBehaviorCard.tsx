import React from 'react';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';

// Standard SVG for drag/popup behavior
const PopupIcon = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

export const PopupBehaviorCard: React.FC = () => {
  const {
    isDraggable,
    setIsDraggable,
    autoCloseEnabled,
    setAutoCloseEnabled,
    autoCloseTimer,
    setAutoCloseTimer,
  } = useSettings();

  return (
    <SettingsCard icon={<PopupIcon size={22} />} title="Popup Behavior">
      <div className="setting-item">
        <label>Draggable Popup Headers</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isDraggable}
            onChange={(e) => setIsDraggable(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>Auto-Close on Success/Error</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={autoCloseEnabled}
            onChange={(e) => setAutoCloseEnabled(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {autoCloseEnabled && (
        <div className="setting-item">
          <label>Auto-Close Delay</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={autoCloseTimer}
              onChange={(e) => setAutoCloseTimer(Math.max(1, parseInt(e.target.value) || 5))}
              className="apple-select"
              style={{ width: '60px', textAlign: 'center' }}
              min={1}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>seconds</span>
          </div>
        </div>
      )}
    </SettingsCard>
  );
};
