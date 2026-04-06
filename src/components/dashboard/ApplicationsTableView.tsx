/**
 * ApplicationsTableView — Full table view with toolbar, filters, bulk actions, and JobTable.
 *
 * Extracted from the `default:` case in App.tsx's renderContent.
 */
import React from 'react';
import { JobApplication, JobStatus } from '../../types/job';
import type { CVProfile } from '../../types/job';
import type { FilterField } from '../../types/ui';
import { useApplicationFilters } from '../../hooks/useApplicationFilters';
import { useSelection } from '../../context/SelectionContext';
import { useTableFilters } from '../../context/TableFilterContext';
import { useUI } from '../../context/UIContext';

import { JobTable } from './JobTable';
import { TableToolbar } from '../common/TableToolbar';
import { FilterBar } from '../common/FilterBar';
import { BulkActionsBar } from '../common/BulkActionsBar';
import { FILTER_FIELDS } from '../../config/filterConfig';
import { STATUS_SELECT_OPTIONS } from '../../constants/status';

interface ApplicationsTableViewProps {
  applications: JobApplication[];
  displayCurrency: string;
  cvProfiles: CVProfile[];
  visibleColumns: string[];
  onStatusChange: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (app: JobApplication) => void;
  onRowClick: (app: JobApplication) => void;
  filterApplications: (term: string) => JobApplication[];
  onBulkDelete: () => void;
  onBulkStatus: () => void;
  onBulkOpenLinks: (kind: 'job' | 'website' | 'linkedin') => void;
}

export const ApplicationsTableView: React.FC<ApplicationsTableViewProps> = ({
  applications,
  displayCurrency,
  cvProfiles,
  visibleColumns,
  onStatusChange,
  onDelete,
  onEdit,
  onRowClick,
  filterApplications,
  onBulkDelete,
  onBulkStatus,
  onBulkOpenLinks,
}) => {
  const { setShowNewModal } = useUI();
  const {
    selectorMode, setSelectorMode, selectedIds, setSelectedIds,
    bulkStatus, setBulkStatus, bulkLinkKind, setBulkLinkKind,
  } = useSelection();
  const {
    searchTerm, setSearchTerm,
    showFilterRow, setShowFilterRow,
    filterField, setFilterField,
    filterValue, setFilterValue,
  } = useTableFilters();

  const searchedApplications = filterApplications(searchTerm);
  const { filterValueOptions, filteredApplications } = useApplicationFilters({
    applications,
    cvProfiles,
    filterField,
    filterValue,
    searchedApplications,
  });

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

  return (
    <div className="glass-container applications-card" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
      <TableToolbar
        title="Applications"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilterRow={showFilterRow}
        onToggleFilter={toggleFilterRow}
        selectorMode={selectorMode}
        onToggleSelector={toggleSelectorMode}
        actionButton={
          <button
            className="btn-apple btn-primary btn-new-app"
            style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
            onClick={() => setShowNewModal(true)}
          >
            + New Application
          </button>
        }
      />

      {showFilterRow && (
        <FilterBar
          filterField={filterField}
          onFilterFieldChange={(f) => {
            setFilterField(f as FilterField | '');
            setFilterValue('');
          }}
          filterValue={filterValue}
          onFilterValueChange={setFilterValue}
          fieldOptions={FILTER_FIELDS}
          valueOptions={filterValueOptions}
          onClear={() => { setFilterField(''); setFilterValue(''); }}
        />
      )}

      {selectorMode && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          bulkStatus={bulkStatus}
          onBulkStatusChange={setBulkStatus}
          onApplyBulkStatus={onBulkStatus}
          onBulkDelete={onBulkDelete}
          statusOptions={STATUS_SELECT_OPTIONS}
          linkActions={{
            bulkLinkKind,
            onBulkLinkKindChange: setBulkLinkKind,
            onOpenLinks: () => onBulkOpenLinks(bulkLinkKind),
          }}
        />
      )}

      <JobTable
        applications={filteredApplications}
        displayCurrency={displayCurrency}
        cvProfiles={cvProfiles}
        visibleColumns={visibleColumns}
        selectorMode={selectorMode}
        selectedIds={selectedIds}
        onToggleRowSelection={toggleRowSelection}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onEdit={onEdit}
        onRowClick={onRowClick}
      />
    </div>
  );
};
