/** @vitest-environment node */
import { describe, expect, it } from 'vitest';

import { getCountryName, getFlagClass, normalizeCountryCode } from './countries';

describe('countries utilities', () => {
  describe('normalizeCountryCode', () => {
    it('normalizes UK aliases to GB', () => {
      expect(normalizeCountryCode('UK')).toBe('GB');
      expect(normalizeCountryCode('uk')).toBe('GB');
      expect(normalizeCountryCode(' uk ')).toBe('GB');
    });

    it('preserves valid ISO alpha-2 codes', () => {
      expect(normalizeCountryCode('US')).toBe('US');
      expect(normalizeCountryCode('fr')).toBe('FR');
    });
  });

  describe('getFlagClass', () => {
    it('returns GB flag class when UK alias is provided', () => {
      expect(getFlagClass('UK')).toBe('fi fi-gb');
      expect(getFlagClass('uk')).toBe('fi fi-gb');
    });

    it('returns flag class for standard ISO codes', () => {
      expect(getFlagClass('US')).toBe('fi fi-us');
      expect(getFlagClass('FR')).toBe('fi fi-fr');
    });
  });

  describe('getCountryName', () => {
    it('resolves UK alias to a United Kingdom country name', () => {
      expect(getCountryName('UK')).toContain('United Kingdom');
    });

    it('falls back to normalized code for unknown countries', () => {
      expect(getCountryName('zz')).toBe('ZZ');
    });
  });
});
