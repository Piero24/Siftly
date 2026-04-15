/**
 * InterviewingView — Table view for applications in the "interviewing" status.
 *
 * Orchestrates filtering, bulk selection, and delegates row rendering
 * to extracted sub-components in `./interviewing/`.
 */
import React, { useState } from 'react';
import { JobApplication, JobStatus } from '../../types/job';
import { SearchBar } from './SearchBar';
import { useInterviewingFilters } from '../../hooks/useInterviewingFilters';
import {
  INTERVIEWING_FILTER_FIELDS,
  INTERVIEWING_STATUS_OPTIONS,
} from '../../config/interviewingFilterConfig';
import { useSettings } from '../../context/SettingsContext';
import { FilterIcon, UsersIcon, XCircleIcon, CheckCircleIcon, TrashIcon } from '../common/Icons';

import { InterviewRow } from './interviewing/InterviewRow';
import { InterviewTableHeader } from './interviewing/InterviewTableHeader';

interface InterviewingViewProps {
  applications: JobApplication[];
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onRowClick: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

export const InterviewingView: React.FC<InterviewingViewProps> = ({
  applications,
  onStatusChange,
  onRowClick,
  onDelete,
}) => {
  const { useSoftIconBackground } = useSettings();
  const {
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
  } = useInterviewingFilters(applications);

  const [selectorMode, setSelectorMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<JobStatus>('applied');

  // ── Bulk selection handlers ──

  const toggleSelectorMode = () => {
    setSelectorMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleApplicationIds = filteredApplications.map((app) => app.id);
  const allVisibleSelected =
    visibleApplicationIds.length > 0 && visibleApplicationIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleApplicationIds.some((id) => selectedIds.has(id));

  const toggleAllVisibleRowsSelection = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleApplicationIds.forEach((id) => next.add(id));
      } else {
        visibleApplicationIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const mobileSelectAllRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (mobileSelectAllRef.current) {
      mobileSelectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const handleBulkStatus = () => {
    if (selectedIds.size === 0) return;
    [...selectedIds].forEach((id) => onStatusChange(id, bulkStatus));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected applications?`)) return;
    [...selectedIds].forEach((id) => onDelete(id));
    setSelectedIds(new Set());
  };

  // ── Empty state ──

  if (applications.length === 0) {
    return (
      <div
        className="glass-container applications-card"
        style={{
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          No Applications in Interviewing
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          When an application status is changed to &quot;Interviewing&quot;, it will appear here.
        </p>
      </div>
    );
  }

  // ── Main table view ──

  return (
    <div
      className="glass-container applications-card"
      style={{ maxWidth: '1600px', width: '100%', margin: '0 auto' }}
    >
      {/* Toolbar */}
      <div className="applications-toolbar">
        <div className="applications-toolbar-left">
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>
            Interviewing
          </h2>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="applications-toolbar-right">
          <div className="applications-toolbar-actions">
            <button
              className={`btn-apple selection-toggle-btn ${showFilterRow ? 'is-active' : ''}`}
              onClick={toggleFilterRow}
            >
              <FilterIcon size={14} />
              Filters
            </button>
            <button
              className={`btn-apple selection-toggle-btn ${selectorMode ? 'is-active' : ''}`}
              onClick={toggleSelectorMode}
            >
              <UsersIcon size={14} />
              {selectorMode ? 'Exit Selection' : 'Select Rows'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter row */}
      {showFilterRow && (
        <div className="filter-actions-bar">
          <div className="filter-actions-group filter-actions-left">
            <span className="bulk-actions-count">Filter</span>
            <select
              className="apple-select bulk-actions-status filter-select"
              value={filterField}
              onChange={(e) => {
                setFilterField(e.target.value as 'company' | 'position' | 'date' | 'nextRound');
                setFilterValue('');
              }}
            >
              <option value="">Filter by...</option>
              {INTERVIEWING_FILTER_FIELDS.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>

            <select
              className="apple-select bulk-actions-status filter-select"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              disabled={!filterField}
            >
              <option value="">Value...</option>
              {filterValueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions-group filter-actions-right">
            <button
              className="btn-apple btn-outline bulk-actions-btn"
              onClick={clearFilters}
              disabled={!filterField && !filterValue}
            >
              <XCircleIcon size={14} /> Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {selectorMode && (
        <>
          <div className="bulk-select-all-mobile">
            <label className="bulk-select-all-mobile-label">
              <input
                ref={mobileSelectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => toggleAllVisibleRowsSelection(e.target.checked)}
                aria-label="Select or unselect all visible rows"
              />
              <span>Select all visible rows</span>
            </label>
          </div>

          <div className="bulk-actions-bar">
            <div className="bulk-actions-group bulk-actions-left">
              <span className="bulk-actions-count">{selectedIds.size} selected</span>
              <select
                className="apple-select bulk-actions-status"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as JobStatus)}
              >
                {INTERVIEWING_STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
              <button
                className="btn-apple btn-outline bulk-actions-btn"
                disabled={selectedIds.size === 0}
                onClick={handleBulkStatus}
              >
                <CheckCircleIcon size={14} />
                Change Status
              </button>
            </div>

            <div className="bulk-actions-group bulk-actions-right">
              <button
                className="btn-apple btn-destructive bulk-actions-btn"
                disabled={selectedIds.size === 0}
                onClick={handleBulkDelete}
              >
                <TrashIcon size={14} />
                Delete Selected
              </button>
            </div>
          </div>
        </>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table
          className="job-table interview-table"
          style={{ borderCollapse: 'collapse', width: '100%' }}
        >
          <InterviewTableHeader
            selectorMode={selectorMode}
            allRowsSelected={allVisibleSelected}
            someRowsSelected={someVisibleSelected}
            onToggleAllRowsSelection={toggleAllVisibleRowsSelection}
          />
          <tbody>
            {filteredApplications.map((app) => (
              <InterviewRow
                key={app.id}
                app={app}
                selectorMode={selectorMode}
                isSelected={selectedIds.has(app.id)}
                onToggleSelection={toggleRowSelection}
                onStatusChange={onStatusChange}
                onRowClick={onRowClick}
                useSoftIconBackground={useSoftIconBackground}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
