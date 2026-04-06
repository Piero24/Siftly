/**
 * status.ts — Single source of truth for status, work-type, and employment-type
 * option arrays used across filters, forms, and bulk actions.
 */
import { EmploymentType, JobStatus, WorkType } from '../types/job';
import type { SelectOption } from '../types/ui';

export const STATUS_OPTIONS: Array<{ value: JobStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'declined', label: 'Declined' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no-response', label: 'No Response' },
];

export const WORK_TYPE_OPTIONS: Array<{ value: WorkType; label: string }> = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export const EMPLOYMENT_TYPE_OPTIONS: Array<{ value: EmploymentType; label: string }> = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'intern', label: 'Intern' },
  { value: 'fixed-term', label: 'Fixed-Term' },
];

/** Status options formatted as generic SelectOption (for filter dropdowns). */
export const STATUS_SELECT_OPTIONS: SelectOption[] = STATUS_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export const WORK_TYPE_SELECT_OPTIONS: SelectOption[] = WORK_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export const EMPLOYMENT_SELECT_OPTIONS: SelectOption[] = [
  ...EMPLOYMENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  { value: '__none__', label: 'Not specified' },
];

export const LINK_KIND_OPTIONS = [
  { value: 'job', label: 'Job Links' },
  { value: 'website', label: 'Websites' },
  { value: 'linkedin', label: 'LinkedIn' },
] as const;
