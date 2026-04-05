import { FilterField, SelectOption } from '../types/ui';

export const FILTER_FIELDS: Array<{ value: FilterField; label: string }> = [
  { value: 'company', label: 'Company' },
  { value: 'sector', label: 'Sector' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'workType', label: 'Work Type' },
  { value: 'employmentType', label: 'Employment Type' },
  { value: 'status', label: 'Status' },
  { value: 'cvProfile', label: 'CV Profile' },
  { value: 'referrerName', label: 'Referrer Name' },
  { value: 'referrerCode', label: 'Referrer Code' },
  { value: 'referrerLink', label: 'Referrer Link' },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'declined', label: 'Declined' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no-response', label: 'No Response' },
];

export const WORK_TYPE_OPTIONS: SelectOption[] = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export const EMPLOYMENT_OPTIONS: SelectOption[] = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'intern', label: 'Intern' },
  { value: 'fixed-term', label: 'Fixed-term' },
  { value: '__none__', label: 'Not specified' },
];
