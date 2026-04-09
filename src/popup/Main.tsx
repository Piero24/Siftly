import React, { useState, useEffect } from 'react';
import {
  BriefcaseIcon,
  EditIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
} from '../components/common/Icons';
import { APP_INFO, IS_DEBUG } from '../config/app';
import {
  EXTENSION_IFRAME_CLOSE,
  EXTENSION_PANEL_SOURCE,
  type ExtensionPanelIframeMessage,
} from '../lib/extensionPanelMessages';
import { ManualInsertForm } from './ManualInsertForm';
import { useAuth } from '../context/AuthContext';

type PopupActionCardProps = {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  isPlaceholder?: boolean;
};

const PopupActionCard: React.FC<PopupActionCardProps> = ({
  title,
  icon,
  onClick,
  isPlaceholder = false,
}) => {
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
  const [view, setView] = useState<'main' | 'manual'>('main');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { isAuthenticated } = useAuth();
  const isEmbeddedPanel = new URLSearchParams(window.location.search).get('embedded') === '1';

  const closeEmbeddedPanel = () => {
    const closeMessage: ExtensionPanelIframeMessage = {
      source: EXTENSION_PANEL_SOURCE,
      type: EXTENSION_IFRAME_CLOSE,
    };
    window.parent.postMessage(closeMessage, '*');
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
    if (isEmbeddedPanel) {
      closeEmbeddedPanel();
    }
  };

  const openSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html#settings') });
    if (isEmbeddedPanel) {
      closeEmbeddedPanel();
    }
  };

  const closePopup = () => {
    if (isEmbeddedPanel) {
      closeEmbeddedPanel();
      return;
    }
    window.close();
  };

  const handleManualInsert = () => {
    setView('manual');
  };

  const handleScrapePlaceholder = () => {
    // Placeholder for upcoming scrape flow.
  };

  const forcePopupResize = () => {
    if (isEmbeddedPanel) {
      return;
    }

    // Reset heights aggressively to circumvent Chromium Mac extension popup resizing bug
    if (document.documentElement && document.body) {
      document.documentElement.style.height = '10px';
      document.body.style.height = '10px';
      setTimeout(() => {
        document.documentElement.style.height = 'auto';
        document.body.style.height = 'auto';
      }, 50);
    }
  };

  return (
    <div className="popup-shell">
      {view === 'manual' ? (
        <ManualInsertForm
          onCancel={() => {
            closePopup();
          }}
          onBack={() => {
            setView('main');
            forcePopupResize();
          }}
          onSuccess={() => {
            closePopup();
          }}
        />
      ) : (
        <>
          <div className="popup-header">
            <div className="popup-brand">
              <img
                src={APP_INFO.logo.path}
                alt={APP_INFO.logo.alt}
                width={30}
                height={30}
                className="popup-logo"
              />
              <div className="popup-heading-wrap">
                <div className="popup-title-row">
                  <div className="popup-title">{APP_INFO.popupName}</div>
                  {isOffline ? (
                    <span
                      className="popup-status-tag"
                      style={{
                        color: '#d93025',
                        background: 'rgba(217, 48, 37, 0.1)',
                        flexShrink: 0,
                      }}
                    >
                      OFFLINE
                    </span>
                  ) : !isAuthenticated ? (
                    <span
                      className="popup-status-tag"
                      style={{
                        color: '#E58A00',
                        background: 'rgba(229, 138, 0, 0.1)',
                        flexShrink: 0,
                      }}
                    >
                      LOGGED OUT
                    </span>
                  ) : IS_DEBUG ? (
                    <span className="popup-status-tag">INTERNAL</span>
                  ) : null}
                </div>
                {!IS_DEBUG ? <div className="popup-subtitle">{APP_INFO.tagLine}</div> : null}
              </div>
            </div>

            <div className="popup-header-actions">
              <button
                type="button"
                className="popup-icon-button"
                onClick={openSettings}
                aria-label="Open settings"
              >
                <SettingsIcon size={22} />
              </button>

              <button
                type="button"
                className="popup-icon-button"
                onClick={closePopup}
                aria-label="Close popup"
              >
                <XIcon size={22} />
              </button>
            </div>
          </div>

          <div className="popup-card-list">
            <PopupActionCard
              title="Open Dashboard"
              icon={<BriefcaseIcon size={24} />}
              onClick={openDashboard}
            />

            <PopupActionCard
              title="Manual Insert"
              icon={<EditIcon size={24} />}
              onClick={handleManualInsert}
            />

            <PopupActionCard
              title="Scrape LinkedIn"
              icon={<SearchIcon size={24} />}
              onClick={handleScrapePlaceholder}
              isPlaceholder
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
