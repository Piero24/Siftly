import { useMemo } from 'react';

import { FilterField, SelectOption } from '../types/ui';
import { EMPLOYMENT_OPTIONS, STATUS_OPTIONS, WORK_TYPE_OPTIONS } from '../config/filterConfig';
import { CVProfile, JobApplication } from '../types/job';

interface UseApplicationFiltersArgs {
  applications: JobApplication[];
  cvProfiles: CVProfile[];
  filterField: FilterField | '';
  filterValue: string;
  searchedApplications: JobApplication[];
}

const normalizeValue = (value?: string) => (value ?? '').trim().toLowerCase();

const uniqueSortedValues = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  values.forEach((value) => {
    const trimmed = (value ?? '').trim();
    if (trimmed) seen.add(trimmed);
  });
  return [...seen].sort((a, b) => a.localeCompare(b));
};

export const useApplicationFilters = ({
  applications,
  cvProfiles,
  filterField,
  filterValue,
  searchedApplications,
}: UseApplicationFiltersArgs) => {
  const filterValueOptions = useMemo<SelectOption[]>(() => {
    switch (filterField) {
      case 'company':
        return uniqueSortedValues(applications.map((app) => app.company)).map((item) => ({
          value: item,
          label: item,
        }));
      case 'sector':
        return uniqueSortedValues(applications.map((app) => app.sector)).map((item) => ({
          value: item,
          label: item,
        }));
      case 'country':
        return uniqueSortedValues(applications.map((app) => app.country)).map((item) => ({
          value: item,
          label: item,
        }));
      case 'city':
        return uniqueSortedValues(applications.map((app) => app.city)).map((item) => ({
          value: item,
          label: item,
        }));
      case 'workType':
        return WORK_TYPE_OPTIONS;
      case 'employmentType':
        return EMPLOYMENT_OPTIONS;
      case 'status':
        return STATUS_OPTIONS;
      case 'cvProfile': {
        const withProfile = cvProfiles.map((profile) => ({
          value: profile.id,
          label: profile.name,
        }));
        return [...withProfile, { value: '__none__', label: 'No CV Profile' }];
      }
      case 'referrerName':
        return [
          ...uniqueSortedValues(applications.map((app) => app.referral?.referrer)).map((item) => ({
            value: item,
            label: item,
          })),
          { value: '__none__', label: 'No Referrer Name' },
        ];
      case 'referrerCode':
        return [
          ...uniqueSortedValues(applications.map((app) => app.referral?.code)).map((item) => ({
            value: item,
            label: item,
          })),
          { value: '__none__', label: 'No Referrer Code' },
        ];
      case 'referrerLink':
        return [
          { value: '__has__', label: 'Has Referrer Link' },
          { value: '__none__', label: 'No Referrer Link' },
          ...uniqueSortedValues(applications.map((app) => app.referral?.link)).map((item) => ({
            value: item,
            label: item,
          })),
        ];
      default:
        return [];
    }
  }, [applications, cvProfiles, filterField]);

  const filteredApplications = useMemo(() => {
    if (!filterField || !filterValue) return searchedApplications;

    return searchedApplications.filter((app) => {
      switch (filterField) {
        case 'company':
          return normalizeValue(app.company) === normalizeValue(filterValue);
        case 'sector':
          return normalizeValue(app.sector) === normalizeValue(filterValue);
        case 'country':
          return app.country === filterValue;
        case 'city':
          return normalizeValue(app.city) === normalizeValue(filterValue);
        case 'workType':
          return app.workType === filterValue;
        case 'employmentType':
          return filterValue === '__none__'
            ? !app.employmentType
            : app.employmentType === filterValue;
        case 'status':
          return app.status === filterValue;
        case 'cvProfile':
          return filterValue === '__none__' ? !app.cvProfileId : app.cvProfileId === filterValue;
        case 'referrerName':
          return filterValue === '__none__'
            ? !app.referral?.referrer?.trim()
            : normalizeValue(app.referral?.referrer) === normalizeValue(filterValue);
        case 'referrerCode':
          return filterValue === '__none__'
            ? !app.referral?.code?.trim()
            : normalizeValue(app.referral?.code) === normalizeValue(filterValue);
        case 'referrerLink':
          if (filterValue === '__has__') return !!app.referral?.link?.trim();
          if (filterValue === '__none__') return !app.referral?.link?.trim();
          return normalizeValue(app.referral?.link) === normalizeValue(filterValue);
        default:
          return true;
      }
    });
  }, [filterField, filterValue, searchedApplications]);

  return {
    filterValueOptions,
    filteredApplications,
  };
};
