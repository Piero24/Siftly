/**
 * CvProfilesCard — CV profile creation and management.
 */
import React, { useState } from 'react';
import { BookOpenIcon } from '../common/Icons';
import { SettingsCard } from '../common/SettingsCard';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

const CV_COLORS = [
  '#007AFF',
  '#34C759',
  '#FF9500',
  '#FF3B30',
  '#AF52DE',
  '#5AC8FA',
  '#FF2D55',
  '#8E8E93',
];

export const CvProfilesCard: React.FC = () => {
  const { cvProfiles, setCvProfiles } = useSettings();
  const { showToast } = useToast();
  const [newCvName, setNewCvName] = useState('');
  const [newCvColor, setNewCvColor] = useState(CV_COLORS[0]);

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

  return (
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
          <button className="btn-apple btn-primary" onClick={addCvProfile}>
            Add
          </button>
        </div>
      </div>

      <div className="cv-profile-list">
        {cvProfiles.length === 0 ? (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            No CV profiles yet.
          </span>
        ) : (
          cvProfiles.map((profile) => (
            <div key={profile.id} className="cv-profile-item">
              <div className="cv-profile-meta">
                <span className="cv-profile-dot" style={{ backgroundColor: profile.color }} />
                <span className="cv-profile-name">{profile.name}</span>
              </div>
              <button
                className="btn-apple btn-outline"
                onClick={() => removeCvProfile(profile.id, profile.name)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </SettingsCard>
  );
};
