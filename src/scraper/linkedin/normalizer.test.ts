/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  parseLocation,
  inferWorkType,
  inferEmploymentType,
  normalizeToFormState,
} from './normalizer';

describe('normalizer parseLocation', () => {
  it('correctly parses standard 3-part location (City, Region, Country)', () => {
    const raw = 'Gurugram, Haryana, India · 1 giorno fa · Più di 100 persone';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: 'Gurugram', countryCode: 'IN' });
  });

  it('correctly parses standard 3-part location in Italian (Milano, Lombardia, Italia)', () => {
    const raw = 'Milano, Lombardia, Italia · 2 ore fa';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: 'Milano', countryCode: 'IT' });
  });

  it('correctly parses reversed 3-part location (Country, Region, City)', () => {
    // Just in case country is first
    const raw = 'Italia, Lombardia, Milano · 2 ore fa';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: 'Milano', countryCode: 'IT' });
  });

  it('skips the city when location has less than 3 parts (e.g. Region, Country)', () => {
    const raw = 'Lombardia, Italia · 2 ore fa';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: '', countryCode: 'IT' });
  });

  it('skips the city when location has only country', () => {
    const raw = 'Italia · 2 ore fa';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: '', countryCode: 'IT' });
  });

  it('handles standard US format (New York, NY, United States)', () => {
    const raw = 'New York, NY, United States · 5 days ago';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: 'New York', countryCode: 'US' });
  });

  it('correctly handles bullet character delimiter and extracts city/country', () => {
    const raw = 'Macquarie Group • Gurugram, Haryana, India (Ibrido)';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: 'Gurugram', countryCode: 'IN' });
  });

  it('correctly cleans up parenthetical workplace keywords from country names', () => {
    const raw = 'Gurugram, Haryana, India (Ibrido) · 1 giorno fa';
    const result = parseLocation(raw);
    expect(result).toEqual({ city: 'Gurugram', countryCode: 'IN' });
  });

  it('handles empty input gracefully', () => {
    expect(parseLocation('')).toEqual({ city: '', countryCode: '' });
  });

  it('handles inputs with no valid country gracefully', () => {
    const raw = 'UnknownRegion, UnknownCity · 1 hour ago';
    expect(parseLocation(raw)).toEqual({ city: '', countryCode: '' });
  });

  it('falls back to candidates array when raw is empty', () => {
    const candidates = ['Macquarie Group', 'Gurugram, Haryana, India (Ibrido)', '1 giorno fa'];
    const result = parseLocation('', candidates);
    expect(result).toEqual({ city: 'Gurugram', countryCode: 'IN' });
  });

  it('correctly uses raw even if candidates are provided', () => {
    const raw = 'Milano, Lombardia, Italia';
    const candidates = ['Gurugram, Haryana, India'];
    const result = parseLocation(raw, candidates);
    expect(result).toEqual({ city: 'Milano', countryCode: 'IT' });
  });

  it('resolves location from mixed candidates containing follower count and non-country strings', () => {
    const candidates = [
      '114K follower',
      'Selezione e ricerca di personale',
      'Milano, Lombardia, Italia · Ibrido',
      '11-50 dipendenti',
    ];
    const result = parseLocation('', candidates);
    expect(result).toEqual({ city: 'Milano', countryCode: 'IT' });
  });
});

