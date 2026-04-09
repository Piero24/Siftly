import { LINKS } from './links';
import metadata from '../../metadata.json';

const logoFile = metadata.branding.appLogo.replace(/^\//, '');

function resolveAppAssetPath(fileName: string): string {
  // Extension pages are served from nested routes (e.g. src/popup/index.html),
  // so relative "./logo.svg" paths can resolve incorrectly. Use runtime URL when available.
  if (typeof chrome !== 'undefined' && chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(fileName);
  }
  return `${import.meta.env.BASE_URL}${fileName}`;
}

const logoPath = resolveAppAssetPath(logoFile);

export const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true';

export const MOCK_MODE_KEY = 'siftly-use-mock-data';

export const DEBUG_CONFIG = {
  bypassAuth: IS_DEBUG,
  verboseLogging: IS_DEBUG,
  showToolbar: IS_DEBUG,
  useMockData:
    typeof window !== 'undefined' ? localStorage.getItem(MOCK_MODE_KEY) === 'true' : false,
};

export const APP_INFO = {
  name: metadata.product.name,
  fullName: metadata.product.fullName,
  popupName: metadata.product.popupName,
  version: metadata.version,
  logo: {
    path: logoPath,
    alt: metadata.branding.logoAlt,
  },
  tagLine: metadata.product.tagline,
  links: {
    docs: LINKS.docs,
    support: LINKS.support,
    github: LINKS.github,
    community: LINKS.community,
  },
};
