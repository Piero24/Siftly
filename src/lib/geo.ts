/**
 * Country & City utilities powered by country-state-city.
 * Replaces the hardcoded SUPPORTED_COUNTRIES list with the full world list.
 */
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
  return City.getCitiesOfCountry(countryCode)
    ?.map((c: ICity) => ({ value: c.name, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label)) ?? [];
}

/** Get country name from ISO code using country-state-city */
export function getCountryNameFromCode(code: string): string {
  return Country.getCountryByCode(code)?.name ?? code;
}
