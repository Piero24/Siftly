import React from 'react';
import {
  BriefcaseIcon,
  EditIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
} from '../components/common/Icons';
import { APP_INFO, IS_DEBUG } from '../config/app';

type PopupActionCardProps = {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  isPlaceholder?: boolean;
};

const PopupActionCard: React.FC<PopupActionCardProps> = ({ title, icon, onClick, isPlaceholder = false }) => {
  return (
    <button type="button" className="popup-action-card" onClick={onClick} aria-label={title}>
      <span className="popup-action-icon" aria-hidden="true">
        {icon}
      </span>

      <span className="popup-action-text">{title}</span>

      {isPlaceholder ? <span className="popup-soon-pill">Soon</span> : null}
    </button>
  );
};

const Main: React.FC = () => {
  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
  };

  const openSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html#settings') });
  };

  const closePopup = () => {
    window.close();
  };

  const handleManualPlaceholder = () => {
    // Placeholder for upcoming manual insertion flow.
  };

  const handleScrapePlaceholder = () => {
    // Placeholder for upcoming scrape flow.
  };

  return (
    <div className="popup-shell">
      <div className="popup-header">
        <div className="popup-brand">
          <img src={APP_INFO.logo.path} alt={APP_INFO.logo.alt} width={30} height={30} className="popup-logo" />
          <div className="popup-heading-wrap">
            <div className="popup-title-row">
              <div className="popup-title">{APP_INFO.popupName}</div>
              {IS_DEBUG ? <span className="popup-status-tag">INTERNAL</span> : null}
            </div>
            {!IS_DEBUG ? <div className="popup-subtitle">{APP_INFO.tagLine}</div> : null}
          </div>
        </div>

        <div className="popup-header-actions">
          <button type="button" className="popup-icon-button" onClick={openSettings} aria-label="Open settings">
            <SettingsIcon size={22} />
          </button>

          <button type="button" className="popup-icon-button" onClick={closePopup} aria-label="Close popup">
            <XIcon size={22} />
          </button>
        </div>
      </div>

      <div className="popup-card-list">
        <PopupActionCard title="Open Dashboard" icon={<BriefcaseIcon size={24} />} onClick={openDashboard} />

        <PopupActionCard
          title="Manual Insert"
          icon={<EditIcon size={24} />}
          onClick={handleManualPlaceholder}
          isPlaceholder
        />

        <PopupActionCard
          title="Scrape LinkedIn"
          icon={<SearchIcon size={24} />}
          onClick={handleScrapePlaceholder}
          isPlaceholder
        />
      </div>
    </div>
  );
};

export default Main;
