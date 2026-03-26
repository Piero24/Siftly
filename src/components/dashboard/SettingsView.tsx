/**
 * SettingsView — Application settings panel.
 * Moved to src/components/settings/ for better modularity.
 * Uses lucide-react icons.
 */
import React from 'react';
import { GlobeIcon, SunIcon, MoonIcon, LifeBuoyIcon, BookOpenIcon, MailIcon, ClockIcon, LaptopIcon } from '../common/Icons';
import { APP_INFO } from '../../config/app';
import { useSettings } from '../../context/SettingsContext';
import { SettingsCard } from '../common/SettingsCard';
import { SegmentedToggle } from '../common/SegmentedToggle';

const CV_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FF2D55', '#8E8E93'];

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    theme,
    setTheme,
    resolvedTheme,
    autoNoResponse,
    setAutoNoResponse,
    autoNoResponseDays,
    setAutoNoResponseDays,
    defaultTimeRange,
    setDefaultTimeRange,
    cvProfiles,
    setCvProfiles,
  } = useSettings();

  const [newCvName, setNewCvName] = React.useState('');
  const [newCvColor, setNewCvColor] = React.useState(CV_COLORS[0]);

  const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <SunIcon size={14} /> },
    { value: 'dark', label: 'Dark', icon: <MoonIcon size={14} /> },
    { value: 'system', label: 'System', icon: <LaptopIcon size={14} /> },
  ];

  const addCvProfile = () => {
    const name = newCvName.trim();
    if (!name) return;
    setCvProfiles((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, color: newCvColor },
    ]);
    setNewCvName('');
  };

  const removeCvProfile = (id: string) => {
    setCvProfiles((prev) => prev.filter((profile) => profile.id !== id));
  };

  return (
  <div className="settings-container">
    <h2 className="settings-title">Settings</h2>

    <div className="settings-grid">
      {/* Automation Section */}
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input 
                  type="number" 
                  value={autoNoResponseDays} 
                  onChange={(e) => setAutoNoResponseDays(Math.max(1, parseInt(e.target.value) || 60))} 
                  className="apple-select" 
                  style={{ width: "60px", textAlign: "center" }} 
                  min={1} 
                />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>days</span>
              </div>
            </div>
          )}
      </SettingsCard>

      {/* Localization Section */}
      <SettingsCard icon={<GlobeIcon size={22} />} title="Localization">
          <div className="setting-item">
            <label>App Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="apple-select">
              <option value="en">English (US)</option>
              <option value="it">Italiano</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Default Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="apple-select">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="SEK">SEK (kr)</option>
            </select>
          </div>
      </SettingsCard>

      {/* Appearance Section */}
      <SettingsCard
        icon={theme === 'system' ? <LaptopIcon size={22} /> : resolvedTheme === 'light' ? <SunIcon size={22} /> : <MoonIcon size={22} />}
        title="Appearance & Dashboard"
      >
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
      </SettingsCard>

      {/* Support Section */}
      <SettingsCard icon={<LifeBuoyIcon size={22} />} title="Support & Community">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Need help or have a suggestion? We're here for you.
          </p>
          <div className="support-actions">
            <a href={APP_INFO.links.docs} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-apple btn-outline"><BookOpenIcon size={14} /> Documentation</button>
            </a>
            <a href={APP_INFO.links.support} style={{ textDecoration: 'none' }}>
              <button className="btn-apple btn-outline"><MailIcon size={14} /> Contact Support</button>
            </a>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Version {APP_INFO.version}
          </div>
      </SettingsCard>

      {/* CV Profiles Section */}
      <SettingsCard icon={<BookOpenIcon size={22} />} title="CV Profiles">
          <div className="cv-form-grid">
            <div className="cv-form-field">
              <label htmlFor="cv-name-input">CV Name</label>
              <input
                id="cv-name-input"
                className="apple-select cv-name-input"
                value={newCvName}
                onChange={(e) => setNewCvName(e.target.value)}
                placeholder="e.g. Product CV"
              />
            </div>

            <div className="cv-form-field">
              <label>Color Dot</label>
              <div className="cv-color-picker" role="radiogroup" aria-label="Choose CV color">
                {CV_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={newCvColor === color}
                    className={`cv-color-dot ${newCvColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCvColor(color)}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="cv-form-actions">
              <button className="btn-apple btn-primary" onClick={addCvProfile}>Add</button>
            </div>
          </div>

          <div className="cv-profile-list">
            {cvProfiles.length === 0 ? (
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No CV profiles yet.</span>
            ) : cvProfiles.map((profile) => (
              <div key={profile.id} className="cv-profile-item">
                <div className="cv-profile-meta">
                  <span className="cv-profile-dot" style={{ backgroundColor: profile.color }} />
                  <span className="cv-profile-name">{profile.name}</span>
                </div>
                <button className="btn-apple btn-outline" onClick={() => removeCvProfile(profile.id)}>Remove</button>
              </div>
            ))}
          </div>
      </SettingsCard>
    </div>
  </div>
  );
};
