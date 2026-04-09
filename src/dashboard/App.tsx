/**
 * App — Main dashboard orchestrator.
 *
 * Delegates view rendering to focused components and business logic
 * to custom hooks. This file remains a thin wiring layer.
 */
import React from 'react';
import 'flag-icons/css/flag-icons.min.css';

import { Navbar } from '../components/layout/Navbar';
import { JobDetailModal } from '../components/dashboard/JobDetailModal';
import { NewApplicationModal } from '../components/dashboard/NewApplicationModal';
import { DashboardView } from '../components/dashboard/DashboardView';
import { SettingsView } from '../components/dashboard/SettingsView';
import { InterviewingView } from '../components/dashboard/InterviewingView';
import { AccountView } from '../components/dashboard/AccountView';
import { ApplicationsTableView } from '../components/dashboard/ApplicationsTableView';
import { LoginPage } from '../components/auth/LoginPage';
import { DebugToolbar } from '../components/debug/DebugToolbar';

import { useJobApplications } from '../hooks/useJobApplications';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useApplicationActions } from '../hooks/useApplicationActions';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useSelection } from '../context/SelectionContext';
import { FEATURES } from '../config/features';

const App: React.FC = () => {
  const { currency, autoNoResponse, autoNoResponseDays, cvProfiles, storageMode, tableDisplay } = useSettings();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentView, setCurrentView, selectedJob, setSelectedJob, editingJob, setEditingJob, showNewModal, setShowNewModal } = useUI();
  const { selectedIds, bulkStatus, bulkLinkKind } = useSelection();

  const {
    applications, isLoading: isAppsLoading,
    updateStatus, updateApplication, deleteApplication, addApplication,
    filterApplications, importApplications, resetAllApplications,
  } = useJobApplications(autoNoResponse, autoNoResponseDays, storageMode);

  // ── Hooks ──
  useKeyboardShortcuts();

  React.useEffect(() => {
    if (!isAppsLoading && applications.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get('jobId');
      if (jobId && !selectedJob) {
        const found = applications.find((a) => a.id === jobId);
        if (found) {
          setSelectedJob(found);
          // Clean up the URL to prevent reopening on refresh
          window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        }
      }
    }
  }, [isAppsLoading, applications, selectedJob, setSelectedJob]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentView]);

  const {
    handleDelete, handleStatusChange, handleNewSave, handleEditSave,
    handleBulkDelete, handleBulkStatus,
  } = useApplicationActions({ updateStatus, updateApplication, deleteApplication, addApplication });

  // ── Bulk link opening ──
  const handleBulkOpenLinks = (kind: 'job' | 'website' | 'linkedin') => {
    applications
      .filter((app) => selectedIds.has(app.id))
      .forEach((app) => {
        const url = app.links?.[kind];
        if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
      });
  };

  // ── Loading & Auth gates ──
  const isInitialLoading = isAuthLoading || (isAuthenticated && isAppsLoading);

  if (isInitialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-app)' }}>
        <div className="login-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  // ── View Router ──
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView applications={applications} />;

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
            applications={applications.filter((app) => app.status === 'interviewing')}
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
          <ApplicationsTableView
            applications={applications}
            displayCurrency={currency}
            cvProfiles={cvProfiles}
            visibleColumns={tableDisplay.visibleColumns}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onEdit={setEditingJob}
            onRowClick={setSelectedJob}
            filterApplications={filterApplications}
            onBulkDelete={() => handleBulkDelete(deleteApplication)}
            onBulkStatus={() => handleBulkStatus(updateStatus, bulkStatus)}
            onBulkOpenLinks={handleBulkOpenLinks}
          />
        );
    }
  };

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main className="app-main-shell">{renderContent()}</main>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={() => { setEditingJob(selectedJob); setSelectedJob(null); }}
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
          editingApplication={editingJob}
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
