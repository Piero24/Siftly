/**
 * normalizer.ts — Transform raw LinkedIn data into a JobApplication.
 *
 * Handles:
 * - Location parsing (city / country split)
 * - Salary parsing (ranges, currencies, periods)
 * - Date parsing (relative → ISO)
 * - Work type inference
 * - Description cleanup (HTML → clean text)
 *
 * @see PLAN.md §4 for normalization strategy.
 */

import type { RawLinkedInJob } from './types';
// import type { JobApplication } from '../../types/job';

// TODO: Phase B — Implement normalization functions
//
// export function normalizeJob(raw: RawLinkedInJob): JobApplication { ... }
// export function parseLocation(raw: string): { city: string; country: string } { ... }
// export function parseSalary(raw: string): { amount: number; currency: string; max?: number } { ... }
// export function parseRelativeDate(raw: string): string { ... }
// export function inferWorkType(hint: string): 'remote' | 'hybrid' | 'onsite' { ... }

// Placeholder export.
export const NORMALIZER_VERSION = '0.0.0';
