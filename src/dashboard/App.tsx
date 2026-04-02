import React from 'react';
import 'flag-icons/css/flag-icons.min.css';

import { Navbar } from '../components/layout/Navbar';
import { SearchBar } from '../components/dashboard/SearchBar';
import { JobTable } from '../components/dashboard/JobTable';
import { JobDetailModal } from '../components/dashboard/JobDetailModal';
import { NewApplicationModal } from '../components/dashboard/NewApplicationModal';
import { DashboardView } from '../components/dashboard/DashboardView';
import { SettingsView } from '../components/dashboard/SettingsView';
import { InterviewingView } from '../components/dashboard/InterviewingView';
import { AccountView } from '../components/dashboard/AccountView';
import { LoginPage } from '../components/auth/LoginPage';
import { DebugToolbar } from '../components/debug/DebugToolbar';
import { CheckCircleIcon, FilterIcon, GlobeIcon, LinkIcon, LinkedinIcon, TrashIcon, UsersIcon, XCircleIcon } from '../components/common/Icons';
import { useJobApplications } from '../hooks/useJobApplications';
import { useApplicationFilters } from '../hooks/useApplicationFilters';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useSelection } from '../context/SelectionContext';
import { useTableFilters } from '../context/TableFilterContext';
import { useToast } from '../context/ToastContext';
import { JobApplication, JobStatus } from '../types/job';
import { FilterField } from '../types/ui';
import { FILTER_FIELDS, STATUS_OPTIONS } from '../config/filterConfig';
import { FEATURES } from '../config/features';

const LINK_KIND_OPTIONS = [
  { value: 'job', label: 'Job Links' },
  { value: 'website', label: 'Websites' },
  { value: 'linkedin', label: 'LinkedIn' },
] as const;

