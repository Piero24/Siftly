const EXTENSION_PANEL_SOURCE = 'siftly-extension-panel';
const EXTENSION_PANEL_TOGGLE = 'SIFTLY_PANEL_TOGGLE';
const EXTENSION_PANEL_CLOSE = 'SIFTLY_PANEL_CLOSE';
const EXTENSION_IFRAME_CLOSE = 'SIFTLY_IFRAME_CLOSE';
const EXTENSION_IFRAME_RESIZE = 'SIFTLY_IFRAME_RESIZE';
const EXTENSION_IFRAME_DRAG_START = 'SIFTLY_IFRAME_DRAG_START';

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
  type:
    | typeof EXTENSION_IFRAME_CLOSE
    | typeof EXTENSION_IFRAME_RESIZE
    | typeof EXTENSION_IFRAME_DRAG_START;
  height?: number;
  clientX?: number;
  clientY?: number;
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
    (value.type === EXTENSION_IFRAME_CLOSE ||
      value.type === EXTENSION_IFRAME_RESIZE ||
      value.type === EXTENSION_IFRAME_DRAG_START)
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
  let currentTranslateX = 0;
  let currentTranslateY = 0;
  let pendingTranslateX = 0;
  let pendingTranslateY = 0;
  let dragFrameRequest: number | null = null;

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

  function clamp(value: number, min: number, max: number): number {
    if (max < min) {
      return min;
    }
    return Math.min(Math.max(value, min), max);
  }

  function clampTranslation(nextX: number, nextY: number): { x: number; y: number } {
    if (!hostElement) {
      return { x: nextX, y: nextY };
    }

    const rect = hostElement.getBoundingClientRect();
    const baseLeft = window.innerWidth - PANEL_OFFSET - rect.width;
    const baseTop = PANEL_OFFSET;

    const minX = PANEL_OFFSET - baseLeft;
    const maxX = window.innerWidth - PANEL_OFFSET - rect.width - baseLeft;
    const minY = PANEL_OFFSET - baseTop;
    const maxY = Math.max(minY, window.innerHeight - PANEL_OFFSET - rect.height - baseTop);

    return {
      x: clamp(nextX, minX, maxX),
      y: clamp(nextY, minY, maxY),
    };
  }

  function scheduleTransformFlush(): void {
    if (!hostElement || dragFrameRequest !== null) {
      return;
    }

    dragFrameRequest = window.requestAnimationFrame(() => {
      dragFrameRequest = null;
      if (!hostElement) {
        return;
      }
      hostElement.style.transform = `translate(${pendingTranslateX}px, ${pendingTranslateY}px)`;
    });
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
    host.style.transform = 'translate(0px, 0px)';

    const shadowRoot = host.attachShadow({ mode: 'open' });
    currentTranslateX = 0;
    currentTranslateY = 0;
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

    if (dragFrameRequest !== null) {
      window.cancelAnimationFrame(dragFrameRequest);
      dragFrameRequest = null;
    }

    hostElement = null;
    iframeElement = null;
    isFrameVisible = false;
    currentTranslateX = 0;
    currentTranslateY = 0;
    pendingTranslateX = 0;
    pendingTranslateY = 0;
  }

  function togglePanel(): boolean {
    const existingHost = hostElement ?? getHostFromDom();
    if (!existingHost) {
      currentTranslateX = 0;
      currentTranslateY = 0;
    }

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

    if (event.data.type === EXTENSION_IFRAME_DRAG_START && hostElement) {
      const rect = hostElement.getBoundingClientRect();
      const parentStartX = rect.left + (event.data.clientX ?? 0);
      const parentStartY = rect.top + (event.data.clientY ?? 0);
      const initialTranslateX = currentTranslateX;
      const initialTranslateY = currentTranslateY;

      const iframe = iframeElement;
      if (iframe) iframe.style.pointerEvents = 'none';

      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '2147483001';
      overlay.style.cursor = 'grabbing';
      document.body.appendChild(overlay);

      const onPointerMove = (e: PointerEvent) => {
        const deltaX = e.clientX - parentStartX;
        const deltaY = e.clientY - parentStartY;
        const clamped = clampTranslation(initialTranslateX + deltaX, initialTranslateY + deltaY);
        currentTranslateX = clamped.x;
        currentTranslateY = clamped.y;
        pendingTranslateX = clamped.x;
        pendingTranslateY = clamped.y;
        scheduleTransformFlush();
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);

        if (dragFrameRequest !== null) {
          window.cancelAnimationFrame(dragFrameRequest);
          dragFrameRequest = null;
        }
        if (hostElement) {
          hostElement.style.transform = `translate(${pendingTranslateX}px, ${pendingTranslateY}px)`;
        }

        if (iframe) iframe.style.pointerEvents = 'auto';
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
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
