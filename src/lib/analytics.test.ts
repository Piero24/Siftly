/** @vitest-environment node */
import { describe, expect, it } from 'vitest';

import {
  getStatusCounts,
  getTopCompaniesByRejections,
  getWorkTypeStats,
  getApplicationTimeline,
  getStatusFunnel,
  getResponseRate,
  getSalaryDistribution,
} from './analytics';
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

  it('computes response rate correctly', () => {
    const apps: JobApplication[] = [
      makeApp({ status: 'rejected' }), // responded
      makeApp({ status: 'offer' }), // responded
      makeApp({ status: 'no-response' }), // no-response
      makeApp({ status: 'applied' }), // pending
    ];

    const stats = getResponseRate(apps);
    expect(stats.responded).toBe(2);
    expect(stats.noResponse).toBe(1);
    expect(stats.pending).toBe(1);
  });

  it('computes status funnel correctly', () => {
    const apps: JobApplication[] = [
      makeApp({ status: 'applied' }),
      makeApp({ status: 'interviewing' }),
      makeApp({ status: 'offer' }),
    ];

    const funnel = getStatusFunnel(apps);
    expect(funnel.find((s) => s.stage === 'Applied')?.count).toBe(3);
    expect(funnel.find((s) => s.stage === 'Interviewing')?.count).toBe(2);
    expect(funnel.find((s) => s.stage === 'Offer')?.count).toBe(1);
  });

  it('computes salary distribution correctly', () => {
    const apps: JobApplication[] = [
      makeApp({ salary: { amount: 50000, currency: 'USD' } }),
      makeApp({ salary: { amount: 75000, currency: 'USD' } }),
      makeApp({ salary: { amount: 120000, currency: 'USD' } }),
    ];

    const dist = getSalaryDistribution(apps);
    // With max 120k, step is 25k. 50k is in 50k–75k, 75k is in 75k–100k, 120k is in 100k–125k
    expect(dist.find((d) => d.range === '50k–75k')?.count).toBe(1);
    expect(dist.find((d) => d.range === '75k–100k')?.count).toBe(1);
    expect(dist.find((d) => d.range === '100k–125k')?.count).toBe(1);
  });
});
