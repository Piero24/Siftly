import React, { useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import Main from './Main';
import { SettingsProvider } from '../context/SettingsContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/glass.css';
import '../styles/popup.css';

const isEmbeddedPanel = new URLSearchParams(window.location.search).get('embedded') === '1';
const EXTENSION_PANEL_SOURCE = 'siftly-extension-panel';
const EXTENSION_IFRAME_RESIZE = 'SIFTLY_IFRAME_RESIZE';

type ExtensionPanelIframeResizeMessage = {
  source: typeof EXTENSION_PANEL_SOURCE;
  type: typeof EXTENSION_IFRAME_RESIZE;
  height: number;
};

type PopupRootProps = {
  isEmbedded: boolean;
};

const PopupRoot: React.FC<PopupRootProps> = ({ isEmbedded }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const frameRequestRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!isEmbedded || window.parent === window) {
      return;
    }

    const postEmbeddedHeight = () => {
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }

      frameRequestRef.current = requestAnimationFrame(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) {
          return;
        }

        const message: ExtensionPanelIframeResizeMessage = {
          source: EXTENSION_PANEL_SOURCE,
          type: EXTENSION_IFRAME_RESIZE,
          height: Math.ceil(wrapper.getBoundingClientRect().height),
        };

        window.parent.postMessage(message, '*');
      });
    };

    const observer = new ResizeObserver(() => {
      postEmbeddedHeight();
    });

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    window.addEventListener('load', postEmbeddedHeight);
    window.addEventListener('resize', postEmbeddedHeight);
    postEmbeddedHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener('load', postEmbeddedHeight);
      window.removeEventListener('resize', postEmbeddedHeight);
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [isEmbedded]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: isEmbedded ? '100%' : '372px',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Main />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <AuthProvider>
          <PopupRoot isEmbedded={isEmbeddedPanel} />
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  </React.StrictMode>
);
