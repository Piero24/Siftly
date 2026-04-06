/**
 * NotificationsCard — Email report preferences.
 */
import React from 'react';
import { BellIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';

export const NotificationsCard: React.FC = () => {
  const { notifications, setNotifications } = useSettings();

  return (
    <SettingsCard icon={<BellIcon size={22} />} title="Notifications">
      <div className="setting-item">
        <label>Email Reports</label>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={notifications.email}
            onChange={(e) => setNotifications((prev) => ({ ...prev, email: e.target.checked }))}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
        Get weekly summaries and interview reminders.
      </p>
    </SettingsCard>
  );
};
