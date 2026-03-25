import { describe, expect, it } from 'vitest';

import { getStatusCounts, getTopCompaniesByRejections, getWorkTypeStats } from './analytics';
import { JobApplication } from '../types/job';

const makeApp = (overrides: Partial<JobApplication>): JobApplication => ({
  id: crypto.randomUUID(),
  company: 'Acme',
  sector: 'Tech',
  position: 'Engineer',
  country: 'US',
  city: 'New York',
  workType: 'hybrid',
  status: 'applied',
  salary: { amount: 100000, currency: 'USD' },
  date: '2026-03-01',
  links: {
    job: '#',
    linkedin: '#',
    website: '#',
  },
  ...overrides,
});

describe('analytics', () => {
  it('counts statuses correctly', () => {
    const apps: JobApplication[] = [
      makeApp({ status: 'applied' }),
      makeApp({ status: 'offer' }),
      makeApp({ status: 'rejected' }),
      makeApp({ status: 'rejected' }),
    ];

    const counts = getStatusCounts(apps);

    expect(counts.total).toBe(4);
    expect(counts.applied).toBe(1);
    expect(counts.offer).toBe(1);
    expect(counts.rejected).toBe(2);
  });

  it('returns work type stats ordered by count', () => {
    const apps: JobApplication[] = [
      makeApp({ workType: 'remote' }),
      makeApp({ workType: 'remote' }),
      makeApp({ workType: 'onsite' }),
    ];

    const stats = getWorkTypeStats(apps);

    expect(stats[0]).toEqual({ name: 'remote', count: 2 });
    expect(stats[1]).toEqual({ name: 'onsite', count: 1 });
  });

  it('computes top rejected companies', () => {
    const apps: JobApplication[] = [
      makeApp({ company: 'Acme', status: 'rejected' }),
      makeApp({ company: 'Acme', status: 'rejected' }),
      makeApp({ company: 'Beta', status: 'rejected' }),
      makeApp({ company: 'Gamma', status: 'applied' }),
    ];

    const top = getTopCompaniesByRejections(apps, 2);

    expect(top).toHaveLength(2);
    expect(top[0].name).toBe('Acme');
    expect(top[0].count).toBe(2);
    expect(top[1].name).toBe('Beta');
    expect(top[1].count).toBe(1);
  });
});
