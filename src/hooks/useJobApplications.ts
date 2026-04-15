/**
 * useJobApplications — Custom hook that encapsulates all job application
 * state management, keeping App.tsx as a clean orchestrator.
 *
 * Now backed by a pluggable StorageAdapter (remote Supabase, local
 * local SQLite API, or both) selected via SettingsContext.storageMode.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { JobApplication, JobStatus } from '../types/job';
import { createAdapter, StorageMode, SupabaseUnconfiguredError } from '../lib/storage';
import { StorageAdapter } from '../lib/storageInterface';
import { DEBUG_CONFIG } from '../config/app';
import { MOCK_APPLICATIONS } from '../lib/mockData';
import { logger } from '../lib/logger';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabaseClient';

const hookLogger = logger.for('useJobApplications');

export function useJobApplications(
  autoNoResponse: boolean = false,
  autoNoResponseDays: number = 60,
  storageMode: StorageMode = 'remote'
) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const adapterRef = useRef<StorageAdapter>(createAdapter(storageMode));

  const loadData = useCallback(async () => {
    setIsLoading(true);

    if (DEBUG_CONFIG.useMockData) {
      hookLogger.info('Mock Mode active! Loading 50+ fake applications.');
      setApplications(MOCK_APPLICATIONS);
      setIsLoading(false);
      return;
    }

    try {
      const data = await adapterRef.current.getAll();
      setApplications(data);
    } catch (err) {
      hookLogger.error('Failed to load data:', err);
      // In extension/remote mode, we should NOT fallback to local or show confusing messages
      if (storageMode === 'remote') {
        if (err instanceof SupabaseUnconfiguredError) {
          showToast(
            'Supabase client is not configured. Please check your environment variables.',
            'error'
          );
        } else {
          showToast('Failed to load data from Supabase.', 'error');
        }
        setApplications([]); // Clear apps to avoid showing stale/local data
      } else {
        // Local mode expects the Node API server (/api/*) to be running.
        if (err instanceof SupabaseUnconfiguredError) {
          showToast(
            'Supabase is not required in local mode. Start the local API server.',
            'warning'
          );
        } else {
          showToast(
            'Local API unavailable. Start it with "npm run server" or "npm run dev:full".',
            'error'
          );
        }
        setApplications([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [storageMode]);

  // Re-create adapter when storageMode changes
  useEffect(() => {
    adapterRef.current = createAdapter(storageMode);
    loadData();
  }, [storageMode, loadData]);

  // Realtime Supabase Hook
  useEffect(() => {
    if ((storageMode === 'remote' || storageMode === 'both') && supabase) {
      hookLogger.info('Initializing Supabase Realtime channel for job_applications');
      const channel = supabase
        .channel('job-applications-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'job_applications' },
          (payload) => {
            hookLogger.info('Realtime change detected!', payload);
            loadData(); // Seamlessly reload the dashboard when the table modifies
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, [storageMode, loadData]);

  // Auto no-response logic
  useEffect(() => {
    if (!autoNoResponse) return;

    const now = new Date();
    setApplications((prev) => {
      let changed = false;
      const nextApps = prev.map((app) => {
        if (app.status === 'applied' || app.status === 'pending') {
          const appDate = new Date(app.date);
          const diffDays = Math.ceil(
            Math.abs(now.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays > autoNoResponseDays) {
            changed = true;
            const updated = { ...app, status: 'no-response' as JobStatus };
            adapterRef.current
              .upsert(updated)
              .catch((err: unknown) => hookLogger.error('Auto-update failed:', err));
            return updated;
          }
        }
        return app;
      });
      return changed ? nextApps : prev;
    });
  }, [autoNoResponse, autoNoResponseDays]);

  const updateStatus = async (id: string, status: JobStatus) => {
    try {
      const updated = applications.find((app) => app.id === id);
      if (!updated) return;
      const nextApp = { ...updated, status };
      await adapterRef.current.upsert(nextApp);
      setApplications((prev) => prev.map((app) => (app.id === id ? nextApp : app)));
    } catch (err) {
      hookLogger.error('Failed to update status:', err);
      showToast('Failed to update job status in database.', 'error');
    }
  };

  const updateApplication = async (updatedApp: JobApplication) => {
    try {
      await adapterRef.current.upsert(updatedApp);
      setApplications((prev) => prev.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
      showToast('Application updated.', 'success');
    } catch (err) {
      hookLogger.error('Failed to update app:', err);
      showToast('Failed to save changes to database.', 'error');
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      await adapterRef.current.remove(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      showToast('Application deleted.', 'info');
    } catch (err) {
      hookLogger.error('Failed to delete app:', err);
      showToast('Failed to delete from database.', 'error');
    }
  };

  const filterApplications = (term: string): JobApplication[] => {
    if (!term.trim()) return applications;
    const lower = term.toLowerCase();
    return applications.filter(
      (app) =>
        app.company.toLowerCase().includes(lower) ||
        app.position.toLowerCase().includes(lower) ||
        app.city.toLowerCase().includes(lower) ||
        app.sector.toLowerCase().includes(lower)
    );
  };

  const addApplication = async (app: JobApplication, suppressToast: boolean = false) => {
    try {
      await adapterRef.current.upsert(app);
      setApplications((prev) => [app, ...prev]);
      if (!suppressToast) showToast('New application added!', 'success');
    } catch (err) {
      hookLogger.error('Failed to add app:', err);
      if (!suppressToast) showToast('Failed to save new application.', 'error');
      throw err;
    }
  };

  const importApplications = async (apps: JobApplication[]) => {
    try {
      await adapterRef.current.importBatch(apps);
      setApplications((prev) => [...apps, ...prev]);
      showToast(`Imported ${apps.length} applications.`, 'success');
    } catch (err) {
      hookLogger.error('Failed to import apps:', err);
      showToast('Import failed. Check CSV format.', 'error');
    }
  };

  const resetAllApplications = async () => {
    try {
      if (confirm('Are you sure? This will delete ALL applications from the current storage!')) {
        await adapterRef.current.removeAll();
        setApplications([]);
        showToast('All data cleared.', 'warning');
      }
    } catch (err) {
      hookLogger.error('Failed to reset apps:', err);
      showToast('Failed to clear data.', 'error');
    }
  };

  return {
    applications,
    isLoading,
    updateStatus,
    updateApplication,
    deleteApplication,
    filterApplications,
    addApplication,
    importApplications,
    resetAllApplications,
    reload: loadData,
  };
}
