import { useMemo, useState } from 'react';

import { JobApplication, InterviewRound } from '../types/job';
import { InterviewingFilterField } from '../config/interviewingFilterConfig';

interface SelectOption {
  value: string;
  label: string;
}

const uniqueSortedValues = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  values.forEach((value) => {
    const trimmed = (value ?? '').trim();
    if (trimmed) seen.add(trimmed);
  });
  return [...seen].sort((a, b) => a.localeCompare(b));
};

const getNextRoundDate = (rounds?: InterviewRound[]) => {
  if (!rounds) return '';
  const sorted = [...rounds].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const now = new Date().getTime();
  const nextRound = sorted.find((round) => round.date && new Date(round.date).getTime() > now);
  return nextRound
    ? new Date(nextRound.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';
};

export const useInterviewingFilters = (applications: JobApplication[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [filterField, setFilterField] = useState<InterviewingFilterField | ''>('');
  const [filterValue, setFilterValue] = useState('');

  const searchedApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return applications;
    return applications.filter((app) => app.company.toLowerCase().includes(term) || app.position.toLowerCase().includes(term));
  }, [applications, searchTerm]);

  const filterValueOptions = useMemo<SelectOption[]>(() => {
    switch (filterField) {
      case 'company':
        return uniqueSortedValues(applications.map((app) => app.company)).map((value) => ({ value, label: value }));
      case 'position':
        return uniqueSortedValues(applications.map((app) => app.position)).map((value) => ({ value, label: value }));
      case 'date':
        return uniqueSortedValues(applications.map((app) => app.date)).map((value) => ({
          value,
          label: new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        }));
      case 'nextRound':
        return uniqueSortedValues(applications.map((app) => getNextRoundDate(app.rounds))).map((value) => ({ value, label: value }));
      default:
        return [];
    }
  }, [applications, filterField]);

  const filteredApplications = useMemo(() => {
    if (!filterField || !filterValue) return searchedApplications;

    const normalizedFilter = filterValue.trim().toLowerCase();
    return searchedApplications.filter((app) => {
      if (filterField === 'company') return app.company.trim().toLowerCase() === normalizedFilter;
      if (filterField === 'position') return app.position.trim().toLowerCase() === normalizedFilter;
      if (filterField === 'date') return app.date === filterValue;
      if (filterField === 'nextRound') return getNextRoundDate(app.rounds) === filterValue;
      return true;
    });
  }, [searchedApplications, filterField, filterValue]);

  const toggleFilterRow = () => {
    setShowFilterRow((prev) => {
      const next = !prev;
      if (!next) {
        setFilterField('');
        setFilterValue('');
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilterField('');
    setFilterValue('');
  };

  return {
    searchTerm,
    setSearchTerm,
    showFilterRow,
    filterField,
    setFilterField,
    filterValue,
    setFilterValue,
    filterValueOptions,
    filteredApplications,
    toggleFilterRow,
    clearFilters,
  };
};
