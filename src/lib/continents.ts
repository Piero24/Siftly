/**
 * continents.ts — ISO 3166-1 alpha-2 country → continent mapping.
 * Sufficient for world-map grouping. Not exhaustive for every territory.
 */

export type Continent =
  | 'North America'
  | 'South America'
  | 'Europe'
  | 'Africa'
  | 'Asia'
  | 'Oceania'
  | 'Antarctica';

const MAP: Record<string, Continent> = {
  // North America
  US: 'North America', CA: 'North America', MX: 'North America',
  GT: 'North America', BZ: 'North America', HN: 'North America',
  SV: 'North America', NI: 'North America', CR: 'North America',
  PA: 'North America', CU: 'North America', JM: 'North America',
  HT: 'North America', DO: 'North America', PR: 'North America',

  // South America
  BR: 'South America', AR: 'South America', CL: 'South America',
  CO: 'South America', PE: 'South America', VE: 'South America',
  EC: 'South America', BO: 'South America', PY: 'South America',
  UY: 'South America', GY: 'South America', SR: 'South America',

  // Europe
  GB: 'Europe', DE: 'Europe', FR: 'Europe', IT: 'Europe', ES: 'Europe',
  PT: 'Europe', NL: 'Europe', BE: 'Europe', CH: 'Europe', AT: 'Europe',
  SE: 'Europe', NO: 'Europe', DK: 'Europe', FI: 'Europe', IE: 'Europe',
  PL: 'Europe', CZ: 'Europe', SK: 'Europe', HU: 'Europe', RO: 'Europe',
  BG: 'Europe', HR: 'Europe', SI: 'Europe', GR: 'Europe', LU: 'Europe',
  EE: 'Europe', LV: 'Europe', LT: 'Europe', MT: 'Europe', CY: 'Europe',
  IS: 'Europe', LI: 'Europe', MC: 'Europe', SM: 'Europe', VA: 'Europe',
  AL: 'Europe', BA: 'Europe', ME: 'Europe', MK: 'Europe', RS: 'Europe',
  XK: 'Europe', UA: 'Europe', MD: 'Europe', BY: 'Europe', RU: 'Europe',
  TR: 'Europe',

  // Africa
  NG: 'Africa', ZA: 'Africa', EG: 'Africa', KE: 'Africa', GH: 'Africa',
  ET: 'Africa', TZ: 'Africa', MA: 'Africa', CM: 'Africa', CI: 'Africa',
  SN: 'Africa', UG: 'Africa', MZ: 'Africa', AO: 'Africa', MG: 'Africa',
  ZW: 'Africa', TN: 'Africa', DZ: 'Africa', LY: 'Africa', SD: 'Africa',

  // Asia
  CN: 'Asia', JP: 'Asia', IN: 'Asia', KR: 'Asia', SG: 'Asia',
  HK: 'Asia', AE: 'Asia', SA: 'Asia', IL: 'Asia', TH: 'Asia',
  MY: 'Asia', ID: 'Asia', PH: 'Asia', PK: 'Asia', BD: 'Asia',
  VN: 'Asia', TW: 'Asia', KW: 'Asia', QA: 'Asia', BH: 'Asia',
  OM: 'Asia', JO: 'Asia', LB: 'Asia', IR: 'Asia', IQ: 'Asia',
  KZ: 'Asia', UZ: 'Asia', GE: 'Asia', AM: 'Asia', AZ: 'Asia',
  NP: 'Asia', LK: 'Asia', MM: 'Asia', KH: 'Asia', LA: 'Asia',

  // Oceania
  AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania', PG: 'Oceania',
  SB: 'Oceania', VU: 'Oceania', WS: 'Oceania', TO: 'Oceania',

  // Antarctica
  AQ: 'Antarctica',
};

export function getContinent(countryCode: string): Continent {
  return MAP[countryCode.toUpperCase()] ?? 'Asia'; // safe fallback
}
