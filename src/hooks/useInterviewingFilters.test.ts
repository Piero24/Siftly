import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useInterviewingFilters } from './useInterviewingFilters';
import { JobApplication } from '../types/job';

const makeApp = (overrides: Partial<JobApplication>): JobApplication => ({
  id: crypto.randomUUID(),
  company: 'Acme',
  sector: 'Technology',
  position: 'Engineer',
  country: 'US',
  city: 'New York',
  workType: 'remote',
  status: 'interviewing',
  salary: { amount: 100000, currency: 'USD' },
  date: '2026-01-01',
  links: { job: '#', linkedin: '#', website: '#' },
  ...overrides,
});

describe('useInterviewingFilters', () => {
  it('builds company options and filters by selected company', () => {
    const applications = [
      makeApp({ company: 'Beta' }),
      makeApp({ company: 'Acme' }),
    ];

    const { result, rerender } = renderHook(({ apps }) => useInterviewingFilters(apps), {
      initialProps: { apps: applications },
    });

    act(() => {
      result.current.setFilterField('company');
      result.current.setFilterValue('Acme');
    });
    rerender({ apps: applications });

    expect(result.current.filterValueOptions).toEqual([
      { value: 'Acme', label: 'Acme' },
      { value: 'Beta', label: 'Beta' },
    ]);
    expect(result.current.filteredApplications).toHaveLength(1);
    expect(result.current.filteredApplications[0].company).toBe('Acme');
  });

  it('applies search term over company and position', () => {
    const applications = [
      makeApp({ company: 'Google', position: 'Backend Engineer' }),
      makeApp({ company: 'Apple', position: 'iOS Engineer' }),
    ];

    const { result } = renderHook(() => useInterviewingFilters(applications));

    act(() => {
      result.current.setSearchTerm('ios');
    });

    expect(result.current.filteredApplications).toHaveLength(1);
    expect(result.current.filteredApplications[0].company).toBe('Apple');
  });
});
