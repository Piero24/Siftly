/**
 * analytics.ts — Pure aggregation functions over JobApplication[].
 * All dashboard stats are derived here; components stay dumb.
 */

import { CVProfile, EmploymentType, JobApplication, JobStatus, WorkType } from '../types/job';
import { getContinent, Continent } from './continents';

/* ── Status counts ──────────────────────────────────────────── */
export interface StatusCounts {
  total:        number;
  pending:      number;
  applied:      number;
  interviewing: number;
  offer:        number;
  declined:     number;
  accepted:     number;
  rejected:     number;
  'no-response': number;
}

export function getStatusCounts(apps: JobApplication[]): StatusCounts {
  const zero: StatusCounts = {
    total: apps.length, pending: 0, applied: 0,
    interviewing: 0, offer: 0, declined: 0, accepted: 0, rejected: 0, 'no-response': 0,
  };
  return apps.reduce((acc, app) => {
    const s = app.status as JobStatus;
    if (s in acc) (acc as any)[s]++;
    return acc;
  }, zero);
}

/* ── Continent breakdown ──────────────────────────────────────── */
export interface ContinentStat {
  name:  Continent;
  count: number;
}

export function getContinentStats(apps: JobApplication[]): ContinentStat[] {
  const map = new Map<Continent, number>();
  for (const app of apps) {
    const c = getContinent(app.country);
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/* ── Work type breakdown ──────────────────────────────────────── */
export interface WorkTypeStat {
  name:  WorkType;
  count: number;
}

export function getWorkTypeStats(apps: JobApplication[]): WorkTypeStat[] {
  const map = new Map<WorkType, number>();
  for (const app of apps) {
    const w = app.workType;
    map.set(w, (map.get(w) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/* ── CV breakdown ─────────────────────────────────────────────── */
export interface CvStat {
  id: string;
  name: string;
  color: string;
  count: number;
}

export function getCvStats(apps: JobApplication[], profiles: CVProfile[]): CvStat[] {
  const map = new Map<string, number>();

  for (const app of apps) {
    if (!app.cvProfileId) continue;
    map.set(app.cvProfileId, (map.get(app.cvProfileId) ?? 0) + 1);
  }

  return profiles
    .map((profile) => ({
      id: profile.id,
      name: profile.name,
      color: profile.color,
      count: map.get(profile.id) ?? 0,
    }))
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.count - a.count);
}

/* ── Employment type breakdown ────────────────────────────────── */
export interface EmploymentTypeStat {
  name: EmploymentType;
  count: number;
}

export function getEmploymentTypeStats(apps: JobApplication[]): EmploymentTypeStat[] {
  const map = new Map<EmploymentType, number>([
    ['permanent', 0],
    ['intern', 0],
    ['fixed-term', 0],
  ]);

  for (const app of apps) {
    const type = app.employmentType ?? 'permanent';
    map.set(type, (map.get(type) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/* ── Country heat (for the world map) ──────────────────────────── */
export interface CountryStat {
  code:  string; // ISO alpha-2
  count: number;
}

export function getCountryStats(apps: JobApplication[]): CountryStat[] {
  const map = new Map<string, number>();
  for (const app of apps) {
    const c = app.country.toUpperCase();
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  return [...map.entries()].map(([code, count]) => ({ code, count }));
}

/* ── Top-N companies ────────────────────────────────────────────── */
export interface CompanyStat {
  name:  string;
  count: number;
  logo?: string;
  website?: string;
  linkedin?: string;
}

export function getTopCompaniesByApplications(
  apps: JobApplication[], n = 8,
): CompanyStat[] {
  const map = new Map<string, { count: number; logo?: string; website?: string; linkedin?: string }>();
  for (const app of apps) {
    const c = normalise(app.company);
    const existing = map.get(c) ?? { count: 0, logo: undefined, website: undefined, linkedin: undefined };
    map.set(c, {
      count: existing.count + 1,
      logo: existing.logo || app.logo,
      website: existing.website || app.links?.website,
      linkedin: existing.linkedin || app.links?.linkedin
    });
  }
  return [...map.entries()]
    .map(([name, { count, logo, website, linkedin }]) => ({ name, count, logo, website, linkedin }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function getTopCompaniesByRejections(
  apps: JobApplication[], n = 8,
): CompanyStat[] {
  const rejected = apps.filter((a) => a.status === 'rejected');
  return getTopCompaniesByApplications(rejected, n);
}

/* ── Top-N cities ─────────────────────────────────────────────── */
export interface CityStat {
  name: string;
  count: number;
}

export function getTopCitiesByApplications(
  apps: JobApplication[], n = 8,
): CityStat[] {
  const map = new Map<string, number>();

  for (const app of apps) {
    const city = normalise(app.city);
    if (!city) continue;
    map.set(city, (map.get(city) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

function normalise(name: string): string {
  return name.trim().split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/* ── Application timeline (weekly buckets) ────────────── */
export interface TimelineBucket {
  week: string;   // ISO date string of the Monday
  count: number;
}

export function getApplicationTimeline(
  apps: JobApplication[],
  weeks = 12,
): TimelineBucket[] {
  const now = new Date();
  // Find the Monday of the current week
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);

  // Build empty buckets
  const buckets: TimelineBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const monday = new Date(currentMonday);
    monday.setDate(monday.getDate() - i * 7);
    buckets.push({
      week: monday.toISOString().split('T')[0],
      count: 0,
    });
  }

  // Fill buckets
  for (const app of apps) {
    if (!app.date) continue;
    const appDate = new Date(app.date);
    const appDay = appDate.getDay();
    const appMondayOffset = appDay === 0 ? -6 : 1 - appDay;
    const appMonday = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate() + appMondayOffset);
    const weekKey = appMonday.toISOString().split('T')[0];

    const bucket = buckets.find((b) => b.week === weekKey);
    if (bucket) bucket.count++;
  }

  return buckets;
}

/* ── Status funnel ────────────────────────────────────── */
export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export function getStatusFunnel(apps: JobApplication[]): FunnelStage[] {
  const total = apps.length || 1;
  const stages = [
    { stage: 'Applied', statuses: ['applied', 'pending'] as JobStatus[], color: '#007AFF' },
    { stage: 'Interviewing', statuses: ['interviewing'] as JobStatus[], color: '#34C759' },
    { stage: 'Offer', statuses: ['offer'] as JobStatus[], color: '#AF52DE' },
    { stage: 'Accepted', statuses: ['accepted'] as JobStatus[], color: '#30D158' },
  ];

  // For a funnel, each stage includes all downstream stages too
  const stageCounts = stages.map(({ stage, statuses, color }) => {
    const count = apps.filter((app) => statuses.includes(app.status)).length;
    return { stage, count, percentage: Math.round((count / total) * 100), color };
  });

  // Make it cumulative-like: Applied should include all apps at that stage or further
  const cumulativeCounts: FunnelStage[] = [];
  let cumulative = 0;
  for (let i = stageCounts.length - 1; i >= 0; i--) {
    cumulative += stageCounts[i].count;
    cumulativeCounts.unshift({
      ...stageCounts[i],
      count: cumulative,
      percentage: Math.round((cumulative / total) * 100),
    });
  }

  return cumulativeCounts;
}

/* ── Response rate ────────────────────────────────────── */
export interface ResponseRate {
  responded: number;
  noResponse: number;
  pending: number;
}

export function getResponseRate(apps: JobApplication[]): ResponseRate {
  let responded = 0;
  let noResponse = 0;
  let pending = 0;

  for (const app of apps) {
    if (['interviewing', 'offer', 'declined', 'accepted', 'rejected'].includes(app.status)) {
      responded++;
    } else if (app.status === 'no-response') {
      noResponse++;
    } else {
      pending++;
    }
  }

  return { responded, noResponse, pending };
}

/* ── Salary distribution ──────────────────────────────── */
export interface SalaryBucket {
  range: string;
  count: number;
  min: number;
  max: number;
}

export function getSalaryDistribution(apps: JobApplication[]): SalaryBucket[] {
  // Only consider apps with salary > 0
  const salaries = apps
    .filter((app) => app.salary && app.salary.amount > 0)
    .map((app) => app.salary.amount);

  if (salaries.length === 0) return [];

  const maxSalary = Math.max(...salaries);

  // Create dynamic ranges
  let step: number;
  if (maxSalary <= 50000) step = 10000;
  else if (maxSalary <= 150000) step = 25000;
  else if (maxSalary <= 500000) step = 50000;
  else step = 100000;

  const buckets: SalaryBucket[] = [];
  for (let min = 0; min < maxSalary + step; min += step) {
    const max = min + step;
    const count = salaries.filter((s) => s >= min && s < max).length;
    if (count > 0) {
      buckets.push({
        range: `${formatK(min)}–${formatK(max)}`,
        count,
        min,
        max,
      });
    }
  }

  return buckets;
}

function formatK(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

