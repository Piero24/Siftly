/**
 * links.ts — Central configuration for all external URLs and static resource links.
 *
 * Consolidation of these values here makes them easily reusable and simplifies
 * global updates to documentation, support, or repository links.
 */

export const LINKS = {
  // Official Siftly Repository
  github: 'https://github.com/pietrobon/siftly',

  // Community & Social
  community: 'https://github.com/pietrobon/siftly/discussions',

  // Documentation & Support
  docs: 'https://github.com/pietrobon/siftly', // Replace with link once docs are hosted
  support: 'mailto:support@example.com',

  // Public Assets & Data
  geoData: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',

  // Privacy & Legal
  privacy: 'https://github.com/pietrobon/siftly/blob/main/PRIVACY.md',
  terms: 'https://github.com/pietrobon/siftly/blob/main/TERMS.md',
} as const;
