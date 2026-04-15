/**
 * useApplicationActions — CRUD operations for job applications with toast feedback.
 *
 * Extracted from App.tsx to centralize application mutation logic.
 */
import { JobApplication, JobStatus } from '../types/job';
import { useUI } from '../context/UIContext';
import { useSelection } from '../context/SelectionContext';
import { useToast } from '../context/ToastContext';

interface ApplicationOperations {
  updateStatus: (id: string, status: JobStatus) => Promise<void>;
  updateApplication: (app: JobApplication) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  addApplication: (app: JobApplication) => Promise<void>;
}

export function useApplicationActions(operations: ApplicationOperations) {
  const { selectedJob, setSelectedJob, setEditingJob, setShowNewModal } = useUI();
  const { selectedIds, setSelectedIds } = useSelection();
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await operations.deleteApplication(id);
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
      await operations.updateStatus(id, status);
      if (selectedJob?.id === id) setSelectedJob((prev) => (prev ? { ...prev, status } : null));
    } catch (error: any) {
      showToast(`Failed to update status: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleNewSave = async (app: JobApplication) => {
    try {
      await operations.addApplication(app);
      setShowNewModal(false);
      showToast(`Application to ${app.company} added!`, 'success');
    } catch (error: any) {
      showToast(`Failed to add application: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleEditSave = async (app: JobApplication) => {
    try {
      await operations.updateApplication(app);
      setEditingJob(null);
      if (selectedJob?.id === app.id) setSelectedJob(app);
      showToast('Application updated.', 'info');
    } catch (error: any) {
      showToast(`Failed to update application: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleBulkDelete = async (deleteApp: (id: string) => Promise<void>) => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Delete ${count} selected applications?`)) return;
    try {
      await Promise.all([...selectedIds].map((id) => deleteApp(id)));
      setSelectedIds(new Set());
      showToast(`Deleted ${count} applications.`, 'info');
    } catch (error: any) {
      showToast(`Failed to delete applications: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleBulkStatus = async (
    updateSt: (id: string, status: JobStatus) => Promise<void>,
    status: JobStatus
  ) => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    try {
      await Promise.all([...selectedIds].map((id) => updateSt(id, status)));
      setSelectedIds(new Set());
      showToast(`Updated ${count} applications to ${status}.`, 'success');
    } catch (error: any) {
      showToast(`Failed to update status: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  return {
    handleDelete,
    handleStatusChange,
    handleNewSave,
    handleEditSave,
    handleBulkDelete,
    handleBulkStatus,
  };
}
