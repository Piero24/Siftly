import type { CVProfile } from '../types/job';
import type { OverviewScope } from '../constants/dashboard';
import type { StorageMode } from './storage';
import type { ThemeMode } from '../types/ui';
import { logger } from './logger';
import { supabase } from './supabaseClient';

const settingsLogger = logger.for('SettingsStorage');

export type SettingsNotifications = { email: boolean };
export type SettingsPrivacy = { telemetry: boolean; dataRetention: number };
export type SettingsTableDisplay = {
  visibleColumns: string[];
  defaultSort: string;
  rowsPerPage: number;
};

export type SettingsSnapshot = {
  language: string;
  currency: string;
  theme: ThemeMode;
  autoNoResponse: boolean;
  autoNoResponseDays: number;
  defaultTimeRange: 'today' | 'total' | '7d' | '30d' | '1y';
  defaultOverviewScope: OverviewScope;
  cvProfiles: CVProfile[];
  storageMode: StorageMode;
  notifications: SettingsNotifications;
  privacy: SettingsPrivacy;
  tableDisplay: SettingsTableDisplay;
  useSoftIconBackground: boolean;
  isDraggable: boolean;
  autoCloseEnabled: boolean;
  autoCloseTimer: number;
};

type UserSettingsRow = {
  user_id: string;
  language: string;
  currency: string;
  theme: string;
  auto_no_response: boolean;
  auto_no_response_days: number;
  default_time_range: string;
  default_overview_scope: string;
  storage_mode: string;
  cv_profiles: unknown;
  notifications: unknown;
  privacy: unknown;
  table_display: unknown;
  use_soft_icon_background: boolean;
  is_draggable: boolean;
  auto_close_enabled: boolean;
  auto_close_timer: number;
};

function asThemeMode(value: string): ThemeMode {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
}

function asDefaultTimeRange(value: string): SettingsSnapshot['defaultTimeRange'] {
  if (
    value === 'today' ||
    value === '7d' ||
    value === '30d' ||
    value === '1y' ||
    value === 'total'
  ) {
    return value;
  }
  return 'total';
}

function asOverviewScope(value: string): OverviewScope {
  return value === 'current' ? 'current' : 'total';
}

function asStorageMode(value: string): StorageMode {
  if (value === 'local' || value === 'both' || value === 'remote') {
    return value;
  }
  return 'remote';
}

function asNotifications(value: unknown): SettingsNotifications {
  if (!value || typeof value !== 'object') {
    return { email: false };
  }

  const candidate = value as Partial<SettingsNotifications>;
  return {
    email: Boolean(candidate.email),
  };
}

function asPrivacy(value: unknown): SettingsPrivacy {
  if (!value || typeof value !== 'object') {
    return { telemetry: true, dataRetention: 0 };
  }

  const candidate = value as Partial<SettingsPrivacy>;
  return {
    telemetry: candidate.telemetry !== false,
    dataRetention:
      typeof candidate.dataRetention === 'number' && Number.isFinite(candidate.dataRetention)
        ? Math.max(0, Math.floor(candidate.dataRetention))
        : 0,
  };
}

function asTableDisplay(value: unknown): SettingsTableDisplay {
  if (!value || typeof value !== 'object') {
    return {
      visibleColumns: ['company', 'position', 'status', 'date'],
      defaultSort: 'date-desc',
      rowsPerPage: 20,
    };
  }

  const candidate = value as Partial<SettingsTableDisplay>;
  const visibleColumns = Array.isArray(candidate.visibleColumns)
    ? candidate.visibleColumns.filter((item): item is string => typeof item === 'string')
    : ['company', 'position', 'status', 'date'];

  return {
    visibleColumns,
    defaultSort: typeof candidate.defaultSort === 'string' ? candidate.defaultSort : 'date-desc',
    rowsPerPage:
      typeof candidate.rowsPerPage === 'number' && Number.isFinite(candidate.rowsPerPage)
        ? Math.max(1, Math.floor(candidate.rowsPerPage))
        : 20,
  };
}

