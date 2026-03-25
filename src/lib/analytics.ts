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
  accepted:     number;
  rejected:     number;
  'no-response': number;
}

export function getStatusCounts(apps: JobApplication[]): StatusCounts {
  const zero: StatusCounts = {
    total: apps.length, pending: 0, applied: 0,
    interviewing: 0, offer: 0, accepted: 0, rejected: 0, 'no-response': 0,
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
