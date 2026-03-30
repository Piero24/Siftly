/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { exportToCSV, parseCSV } from './csv';
import { JobApplication } from '../types/job';

const mockApp: JobApplication = {
  id: 'test-123',
  company: 'Acme Corp',
  logo: 'logo.png',
  sector: 'Technology',
  position: 'Senior Engineer',
  country: 'US',
  city: 'New York',
  workType: 'remote',
  status: 'applied',
  salary: { amount: 120000, currency: 'USD' },
  date: '2026-03-01',
  links: { job: 'https://job.com', linkedin: 'https://li.com', website: 'https://web.com' },
};

describe('csv library', () => {
  it('exports applications to CSV correctly', () => {
    const csv = exportToCSV([mockApp]);
    const lines = csv.split('\n');
    // Header check
    expect(lines[0]).toContain('company,logo,sector,position');
    // Data check
    expect(lines[1]).toContain('Acme Corp,Technology,Senior Engineer,US,New York');
    expect(lines[1]).toContain('120000,USD');
    expect(lines[1]).toContain('applied');
  });

  it('parses valid CSV with exact headers correctly', () => {
    // Note: parseCSV is case-sensitive and expects specific field names from FLAT_COLUMNS
    const csvContent = `company,sector,position,country,city,workType,salary.amount,salary.currency,date,status,links.job,links.linkedin,links.website
Google,Cloud,Staff Engineer,US,Mountain View,remote,250000,USD,2026-03-29,interviewing,https://google.com/jobs,https://linkedin.com/google,https://google.com`;

    const apps = parseCSV(csvContent);
    expect(apps).toHaveLength(1);
    expect(apps[0].company).toBe('Google');
    expect(apps[0].sector).toBe('Cloud');
    expect(apps[0].status).toBe('interviewing');
    expect(apps[0].salary.amount).toBe(250000);
    expect(apps[0].workType).toBe('remote');
  });

  it('handles empty string by returning empty array', () => {
    expect(parseCSV('')).toHaveLength(0);
  });

  it('handles malformed headers by using default values', () => {
    const csvContent = `Random,Header\nValue1,Value2`;
    const apps = parseCSV(csvContent);
    expect(apps).toHaveLength(1);
    expect(apps[0].company).toBe('Unknown'); // Default value when 'company' header missing
  });
});
