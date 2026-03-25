import React from 'react';
import { BriefcaseIcon, EditIcon, SearchIcon, SettingsIcon } from '../components/common/Icons';
import { APP_INFO } from '../config/app';

const Main: React.FC = () => {
  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
  };

  const openSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html#settings') });
  };

  const handleManual = () => {
    // Placeholder for upcoming manual insertion flow.
  };

  const handleScrape = () => {
    // Placeholder for upcoming scrape flow.
  };

  return (
    <div className="glass-container popup-shell">
      <div className="popup-header">
        <div className="popup-brand">
          <img src={APP_INFO.logo.path} alt={APP_INFO.logo.alt} width={34} height={34} className="popup-logo" />
          <div className="popup-heading-block">
            <div className="popup-title">{APP_INFO.popupName}</div>
            <div className="popup-subtitle">{APP_INFO.tagLine}</div>
          </div>
        </div>
        <button className="popup-settings-top" onClick={openSettings} aria-label="Open settings">
          <SettingsIcon size={18} />
        </button>
      </div>

      <div className="popup-actions-card">
        <div className="popup-section-label">Quick Actions</div>

        <button className="btn-apple btn-primary popup-action-btn" onClick={openDashboard}>
          <BriefcaseIcon size={14} />
          Open Dashboard
        </button>

        <div className="popup-action-grid">
          <button className="btn-apple popup-action-btn" onClick={handleManual}>
            <EditIcon size={14} />
            Manual Insert
            <span className="popup-soon-pill">Soon</span>
          </button>

          <button className="btn-apple popup-action-btn" onClick={handleScrape}>
            <SearchIcon size={14} />
            Scrape LinkedIn
            <span className="popup-soon-pill">Soon</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
