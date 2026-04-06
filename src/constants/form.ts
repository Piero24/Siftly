/**
 * form.ts — Default values and option lists for the NewApplicationModal form.
 */
import type { EmploymentType, InterviewRound, JobStatus, WorkType } from '../types/job';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'SEK', 'CHF', 'JPY', 'CAD', 'AUD', 'INR'];

export type SalaryType = 'single' | 'range';

export type FormState = {
  company: string;
  sector: string;
  position: string;
  workType: WorkType;
  employmentType: EmploymentType;
  cvProfileId: string;
  country: string;
  city: string;
  status: JobStatus;
  date: string;
  salaryType: SalaryType;
  salaryAmount: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  jobUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  description: string;
  rating: number;
  notes: string;
  referrer: string;
  referralDate: string;
  referralNote: string;
  referralLink: string;
  referralCode: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  phoneScreens: number;
  interviews: number;
  rounds: InterviewRound[];
};

export const DEFAULT_FORM_STATE: FormState = {
  company: '', sector: '', position: '', workType: 'hybrid',
  employmentType: 'permanent', cvProfileId: '',
  country: '', city: '', status: 'applied',
  date: new Date().toISOString().slice(0, 10),
  salaryType: 'single', salaryAmount: '', salaryMin: '', salaryMax: '',
  salaryCurrency: 'USD',
  jobUrl: '', linkedinUrl: '', websiteUrl: '',
  description: '', rating: 0, notes: '',
  referrer: '', referralDate: '', referralNote: '', referralLink: '', referralCode: '',
  recruiterName: '', recruiterEmail: '', recruiterPhone: '', phoneScreens: 0, interviews: 0, rounds: [],
};
