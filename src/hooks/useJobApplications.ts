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
