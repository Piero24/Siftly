export const EXTENSION_PANEL_SOURCE = 'siftly-extension-panel';

export const EXTENSION_PANEL_TOGGLE = 'SIFTLY_PANEL_TOGGLE';
export const EXTENSION_PANEL_CLOSE = 'SIFTLY_PANEL_CLOSE';
export const EXTENSION_IFRAME_CLOSE = 'SIFTLY_IFRAME_CLOSE';

export type ExtensionPanelRuntimeMessage = {
  source: typeof EXTENSION_PANEL_SOURCE;
  type: typeof EXTENSION_PANEL_TOGGLE | typeof EXTENSION_PANEL_CLOSE;
};

export type ExtensionPanelRuntimeResponse = {
  ok: boolean;
  open: boolean;
};

export type ExtensionPanelIframeMessage = {
  source: typeof EXTENSION_PANEL_SOURCE;
  type: typeof EXTENSION_IFRAME_CLOSE;
};

export function isExtensionPanelRuntimeMessage(
  message: unknown
): message is ExtensionPanelRuntimeMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const value = message as Partial<ExtensionPanelRuntimeMessage>;

  return (
    value.source === EXTENSION_PANEL_SOURCE &&
    (value.type === EXTENSION_PANEL_TOGGLE || value.type === EXTENSION_PANEL_CLOSE)
  );
}

export function isExtensionPanelIframeMessage(
  message: unknown
): message is ExtensionPanelIframeMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const value = message as Partial<ExtensionPanelIframeMessage>;

  return value.source === EXTENSION_PANEL_SOURCE && value.type === EXTENSION_IFRAME_CLOSE;
}
