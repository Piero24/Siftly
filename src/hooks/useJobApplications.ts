/**
 * useJobApplications — Custom hook that encapsulates all job application
 * state management, keeping App.tsx as a clean orchestrator.
 */
import { useState, useEffect } from 'react';
import { JobApplication, JobStatus } from '../types/job';

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: '1',
    company: 'Google',
    sector: 'Technology',
    position: 'Senior Software Engineer',
    country: 'US',
    city: 'Mountain View',
    workType: 'hybrid',
    status: 'interviewing',
    salary: { amount: 200000, currency: 'USD' },
    date: '2024-03-20',
    links: { job: '#', linkedin: '#', website: 'https://google.com' },
    description: 'Build the future of Search and AI on massive-scale distributed systems with world-class engineers.',
    rating: 4.8,
    notes: 'Focus on distributed systems and ML integration during the next interview.',
    referral: {
      referrer: 'Sarah Chen',
      date: '2024-03-10',
      note: 'Former colleague from Stanford.',
      link: 'https://careers.google.com/ref/sarah-chen',
      code: 'SARAH-G24',
    },
  },
  {
    id: '2',
    company: 'Apple',
    sector: 'Consumer Electronics',
    position: 'Frontend Developer',
    country: 'US',
    city: 'Cupertino',
    workType: 'onsite',
    status: 'applied',
    salary: { amount: 185000, currency: 'USD' },
    date: '2024-03-19',
    links: { job: '#', linkedin: '#', website: 'https://apple.com' },
    description: 'Craft high-fidelity user interfaces for the next generation of iOS and macOS applications.',
    rating: 4.9,
    notes: 'Apple cares deeply about accessibility and pixel-perfect design.',
  },
  {
    id: '3',
    company: 'Ferrari',
    sector: 'Automotive',
    position: 'Systems Architect',
    country: 'IT',
    city: 'Maranello',
    workType: 'onsite',
    status: 'offer',
    salary: { amount: 105000, currency: 'EUR' },
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
    status: 'pending',
    salary: { amount: 900000, currency: 'SEK' },
    date: '2024-03-17',
    links: { job: '#', linkedin: '#', website: 'https://spotify.com' },
    description: 'Build the platform that powers music discovery for millions of users.',
    rating: 4.6,
    notes: 'Java and Go are the primary languages. Focus on high-throughput data pipelines.',
  },
];

export function useJobApplications(autoNoResponse: boolean = false, autoNoResponseDays: number = 60) {
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);

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
            return { ...app, status: 'no-response' as JobStatus };
          }
        }
        return app;
      });
      return changed ? nextApps : prev;
    });
  }, [autoNoResponse, autoNoResponseDays]);

  const updateStatus = (id: string, status: JobStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
  };

  const updateApplication = (updatedApp: JobApplication) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
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

  const addApplication = (app: JobApplication) => {
    setApplications((prev) => [app, ...prev]);
  };

  return { applications, updateStatus, updateApplication, deleteApplication, filterApplications, addApplication };
}
