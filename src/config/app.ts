import { LINKS } from './links';
import metadata from '../../metadata.json';

const logoPath = `${import.meta.env.BASE_URL}${metadata.branding.appLogo.replace(/^\//, '')}`;

export const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true';

export const MOCK_MODE_KEY = 'siftly-use-mock-data';

export const DEBUG_CONFIG = {
  bypassAuth: IS_DEBUG,
  verboseLogging: IS_DEBUG,
  showToolbar: IS_DEBUG,
  useMockData: typeof window !== 'undefined' ? localStorage.getItem(MOCK_MODE_KEY) === 'true' : false,
};

export const APP_INFO = {
  name: metadata.product.name,
  fullName: metadata.product.fullName,
  popupName: metadata.product.popupName,
  version: metadata.version,
  logo: {
    path: logoPath,
    alt: metadata.branding.logoAlt
  },
  tagLine: metadata.product.tagline,
  links: {
    docs: LINKS.docs,
    support: LINKS.support,
    github: LINKS.github,
    community: LINKS.community,
  }
};
