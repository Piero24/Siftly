import { EmploymentType, JobApplication, JobStatus, WorkType } from '../types/job';

const STATUS_DISTRIBUTION: Array<{ status: JobStatus; count: number }> = [
  { status: 'applied', count: 35 },
  { status: 'interviewing', count: 30 },
  { status: 'offer', count: 12 },
  { status: 'rejected', count: 20 },
  { status: 'no-response', count: 15 },
  { status: 'declined', count: 8 },
];

const EMPLOYMENT_CYCLE: EmploymentType[] = ['permanent', 'intern', 'fixed-term'];
const WORK_CYCLE: WorkType[] = ['remote', 'hybrid', 'onsite'];
const CV_PROFILE_IDS = [
  'cv-backend',
  'cv-frontend',
  'cv-product',
  'cv-data',
  'cv-ml',
  'cv-mobile',
  'cv-cloud',
  'cv-security',
];

const RECRUITER_NAMES = [
  'Alex Rivera',
  'Jamie Chen',
  'Morgan White',
  'Priya Nair',
  'Luca Romano',
  'Sofia Petrov',
  'Noah Brooks',
  'Emma Carter',
  'Daniel Kim',
  'Sara Lopez',
];

const REFERRAL_NAMES = [
  'Giulia Bianchi',
  'Marco Silva',
  'Sven Karlsson',
  'Nora Ahmed',
  'Yuki Tanaka',
  'Ivan Horvat',
  'Marta Ruiz',
  'Omar Khalid',
];

const POSITIONS = [
  'Backend Engineer',
  'Frontend Engineer',
  'Product Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Platform Engineer',
  'Cloud Architect',
  'ML Engineer',
  'Security Engineer',
  'SRE Engineer',
  'QA Automation Engineer',
  'Business Analyst',
  'Product Manager',
  'Technical Writer',
  'Mobile Engineer',
  'AI Research Engineer',
  'Solutions Architect',
  'Analytics Engineer',
  'Staff Engineer',
  'Engineering Manager',
];

