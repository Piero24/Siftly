/**
 * TableToolbar — Shared toolbar for Applications and Interviewing table views.
 *
 * Renders a title, search bar, filter toggle, selector toggle, and optional
 * "New Application" action button.
 */
import React from 'react';
import { FilterIcon, UsersIcon } from './Icons';
import { SearchBar } from '../dashboard/SearchBar';

interface TableToolbarProps {
  title: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilterRow: boolean;
  onToggleFilter: () => void;
  selectorMode: boolean;
  onToggleSelector: () => void;
  /** Optional CTA shown on the right side of the toolbar. */
  actionButton?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  searchTerm,
  onSearchChange,
  showFilterRow,
  onToggleFilter,
  selectorMode,
  onToggleSelector,
  actionButton,
}) => {
  return (
    <div className="applications-toolbar">
      <div className="applications-toolbar-left">
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>
          {title}
        </h2>
        <SearchBar value={searchTerm} onChange={onSearchChange} />
      </div>
      <div className="applications-toolbar-right">
        <div className="applications-toolbar-actions">
          <button
            className={`btn-apple selection-toggle-btn ${showFilterRow ? 'is-active' : ''}`}
            onClick={onToggleFilter}
          >
            <FilterIcon size={14} />
            Filters
          </button>
          <button
            className={`btn-apple selection-toggle-btn ${selectorMode ? 'is-active' : ''}`}
            onClick={onToggleSelector}
          >
            <UsersIcon size={14} />
            {selectorMode ? 'Exit Selection' : 'Select Rows'}
          </button>
        </div>
        {actionButton}
      </div>
    </div>
  );
};
