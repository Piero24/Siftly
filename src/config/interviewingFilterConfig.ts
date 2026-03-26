import { JobStatus } from '../types/job';

export type InterviewingFilterField = 'company' | 'position' | 'date' | 'nextRound';

export const INTERVIEWING_FILTER_FIELDS: Array<{ value: InterviewingFilterField; label: string }> = [
  { value: 'company', label: 'Company' },
  { value: 'position', label: 'Position' },
  { value: 'date', label: 'Applied Date' },
  { value: 'nextRound', label: 'Next Round Date' },
];

export const INTERVIEWING_STATUS_OPTIONS: Array<{ value: JobStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no-response', label: 'No Response' },
];
