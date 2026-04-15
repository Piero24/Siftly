/**
 * StorageAdapter — Unified data-access abstraction.
 *
 * Implementations:
 *   • SupabaseAdapter  — remote Postgres via Supabase JS
 *   • SelfHostedAdapter — local SQLite via custom lightweight API
 */
import { JobApplication } from '../types/job';
import { supabase } from './supabaseClient';
import { logger } from './logger';
import { getStoredProfile } from './localAuth';
import { StorageAdapter } from './storageInterface';

// ── Supabase ────────────────────────────────────────────
export class SupabaseUnconfiguredError extends Error {
  constructor() {
    super('Supabase client is not configured. Please add your API keys.');
    this.name = 'SupabaseUnconfiguredError';
  }
}

// Maps Supabase snake_case rows to camelCase JobApplication objects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToApp(row: any): JobApplication {
  return {
    id: row.id,
    company: row.company ?? '',
    logo: row.logo,
    sector: row.sector ?? '',
    position: row.position ?? '',
    employmentType: row.employment_type,
    country: row.country ?? '',
    city: row.city ?? '',
    workType: row.work_type ?? 'remote',
    cvProfileId: row.cv_profile_id,
    status: row.status ?? 'pending',
    salary: {
      amount: row.salary_amount ?? 0,
      currency: row.salary_currency ?? 'USD',
    },
    date: row.date ?? '',
    links: {
      job: row.link_job ?? '',
      linkedin: row.link_linkedin ?? '',
      website: row.link_website ?? '',
    },
    description: row.description,
    rating: row.rating,
    referral: row.referral_referrer
      ? {
          referrer: row.referral_referrer,
          date: row.referral_date ?? '',
          note: row.referral_note ?? '',
          link: row.referral_link,
          code: row.referral_code,
        }
      : undefined,
    recruiter: row.recruiter_name
      ? {
          name: row.recruiter_name,
          email: row.recruiter_email,
          phone: row.recruiter_phone,
        }
      : undefined,
    notes: row.notes,
    phoneScreens: row.phone_screens,
    interviews: row.interviews,
    rounds: row.rounds ?? undefined,
  };
}

function appToRow(app: JobApplication) {
  return {
    id: app.id,
    company: app.company,
    logo: app.logo ?? null,
    sector: app.sector,
    position: app.position,
    employment_type: app.employmentType ?? null,
    country: app.country,
    city: app.city,
    work_type: app.workType,
    cv_profile_id: app.cvProfileId ?? null,
    status: app.status,
    salary_amount: app.salary.amount,
    salary_currency: app.salary.currency,
    date: app.date,
    link_job: app.links.job,
    link_linkedin: app.links.linkedin,
    link_website: app.links.website,
    description: app.description ?? null,
    rating: app.rating ?? null,
    referral_referrer: app.referral?.referrer ?? null,
    referral_date: app.referral?.date ?? null,
    referral_note: app.referral?.note ?? null,
    referral_link: app.referral?.link ?? null,
    referral_code: app.referral?.code ?? null,
    recruiter_name: app.recruiter?.name ?? null,
    recruiter_email: app.recruiter?.email ?? null,
    recruiter_phone: app.recruiter?.phone ?? null,
    notes: app.notes ?? null,
    phone_screens: app.phoneScreens ?? null,
    interviews: app.interviews ?? null,
    rounds: app.rounds ?? null,
  };
}

export class SupabaseAdapter implements StorageAdapter {
  async getAll(): Promise<JobApplication[]> {
    if (!supabase) throw new SupabaseUnconfiguredError();
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .is('deleted_at', null)
      .order('date', { ascending: false });
    if (error) {
      logger.error('[SupabaseAdapter] getAll:', error);
      throw error;
    }
    return (data ?? []).map(rowToApp);
  }

  async upsert(app: JobApplication): Promise<void> {
    if (!supabase) throw new SupabaseUnconfiguredError();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const row = { ...appToRow(app), user_id: session?.user?.id };
    const { error } = await supabase.from('job_applications').upsert(row);
    if (error) {
      logger.error('[SupabaseAdapter] upsert:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!supabase) throw new SupabaseUnconfiguredError();
    const { error } = await supabase.rpc('soft_delete_application', { app_id: id });
    if (error) {
      logger.error('[SupabaseAdapter] remove (soft):', error);
      throw error;
    }
  }

  async removeAll(): Promise<void> {
    if (!supabase) throw new SupabaseUnconfiguredError();
    const { error } = await supabase.rpc('soft_delete_all_applications');
    if (error) {
      logger.error('[SupabaseAdapter] removeAll (soft):', error);
      throw error;
    }
  }

  async importBatch(apps: JobApplication[]): Promise<void> {
    if (!supabase) throw new SupabaseUnconfiguredError();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const rows = apps.map((app) => ({ ...appToRow(app), user_id: session?.user?.id }));
    const { error } = await supabase.from('job_applications').upsert(rows);
    if (error) {
      logger.error('[SupabaseAdapter] importBatch:', error);
      throw error;
    }
  }
}

// ── Local SQLite Server  ────────────────────────────────
export class SelfHostedAdapter implements StorageAdapter {
  private getHeaders(): Record<string, string> {
    const profile = getStoredProfile();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (profile) {
      headers['X-User-Id'] = profile.id;
    }
    return headers;
  }

  async getAll(): Promise<JobApplication[]> {
    const res = await fetch('/api/applications', {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch applications');
    }
    return res.json();
  }

  async upsert(app: JobApplication): Promise<void> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(app),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upsert application');
    }
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to remove application');
    }
  }

  async removeAll(): Promise<void> {
    const res = await fetch('/api/applications', {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to remove all applications');
    }
  }

  async importBatch(apps: JobApplication[]): Promise<void> {
    const res = await fetch('/api/applications/batch', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(apps),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import batch');
    }
  }
}

export type StorageMode = 'remote' | 'local' | 'both';

export function createAdapter(mode: StorageMode): StorageAdapter {
  switch (mode) {
    case 'remote':
      return new SupabaseAdapter();
    case 'local':
      return new SelfHostedAdapter();
    case 'both':
      return new SupabaseAdapter(); // Fallback conceptually
    default:
      return new SupabaseAdapter();
  }
}
