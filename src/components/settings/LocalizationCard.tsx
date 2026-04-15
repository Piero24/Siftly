/**
 * LocalizationCard — Language and currency preferences.
 */
import React from 'react';
import { GlobeIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';

export const LocalizationCard: React.FC = () => {
  const { language, setLanguage, currency, setCurrency } = useSettings();

  return (
    <SettingsCard icon={<GlobeIcon size={22} />} title="Localization">
      <div className="setting-item">
        <label>App Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="apple-select"
        >
          <option value="en">English (US)</option>
          <option value="it">Italiano</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>
      <div className="setting-item">
        <label>Default Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="apple-select"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="SEK">SEK (kr)</option>
        </select>
      </div>
    </SettingsCard>
  );
};
