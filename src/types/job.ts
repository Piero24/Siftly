export type JobStatus = 'pending' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'no-response';
export type WorkType = 'onsite' | 'hybrid' | 'remote';
export type EmploymentType = 'permanent' | 'intern' | 'fixed-term';

export interface CVProfile {
  id: string;
  name: string;
  color: string;
}

export interface Salary {
  amount: number;
  currency: string; // ISO 4217, e.g. "USD", "EUR"
}

export interface Referral {
  referrer: string;
  date: string;
  note: string;
  link?: string;
  code?: string;
}

export interface Recruiter {
  name: string;
  email?: string;
  phone?: string;
}

export interface InterviewRound {
  id: string;
  roundNumber: number;
  interviewerName?: string;
  interviewerContact?: string;
  date: string; // ISO 8601 DateTime string
  meetingLink?: string;
  location?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  logo?: string;
  sector: string;
  position: string;
  employmentType?: EmploymentType;
  country: string; // ISO 3166-1 alpha-2
  city: string;
  workType: WorkType;
  cvProfileId?: string;
  status: JobStatus;
  salary: Salary;
  date: string;
  links: {
    job: string;
    linkedin: string;
    website: string;
  };
  description?: string;
  rating?: number;
  referral?: Referral;
  recruiter?: Recruiter;
  notes?: string;
  phoneScreens?: number;
  interviews?: number;
  rounds?: InterviewRound[];
}
