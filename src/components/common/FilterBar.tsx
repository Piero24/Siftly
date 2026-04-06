/**
 * FilterBar — Shared filter row for table views.
 *
 * Renders a field selector, value selector, and clear button.
 */
import React from 'react';
import { XCircleIcon } from './Icons';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filterField: string;
  onFilterFieldChange: (field: string) => void;
  filterValue: string;
  onFilterValueChange: (value: string) => void;
  fieldOptions: FilterOption[];
  valueOptions: FilterOption[];
  onClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterField,
  onFilterFieldChange,
  filterValue,
  onFilterValueChange,
  fieldOptions,
  valueOptions,
  onClear,
}) => {
  return (
    <div className="filter-actions-bar">
      <div className="filter-actions-group filter-actions-left">
        <span className="bulk-actions-count">Filter</span>
        <select
          className="apple-select bulk-actions-status filter-select"
          value={filterField}
          onChange={(e) => {
            onFilterFieldChange(e.target.value);
          }}
        >
          <option value="">Filter by...</option>
          {fieldOptions.map((field) => (
            <option key={field.value} value={field.value}>{field.label}</option>
          ))}
        </select>

        <select
          className="apple-select bulk-actions-status filter-select"
          value={filterValue}
          onChange={(e) => onFilterValueChange(e.target.value)}
          disabled={!filterField}
        >
          <option value="">Value...</option>
          {valueOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-actions-group filter-actions-right">
        <button
          className="btn-apple btn-outline bulk-actions-btn"
          onClick={onClear}
          disabled={!filterField && !filterValue}
        >
          <XCircleIcon size={14} />
          Clear Filter
        </button>
      </div>
    </div>
  );
};
