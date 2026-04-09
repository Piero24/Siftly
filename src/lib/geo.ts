import { Country, City } from 'country-state-city';
import type { ICountry, ICity } from 'country-state-city';

export interface CountryOption {
  value: string; // ISO alpha-2 code (e.g. "US")
  label: string; // Full name (e.g. "United States")
}

export interface CityOption {
  value: string; // City name
  label: string; // Same as name
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/** All countries as ComboBox items, sorted alphabetically. */
export function getAllCountryOptions(): CountryOption[] {
  return Country.getAllCountries()
    .map((c: ICountry) => ({
      value: c.isoCode,
      label: c.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Cities for a given ISO alpha-2 country code, sorted alphabetically. */
export function getCitiesForCountry(countryCode: string): CityOption[] {
  const cities = City.getCitiesOfCountry(countryCode);
  if (!cities) return [];

  // country-state-city can return duplicate city names across regions/states.
  // Keep one unique entry per normalized city label for cleaner UX.
  const uniqueByName = new Map<string, CityOption>();
  for (const c of cities) {
    const key = normalizeText(c.name);
    if (!uniqueByName.has(key)) {
      uniqueByName.set(key, { value: c.name, label: c.name });
    }
  }

  return Array.from(uniqueByName.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/** Get country name from ISO code using country-state-city */
export function getCountryNameFromCode(code: string): string {
  return Country.getCountryByCode(code)?.name ?? code;
}
