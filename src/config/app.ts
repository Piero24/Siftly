import { LINKS } from './links';

const logoPath = `${import.meta.env.BASE_URL}logo.svg`;

export const IS_DEBUG = import.meta.env.VITE_DEBUG_MODE === 'true';

export const MOCK_MODE_KEY = 'siftly-use-mock-data';

export const DEBUG_CONFIG = {
  bypassAuth: IS_DEBUG,
  verboseLogging: IS_DEBUG,
  showToolbar: IS_DEBUG,
  useMockData: typeof window !== 'undefined' ? localStorage.getItem(MOCK_MODE_KEY) === 'true' : false,
};

export const APP_INFO = {
  name: 'Siftly',
  fullName: 'Siftly Tracker',
  popupName: 'Siftly Tracker',
  version: '1.0.0', // Update this based on your version strategy
  logo: {
    path: logoPath,
    alt: 'Siftly logo'
  },
  tagLine: 'Your job search control panel',
  links: {
    docs: LINKS.docs,
    support: LINKS.support,
    github: LINKS.github,
    community: LINKS.community,
  }
};
