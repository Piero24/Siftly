/**
 * filterConfig.ts — Filter field and option definitions for the Applications table.
 *
 * Status, work-type, and employment options are imported from the shared
 * constants module (src/constants/status.ts) to maintain a single source of truth.
 */
import { FilterField } from '../types/ui';
import {
  STATUS_SELECT_OPTIONS,
  WORK_TYPE_SELECT_OPTIONS,
  EMPLOYMENT_SELECT_OPTIONS,
} from '../constants/status';

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

export {
  STATUS_SELECT_OPTIONS as STATUS_OPTIONS,
  WORK_TYPE_SELECT_OPTIONS as WORK_TYPE_OPTIONS,
  EMPLOYMENT_SELECT_OPTIONS as EMPLOYMENT_OPTIONS,
};