function asCvProfiles(value: unknown): CVProfile[] {
  if (!Array.isArray(value)) {
    return [{ id: 'cv-default', name: 'Default CV', color: '#007AFF' }];
  }

  const parsed = value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const candidate = item as Partial<CVProfile>;
      if (
        typeof candidate.id !== 'string' ||
        typeof candidate.name !== 'string' ||
        typeof candidate.color !== 'string'
      ) {
        return null;
      }
      return {
        id: candidate.id,
        name: candidate.name,
        color: candidate.color,
      };
    })
    .filter((item): item is CVProfile => item !== null);

  return parsed.length > 0 ? parsed : [{ id: 'cv-default', name: 'Default CV', color: '#007AFF' }];
}

function rowToSnapshot(row: UserSettingsRow): SettingsSnapshot {
  return {
    language: row.language || 'en',
    currency: row.currency || 'USD',
    theme: asThemeMode(row.theme),
    autoNoResponse: Boolean(row.auto_no_response),
    autoNoResponseDays:
      typeof row.auto_no_response_days === 'number' && Number.isFinite(row.auto_no_response_days)
        ? Math.max(1, Math.floor(row.auto_no_response_days))
        : 60,
    defaultTimeRange: asDefaultTimeRange(row.default_time_range),
    defaultOverviewScope: asOverviewScope(row.default_overview_scope),
    storageMode: asStorageMode(row.storage_mode),
    cvProfiles: asCvProfiles(row.cv_profiles),
    notifications: asNotifications(row.notifications),
    privacy: asPrivacy(row.privacy),
    tableDisplay: asTableDisplay(row.table_display),
    useSoftIconBackground: row.use_soft_icon_background !== false,
    isDraggable: row.is_draggable !== false,
    autoCloseEnabled: row.auto_close_enabled !== false,
    autoCloseTimer:
      typeof row.auto_close_timer === 'number' && Number.isFinite(row.auto_close_timer)
        ? Math.max(1, Math.floor(row.auto_close_timer))
        : 5,
  };
}

function snapshotToRow(userId: string, snapshot: SettingsSnapshot) {
  return {
    user_id: userId,
    language: snapshot.language,
    currency: snapshot.currency,
    theme: snapshot.theme,
    auto_no_response: snapshot.autoNoResponse,
    auto_no_response_days: Math.max(1, Math.floor(snapshot.autoNoResponseDays)),
    default_time_range: snapshot.defaultTimeRange,
    default_overview_scope: snapshot.defaultOverviewScope,
    storage_mode: snapshot.storageMode,
    cv_profiles: snapshot.cvProfiles,
    notifications: snapshot.notifications,
    privacy: snapshot.privacy,
    table_display: snapshot.tableDisplay,
    use_soft_icon_background: snapshot.useSoftIconBackground,
    is_draggable: snapshot.isDraggable,
    auto_close_enabled: snapshot.autoCloseEnabled,
    auto_close_timer: Math.max(1, Math.floor(snapshot.autoCloseTimer)),
    deleted_at: null,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id ?? null;
}

import { DEPLOYMENT } from '../config/deploymentMode';
import { getStoredProfile } from './localAuth';

export async function loadRemoteSettingsSnapshot(): Promise<SettingsSnapshot | null> {
  if (DEPLOYMENT.storageMode === 'local') {
    const profile = getStoredProfile();
    if (!profile) return null;
    try {
      const res = await fetch('/api/settings', {
        headers: { 'X-User-Id': profile.id },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data ? rowToSnapshot(data) : null;
    } catch {
      return null;
    }
  }

  if (!supabase) {
    return null;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select(
      'user_id,language,currency,theme,auto_no_response,auto_no_response_days,default_time_range,default_overview_scope,storage_mode,cv_profiles,notifications,privacy,table_display,use_soft_icon_background,is_draggable,auto_close_enabled,auto_close_timer'
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    settingsLogger.warn('Failed to load remote settings snapshot', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return rowToSnapshot(data as UserSettingsRow);
}

export async function saveRemoteSettingsSnapshot(snapshot: SettingsSnapshot): Promise<void> {
  if (DEPLOYMENT.storageMode === 'local') {
    const profile = getStoredProfile();
    if (!profile) return;
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profile.id,
        },
        body: JSON.stringify(snapshotToRow(profile.id, snapshot)),
      });
    } catch (err) {
      settingsLogger.warn('Failed to save local settings snapshot', err);
    }
    return;
  }

  if (!supabase) {
    return;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const row = snapshotToRow(userId, snapshot);
  const { error } = await supabase.from('user_settings').upsert(row, { onConflict: 'user_id' });

  if (error) {
    settingsLogger.warn('Failed to save remote settings snapshot', error);
  }
}
