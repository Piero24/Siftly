import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useApplicationFilters } from './useApplicationFilters';
import { CVProfile, JobApplication } from '../types/job';

const makeApp = (overrides: Partial<JobApplication>): JobApplication => ({
  id: crypto.randomUUID(),
  company: 'Acme',
  sector: 'Technology',
  position: 'Engineer',
  country: 'US',
  city: 'New York',
  workType: 'remote',
  status: 'applied',
  salary: { amount: 100000, currency: 'USD' },
  date: '2026-01-01',
  links: { job: '#', linkedin: '#', website: '#' },
  ...overrides,
});

const cvProfiles: CVProfile[] = [
  { id: 'cv-default', name: 'Default CV', color: '#007AFF' },
  { id: 'cv-alt', name: 'Alternative CV', color: '#34C759' },
];

describe('useApplicationFilters', () => {
  it('builds unique sorted company options', () => {
    const applications = [
      makeApp({ company: 'Beta' }),
      makeApp({ company: 'Acme' }),
      makeApp({ company: 'Acme' }),
    ];

    const { result } = renderHook(() =>
      useApplicationFilters({
        applications,
        cvProfiles,
        filterField: 'company',
        filterValue: '',
        searchedApplications: applications,
      })
    );

    expect(result.current.filterValueOptions).toEqual([
      { value: 'Acme', label: 'Acme' },
      { value: 'Beta', label: 'Beta' },
    ]);
  });

  it('includes special options for referrer link filtering', () => {
    const applications = [
      makeApp({
        referral: { referrer: 'A', date: '2026-01-01', note: 'n', link: 'https://x.com/ref' },
      }),
      makeApp({ referral: { referrer: 'B', date: '2026-01-02', note: 'n' } }),
    ];

    const { result } = renderHook(() =>
      useApplicationFilters({
        applications,
        cvProfiles,
        filterField: 'referrerLink',
        filterValue: '',
        searchedApplications: applications,
      })
    );

    expect(result.current.filterValueOptions).toEqual([
      { value: '__has__', label: 'Has Referrer Link' },
      { value: '__none__', label: 'No Referrer Link' },
      { value: 'https://x.com/ref', label: 'https://x.com/ref' },
    ]);
  });

  it('filters by cvProfile none sentinel value', () => {
    const withProfile = makeApp({ cvProfileId: 'cv-default' });
    const withoutProfile = makeApp({ cvProfileId: undefined });
    const searchedApplications = [withProfile, withoutProfile];

    const { result } = renderHook(() =>
      useApplicationFilters({
        applications: searchedApplications,
        cvProfiles,
        filterField: 'cvProfile',
        filterValue: '__none__',
        searchedApplications,
      })
    );

    expect(result.current.filteredApplications).toEqual([withoutProfile]);
  });

  it('filters by exact status value', () => {
    const interviewed = makeApp({ status: 'interviewing' });
    const applied = makeApp({ status: 'applied' });
    const searchedApplications = [interviewed, applied];

    const { result } = renderHook(() =>
      useApplicationFilters({
        applications: searchedApplications,
        cvProfiles,
        filterField: 'status',
        filterValue: 'interviewing',
        searchedApplications,
      })
    );

    expect(result.current.filteredApplications).toEqual([interviewed]);
  });
});
