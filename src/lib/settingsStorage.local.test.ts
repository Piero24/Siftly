import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/deploymentMode', () => ({
  DEPLOYMENT: {
    storageMode: 'local',
  },
}));

vi.mock('./localAuth', () => ({
  getStoredProfile: vi.fn(),
}));

vi.mock('./supabaseClient', () => ({
  supabase: null,
}));

import { getStoredProfile } from './localAuth';
import { loadRemoteSettingsSnapshot, saveRemoteSettingsSnapshot } from './settingsStorage';

const mockGetStoredProfile = vi.mocked(getStoredProfile);

describe('settingsStorage local backend integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns null when no local profile is available', async () => {
    mockGetStoredProfile.mockReturnValueOnce(null);

    const snapshot = await loadRemoteSettingsSnapshot();

    expect(snapshot).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('loads local settings snapshot from /api/settings with X-User-Id', async () => {
    mockGetStoredProfile.mockReturnValueOnce({
      id: 'profile-1',
      displayName: 'Piero',
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'piero@example.com',
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user_id: 'profile-1',
        language: 'it',
        currency: 'EUR',
        theme: 'dark',
        auto_no_response: true,
        auto_no_response_days: 30,
        default_time_range: '30d',
        default_overview_scope: 'current',
        storage_mode: 'local',
        cv_profiles: [{ id: 'cv-1', name: 'Backend CV', color: '#000000' }],
        notifications: { email: true },
        privacy: { telemetry: false, dataRetention: 7 },
        table_display: {
          visibleColumns: ['company', 'status'],
          defaultSort: 'date-desc',
          rowsPerPage: 50,
        },
        use_soft_icon_background: true,
        is_draggable: false,
        auto_close_enabled: true,
        auto_close_timer: 9,
      }),
    } as Response);

    const snapshot = await loadRemoteSettingsSnapshot();

    expect(fetch).toHaveBeenCalledWith('/api/settings', {
      headers: { 'X-User-Id': 'profile-1' },
    });

    expect(snapshot).toMatchObject({
      language: 'it',
      currency: 'EUR',
      theme: 'dark',
      autoNoResponse: true,
      autoNoResponseDays: 30,
      defaultTimeRange: '30d',
      defaultOverviewScope: 'current',
      storageMode: 'local',
      autoCloseTimer: 9,
      isDraggable: false,
    });
  });

  it('saves local settings snapshot to /api/settings using transformed payload', async () => {
    mockGetStoredProfile.mockReturnValueOnce({
      id: 'profile-2',
      displayName: 'Piero',
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'piero@example.com',
    });

    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);

    const snapshot = {
      language: 'en',
      currency: 'USD',
      theme: 'system' as const,
      autoNoResponse: false,
      autoNoResponseDays: 60,
      defaultTimeRange: 'total' as const,
      defaultOverviewScope: 'total' as const,
      cvProfiles: [{ id: 'cv-default', name: 'Default CV', color: '#007AFF' }],
      storageMode: 'local' as const,
      notifications: { email: false },
      privacy: { telemetry: true, dataRetention: 0 },
      tableDisplay: {
        visibleColumns: ['company', 'position', 'status', 'date'],
        defaultSort: 'date-desc',
        rowsPerPage: 20,
      },
      useSoftIconBackground: true,
      isDraggable: true,
      autoCloseEnabled: false,
      autoCloseTimer: 8,
    };

    await saveRemoteSettingsSnapshot(snapshot);

    expect(fetch).toHaveBeenCalledWith('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'profile-2',
      },
      body: expect.any(String),
    });

    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as any).body);
    expect(body.user_id).toBe('profile-2');
    expect(body.auto_no_response).toBe(false);
    expect(body.auto_close_timer).toBe(8);
    expect(body.deleted_at).toBeNull();
  });
});
