/**
 * CSV import / export utilities for JobApplication data.
 *
 * The CSV format flattens nested objects (salary, links, referral, recruiter)
 * into dot-notation columns and serialises interview rounds as JSON.
 */
import { JobApplication, InterviewRound } from '../types/job';

// ── Column order ────────────────────────────────────────
const FLAT_COLUMNS = [
  'id', 'company', 'logo', 'sector', 'position', 'employmentType',
  'country', 'city', 'workType', 'cvProfileId', 'status',
  'salary.amount', 'salary.currency',
  'date',
  'links.job', 'links.linkedin', 'links.website',
  'description', 'rating',
  'referral.referrer', 'referral.date', 'referral.note', 'referral.link', 'referral.code',
  'recruiter.name', 'recruiter.email', 'recruiter.phone',
  'notes', 'phoneScreens', 'interviews', 'rounds',
] as const;

// ── Helpers ─────────────────────────────────────────────
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function unescapeCSV(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): string {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return '';
    current = current[part];
  }
  if (current == null) return '';
  if (typeof current === 'object') return JSON.stringify(current);
  return String(current);
}

// ── Export ───────────────────────────────────────────────
export function exportToCSV(applications: JobApplication[]): string {
  const header = FLAT_COLUMNS.map(escapeCSV).join(',');
  const rows = applications.map((app) =>
    FLAT_COLUMNS.map((col) => {
      if (col === 'rounds') {
        return escapeCSV(app.rounds ? JSON.stringify(app.rounds) : '');
      }
      return escapeCSV(getNestedValue(app, col));
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCSV(csvString: string, filename = 'siftly-applications.csv'): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Import / Parse ──────────────────────────────────────
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Split CSV text into lines, handling quoted newlines
function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        i++;
      }
      if (current.trim()) lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

export function parseCSV(csvString: string): JobApplication[] {
  const lines = splitCSVLines(csvString);
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(unescapeCSV);
  const applications: JobApplication[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = {
      salary: { amount: 0, currency: 'USD' },
      links: { job: '', linkedin: '', website: '' },
    };

    headers.forEach((header, idx) => {
      const raw = idx < values.length ? unescapeCSV(values[idx]) : '';
      if (!raw) return;

      if (header === 'rounds') {
        try { obj.rounds = JSON.parse(raw) as InterviewRound[]; } catch { /* skip */ }
        return;
      }

      const parts = header.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        if (!obj[parent]) obj[parent] = {};
        // Auto-convert numbers
        if (child === 'amount') {
          obj[parent][child] = parseFloat(raw) || 0;
        } else {
          obj[parent][child] = raw;
        }
      } else {
        // Top-level fields — auto-convert known number fields
        if (['rating', 'phoneScreens', 'interviews'].includes(header)) {
          obj[header] = parseFloat(raw) || undefined;
        } else {
          obj[header] = raw;
        }
      }
    });

    // Ensure required fields have defaults
    if (!obj.id) obj.id = `import-${Date.now()}-${i}`;
    if (!obj.company) obj.company = 'Unknown';
    if (!obj.position) obj.position = 'Unknown';
    if (!obj.status) obj.status = 'pending';
    if (!obj.date) obj.date = new Date().toISOString().split('T')[0];
    if (!obj.country) obj.country = 'US';
    if (!obj.city) obj.city = '';
    if (!obj.sector) obj.sector = '';
    if (!obj.workType) obj.workType = 'remote';

    applications.push(obj as JobApplication);
  }

  return applications;
}
