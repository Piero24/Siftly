const EXTENSION_PANEL_SOURCE = 'siftly-extension-panel';
const EXTENSION_PANEL_TOGGLE = 'SIFTLY_PANEL_TOGGLE';
const EXTENSION_PANEL_CLOSE = 'SIFTLY_PANEL_CLOSE';
const EXTENSION_IFRAME_CLOSE = 'SIFTLY_IFRAME_CLOSE';
const EXTENSION_IFRAME_RESIZE = 'SIFTLY_IFRAME_RESIZE';

type ExtensionPanelRuntimeMessage = {
  source: typeof EXTENSION_PANEL_SOURCE;
  type: typeof EXTENSION_PANEL_TOGGLE | typeof EXTENSION_PANEL_CLOSE;
};

type ExtensionPanelRuntimeResponse = {
  ok: boolean;
  open: boolean;
};

type ExtensionPanelIframeMessage = {
  source: typeof EXTENSION_PANEL_SOURCE;
  type: typeof EXTENSION_IFRAME_CLOSE | typeof EXTENSION_IFRAME_RESIZE;
  height?: number;
};

function isExtensionPanelRuntimeMessage(message: unknown): message is ExtensionPanelRuntimeMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const value = message as Partial<ExtensionPanelRuntimeMessage>;

  return (
    value.source === EXTENSION_PANEL_SOURCE &&
    (value.type === EXTENSION_PANEL_TOGGLE || value.type === EXTENSION_PANEL_CLOSE)
  );
}

function isExtensionPanelIframeMessage(message: unknown): message is ExtensionPanelIframeMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const value = message as Partial<ExtensionPanelIframeMessage>;
  return (
    value.source === EXTENSION_PANEL_SOURCE &&
    (value.type === EXTENSION_IFRAME_CLOSE || value.type === EXTENSION_IFRAME_RESIZE)
  );
}

const PANEL_HOST_ID = 'siftly-extension-panel-host';
const PANEL_WIDTH = 384;
const PANEL_DEFAULT_HEIGHT = 420;
const PANEL_MIN_HEIGHT = 120;
const PANEL_OFFSET = 16;
const PANEL_Z_INDEX = 2147483000;

const globalWindow = window as Window & {
  __SIFTLY_PANEL_MANAGER__?: {
    initialized: boolean;
    togglePanel: () => boolean;
    closePanel: () => void;
  };
};

