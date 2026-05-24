/**
 * normalizer.ts — Transform raw LinkedIn data into a partial FormState.
 *
 * Handles:
 * - Location parsing (city / country split with fuzzy matching)
 * - Salary parsing (ranges, currencies, periods)
 * - Work type inference
 * - Employment type inference
 * - Description cleanup
 *
 * Runs in the background script context (has access to npm modules).
 *
 * @see PLAN.md §4 for normalization strategy.
 */

import countries from 'i18n-iso-countries';

// Register all locale packs dynamically using Vite glob.
const localeModules = import.meta.glob('../../../node_modules/i18n-iso-countries/langs/*.json', {
  eager: true,
});

for (const path in localeModules) {
  const pack = localeModules[path];
  countries.registerLocale((pack as any).default || pack);
}

/** All locale codes we registered, used for lookup iteration. */
const REGISTERED_LOCALES = Object.keys(localeModules).map((path) => {
  const filename = path.split('/').pop() || '';
  return filename.replace('.json', '');
});

import type { RawLinkedInJob } from './types';
import type { FormState } from '../../constants/form';
import type { WorkType, EmploymentType } from '../../types/job';

export const NORMALIZER_VERSION = '1.1.0';

// ── Location Parsing ────────────────────────────────────

/**
 * Normalize accented characters for comparison.
 */
function normalizeStr(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Resolve a country name or abbreviation to an ISO alpha-2 code.
 * Tries all 30 registered locales so it works regardless of the user's LinkedIn language.
 */
function resolveCountryCode(raw: string): string {
  const normalized = raw.trim();
  if (!normalized) return '';

  // 1. Direct ISO code (2 letters like "US", "IT")
  if (normalized.length === 2 && countries.isValid(normalized.toUpperCase())) {
    return normalized.toUpperCase();
  }

  // 2. Try exact lookup across ALL registered locales
  for (const locale of REGISTERED_LOCALES) {
    const code = countries.getAlpha2Code(normalized, locale);
    if (code) return code;
  }

  // 3. Fuzzy fallback: partial match against all locale names
  const normSearch = normalizeStr(normalized);
  if (normSearch.length < 2) return '';

  for (const locale of REGISTERED_LOCALES) {
    const allNames = countries.getNames(locale);
    for (const [code, name] of Object.entries(allNames)) {
      const normName = normalizeStr(name);
      if (normName === normSearch) return code;
    }
  }

  // 4. Very loose partial match (only against English to avoid false positives)
  const enNames = countries.getNames('en', { select: 'official' });
  for (const [code, name] of Object.entries(enNames)) {
    const normName = normalizeStr(name);
    if (normName.includes(normSearch) || normSearch.includes(normName)) return code;
  }

  return '';
}

/**
 * Parse a raw LinkedIn location string like "Milano, Lombardia, Italia · Ripubblicata..."
 * into { city, countryCode } using an intelligent part-by-part resolution.
 *
 * Algorithm:
 *   1. Split by " · " — take the first part (location info)
 *   2. Split by "," — get candidate parts
 *   3. For each part (from end), try all 30 locales to identify the country
 *   4. Take the first remaining part as the city
 *
 * LinkedIn always orders locations most-specific first: City, Region, Country.
 * So after removing the country, the first part is the city.
 * We don't validate against a city database because LinkedIn shows localized
 * names (e.g. "Milano", "Roma") which won't match English databases.
 */
export function parseLocation(
  raw: string,
  candidates: string[] = [],
  positionName?: string
): { city: string; countryCode: string } {
  const inputs = raw ? [raw] : candidates;

  for (const input of inputs) {
    if (!input) continue;

    // 1. Split by delimiters: middle dot (·), bullet (•), and pipe (|)
    const splitParts = input.split(/[\u00b7\u2022|]/);

    let countryCode = '';
    let countryIndex = -1;
    let parts: string[] = [];

    // 2. Find the part that contains the country
    for (const part of splitParts) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;

      // Split components by comma and clean parentheticals (e.g. "India (Ibrido)" -> "India")
      const candidatesList = trimmedPart
        .split(',')
        .map((p) => p.replace(/\([^)]+\)/g, '').trim())
        .filter(Boolean);

      // Try to resolve the country from the components
      for (let i = candidatesList.length - 1; i >= 0; i--) {
        const code = resolveCountryCode(candidatesList[i]);
        if (code) {
          countryCode = code;
          countryIndex = i;
          parts = candidatesList;
          break;
        }
      }

      if (countryCode) {
        break;
      }
    }

    if (countryCode) {
      // 3. Find the city based on the rules:
      //    - If the number of components is 3 and country was found:
      //      - if country is at index 2, city is at index 0
      //      - if country is at index 0, city is at index 2
      //    - If the number of components is less than 3, skip the city (leave it empty)
      //    - If the number of components is greater than 3 and country was found:
      //      - if country is at the last index, city is at index 0
      //      - if country is at index 0, city is at the last index
      let city = '';
      if (parts.length === 3) {
        if (countryIndex === 2) {
          city = parts[0];
        } else if (countryIndex === 0) {
          city = parts[2];
        }
      } else if (parts.length > 3) {
        if (countryIndex === parts.length - 1) {
          city = parts[0];
        } else if (countryIndex === 0) {
          city = parts[parts.length - 1];
        }
      }
      return { city, countryCode };
    }
  }

  return { city: '', countryCode: '' };
}

