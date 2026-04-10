import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./localAuth', () => ({
  getStoredProfile: vi.fn(),
}));

import { getStoredProfile } from './localAuth';
import { SelfHostedAdapter, SupabaseAdapter, createAdapter } from './storage';

const mockGetStoredProfile = vi.mocked(getStoredProfile);

describe('SelfHostedAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    mockGetStoredProfile.mockReturnValue({
      id: 'local-user-1',
      displayName: 'Local User',
      email: 'local@example.com',
      createdAt: new Date().toISOString(),
    });
  });

  it('sends X-User-Id header when profile exists', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const adapter = new SelfHostedAdapter();
    await adapter.getAll();

    expect(fetch).toHaveBeenCalledWith('/api/applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'local-user-1',
      },
    });
  });

  it('omits X-User-Id header when profile is missing', async () => {
    mockGetStoredProfile.mockReturnValueOnce(null);

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const adapter = new SelfHostedAdapter();
    await adapter.getAll();

    expect(fetch).toHaveBeenCalledWith('/api/applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('throws API error message when getAll fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Missing X-User-Id header' }),
    } as Response);

    const adapter = new SelfHostedAdapter();

    await expect(adapter.getAll()).rejects.toThrow('Missing X-User-Id header');
  });

  it('upserts an application via POST /api/applications', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const adapter = new SelfHostedAdapter();
    const app = {
      id: 'app-1',
      company: 'Acme',
      sector: 'Tech',
      position: 'Engineer',
      country: 'US',
      city: 'SF',
      workType: 'remote',
      status: 'applied',
      salary: { amount: 100000, currency: 'USD' },
      date: '2026-01-01',
      links: { job: '', linkedin: '', website: '' },
      phoneScreens: 0,
      interviews: 0,
    };

    await adapter.upsert(app as any);

    expect(fetch).toHaveBeenCalledWith('/api/applications', {
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'X-User-Id': 'local-user-1',
      }),
      body: JSON.stringify(app),
    });
  });

  it('deletes a single application by id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const adapter = new SelfHostedAdapter();
    await adapter.remove('app-123');

    expect(fetch).toHaveBeenCalledWith('/api/applications/app-123', {
      method: 'DELETE',
      headers: expect.objectContaining({
        'X-User-Id': 'local-user-1',
      }),
    });
  });

  it('deletes all applications for current user', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const adapter = new SelfHostedAdapter();
    await adapter.removeAll();

    expect(fetch).toHaveBeenCalledWith('/api/applications', {
      method: 'DELETE',
      headers: expect.objectContaining({
        'X-User-Id': 'local-user-1',
      }),
    });
  });

  it('imports a batch using POST /api/applications/batch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const apps = [
      {
        id: 'a1',
        company: 'A',
        salary: { amount: 1, currency: 'USD' },
        links: { job: '', linkedin: '', website: '' },
      },
      {
        id: 'a2',
        company: 'B',
        salary: { amount: 2, currency: 'USD' },
        links: { job: '', linkedin: '', website: '' },
      },
    ];

    const adapter = new SelfHostedAdapter();
    await adapter.importBatch(apps as any);

    expect(fetch).toHaveBeenCalledWith('/api/applications/batch', {
      method: 'POST',
      headers: expect.objectContaining({
        'X-User-Id': 'local-user-1',
      }),
      body: JSON.stringify(apps),
    });
  });
});

describe('createAdapter', () => {
  it('returns local adapter for local mode', () => {
    const adapter = createAdapter('local');
    expect(adapter).toBeInstanceOf(SelfHostedAdapter);
  });

  it('returns supabase adapter for remote mode', () => {
    const adapter = createAdapter('remote');
    expect(adapter).toBeInstanceOf(SupabaseAdapter);
  });

  it('returns supabase adapter fallback for both mode', () => {
    const adapter = createAdapter('both');
    expect(adapter).toBeInstanceOf(SupabaseAdapter);
  });
});
