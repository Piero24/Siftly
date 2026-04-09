/**
 * useJobApplications — Custom hook that encapsulates all job application
 * state management, keeping App.tsx as a clean orchestrator.
 *
 * Now backed by a pluggable StorageAdapter (remote Supabase, local
 * IndexedDB, or both) selected via SettingsContext.storageMode.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { JobApplication, JobStatus } from '../types/job';
import { createAdapter, StorageAdapter, StorageMode, SupabaseUnconfiguredError } from '../lib/storage';
import { DEBUG_CONFIG } from '../config/app';
import { MOCK_APPLICATIONS } from '../lib/mockData';
import { logger } from '../lib/logger';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabaseClient';

const hookLogger = logger.for('useJobApplications');

const SEED_APPLICATIONS: JobApplication[] = [
  {
    id: '1',
    company: 'Google',
    sector: 'Technology',
    position: 'Senior Software Engineer',
    country: 'US',
    city: 'Mountain View',
    workType: 'hybrid',
    employmentType: 'permanent',
    status: 'interviewing',
    salary: { amount: 220000, currency: 'USD', ...({ max: 280000 } as any) },
    date: '2024-03-20',
    links: { job: 'https://careers.google.com', linkedin: 'https://linkedin.com/company/google', website: 'https://google.com' },
    description: '### The Role\nBuild the future of Search and AI on massive-scale distributed systems with world-class engineers.\n\n**Requirements:**\n- 5+ years of distributed systems\n- `C++` and `Go` expertise\n- Passion for AI',
    rating: 4.8,
    notes: 'Focus on **distributed systems** and *ML integration* during the next interview. Make sure to review the Paxos algorithm.',
    phoneScreens: 1,
    interviews: 2,
    recruiter: {
      name: 'Alice Johnson',
      email: 'alice.hr@google.com',
      phone: '+1 650-253-0000'
    },
    referral: {
      referrer: 'Sarah Chen',
      date: '2024-03-10',
      note: 'Former colleague from Stanford. She already spoke to the hiring manager.',
      link: 'https://careers.google.com/ref/sarah-chen',
      code: 'SARAH-G24',
    },
    rounds: [
      {
        id: 'r1',
        roundNumber: 1,
        date: '2024-03-22T10:00:00Z',
        interviewerName: 'Bob Smith',
        meetingLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: 'r2',
        roundNumber: 2,
        date: '2024-03-28T14:30:00Z',
        interviewerName: 'Dr. Jane Doe',
        interviewerContact: 'jane@google.com',
        location: 'Building 43, Mountain View Campus'
      }
    ]
  },
  {
    id: '2',
    company: 'Apple',
    sector: 'Consumer Electronics',
    position: 'Frontend Developer',
    country: 'US',
    city: 'Cupertino',
    workType: 'onsite',
    employmentType: 'fixed-term',
    status: 'offer',
    salary: { amount: 185000, currency: 'USD' },
    date: '2024-03-19',
    links: { job: '#', linkedin: '#', website: 'https://apple.com' },
    description: 'Craft high-fidelity user interfaces for the next generation of iOS and macOS applications.\n\nEverything must be pixel-perfect.',
    rating: 4.9,
    notes: 'Apple cares deeply about accessibility.\n\nEmphasize my work on **WCAG** standards and *smooth animations*.',
    phoneScreens: 2,
    interviews: 4,
    recruiter: {
      name: 'Tim Cook (proxy)',
    },
    rounds: [
      {
        id: 'a1',
        roundNumber: 1,
        date: '2024-03-21T09:00:00Z',
        interviewerName: 'Design Lead',
        location: 'Apple Park'
      }
    ]
  },
  {
    id: '3',
    company: 'Ferrari',
    sector: 'Automotive',
    position: 'Systems Architect',
    country: 'IT',
    city: 'Maranello',
    workType: 'onsite',
    employmentType: 'permanent',
    status: 'applied',
    salary: { amount: 105000, currency: 'EUR', ...({ max: 130000 } as any) },
    date: '2024-03-18',
    links: { job: '#', linkedin: '#', website: 'https://ferrari.com' },
    description: 'Define the digital ecosystem of the most iconic automotive brand.',
    rating: 4.7,
    referral: {
      referrer: 'Marco Rossi',
      date: '2024-03-05',
      note: 'Engineering Lead at Maranello.',
      link: 'https://careers.ferrari.com/ref/marco-rossi',
      code: 'MARCO-F24',
    },
  },
  {
    id: '4',
    company: 'Spotify',
    sector: 'Entertainment',
    position: 'Backend Engineer',
    country: 'SE',
    city: 'Stockholm',
    workType: 'remote',
    employmentType: 'permanent',
    status: 'pending',
    salary: { amount: 900000, currency: 'SEK' },
    date: '2024-03-17',
    links: { job: '#', linkedin: '#', website: 'https://spotify.com' },
    description: 'Build the platform that powers music discovery for millions of users.\n\n`Java` and `Go` are the primary languages. Focus on high-throughput data pipelines.',
    rating: 4.6,
    notes: '- Scalability\n- Low latency\n- Redis & Cassandra',
    recruiter: {
      name: 'Johan Svensson',
      email: 'johan@spotify.com'
    }
  },
];

const SEED_FLAG_KEY = 'siftly-seeded';

export function useJobApplications(
  autoNoResponse: boolean = false,
  autoNoResponseDays: number = 60,
  storageMode: StorageMode = 'remote',
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
      let data = await adapterRef.current.getAll();
      // Seed with demo data on first use (local mode only)
      if (data.length === 0 && storageMode === 'local') {
        const alreadySeeded = window.localStorage.getItem(SEED_FLAG_KEY);
        if (!alreadySeeded) {
          await adapterRef.current.importBatch(SEED_APPLICATIONS);
          window.localStorage.setItem(SEED_FLAG_KEY, 'true');
          data = SEED_APPLICATIONS;
        }
      }
      setApplications(data);
    } catch (err) {
      hookLogger.error('Failed to load data:', err);
      // In extension/remote mode, we should NOT fallback to local or show confusing messages
      if (storageMode === 'remote') {
        if (err instanceof SupabaseUnconfiguredError) {
          showToast('Supabase client is not configured. Please check your environment variables.', 'error');
        } else {
          showToast('Failed to load data from Supabase.', 'error');
        }
        setApplications([]); // Clear apps to avoid showing stale/local data
      } else {
        // Local mode fallback
        if (err instanceof SupabaseUnconfiguredError) {
          showToast('Supabase not configured. Using local fallback.', 'warning');
        } else {
          showToast('Connection to database failed. Showing local fallback.', 'error');
        }
        setApplications(SEED_APPLICATIONS);
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
      const channel = supabase.channel('job-applications-changes')
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
    setApplications(prev => {
      let changed = false;
      const nextApps = prev.map(app => {
        if (app.status === 'applied' || app.status === 'pending') {
          const appDate = new Date(app.date);
          const diffDays = Math.ceil(Math.abs(now.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > autoNoResponseDays) {
            changed = true;
            const updated = { ...app, status: 'no-response' as JobStatus };
            adapterRef.current.upsert(updated).catch(err => hookLogger.error('Auto-update failed:', err));
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
      const updated = applications.find(app => app.id === id);
      if (!updated) return;
      const nextApp = { ...updated, status };
      await adapterRef.current.upsert(nextApp);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? nextApp : app))
      );
    } catch (err) {
      hookLogger.error('Failed to update status:', err);
      showToast('Failed to update job status in database.', 'error');
    }
  };

  const updateApplication = async (updatedApp: JobApplication) => {
    try {
      await adapterRef.current.upsert(updatedApp);
      setApplications((prev) =>
        prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
      );
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