describe('normalizer inferWorkType', () => {
  it('correctly infers remote in multiple languages', () => {
    expect(inferWorkType('Remote')).toBe('remote');
    expect(inferWorkType('Télétravail')).toBe('remote');
    expect(inferWorkType('Telelavoro')).toBe('remote');
    expect(inferWorkType('Zdalna')).toBe('remote');
    expect(inferWorkType('Uzaktan')).toBe('remote');
  });

  it('correctly infers hybrid in multiple languages', () => {
    expect(inferWorkType('Hybrid')).toBe('hybrid');
    expect(inferWorkType('Ibrido')).toBe('hybrid');
    expect(inferWorkType('Híbrido')).toBe('hybrid');
    expect(inferWorkType('Smart working')).toBe('hybrid');
  });

  it('correctly infers onsite in multiple languages', () => {
    expect(inferWorkType('On-site')).toBe('onsite');
    expect(inferWorkType('In sede')).toBe('onsite');
    expect(inferWorkType('Presencial')).toBe('onsite');
    expect(inferWorkType('Vor Ort')).toBe('onsite');
  });

  it('falls back to onsite when input is empty or non-matching', () => {
    expect(inferWorkType('')).toBe('onsite');
    expect(inferWorkType(null)).toBe('onsite');
    expect(inferWorkType('unknown workplace type')).toBe('onsite');
  });

  it('respects precedence (hybrid > remote > onsite)', () => {
    expect(inferWorkType('hybrid remote role')).toBe('hybrid');
    expect(inferWorkType('remote and onsite presence required')).toBe('remote');
  });
});

describe('normalizer normalizeToFormState', () => {
  it('correctly maps raw industry and website to form state sector and websiteUrl', () => {
    const rawJob = {
      company: 'Quik Hire Staffing',
      companyLogo: 'logoUrl',
      position: 'Recruiter',
      locationRaw: 'Pune, Maharashtra',
      description: 'Job description text',
      workTypeHint: 'Remote',
      employmentTypeHint: 'Full-time',
      postedDateRaw: '2 weeks ago',
      jobUrl: 'https://linkedin.com/jobs/view/12345',
      companyUrl: 'https://linkedin.com/company/quik-hire-staffing',
      industry: 'Selezione e ricerca di personale',
      websiteUrl: 'https://quikhire.com',
    };
    const result = normalizeToFormState(rawJob);
    expect(result.sector).toBe('Selezione e ricerca di personale');
    expect(result.websiteUrl).toBe('https://quikhire.com');
  });
});

describe('normalizer inferEmploymentType', () => {
  it('correctly infers permanent/full-time/part-time in multiple languages', () => {
    expect(inferEmploymentType('Full-time')).toBe('permanent');
    expect(inferEmploymentType('Tempo pieno')).toBe('permanent');
    expect(inferEmploymentType('Vollzeit')).toBe('permanent');
    expect(inferEmploymentType('À temps plein')).toBe('permanent');
    expect(inferEmploymentType('Tempo indeterminato')).toBe('permanent');
    expect(inferEmploymentType('Indefinido')).toBe('permanent');
    expect(inferEmploymentType('正社員')).toBe('permanent');
  });

  it('correctly infers internship/stage/tirocinio in multiple languages', () => {
    expect(inferEmploymentType('Intern')).toBe('intern');
    expect(inferEmploymentType('Internship')).toBe('intern');
    expect(inferEmploymentType('Stage')).toBe('intern');
    expect(inferEmploymentType('Tirocinio')).toBe('intern');
    expect(inferEmploymentType('Apprendistato')).toBe('intern');
    expect(inferEmploymentType('Praktikum')).toBe('intern');
    expect(inferEmploymentType('インターンシップ')).toBe('intern');
  });

  it('correctly infers fixed-term/contract/temporary in multiple languages', () => {
    expect(inferEmploymentType('Contract')).toBe('fixed-term');
    expect(inferEmploymentType('Temporary')).toBe('fixed-term');
    expect(inferEmploymentType('Freelance')).toBe('fixed-term');
    expect(inferEmploymentType('Tempo determinato')).toBe('fixed-term');
    expect(inferEmploymentType('Determinato')).toBe('fixed-term');
    expect(inferEmploymentType('Contratto a termine')).toBe('fixed-term');
    expect(inferEmploymentType('Befristet')).toBe('fixed-term');
    expect(inferEmploymentType('CDD')).toBe('fixed-term');
    expect(inferEmploymentType('契約社員')).toBe('fixed-term');
  });

  it('falls back to permanent when input is empty or non-matching', () => {
    expect(inferEmploymentType('')).toBe('permanent');
    expect(inferEmploymentType(null)).toBe('permanent');
    expect(inferEmploymentType('unknown employment type')).toBe('permanent');
  });
});
