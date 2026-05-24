import { useSettings } from '../context/SettingsContext';
import { EXTENSION_IFRAME_DRAG_START } from '../lib/extensionPanelMessages';
import React, { useState, useEffect } from 'react';
import {
  BriefcaseIcon,
  EditIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
  SpinnerIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from '../components/common/Icons';
import { APP_INFO, IS_DEBUG } from '../config/app';
import {
  EXTENSION_IFRAME_CLOSE,
  EXTENSION_PANEL_SOURCE,
  type ExtensionPanelIframeMessage,
} from '../lib/extensionPanelMessages';
import { ManualInsertForm } from './ManualInsertForm';
import { useAuth } from '../context/AuthContext';
import { SIFT_SCRAPE_PAGE } from '../lib/scrapeMessages';
import type { ScrapeResponse } from '../lib/scrapeMessages';
import type { FormState } from '../constants/form';

type PopupActionCardProps = {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  isPlaceholder?: boolean;
  badge?: string;
};

const PopupActionCard: React.FC<PopupActionCardProps> = ({
  title,
  icon,
  onClick,
  isPlaceholder = false,
  badge,
}) => {
  return (
    <button type="button" className="popup-action-card" onClick={onClick} aria-label={title}>
      <span className="popup-action-icon" aria-hidden="true">
        {icon}
      </span>

      <span className="popup-action-text">{title}</span>

      {isPlaceholder ? <span className="popup-soon-pill">Soon</span> : null}
      {badge ? (
        <span
          className="popup-status-tag"
          style={{
            color: '#0a66c2',
            background: 'rgba(10, 102, 194, 0.1)',
            fontSize: '10px',
            marginLeft: 'auto',
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
};

type PopupView = 'main' | 'manual' | 'scraping' | 'scrape-error';

const Main: React.FC = () => {
  const { isDraggable } = useSettings();
  const handleDragStart = (e: React.PointerEvent) => {
    if (!isDraggable) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    window.parent.postMessage(
      {
        type: EXTENSION_IFRAME_DRAG_START,
        source: EXTENSION_PANEL_SOURCE,
        clientX: e.clientX,
        clientY: e.clientY,
      },
      '*'
    );
  };

  const [view, setView] = useState<PopupView>('main');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { isAuthenticated } = useAuth();
  const isEmbeddedPanel = new URLSearchParams(window.location.search).get('embedded') === '1';

  // Scrape state
  const [scrapeData, setScrapeData] = useState<Partial<FormState> | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

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
    setScrapeData(null);
    setView('manual');
  };

  const handleScrape = () => {
    if (!navigator.onLine) {
      setScrapeError('No internet connection. Please verify your network and try again.');
      setView('scrape-error');
      return;
    }

    if (!isAuthenticated) {
      setScrapeError('You are logged out. Please log in from the dashboard first.');
      setView('scrape-error');
      return;
    }

    setView('scraping');
    setScrapeError(null);

    chrome.runtime.sendMessage(
      { type: SIFT_SCRAPE_PAGE },
      (response: ScrapeResponse | undefined) => {
        const lastError = chrome.runtime.lastError;

        if (lastError) {
          setScrapeError('Could not reach the extension. Please try again.');
          setView('scrape-error');
          return;
        }

        if (!response || !response.success || !response.formState) {
          setScrapeError(
            response?.error ||
              'Could not extract job data. Make sure you are on a LinkedIn job page.'
          );
          setView('scrape-error');
          return;
        }

        setScrapeData(response.formState);
        setView('manual');
      }
    );
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

  // ── Scraping spinner view ──
  if (view === 'scraping') {
    return (
      <div className="popup-shell">
        <div className="popup-form-view">
          <div
            className="popup-form-header"
            onPointerDown={handleDragStart}
            style={{ cursor: isDraggable ? 'grab' : 'default', touchAction: 'none' }}
          >
            <button
              type="button"
              className="popup-icon-button"
              onClick={() => setView('main')}
              aria-label="Go back"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <span className="popup-form-title">Scraping…</span>
          </div>
          <div
            className="popup-form-body"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              flex: 1,
              minHeight: '200px',
            }}
          >
            <div className="popup-spinner" style={{ marginBottom: '16px', color: '#0a66c2' }}>
              <SpinnerIcon size={48} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Extracting Job Data</h3>
            <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Reading the LinkedIn job page…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Scrape error view ──
  if (view === 'scrape-error') {
    return (
      <div className="popup-shell">
        <div className="popup-form-view">
          <div
            className="popup-form-header"
            onPointerDown={handleDragStart}
            style={{ cursor: isDraggable ? 'grab' : 'default', touchAction: 'none' }}
          >
            <button
              type="button"
              className="popup-icon-button"
              onClick={() => setView('main')}
              aria-label="Go back"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <span className="popup-form-title">Scrape Failed</span>
          </div>
          <div
            className="popup-form-body"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              flex: 1,
              minHeight: '200px',
            }}
          >
            <XCircleIcon
              size={48}
              color="#d93025"
              style={{ marginBottom: '16px', flexShrink: 0 }}
            />
            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Extraction Failed</h3>
            <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {scrapeError}
            </p>
          </div>
          <div className="popup-form-footer">
            <button
              className="btn-apple btn-outline popup-form-btn"
              onClick={() => setView('main')}
            >
              Back
            </button>
            <button className="btn-apple btn-primary popup-form-btn" onClick={handleScrape}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-shell">
      {view === 'manual' ? (
        <ManualInsertForm
          onCancel={() => {
            closePopup();
          }}
          onBack={() => {
            setScrapeData(null);
            setView('main');
            forcePopupResize();
          }}
          onSuccess={() => {
            closePopup();
          }}
          initialData={scrapeData ?? undefined}
        />
      ) : (
        <>
          <div
            className="popup-header"
            onPointerDown={handleDragStart}
            style={{ cursor: isDraggable ? 'grab' : 'default', touchAction: 'none' }}
          >
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
              title="Scrape Job Portal"
              icon={<SearchIcon size={24} />}
              onClick={handleScrape}
              badge="BETA"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
