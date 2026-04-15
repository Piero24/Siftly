/**
 * Content Script — Injected into web pages to manage the Siftly extension panel.
 *
 * Lifecycle:
 *   1. Background script injects this content script via `chrome.scripting.executeScript`.
 *   2. On first execution, it registers listeners for runtime messages (toggle/close)
 *      and iframe messages (close/resize/drag).
 *   3. The panel is a fixed-position host <div> containing a shadow DOM with an <iframe>.
 *   4. The iframe loads the popup app at `src/popup/index.html?embedded=1`.
 *   5. Clicking outside the panel or pressing Escape closes it.
 *   6. A global singleton (`__SIFTLY_PANEL_MANAGER__`) prevents double-initialization.
 */
import {
  EXTENSION_PANEL_SOURCE,
  EXTENSION_PANEL_TOGGLE,
  EXTENSION_PANEL_CLOSE,
  EXTENSION_IFRAME_CLOSE,
  EXTENSION_IFRAME_RESIZE,
  EXTENSION_IFRAME_DRAG_START,
  isExtensionPanelRuntimeMessage,
  isExtensionPanelIframeMessage,
  type ExtensionPanelRuntimeResponse,
} from '../lib/extensionPanelMessages';

// ── Panel Layout Constants ──────────────────────────────────

const PANEL_HOST_ID = 'siftly-extension-panel-host';
const PANEL_WIDTH = 384;
const PANEL_DEFAULT_HEIGHT = 420;
const PANEL_MIN_HEIGHT = 120;
const PANEL_OFFSET = 16;
const PANEL_Z_INDEX = 2147483000;

// ── Global Singleton Guard ──────────────────────────────────

const globalWindow = window as Window & {
  __SIFTLY_PANEL_MANAGER__?: {
    initialized: boolean;
    togglePanel: () => boolean;
    closePanel: () => void;
  };
};