// ── Work Type / Employment Type ─────────────────────────

import constants from './constants.json';
const workTypeData = constants.workTypeData;

/**
 * Reverse-lookup map built at module load from workTypeTranslations.json.
 * Maps each localized term → canonical WorkType value.
 * Sorted by key length descending so longer phrases match first.
 */
const WORK_TYPE_MAP: Array<[string, WorkType]> = (() => {
  const entries: Array<[string, WorkType]> = [];
  for (const [type, keywords] of Object.entries(workTypeData)) {
    for (const kw of keywords) {
      entries.push([kw.toLowerCase(), type as WorkType]);
    }
  }
  // Sort by key length descending so "smart working" matches before "work"
  entries.sort((a, b) => b[0].length - a[0].length);
  return entries;
})();

/**
 * Precedence order for work type inference.
 * Hybrid > Remote > Onsite — if a hint mentions both hybrid and remote,
 * we classify it as hybrid.
 */
const WORK_TYPE_PRECEDENCE: Record<WorkType, number> = {
  hybrid: 0,
  remote: 1,
  onsite: 2,
};

/**
 * Infer work type from a LinkedIn hint string.
 * Uses a data-driven reverse-lookup map built from workTypeTranslations.json.
 */
export function inferWorkType(hint: string | null): WorkType {
  if (!hint) return 'onsite';
  const lower = hint.toLowerCase();

  let bestMatch: WorkType | null = null;

  for (const [keyword, type] of WORK_TYPE_MAP) {
    if (lower.includes(keyword)) {
      if (!bestMatch || WORK_TYPE_PRECEDENCE[type] < WORK_TYPE_PRECEDENCE[bestMatch]) {
        bestMatch = type;
      }
      // If we already found the highest-precedence type, stop early
      if (bestMatch === 'hybrid') break;
    }
  }

  return bestMatch ?? 'onsite';
}

const employmentTypeData = constants.employmentTypeData;

/**
 * Reverse-lookup map built at module load from employmentTypeTranslations.json.
 * Maps each localized term → canonical EmploymentType value.
 * Sorted by key length descending so longer phrases match first.
 */
const EMPLOYMENT_TYPE_MAP: Array<[string, EmploymentType]> = (() => {
  const entries: Array<[string, EmploymentType]> = [];
  for (const [type, keywords] of Object.entries(employmentTypeData)) {
    for (const kw of keywords) {
      entries.push([kw.toLowerCase(), type as EmploymentType]);
    }
  }
  // Sort by key length descending so "tempo determinato" matches before "tempo"
  entries.sort((a, b) => b[0].length - a[0].length);
  return entries;
})();

/**
 * Infer employment type from a LinkedIn hint string.
 * Uses a data-driven reverse-lookup map built from employmentTypeTranslations.json.
 */
export function inferEmploymentType(hint: string | null): EmploymentType {
  if (!hint) return 'permanent';
  const lower = hint.toLowerCase();

  for (const [keyword, type] of EMPLOYMENT_TYPE_MAP) {
    if (lower.includes(keyword)) {
      return type;
    }
  }

  return 'permanent';
}

// ── Main Normalizer ─────────────────────────────────────

/**
 * Convert raw LinkedIn extraction data into a partial FormState
 * that can be merged with DEFAULT_FORM_STATE to pre-fill the form.
 */
export function normalizeToFormState(raw: RawLinkedInJob): Partial<FormState> {
  // Parse location from localized DOM text as baseline
  const parsed = parseLocation(
    raw.locationRaw ?? '',
    raw.locationCandidates ?? [],
    raw.position ?? ''
  );

  // Prefer English city/country from LinkedIn's internal JSON (from <code> blocks)
  // These are always in English, regardless of the user's LinkedIn UI language.
  const city = raw.locationCity || parsed.city;
  const countryCode = raw.locationCountryCode || parsed.countryCode;

  const result: Partial<FormState> = {
    company: raw.company?.trim() ?? '',
    position: raw.position?.trim() ?? '',
    workType: inferWorkType(raw.workTypeHint),
    employmentType: inferEmploymentType(raw.employmentTypeHint),
    country: countryCode,
    city: city,
    status: 'applied',
    date: new Date().toISOString().slice(0, 10),
    description: raw.description?.trim() ?? '',
    jobUrl: raw.jobUrl || '',
    linkedinUrl: '',
  };

  if (raw.companyUrl) {
    const url = raw.companyUrl.startsWith('http')
      ? raw.companyUrl
      : `https://www.linkedin.com${raw.companyUrl}`;
    result.linkedinUrl = url;
  }

  // Set company sector and website if deep-scraped
  if (raw.industry) result.sector = raw.industry;
  if (raw.websiteUrl) result.websiteUrl = raw.websiteUrl;

  return result;
}