if (!globalWindow.__SIFTLY_PANEL_MANAGER__?.initialized) {
  let hostElement: HTMLDivElement | null = null;
  let iframeElement: HTMLIFrameElement | null = null;
  let panelHeight = PANEL_DEFAULT_HEIGHT;
  let isFrameVisible = false;
  let revealFallbackTimer: number | null = null;

  const iframeUrl = chrome.runtime.getURL('src/popup/index.html?embedded=1');

  function clampPanelHeight(nextHeight: number): number {
    const maxHeight = Math.max(window.innerHeight - PANEL_OFFSET * 2, PANEL_MIN_HEIGHT);
    return Math.min(Math.max(Math.ceil(nextHeight), PANEL_MIN_HEIGHT), maxHeight);
  }

  function applyPanelHeight(nextHeight?: number): void {
    if (!iframeElement) {
      return;
    }

    if (typeof nextHeight === 'number') {
      panelHeight = nextHeight;
    }

    const clampedHeight = clampPanelHeight(panelHeight);
    iframeElement.style.height = `${clampedHeight}px`;

    if (!isFrameVisible) {
      if (iframeElement.parentElement) {
        iframeElement.parentElement.style.opacity = '1';
        iframeElement.parentElement.style.visibility = 'visible';
      }
      isFrameVisible = true;
    }
  }

  function getHostFromDom(): HTMLDivElement | null {
    const existing = document.getElementById(PANEL_HOST_ID);
    return existing instanceof HTMLDivElement ? existing : null;
  }

  function ensurePanelOpen(): void {
    if (hostElement && iframeElement && document.contains(hostElement)) {
      return;
    }

    const host = document.createElement('div');
    host.id = PANEL_HOST_ID;
    host.style.position = 'fixed';
    host.style.top = `${PANEL_OFFSET}px`;
    host.style.right = `${PANEL_OFFSET}px`;
    host.style.width = `${PANEL_WIDTH}px`;
    host.style.maxWidth = `calc(100vw - ${PANEL_OFFSET * 2}px)`;
    host.style.maxHeight = `calc(100vh - ${PANEL_OFFSET * 2}px)`;
    host.style.zIndex = String(PANEL_Z_INDEX);
    host.style.pointerEvents = 'auto';

    const shadowRoot = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
			:host {
				all: initial;
			}

			*, *::before, *::after {
				box-sizing: border-box;
			}

			.siftly-panel-shell {
				width: 100%;
				max-width: 100%;
				max-height: calc(100vh - ${PANEL_OFFSET * 2}px);
				border-radius: 16px;
				overflow: hidden;
				box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
				border: 1px solid rgba(15, 23, 42, 0.14);
				background: transparent;
        opacity: 0;
        visibility: hidden;
        transition: opacity 120ms ease;
			}

			.siftly-panel-frame {
				width: 100%;
        height: ${PANEL_DEFAULT_HEIGHT}px;
				max-height: calc(100vh - ${PANEL_OFFSET * 2}px);
				border: 0;
				border-radius: 16px;
				display: block;
				background: transparent;
			}
		`;

    const shell = document.createElement('div');
    shell.className = 'siftly-panel-shell';

    const iframe = document.createElement('iframe');
    iframe.className = 'siftly-panel-frame';
    iframe.src = iframeUrl;
    iframe.title = 'Siftly Extension Panel';
    iframe.setAttribute('aria-label', 'Siftly extension panel');
    iframe.addEventListener('load', () => {
      if (revealFallbackTimer !== null) {
        window.clearTimeout(revealFallbackTimer);
      }

      // Fallback reveal if iframe resize message is delayed.
      revealFallbackTimer = window.setTimeout(() => {
        if (iframeElement === iframe && !isFrameVisible) {
          applyPanelHeight();
        }
      }, 220);
    });

    shell.appendChild(iframe);
    shadowRoot.append(style, shell);

    document.documentElement.appendChild(host);

    hostElement = host;
    iframeElement = iframe;
  }

  function closePanel(): void {
    const existingHost = hostElement ?? getHostFromDom();
    if (existingHost) {
      existingHost.remove();
    }

    if (revealFallbackTimer !== null) {
      window.clearTimeout(revealFallbackTimer);
      revealFallbackTimer = null;
    }

    hostElement = null;
    iframeElement = null;
    isFrameVisible = false;
  }

  function togglePanel(): boolean {
    const existingHost = hostElement ?? getHostFromDom();
    if (existingHost) {
      closePanel();
      return false;
    }
    ensurePanelOpen();
    return true;
  }

  function isInsideHost(target: EventTarget | null): boolean {
    if (!hostElement || !(target instanceof Node)) {
      return false;
    }
    return hostElement.contains(target);
  }

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!hostElement) {
        return;
      }
      if (!isInsideHost(event.target)) {
        closePanel();
      }
    },
    true
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && hostElement) {
        closePanel();
      }
    },
    true
  );

  window.addEventListener(
    'resize',
    () => {
      if (!iframeElement) {
        return;
      }
      applyPanelHeight();
    },
    { passive: true }
  );

  window.addEventListener('message', (event: MessageEvent) => {
    if (!iframeElement) {
      return;
    }
    if (!isExtensionPanelIframeMessage(event.data)) {
      return;
    }
    if (event.data.type === EXTENSION_IFRAME_CLOSE) {
      closePanel();
      return;
    }

    if (event.data.type === EXTENSION_IFRAME_RESIZE && typeof event.data.height === 'number') {
      applyPanelHeight(event.data.height);
    }
  });

  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isExtensionPanelRuntimeMessage(message)) {
      return;
    }

    let response: ExtensionPanelRuntimeResponse;

    if (message.type === EXTENSION_PANEL_TOGGLE) {
      const isOpen = togglePanel();
      response = { ok: true, open: isOpen };
      sendResponse(response);
      return;
    }

    if (message.type === EXTENSION_PANEL_CLOSE) {
      closePanel();
      response = { ok: true, open: false };
      sendResponse(response);
    }
  });

  globalWindow.__SIFTLY_PANEL_MANAGER__ = {
    initialized: true,
    togglePanel,
    closePanel,
  };
}