if (!globalWindow.__SIFTLY_PANEL_MANAGER__?.initialized) {
  // ── Mutable panel state ──
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

  // ── Geometry Helpers ────────────────────────────────────

  /** Clamp a height value to the visible viewport. */
  function clampPanelHeight(nextHeight: number): number {
    const maxHeight = Math.max(window.innerHeight - PANEL_OFFSET * 2, PANEL_MIN_HEIGHT);
    return Math.min(Math.max(Math.ceil(nextHeight), PANEL_MIN_HEIGHT), maxHeight);
  }

  /** Apply a new height to the iframe and reveal the panel if hidden. */
  function applyPanelHeight(nextHeight?: number): void {
    if (!iframeElement) return;

    if (typeof nextHeight === 'number') {
      panelHeight = nextHeight;
    }

    iframeElement.style.height = `${clampPanelHeight(panelHeight)}px`;

    if (!isFrameVisible && iframeElement.parentElement) {
      iframeElement.parentElement.style.opacity = '1';
      iframeElement.parentElement.style.visibility = 'visible';
      isFrameVisible = true;
    }
  }

  function clamp(value: number, min: number, max: number): number {
    return max < min ? min : Math.min(Math.max(value, min), max);
  }

  /** Keep the panel within the viewport after drag. */
  function clampTranslation(nextX: number, nextY: number): { x: number; y: number } {
    if (!hostElement) return { x: nextX, y: nextY };

    const rect = hostElement.getBoundingClientRect();
    const baseLeft = window.innerWidth - PANEL_OFFSET - rect.width;
    const baseTop = PANEL_OFFSET;

    return {
      x: clamp(nextX, PANEL_OFFSET - baseLeft, window.innerWidth - PANEL_OFFSET - rect.width - baseLeft),
      y: clamp(nextY, PANEL_OFFSET - baseTop, Math.max(PANEL_OFFSET - baseTop, window.innerHeight - PANEL_OFFSET - rect.height - baseTop)),
    };
  }

  /** Batch transform updates into a single rAF callback. */
  function scheduleTransformFlush(): void {
    if (!hostElement || dragFrameRequest !== null) return;

    dragFrameRequest = window.requestAnimationFrame(() => {
      dragFrameRequest = null;
      if (hostElement) {
        hostElement.style.transform = `translate(${pendingTranslateX}px, ${pendingTranslateY}px)`;
      }
    });
  }

  // ── Panel Lifecycle ─────────────────────────────────────

  function getHostFromDom(): HTMLDivElement | null {
    const existing = document.getElementById(PANEL_HOST_ID);
    return existing instanceof HTMLDivElement ? existing : null;
  }

  /** Create and mount the panel host if it doesn't exist. */
  function ensurePanelOpen(): void {
    if (hostElement && iframeElement && document.contains(hostElement)) return;

    const host = document.createElement('div');
    host.id = PANEL_HOST_ID;
    Object.assign(host.style, {
      position: 'fixed',
      top: `${PANEL_OFFSET}px`,
      right: `${PANEL_OFFSET}px`,
      width: `${PANEL_WIDTH}px`,
      maxWidth: `calc(100vw - ${PANEL_OFFSET * 2}px)`,
      maxHeight: `calc(100vh - ${PANEL_OFFSET * 2}px)`,
      zIndex: String(PANEL_Z_INDEX),
      pointerEvents: 'auto',
      transform: 'translate(0px, 0px)',
    });

    const shadowRoot = host.attachShadow({ mode: 'open' });
    currentTranslateX = 0;
    currentTranslateY = 0;

    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      *, *::before, *::after { box-sizing: border-box; }
      .siftly-panel-shell {
        width: 100%; max-width: 100%;
        max-height: calc(100vh - ${PANEL_OFFSET * 2}px);
        border-radius: 16px; overflow: hidden;
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(15, 23, 42, 0.14);
        background: transparent; opacity: 0; visibility: hidden;
        transition: opacity 120ms ease;
      }
      .siftly-panel-frame {
        width: 100%; height: ${PANEL_DEFAULT_HEIGHT}px;
        max-height: calc(100vh - ${PANEL_OFFSET * 2}px);
        border: 0; border-radius: 16px; display: block;
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
      if (revealFallbackTimer !== null) window.clearTimeout(revealFallbackTimer);
      revealFallbackTimer = window.setTimeout(() => {
        if (iframeElement === iframe && !isFrameVisible) applyPanelHeight();
      }, 220);
    });

    shell.appendChild(iframe);
    shadowRoot.append(style, shell);
    document.documentElement.appendChild(host);

    hostElement = host;
    iframeElement = iframe;
  }

  /** Tear down the panel and reset all state. */
  function closePanel(): void {
    const existingHost = hostElement ?? getHostFromDom();
    if (existingHost) existingHost.remove();

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

  /** Toggle the panel open/closed. Returns the new open state. */
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
    if (!hostElement || !(target instanceof Node)) return false;
    return hostElement.contains(target);
  }

  // ── Event Listeners ─────────────────────────────────────

  // Close panel when clicking outside
  document.addEventListener('pointerdown', (event) => {
    if (hostElement && !isInsideHost(event.target)) closePanel();
  }, true);

  // Close panel on Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && hostElement) closePanel();
  }, true);

  // Re-clamp height on viewport resize
  window.addEventListener('resize', () => {
    if (iframeElement) applyPanelHeight();
  }, { passive: true });

  // Handle iframe → content script messages (close, resize, drag)
  window.addEventListener('message', (event: MessageEvent) => {
    if (!iframeElement || !isExtensionPanelIframeMessage(event.data)) return;

    if (event.data.type === EXTENSION_IFRAME_DRAG_START && hostElement) {
      handleDragStart(event.data.clientX ?? 0, event.data.clientY ?? 0);
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

  // Handle background script → content script messages (toggle, close)
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isExtensionPanelRuntimeMessage(message)) return;

    let response: ExtensionPanelRuntimeResponse;

    if (message.type === EXTENSION_PANEL_TOGGLE) {
      response = { ok: true, open: togglePanel() };
      sendResponse(response);
      return;
    }

    if (message.type === EXTENSION_PANEL_CLOSE) {
      closePanel();
      response = { ok: true, open: false };
      sendResponse(response);
    }
  });

  // ── Drag Logic ──────────────────────────────────────────

  /** Set up pointer-move/up listeners for drag-to-reposition. */
  function handleDragStart(clientX: number, clientY: number): void {
    if (!hostElement) return;

    const rect = hostElement.getBoundingClientRect();
    const parentStartX = rect.left + clientX;
    const parentStartY = rect.top + clientY;
    const initialTx = currentTranslateX;
    const initialTy = currentTranslateY;

    if (iframeElement) iframeElement.style.pointerEvents = 'none';

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      zIndex: '2147483001', cursor: 'grabbing',
    });
    document.body.appendChild(overlay);

    const onPointerMove = (e: PointerEvent) => {
      const clamped = clampTranslation(initialTx + e.clientX - parentStartX, initialTy + e.clientY - parentStartY);
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
      if (iframeElement) iframeElement.style.pointerEvents = 'auto';
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  // ── Singleton Registration ──────────────────────────────

  globalWindow.__SIFTLY_PANEL_MANAGER__ = {
    initialized: true,
    togglePanel,
    closePanel,
  };
}
