/**
 * StorageAdapter — Unified data-access abstraction.
 *
 * Three implementations:
 *   • SupabaseAdapter  — remote Postgres via Supabase JS
 *   • IndexedDBAdapter — browser-local IndexedDB
 *   • DualSyncAdapter  — writes to both, reads from remote (falls back to local)
 */
import { JobApplication } from '../types/job';
import { supabase } from './supabaseClient';
import { idbGetAll, idbPut, idbPutBatch, idbDelete, idbClear } from './indexedDB';
import { logger } from './logger';

// ── Interface ───────────────────────────────────────────
export interface StorageAdapter {
  getAll(): Promise<JobApplication[]>;
  upsert(app: JobApplication): Promise<void>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<void>;
  importBatch(apps: JobApplication[]): Promise<void>;
}

// ── Supabase ────────────────────────────────────────────
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
    referral: row.referral_referrer ? {
      referrer: row.referral_referrer,
      date: row.referral_date ?? '',
      note: row.referral_note ?? '',
      link: row.referral_link,
      code: row.referral_code,
    } : undefined,
    recruiter: row.recruiter_name ? {
      name: row.recruiter_name,
      email: row.recruiter_email,
      phone: row.recruiter_phone,
    } : undefined,
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
    if (!supabase) return [];
    const { data, error } = await supabase.from('job_applications').select('*').order('date', { ascending: false });
    if (error) { logger.error('[SupabaseAdapter] getAll:', error); return []; }
    return (data ?? []).map(rowToApp);
  }

  async upsert(app: JobApplication): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('job_applications').upsert(appToRow(app));
    if (error) logger.error('[SupabaseAdapter] upsert:', error);
  }

  async remove(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('job_applications').delete().eq('id', id);
    if (error) logger.error('[SupabaseAdapter] remove:', error);
  }

  async removeAll(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('job_applications').delete().neq('id', '');
    if (error) logger.error('[SupabaseAdapter] removeAll:', error);
  }

  async importBatch(apps: JobApplication[]): Promise<void> {
    if (!supabase) return;
    const rows = apps.map(appToRow);
    const { error } = await supabase.from('job_applications').upsert(rows);
    if (error) logger.error('[SupabaseAdapter] importBatch:', error);
  }
}

// ── IndexedDB ───────────────────────────────────────────
export class IndexedDBAdapter implements StorageAdapter {
  async getAll(): Promise<JobApplication[]> {
    return idbGetAll();
  }
  async upsert(app: JobApplication): Promise<void> {
    return idbPut(app);
  }
  async remove(id: string): Promise<void> {
    return idbDelete(id);
  }
  async removeAll(): Promise<void> {
    return idbClear();
  }
  async importBatch(apps: JobApplication[]): Promise<void> {
    return idbPutBatch(apps);
  }
}

// ── Dual Sync (writes to both, reads from remote first) ─
export class DualSyncAdapter implements StorageAdapter {
  private remote = new SupabaseAdapter();
  private local = new IndexedDBAdapter();

  async getAll(): Promise<JobApplication[]> {
    try {
      const remoteApps = await this.remote.getAll();
      // Keep local in sync
      await this.local.importBatch(remoteApps);
      return remoteApps;
    } catch {
      // Fallback to local if remote is unavailable
      logger.warn('[DualSync] Remote unavailable, reading from local');
      return this.local.getAll();
    }
  }

  async upsert(app: JobApplication): Promise<void> {
    await Promise.all([this.remote.upsert(app), this.local.upsert(app)]);
  }

  async remove(id: string): Promise<void> {
    await Promise.all([this.remote.remove(id), this.local.remove(id)]);
  }

  async removeAll(): Promise<void> {
    await Promise.all([this.remote.removeAll(), this.local.removeAll()]);
  }

  async importBatch(apps: JobApplication[]): Promise<void> {
    await Promise.all([this.remote.importBatch(apps), this.local.importBatch(apps)]);
  }
}

// ── Factory ─────────────────────────────────────────────
export type StorageMode = 'remote' | 'local' | 'both';

export function createAdapter(mode: StorageMode): StorageAdapter {
  switch (mode) {
    case 'remote': return new SupabaseAdapter();
    case 'local': return new IndexedDBAdapter();
    case 'both': return new DualSyncAdapter();
  }
}
