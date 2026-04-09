import { logger } from '../lib/logger';
import {
  EXTENSION_PANEL_SOURCE,
  EXTENSION_PANEL_TOGGLE,
  type ExtensionPanelRuntimeResponse,
} from '../lib/extensionPanelMessages';

const bgLogger = logger.for('Background');

bgLogger.info('Siftly Background Service Worker Initialized');

chrome.runtime.onInstalled.addListener(() => {
  bgLogger.info('Siftly Job Tracker Extension Installed');
});

function isInjectableTabUrl(url?: string): boolean {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sendPanelToggleMessage(tabId: number): Promise<ExtensionPanelRuntimeResponse | null> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        source: EXTENSION_PANEL_SOURCE,
        type: EXTENSION_PANEL_TOGGLE,
      },
      (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        resolve((response as ExtensionPanelRuntimeResponse | undefined) ?? null);
      }
    );
  });
}

async function injectContentRuntime(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['assets/content.js'],
  });
}

async function tryTogglePanelWithRetries(
  tabId: number,
  retries: number,
  intervalMs: number
): Promise<ExtensionPanelRuntimeResponse | null> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await sendPanelToggleMessage(tabId);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await delay(intervalMs);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Panel toggle retries exhausted');
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    bgLogger.warn('No active tab id available for panel toggle');
    return;
  }

  if (!isInjectableTabUrl(tab.url)) {
    bgLogger.debug('Ignoring non-web tab URL for in-page panel', tab.url);
    return;
  }

  try {
    const existingResponse = await sendPanelToggleMessage(tab.id);
    if (existingResponse?.ok) {
      return;
    }
  } catch {
    // No receiver yet; we will inject content runtime below.
  }

  try {
    await injectContentRuntime(tab.id);
  } catch (error) {
    bgLogger.error('Failed to inject content runtime', error);
    return;
  }

  try {
    await tryTogglePanelWithRetries(tab.id, 3, 90);
  } catch (error) {
    bgLogger.error('Failed to toggle panel after injection', error);
  }
});