const COMPANY_CATALOG: Array<{
  company: string;
  sector: string;
  country: string;
  city: string;
  website: string;
  salaryBase: number;
  currency: string;
}> = [
  { company: 'Stripe', sector: 'Fintech', country: 'IE', city: 'Dublin', website: 'https://stripe.com', salaryBase: 90000, currency: 'EUR' },
  { company: 'Klarna', sector: 'Fintech', country: 'SE', city: 'Stockholm', website: 'https://klarna.com', salaryBase: 760000, currency: 'SEK' },
  { company: 'Revolut', sector: 'Fintech', country: 'GB', city: 'London', website: 'https://revolut.com', salaryBase: 98000, currency: 'GBP' },
  { company: 'Adyen', sector: 'Fintech', country: 'NL', city: 'Amsterdam', website: 'https://adyen.com', salaryBase: 88000, currency: 'EUR' },
  { company: 'Wise', sector: 'Fintech', country: 'EE', city: 'Tallinn', website: 'https://wise.com', salaryBase: 70000, currency: 'EUR' },
  { company: 'Datadog', sector: 'SaaS', country: 'DE', city: 'Berlin', website: 'https://datadoghq.com', salaryBase: 115000, currency: 'EUR' },
  { company: 'Snowflake', sector: 'Data', country: 'NL', city: 'Utrecht', website: 'https://snowflake.com', salaryBase: 125000, currency: 'EUR' },
  { company: 'HashiCorp', sector: 'Infrastructure', country: 'FR', city: 'Lyon', website: 'https://hashicorp.com', salaryBase: 110000, currency: 'EUR' },
  { company: 'Cloudflare', sector: 'Infrastructure', country: 'US', city: 'Austin', website: 'https://cloudflare.com', salaryBase: 185000, currency: 'USD' },
  { company: 'Vercel', sector: 'Developer Tools', country: 'US', city: 'San Francisco', website: 'https://vercel.com', salaryBase: 195000, currency: 'USD' },
  { company: 'GitLab', sector: 'Developer Tools', country: 'US', city: 'Remote', website: 'https://gitlab.com', salaryBase: 175000, currency: 'USD' },
  { company: 'GitHub', sector: 'Developer Tools', country: 'US', city: 'Remote', website: 'https://github.com', salaryBase: 185000, currency: 'USD' },
  { company: 'Shopify', sector: 'E-commerce', country: 'CA', city: 'Toronto', website: 'https://shopify.com', salaryBase: 170000, currency: 'USD' },
  { company: 'Zalando', sector: 'Retail', country: 'DE', city: 'Berlin', website: 'https://zalando.com', salaryBase: 95000, currency: 'EUR' },
  { company: 'H and M Group', sector: 'Retail', country: 'SE', city: 'Stockholm', website: 'https://hmgroup.com', salaryBase: 720000, currency: 'SEK' },
  { company: 'Booking', sector: 'Travel', country: 'NL', city: 'Amsterdam', website: 'https://booking.com', salaryBase: 98000, currency: 'EUR' },
  { company: 'Skyscanner', sector: 'Travel', country: 'GB', city: 'Edinburgh', website: 'https://skyscanner.net', salaryBase: 92000, currency: 'GBP' },
  { company: 'Airbnb', sector: 'Travel', country: 'US', city: 'San Francisco', website: 'https://airbnb.com', salaryBase: 230000, currency: 'USD' },
  { company: 'Spotify', sector: 'Entertainment', country: 'US', city: 'New York', website: 'https://spotify.com', salaryBase: 240000, currency: 'USD' },
  { company: 'Netflix', sector: 'Entertainment', country: 'US', city: 'Los Gatos', website: 'https://netflix.com', salaryBase: 300000, currency: 'USD' },
  { company: 'Discord', sector: 'Social Media', country: 'NL', city: 'Amsterdam', website: 'https://discord.com', salaryBase: 160000, currency: 'EUR' },
  { company: 'Reddit', sector: 'Social Media', country: 'CA', city: 'Vancouver', website: 'https://reddit.com', salaryBase: 190000, currency: 'USD' },
  { company: 'Notion', sector: 'Productivity', country: 'US', city: 'San Francisco', website: 'https://notion.so', salaryBase: 200000, currency: 'USD' },
  { company: 'Figma', sector: 'Design Tools', country: 'US', city: 'San Francisco', website: 'https://figma.com', salaryBase: 210000, currency: 'USD' },
  { company: 'Canva', sector: 'Design Tools', country: 'AU', city: 'Sydney', website: 'https://canva.com', salaryBase: 150000, currency: 'USD' },
  { company: 'Atlassian', sector: 'Developer Tools', country: 'AU', city: 'Sydney', website: 'https://atlassian.com', salaryBase: 155000, currency: 'USD' },
  { company: 'HubSpot', sector: 'Marketing Tech', country: 'US', city: 'Boston', website: 'https://hubspot.com', salaryBase: 165000, currency: 'USD' },
  { company: 'Salesforce', sector: 'SaaS', country: 'US', city: 'Indianapolis', website: 'https://salesforce.com', salaryBase: 210000, currency: 'USD' },
  { company: 'Oracle', sector: 'Enterprise Software', country: 'US', city: 'Austin', website: 'https://oracle.com', salaryBase: 190000, currency: 'USD' },
  { company: 'ServiceNow', sector: 'Enterprise Software', country: 'US', city: 'Santa Clara', website: 'https://servicenow.com', salaryBase: 205000, currency: 'USD' },
  { company: 'Siemens', sector: 'Industrial Tech', country: 'DE', city: 'Munich', website: 'https://siemens.com', salaryBase: 98000, currency: 'EUR' },
  { company: 'ABB', sector: 'Industrial Tech', country: 'SE', city: 'Vasteras', website: 'https://abb.com', salaryBase: 640000, currency: 'SEK' },
  { company: 'Ericsson', sector: 'Telecom', country: 'SE', city: 'Stockholm', website: 'https://ericsson.com', salaryBase: 760000, currency: 'SEK' },
  { company: 'Nokia', sector: 'Telecom', country: 'FI', city: 'Espoo', website: 'https://nokia.com', salaryBase: 94000, currency: 'EUR' },
  { company: 'Cisco', sector: 'Networking', country: 'US', city: 'San Jose', website: 'https://cisco.com', salaryBase: 180000, currency: 'USD' },
  { company: 'Palo Alto Networks', sector: 'Security', country: 'US', city: 'Santa Clara', website: 'https://paloaltonetworks.com', salaryBase: 225000, currency: 'USD' },
  { company: 'CrowdStrike', sector: 'Security', country: 'US', city: 'Austin', website: 'https://crowdstrike.com', salaryBase: 215000, currency: 'USD' },
  { company: 'Snyk', sector: 'Security', country: 'GB', city: 'London', website: 'https://snyk.io', salaryBase: 115000, currency: 'GBP' },
  { company: 'DeepMind', sector: 'AI', country: 'GB', city: 'London', website: 'https://deepmind.google', salaryBase: 180000, currency: 'GBP' },
  { company: 'OpenAI', sector: 'AI', country: 'US', city: 'San Francisco', website: 'https://openai.com', salaryBase: 350000, currency: 'USD' },
  { company: 'Anthropic', sector: 'AI', country: 'US', city: 'San Francisco', website: 'https://anthropic.com', salaryBase: 340000, currency: 'USD' },
  { company: 'Mistral AI', sector: 'AI', country: 'FR', city: 'Paris', website: 'https://mistral.ai', salaryBase: 150000, currency: 'EUR' },
  { company: 'NVIDIA', sector: 'Hardware', country: 'US', city: 'Santa Clara', website: 'https://nvidia.com', salaryBase: 300000, currency: 'USD' },
  { company: 'AMD', sector: 'Hardware', country: 'CA', city: 'Toronto', website: 'https://amd.com', salaryBase: 210000, currency: 'USD' },
  { company: 'Intel', sector: 'Hardware', country: 'IL', city: 'Haifa', website: 'https://intel.com', salaryBase: 125000, currency: 'USD' },
  { company: 'TSMC', sector: 'Hardware', country: 'TW', city: 'Hsinchu', website: 'https://tsmc.com', salaryBase: 145000, currency: 'USD' },
  { company: 'ASML', sector: 'Semiconductors', country: 'NL', city: 'Veldhoven', website: 'https://asml.com', salaryBase: 120000, currency: 'EUR' },
  { company: 'Northvolt', sector: 'Green Tech', country: 'SE', city: 'Skelleftea', website: 'https://northvolt.com', salaryBase: 650000, currency: 'SEK' },
  { company: 'Volvo Cars', sector: 'Automotive', country: 'SE', city: 'Gothenburg', website: 'https://volvocars.com', salaryBase: 630000, currency: 'SEK' },
  { company: 'Rivian', sector: 'Automotive', country: 'US', city: 'Irvine', website: 'https://rivian.com', salaryBase: 240000, currency: 'USD' },
  { company: 'Tesla', sector: 'Automotive', country: 'US', city: 'Austin', website: 'https://tesla.com', salaryBase: 265000, currency: 'USD' },
  { company: 'Einride', sector: 'Autonomous', country: 'SE', city: 'Stockholm', website: 'https://einride.tech', salaryBase: 700000, currency: 'SEK' },
  { company: 'DoorDash', sector: 'Logistics', country: 'US', city: 'Seattle', website: 'https://doordash.com', salaryBase: 195000, currency: 'USD' },
  { company: 'Instacart', sector: 'Logistics', country: 'US', city: 'San Francisco', website: 'https://instacart.com', salaryBase: 185000, currency: 'USD' },
  { company: 'Uber', sector: 'Logistics', country: 'NL', city: 'Amsterdam', website: 'https://uber.com', salaryBase: 140000, currency: 'EUR' },
  { company: 'Bolt', sector: 'Mobility', country: 'EE', city: 'Tallinn', website: 'https://bolt.eu', salaryBase: 88000, currency: 'EUR' },
  { company: 'WiseScale', sector: 'Analytics', country: 'PT', city: 'Lisbon', website: 'https://wisescale.io', salaryBase: 72000, currency: 'EUR' },
  { company: 'Monzo', sector: 'Fintech', country: 'GB', city: 'London', website: 'https://monzo.com', salaryBase: 85000, currency: 'GBP' },
  { company: 'N26', sector: 'Fintech', country: 'DE', city: 'Berlin', website: 'https://n26.com', salaryBase: 93000, currency: 'EUR' },
  { company: 'Sopra Steria', sector: 'Consulting', country: 'FR', city: 'Paris', website: 'https://soprasteria.com', salaryBase: 72000, currency: 'EUR' },
  { company: 'Capgemini', sector: 'Consulting', country: 'IT', city: 'Milan', website: 'https://capgemini.com', salaryBase: 64000, currency: 'EUR' },
  { company: 'Accenture', sector: 'Consulting', country: 'ES', city: 'Madrid', website: 'https://accenture.com', salaryBase: 68000, currency: 'EUR' },
  { company: 'Thoughtworks', sector: 'Consulting', country: 'BR', city: 'Sao Paulo', website: 'https://thoughtworks.com', salaryBase: 76000, currency: 'USD' },
  { company: 'Mercado Libre', sector: 'E-commerce', country: 'AR', city: 'Buenos Aires', website: 'https://mercadolibre.com', salaryBase: 68000, currency: 'USD' },
  { company: 'Rappi', sector: 'Logistics', country: 'CO', city: 'Bogota', website: 'https://rappi.com', salaryBase: 62000, currency: 'USD' },
  { company: 'WiseOcean', sector: 'Climate Tech', country: 'DK', city: 'Copenhagen', website: 'https://wiseocean.io', salaryBase: 85000, currency: 'EUR' },
  { company: 'Helios Grid', sector: 'Energy', country: 'NO', city: 'Oslo', website: 'https://heliosgrid.no', salaryBase: 98000, currency: 'EUR' },
];

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateWithOffset(days: number): string {
  const d = new Date('2026-04-09T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return toDateOnly(d);
}

function dateTimeWithOffset(days: number, hour = 10): string {
  const d = new Date('2026-04-09T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function statusAt(index: number): JobStatus {
  let running = 0;
  for (const { status, count } of STATUS_DISTRIBUTION) {
    running += count;
    if (index < running) return status;
  }
  return 'applied';
}

function appDateByStatus(status: JobStatus, index: number): string {
  switch (status) {
    case 'applied':
      return dateWithOffset(-(index % 40));
    case 'interviewing':
      return dateWithOffset(-15 - (index % 45));
    case 'offer':
      return dateWithOffset(-25 - (index % 55));
    case 'declined':
      return dateWithOffset(-35 - (index % 65));
    case 'rejected':
      return dateWithOffset(-45 - (index % 75));
    case 'no-response':
      return dateWithOffset(-90 - (index % 120));
    default:
      return dateWithOffset(-10);
  }
}

function buildRounds(index: number, count: number) {
  return Array.from({ length: count }, (_, roundIndex) => {
    const isFinalRound = roundIndex === count - 1;
    const upcomingFinalRound = isFinalRound && index % 2 === 0;
    const offset = upcomingFinalRound ? 7 + roundIndex * 4 : -25 + roundIndex * 6;

    return {
      id: `m${index + 1}-r${roundIndex + 1}`,
      roundNumber: roundIndex + 1,
      interviewerName: RECRUITER_NAMES[(index + roundIndex) % RECRUITER_NAMES.length],
      interviewerContact: `interviewer${(index + roundIndex) % 40}@example.com`,
      date: dateTimeWithOffset(offset, 9 + (roundIndex % 6)),
      meetingLink: roundIndex % 2 === 0 ? `https://meet.example.com/m${index + 1}r${roundIndex + 1}` : undefined,
      location: roundIndex % 2 === 1 ? 'HQ Office' : 'Video Call',
    };
  });
}

function buildApplication(index: number): JobApplication {
  const companyInfo = COMPANY_CATALOG[index % COMPANY_CATALOG.length];
  const status = statusAt(index);
  const employmentType = EMPLOYMENT_CYCLE[index % EMPLOYMENT_CYCLE.length];
  const workType = WORK_CYCLE[(index + 1) % WORK_CYCLE.length];
  const cvProfileId = CV_PROFILE_IDS[index % CV_PROFILE_IDS.length];
  const salaryVariance = ((index % 7) - 3) * 3500;

  const application: JobApplication = {
    id: `m${index + 1}`,
    company: companyInfo.company,
    sector: companyInfo.sector,
    position: POSITIONS[index % POSITIONS.length],
    country: companyInfo.country,
    city: companyInfo.city,
    workType,
    employmentType,
    cvProfileId,
    status,
    salary: {
      amount: Math.max(22000, companyInfo.salaryBase + salaryVariance),
      currency: companyInfo.currency,
    },
    date: appDateByStatus(status, index),
    links: {
      job: `https://jobs.example.com/${toSlug(companyInfo.company)}/${toSlug(POSITIONS[index % POSITIONS.length])}`,
      linkedin: `https://linkedin.com/company/${toSlug(companyInfo.company)}`,
      website: companyInfo.website,
    },
    rating: (index % 5) + 1,
    notes: index % 3 === 0 ? 'Strong mission fit. Follow-up needed after next round.' : undefined,
    description:
      index % 4 === 0 ? `Role focused on ${POSITIONS[index % POSITIONS.length].toLowerCase()} in ${companyInfo.sector}.` : undefined,
  };

  if (index % 3 === 0) {
    const recruiterName = RECRUITER_NAMES[index % RECRUITER_NAMES.length];
    application.recruiter = {
      name: recruiterName,
      email: `${toSlug(recruiterName)}@recruit.example.com`,
      phone: `+1-555-${String(1000 + index).padStart(4, '0')}`,
    };
  }

  if (index % 4 === 0) {
    const referrerName = REFERRAL_NAMES[index % REFERRAL_NAMES.length];
    application.referral = {
      referrer: referrerName,
      date: dateWithOffset(-30 - (index % 45)),
      note: 'Referral submitted through internal talent program.',
      link: index % 8 === 0 ? `https://referral.example.com/${toSlug(referrerName)}` : undefined,
      code: index % 6 === 0 ? `REF-${1000 + index}` : undefined,
    };
  }

  if (status === 'interviewing') {
    const interviews = 1 + (index % 6);
    const roundsCount = index % 5 === 0 ? 0 : 1 + (index % 4);

    application.interviews = interviews;
    application.phoneScreens = index % 3;
    application.rounds = roundsCount > 0 ? buildRounds(index, roundsCount) : [];
  }

  return application;
}

const totalApplications = STATUS_DISTRIBUTION.reduce((sum, entry) => sum + entry.count, 0);

const generatedApplications = Array.from({ length: totalApplications }, (_, index) =>
  buildApplication(index)
);

const googleAnchorIndex = generatedApplications.findIndex((app) => app.status === 'interviewing');
if (googleAnchorIndex >= 0) {
  generatedApplications[googleAnchorIndex] = {
    ...generatedApplications[googleAnchorIndex],
    company: 'Google',
    sector: 'Big Tech',
    position: 'Solution Architect',
    country: 'IT',
    city: 'Milan',
    workType: 'hybrid',
    employmentType: 'permanent',
    status: 'interviewing',
    salary: { amount: 98000, currency: 'EUR' },
    date: dateWithOffset(-22),
    links: {
      job: 'https://jobs.example.com/google/solution-architect',
      linkedin: 'https://linkedin.com/company/google',
      website: 'https://google.com',
    },
    interviews: 4,
    phoneScreens: 2,
    rounds: [
      {
        id: 'google-r1',
        roundNumber: 1,
        interviewerName: 'Mario Rossi',
        interviewerContact: 'mario.rossi@example.com',
        date: dateTimeWithOffset(-18, 10),
        meetingLink: 'https://meet.example.com/google-r1',
        location: 'Video Call',
      },
      {
        id: 'google-r2',
        roundNumber: 2,
        interviewerName: 'Alice White',
        interviewerContact: 'alice.white@example.com',
        date: dateTimeWithOffset(-8, 15),
        meetingLink: 'https://meet.example.com/google-r2',
        location: 'Video Call',
      },
      {
        id: 'google-r3',
        roundNumber: 3,
        interviewerName: 'Luca Romano',
        interviewerContact: 'luca.romano@example.com',
        date: dateTimeWithOffset(4, 9),
        meetingLink: 'https://meet.example.com/google-r3',
        location: 'Milan Office',
      },
      {
        id: 'google-r4',
        roundNumber: 4,
        interviewerName: 'Emma Carter',
        interviewerContact: 'emma.carter@example.com',
        date: dateTimeWithOffset(15, 14),
        meetingLink: 'https://meet.example.com/google-r4',
        location: 'Milan Office',
      },
    ],
  };
}

export const MOCK_APPLICATIONS: JobApplication[] = generatedApplications;
