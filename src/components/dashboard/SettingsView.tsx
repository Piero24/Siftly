/**
 * SettingsView — Application settings panel.
 * Includes Automation, Localization, Appearance, Data & Storage, Support, and CV Profiles.
 */
import React, { useState } from 'react';
import { GlobeIcon, SunIcon, MoonIcon, LifeBuoyIcon, BookOpenIcon, MailIcon, ClockIcon, LaptopIcon, TrashIcon, BellIcon, LayoutIcon, DownloadIcon, UploadIcon, GithubIcon } from '../common/Icons';
import { APP_INFO } from '../../config/app';
import { useSettings } from '../../context/SettingsContext';
import { SettingsCard } from '../common/SettingsCard';
import { SegmentedToggle } from '../common/SegmentedToggle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import { exportToCSV, downloadCSV } from '../../lib/csv';
import { CSVImportModal } from './CSVImportModal';
import { JobApplication } from '../../types/job';
import { FEATURES } from '../../config/features';

const CV_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FF2D55', '#8E8E93'];

interface SettingsViewProps {
  applications?: JobApplication[];
  onImportCSV?: (apps: JobApplication[]) => void;
  onResetAll?: () => Promise<void>;
}



export const SettingsView: React.FC<SettingsViewProps> = ({ applications = [], onImportCSV, onResetAll }) => {
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
    storageMode,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    tableDisplay,
    setTableDisplay,
  } = useSettings();

  const { showToast } = useToast();
  const { isLocalOnly } = useAuth();
  const [newCvName, setNewCvName] = React.useState('');
  const [newCvColor, setNewCvColor] = React.useState(CV_COLORS[0]);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <SunIcon size={14} /> },
    { value: 'dark', label: 'Dark', icon: <MoonIcon size={14} /> },
    { value: 'system', label: 'System', icon: <LaptopIcon size={14} /> },
  ];

  const storageModeLabel = storageMode === 'remote'
    ? 'Cloud (Supabase)'
    : storageMode === 'local'
      ? 'Local (IndexedDB)'
      : 'Synced (Cloud + Local)';

  const addCvProfile = () => {
    const name = newCvName.trim();
    if (!name) return;
    setCvProfiles((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, color: newCvColor },
    ]);
    setNewCvName('');
    showToast(`CV Profile "${name}" added!`, 'success');
  };

  const removeCvProfile = (id: string, name: string) => {
    setCvProfiles((prev) => prev.filter((profile) => profile.id !== id));
    showToast(`Profile "${name}" removed.`, 'info');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(applications);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `siftly-export-${dateStr}.csv`);
  };

  const handleImportCSV = async (apps: JobApplication[]) => {
    try {
      await onImportCSV?.(apps);
      showToast(`Successfully imported ${apps.length} applications.`, 'success');
    } catch (err: any) {
      showToast(`Failed to import applications: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleResetAll = async () => {
    if (resetInput !== 'RESET') return;
    setIsResetting(true);
    try {
      await onResetAll?.();
      setShowResetConfirm(false);
      setResetInput('');
      showToast('All applications cleared successfully.', 'success');
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      <div className="settings-grid">
        {/* Appearance Section */}
        {FEATURES.settings.appearance && (
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
        )}

        {/* Automation Section */}
        {FEATURES.settings.automation && (
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
        )}

        {/* Localization Section */}
        {FEATURES.settings.localization && (
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
        )}

        {/* Notifications Section */}
        {FEATURES.settings.notifications && (
          <SettingsCard icon={<BellIcon size={22} />} title="Notifications">
            <div className="setting-item">
              <label>Email Reports</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Get weekly summaries and interview reminders.
            </p>
          </SettingsCard>
        )}

        {/* CV Profiles Section */}
        {FEATURES.settings.cvProfiles && (
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

              {/* CV Color Picker Chunk */}
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
                  <button className="btn-apple btn-outline" onClick={() => removeCvProfile(profile.id, profile.name)}>Remove</button>
                </div>
              ))}
            </div>
          </SettingsCard>
        )}

        {/* Table Display Section */}
        {FEATURES.settings.tableDisplay && (
          <SettingsCard icon={<LayoutIcon size={22} />} title="Table Display">
            <div className="setting-item">
              <label>Rows Per Page</label>
              <select
                value={tableDisplay.rowsPerPage}
                onChange={(e) => setTableDisplay(prev => ({ ...prev, rowsPerPage: parseInt(e.target.value) }))}
                className="apple-select"
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Default Sort</label>
              <select
                value={tableDisplay.defaultSort}
                onChange={(e) => setTableDisplay(prev => ({ ...prev, defaultSort: e.target.value }))}
                className="apple-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="salary-desc">Highest Salary</option>
                <option value="rating-desc">Highest Rating</option>
              </select>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Visible Columns</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['Company', 'Sector', 'Position', 'Country', 'City', 'Work', 'Salary', 'CV', 'Date', 'Status'].map(col => {
                  const colKey = col.toLowerCase();
                  const isVisible = tableDisplay.visibleColumns.includes(colKey);
                  return (
                    <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => {
                          const newCols = e.target.checked
                            ? [...tableDisplay.visibleColumns, colKey]
                            : tableDisplay.visibleColumns.filter(c => c !== colKey);
                          setTableDisplay(prev => ({ ...prev, visibleColumns: newCols }));
                        }}
                      />
                      {col}
                    </label>
                  );
                })}
              </div>
            </div>
          </SettingsCard>
        )}


        {/* Data & Storage Section */}
        {FEATURES.settings.dataStorage && (
          <SettingsCard icon={<LayoutIcon size={22} />} title="Data & Storage">
            <div className="setting-item">
              <label>Storage Mode</label>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{storageModeLabel}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Import & Export
              </label>
              <div className="support-actions">
                <button className="btn-apple btn-outline" onClick={handleExportCSV}>
                  <DownloadIcon size={14} /> Export CSV
                </button>
                <button className="btn-apple btn-outline" onClick={() => setShowCSVImport(true)}>
                  <UploadIcon size={14} /> Import CSV
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                Export all your applications as a CSV file or import from a previously exported file.
              </p>
            </div>

            {/* Reset Section */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--color-rejected, #FF3B30)' }}>
                <TrashIcon size={14} /> Reset Data
              </label>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, margin: '0 0 12px' }}>
                Permanently delete all applications. This cannot be undone.
              </p>
              {!showResetConfirm ? (
                <button
                  className="btn-apple btn-destructive"
                  onClick={() => setShowResetConfirm(true)}
                >
                  <TrashIcon size={14} /> Clear All Applications
                </button>
              ) : (
                <div className="delete-confirm-box">
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    Type <strong>RESET</strong> to confirm:
                  </p>
                  <input
                    className="apple-select"
                    style={{ width: '100%', marginBottom: 12, boxSizing: 'border-box' }}
                    value={resetInput}
                    onChange={(e) => setResetInput(e.target.value)}
                    placeholder="Type RESET"
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-apple btn-outline" onClick={() => { setShowResetConfirm(false); setResetInput(''); }}>
                      Cancel
                    </button>
                    <button
                      className="btn-apple btn-destructive"
                      disabled={resetInput !== 'RESET' || isResetting}
                      onClick={handleResetAll}
                    >
                      {isResetting ? 'Resetting…' : 'Delete All'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>
        )}

        {/* Support Section */}
        {FEATURES.settings.support && (
          <SettingsCard icon={<LifeBuoyIcon size={22} />} title="Support & Community">
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              Need help or have a suggestion? We're here for you.
            </p>
            <div className="support-actions">
              <a href={APP_INFO.links.github} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-apple btn-outline"><GithubIcon size={14} /> GitHub</button>
              </a>
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
        )}

      </div>

      {showCSVImport && (
        <CSVImportModal
          onClose={() => setShowCSVImport(false)}
          onImport={handleImportCSV}
        />
      )}
    </div>
  );
};