const App: React.FC = () => {
  const {
    currency,
    autoNoResponse,
    autoNoResponseDays,
    cvProfiles,
    storageMode,
    tableDisplay,
  } = useSettings();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const {
    currentView,
    setCurrentView,
    selectedJob,
    setSelectedJob,
    editingJob,
    setEditingJob,
    showNewModal,
    setShowNewModal,
  } = useUI();
  const {
    selectorMode,
    setSelectorMode,
    selectedIds,
    setSelectedIds,
    bulkStatus,
    setBulkStatus,
    bulkLinkKind,
    setBulkLinkKind,
  } = useSelection();
  const {
    searchTerm,
    setSearchTerm,
    showFilterRow,
    setShowFilterRow,
    filterField,
    setFilterField,
    filterValue,
    setFilterValue,
  } = useTableFilters();

  const { showToast } = useToast();
  const {
    applications,
    isLoading: isAppsLoading,
    updateStatus,
    updateApplication,
    deleteApplication,
    filterApplications,
    addApplication,
    importApplications,
    resetAllApplications,
  } = useJobApplications(autoNoResponse, autoNoResponseDays, storageMode);

  // ── Keyboard Shortcuts ──
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.closest('.modal-content') && e.key !== 'Escape')
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setShowNewModal(true);
            showToast('Adding new application', 'info');
          }
          break;
        case 'd':
          e.preventDefault();
          setCurrentView('dashboard');
          break;
        case 'a':
          e.preventDefault();
          setCurrentView('table');
          break;
        case 'i':
          e.preventDefault();
          setCurrentView('interviewing');
          break;
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('.search-input-field') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        case 'escape':
          if (showNewModal) setShowNewModal(false);
          if (editingJob) setEditingJob(null);
          if (selectedJob) setSelectedJob(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView, setShowNewModal, showToast, showNewModal, editingJob, selectedJob, setEditingJob, setSelectedJob]);


  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      if (selectedJob?.id === id) setSelectedJob(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error: any) {
      showToast(`Failed to delete application: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleStatusChange = async (id: string, status: JobStatus) => {
    try {
      await updateStatus(id, status);
      if (selectedJob?.id === id) setSelectedJob((prev) => prev ? { ...prev, status } : null);
    } catch (error: any) {
      showToast(`Failed to update status: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleNewSave = async (app: JobApplication) => {
    try {
      await addApplication(app);
      setShowNewModal(false);
      showToast(`Application to ${app.company} added!`, 'success');
    } catch (error: any) {
      showToast(`Failed to add application: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleEditSave = async (app: JobApplication) => {
    try {
      await updateApplication(app);
      setEditingJob(null);
      if (selectedJob?.id === app.id) setSelectedJob(app); // update modal if open
      showToast('Application updated.', 'info');
    } catch (error: any) {
      showToast(`Failed to update application: ${error.message || 'Unknown error'}`, 'error');
    }
  };

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

  const getSelectedApps = () => applications.filter((app) => selectedIds.has(app.id));

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Delete ${selectedIds.size} selected applications?`)) return;
    try {
      await Promise.all([...selectedIds].map((id) => deleteApplication(id)));
      setSelectedIds(new Set());
      showToast(`Deleted ${count} applications.`, 'info');
    } catch (error: any) {
      showToast(`Failed to delete applications: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleBulkStatus = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    try {
      await Promise.all([...selectedIds].map((id) => updateStatus(id, bulkStatus)));
      setSelectedIds(new Set());
      showToast(`Updated ${count} applications to ${bulkStatus}.`, 'success');
    } catch (error: any) {
      showToast(`Failed to update status: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleBulkOpenLinks = (kind: 'job' | 'website' | 'linkedin') => {
    const selectedApps = getSelectedApps();
    selectedApps.forEach((app) => {
      const url = app.links?.[kind];
      if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    });
  };

  const isInitialLoading = isAuthLoading || (isAuthenticated && isAppsLoading);

  if (isInitialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-app)' }}>
        <div className="login-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            applications={applications}
          />
        );

      case 'settings':
        return (
          <SettingsView
            applications={applications}
            onImportCSV={importApplications}
            onResetAll={resetAllApplications}
          />
        );

      case 'account':
        return <AccountView />;

      case 'interviewing':
        return (
          <InterviewingView
            applications={applications.filter(app => app.status === 'interviewing')}
            displayCurrency={currency}
            cvProfiles={cvProfiles}
            visibleColumns={tableDisplay.visibleColumns}
            onStatusChange={handleStatusChange}
            onRowClick={setSelectedJob}
            onDelete={handleDelete}
          />
        );

      default:
        return (
          <div className="glass-container applications-card" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
            <div className="applications-toolbar">
              <div className="applications-toolbar-left">
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>Applications</h2>
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
              <div className="applications-toolbar-right">
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
                <button
                  className="btn-apple btn-primary"
                  style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                  onClick={() => setShowNewModal(true)}
                >
                  + New Application
                </button>
              </div>
            </div>

            {showFilterRow && (
              <div className="filter-actions-bar">
                <div className="filter-actions-group filter-actions-left">
                  <span className="bulk-actions-count">Filter</span>
                  <select
                    className="apple-select bulk-actions-status filter-select"
                    value={filterField}
                    onChange={(e) => {
                      setFilterField(e.target.value as FilterField | '');
                      setFilterValue('');
                    }}
                  >
                    <option value="">Filter by...</option>
                    {FILTER_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>{field.label}</option>
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
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-actions-group filter-actions-right">
                  <button
                    className="btn-apple btn-outline bulk-actions-btn"
                    onClick={() => {
                      setFilterField('');
                      setFilterValue('');
                    }}
                    disabled={!filterField && !filterValue}
                  >
                    <XCircleIcon size={14} />
                    Clear Filter
                  </button>
                </div>
              </div>
            )}

            {selectorMode && (
              <div className="bulk-actions-bar">
                <div className="bulk-actions-group bulk-actions-left">
                  <span className="bulk-actions-count">{selectedIds.size} selected</span>
                  <select className="apple-select bulk-actions-status" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as JobStatus)}>
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                    ))}
                  </select>
                  <button className="btn-apple btn-outline bulk-actions-btn" disabled={selectedIds.size === 0} onClick={handleBulkStatus}><CheckCircleIcon size={14} />Change Status</button>
                </div>

                <div className="bulk-actions-group bulk-actions-center">
                  <select className="apple-select bulk-actions-status" value={bulkLinkKind} onChange={(e) => setBulkLinkKind(e.target.value as 'job' | 'website' | 'linkedin')}>
                    {LINK_KIND_OPTIONS.map((linkOption) => (
                      <option key={linkOption.value} value={linkOption.value}>{linkOption.label}</option>
                    ))}
                  </select>
                  <button className="btn-apple btn-outline bulk-actions-btn" disabled={selectedIds.size === 0} onClick={() => handleBulkOpenLinks(bulkLinkKind)}>
                    {bulkLinkKind === 'job' && <LinkIcon size={14} />}
                    {bulkLinkKind === 'website' && <GlobeIcon size={14} />}
                    {bulkLinkKind === 'linkedin' && <LinkedinIcon size={14} />}
                    Open Links
                  </button>
                </div>

                <div className="bulk-actions-group bulk-actions-right">
                  <button className="btn-apple btn-destructive bulk-actions-btn" disabled={selectedIds.size === 0} onClick={handleBulkDelete}><TrashIcon size={14} />Delete Selected</button>
                </div>
              </div>
            )}

            <JobTable
              applications={filteredApplications}
              displayCurrency={currency}
              cvProfiles={cvProfiles}
              visibleColumns={tableDisplay.visibleColumns}
              selectorMode={selectorMode}
              selectedIds={selectedIds}
              onToggleRowSelection={toggleRowSelection}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={setEditingJob}
              onRowClick={setSelectedJob}
            />
          </div>
        );
    }
  };

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main style={{ padding: '28px 40px 40px' }}>{renderContent()}</main>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={() => {
            setEditingJob(selectedJob);
            setSelectedJob(null); // optional: close the detail modal when opening edit modal
          }}
          displayCurrency={currency}
          cvProfiles={cvProfiles}
        />
      )}

      {showNewModal && (
        <NewApplicationModal
          cvProfiles={cvProfiles}
          onClose={() => setShowNewModal(false)}
          onSave={handleNewSave}
        />
      )}

      {editingJob && (
        <NewApplicationModal
          initialData={editingJob}
          cvProfiles={cvProfiles}
          onClose={() => setEditingJob(null)}
          onSave={handleEditSave}
        />
      )}
      {FEATURES.debug.showToolbar && <DebugToolbar />}
    </div>
  );
};

export default App;
