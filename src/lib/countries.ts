/**
 * Country utilities powered by i18n-iso-countries.
 * Provides ISO 3166-1 alpha-2 → full name lookup and flag CSS class helpers.
 */
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register English locale once at module level
countries.registerLocale(enLocale);

const COUNTRY_CODE_ALIASES: Record<string, string> = {
  UK: 'GB',
};

/**
 * Normalizes common non-ISO aliases to ISO 3166-1 alpha-2 country codes.
 */
export function normalizeCountryCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  return COUNTRY_CODE_ALIASES[normalized] ?? normalized;
}

/**
 * Returns the full English country name for an ISO alpha-2 code.
 * Falls back gracefully to the raw code string.
 */
export function getCountryName(code: string): string {
  const normalizedCode = normalizeCountryCode(code);
  return countries.getName(normalizedCode, 'en') ?? normalizedCode;
}

/**
 * Returns the CSS class for flag-icons (e.g. "fi fi-us").
 * Uses lower-case country code.
 */
export function getFlagClass(code: string): string {
  return `fi fi-${normalizeCountryCode(code).toLowerCase()}`;
}

/** All supported country codes (for select menus, etc.) */
export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IT', name: 'Italy' },
  { code: 'SE', name: 'Sweden' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
];
