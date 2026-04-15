/**
 * SettingsContext — Central provider for all user-configurable settings.
 *
 * Every setting is backed by localStorage (via `useLocalStorageState`)
 * and optionally synchronized to a remote backend (Supabase or local API)
 * via `useRemoteSettingsSync`.
 *
 * This file is intentionally kept as a "flat" context: each setting is an
 * independent state slice with its own setter. This avoids the complexity
 * of a reducer while keeping the provider's public API simple.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CVProfile } from '../types/job';
import { ResolvedTheme, ThemeMode } from '../types/ui';
import { StorageMode } from '../lib/storage';
import { DEPLOYMENT } from '../config/deploymentMode';
import { OverviewScope } from '../constants/dashboard';
import type { SettingsSnapshot } from '../lib/settingsStorage';
import {
  useLocalStorageState,
  booleanSerializer,
  intSerializer,
  jsonSerializer,
} from '../hooks/useLocalStorageState';
import { useRemoteSettingsSync } from '../hooks/useRemoteSettingsSync';

// ── Context Interface ──────────────────────────────────────

interface SettingsContextValue {
  /** ISO 639-1 language code (e.g. "en"). */
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  /** ISO 4217 currency code for salary display (e.g. "USD"). */
  currency: string;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  /** User-selected theme mode. */
  theme: ThemeMode;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
  /** Computed theme after resolving 'system' to 'light' or 'dark'. */
  resolvedTheme: ResolvedTheme;
  /** Auto-expire applied jobs to "no-response" after X days. */
  autoNoResponse: boolean;
  setAutoNoResponse: React.Dispatch<React.SetStateAction<boolean>>;
  autoNoResponseDays: number;
  setAutoNoResponseDays: React.Dispatch<React.SetStateAction<number>>;
  /** Default time range filter on the dashboard. */
  defaultTimeRange: 'today' | 'total' | '7d' | '30d' | '1y';
  setDefaultTimeRange: React.Dispatch<React.SetStateAction<'today' | 'total' | '7d' | '30d' | '1y'>>;
  /** Default overview scope on the dashboard KPI strip. */
  defaultOverviewScope: OverviewScope;
  setDefaultOverviewScope: React.Dispatch<React.SetStateAction<OverviewScope>>;
  /** User-defined CV profile list for tagging applications. */
  cvProfiles: CVProfile[];
  setCvProfiles: React.Dispatch<React.SetStateAction<CVProfile[]>>;
  /** Storage backend selector (remote | local | both). */
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
  /** Email notification preferences. */
  notifications: { email: boolean };
  setNotifications: React.Dispatch<React.SetStateAction<{ email: boolean }>>;
  /** Privacy and telemetry settings. */
  privacy: { telemetry: boolean; dataRetention: number };
  setPrivacy: React.Dispatch<React.SetStateAction<{ telemetry: boolean; dataRetention: number }>>;
  /** Table column visibility and pagination preferences. */
  tableDisplay: { visibleColumns: string[]; defaultSort: string; rowsPerPage: number };
  setTableDisplay: React.Dispatch<React.SetStateAction<{ visibleColumns: string[]; defaultSort: string; rowsPerPage: number }>>;
  /** Use averaged-color soft background for company icons. */
  useSoftIconBackground: boolean;
  setUseSoftIconBackground: React.Dispatch<React.SetStateAction<boolean>>;
  /** Allow dragging the extension popup panel. */
  isDraggable: boolean;
  setIsDraggable: React.Dispatch<React.SetStateAction<boolean>>;
  /** Auto-close popup after successful form submission. */
  autoCloseEnabled: boolean;
  setAutoCloseEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  /** Seconds before auto-close fires. */
  autoCloseTimer: number;
  setAutoCloseTimer: React.Dispatch<React.SetStateAction<number>>;
}

// ── localStorage Keys ──────────────────────────────────────

const KEYS = {
  theme: 'lumina-theme-mode',
  storageMode: 'siftly-storage-mode',
  notifications: 'siftly-notifications',
  privacy: 'siftly-privacy',
  tableDisplay: 'siftly-table-display',
  iconStyle: 'siftly-use-soft-icon-background',
  timeRange: 'siftly-default-time-range',
  overviewScope: 'siftly-default-overview-scope',
  draggable: 'siftly-draggable-popup',
  autoCloseEnabled: 'siftly-auto-close-enabled',
  autoCloseTimer: 'siftly-auto-close-timer',
} as const;

// ── Helpers ────────────────────────────────────────────────

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/** Deserializer that validates a ThemeMode string. */
const themeDeserializer = (raw: string): ThemeMode | null =>
  raw === 'light' || raw === 'dark' || raw === 'system' ? raw : null;

/** Deserializer that validates a time range string. */
const timeRangeDeserializer = (raw: string): ('today' | 'total' | '7d' | '30d' | '1y') | null =>
  raw === 'today' || raw === '7d' || raw === '30d' || raw === '1y' || raw === 'total'
    ? raw
    : null;

/** Deserializer that validates an overview scope string. */
const overviewScopeDeserializer = (raw: string): OverviewScope | null =>
  raw === 'current' || raw === 'total' ? raw : null;

/** Deserializer that validates a storage mode string. */
const storageModeDeserializer = (raw: string): StorageMode | null =>
  raw === 'remote' || raw === 'local' || raw === 'both' ? raw : null;

// ── Provider ───────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Plain state (synced from remote only) ──
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [autoNoResponse, setAutoNoResponse] = useState(false);
  const [autoNoResponseDays, setAutoNoResponseDays] = useState(60);
  const [cvProfiles, setCvProfiles] = useState<CVProfile[]>([
    { id: 'cv-default', name: 'Default CV', color: '#007AFF' },
  ]);

  // ── localStorage-backed state ──
  const [theme, setTheme] = useLocalStorageState<ThemeMode>(
    KEYS.theme, 'system', { deserialize: themeDeserializer },
  );
  const [defaultTimeRange, setDefaultTimeRange] = useLocalStorageState(
    KEYS.timeRange, 'total' as const, { deserialize: timeRangeDeserializer },
  );
  const [defaultOverviewScope, setDefaultOverviewScope] = useLocalStorageState<OverviewScope>(
    KEYS.overviewScope, 'total', { deserialize: overviewScopeDeserializer },
  );
  const [notifications, setNotifications] = useLocalStorageState(
    KEYS.notifications, { email: false }, jsonSerializer<{ email: boolean }>(),
  );
  const [privacy, setPrivacy] = useLocalStorageState(
    KEYS.privacy, { telemetry: true, dataRetention: 0 }, jsonSerializer<{ telemetry: boolean; dataRetention: number }>(),
  );
  const [tableDisplay, setTableDisplay] = useLocalStorageState(
    KEYS.tableDisplay,
    { visibleColumns: ['company', 'position', 'status', 'date'], defaultSort: 'date-desc', rowsPerPage: 20 },
    jsonSerializer<{ visibleColumns: string[]; defaultSort: string; rowsPerPage: number }>(),
  );
  const [useSoftIconBackground, setUseSoftIconBackground] = useLocalStorageState(
    KEYS.iconStyle, true, booleanSerializer,
  );
  const [isDraggable, setIsDraggable] = useLocalStorageState(
    KEYS.draggable, true, booleanSerializer,
  );
  const [autoCloseEnabled, setAutoCloseEnabled] = useLocalStorageState(
    KEYS.autoCloseEnabled, true, booleanSerializer,
  );
  const [autoCloseTimer, setAutoCloseTimer] = useLocalStorageState(
    KEYS.autoCloseTimer, 5, intSerializer(1),
  );

  // ── Storage mode (editable only in dev) ──
  const [storageModeInternal, setStorageModeInternal] = useLocalStorageState<StorageMode>(
    KEYS.storageMode,
    DEPLOYMENT.storageEditable ? DEPLOYMENT.storageMode : DEPLOYMENT.storageMode,
    { deserialize: DEPLOYMENT.storageEditable ? storageModeDeserializer : () => null },
  );
  const storageMode = DEPLOYMENT.storageEditable ? storageModeInternal : DEPLOYMENT.storageMode;
  const setStorageMode = (mode: StorageMode) => {
    if (!DEPLOYMENT.storageEditable) return;
    setStorageModeInternal(mode);
  };

  // ── System theme detection ──
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (e?: MediaQueryListEvent) => setSystemTheme(e ? (e.matches ? 'dark' : 'light') : (mq.matches ? 'dark' : 'light'));

    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  // ── Apply theme to DOM ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // ── Remote sync ──
  const snapshot: SettingsSnapshot = useMemo(() => ({
    language, currency, theme, autoNoResponse, autoNoResponseDays,
    defaultTimeRange, defaultOverviewScope, cvProfiles, storageMode,
    notifications, privacy, tableDisplay, useSoftIconBackground,
    isDraggable, autoCloseEnabled, autoCloseTimer,
  }), [
    language, currency, theme, autoNoResponse, autoNoResponseDays,
    defaultTimeRange, defaultOverviewScope, cvProfiles, storageMode,
    notifications, privacy, tableDisplay, useSoftIconBackground,
    isDraggable, autoCloseEnabled, autoCloseTimer,
  ]);

  const applySnapshot = useCallback((s: SettingsSnapshot) => {
    setLanguage(s.language);
    setCurrency(s.currency);
    setTheme(s.theme);
    setAutoNoResponse(s.autoNoResponse);
    setAutoNoResponseDays(s.autoNoResponseDays);
    setDefaultTimeRange(s.defaultTimeRange);
    setDefaultOverviewScope(s.defaultOverviewScope);
    setCvProfiles(s.cvProfiles);
    setNotifications(s.notifications);
    setPrivacy(s.privacy);
    setTableDisplay(s.tableDisplay);
    setUseSoftIconBackground(s.useSoftIconBackground);
    setIsDraggable(s.isDraggable);
    setAutoCloseEnabled(s.autoCloseEnabled);
    setAutoCloseTimer(s.autoCloseTimer);
    if (DEPLOYMENT.storageEditable) setStorageModeInternal(s.storageMode);
  }, [
    setTheme, setDefaultTimeRange, setDefaultOverviewScope, setNotifications, setPrivacy,
    setTableDisplay, setUseSoftIconBackground, setIsDraggable, setAutoCloseEnabled,
    setAutoCloseTimer, setStorageModeInternal,
  ]);

  useRemoteSettingsSync({ snapshot, applySnapshot });

  // ── Context value ──
  const value = useMemo<SettingsContextValue>(() => ({
    language, setLanguage, currency, setCurrency, theme, setTheme, resolvedTheme,
    autoNoResponse, setAutoNoResponse, autoNoResponseDays, setAutoNoResponseDays,
    defaultTimeRange, setDefaultTimeRange, defaultOverviewScope, setDefaultOverviewScope,
    cvProfiles, setCvProfiles, storageMode, setStorageMode,
    notifications, setNotifications, privacy, setPrivacy, tableDisplay, setTableDisplay,
    useSoftIconBackground, setUseSoftIconBackground, isDraggable, setIsDraggable,
    autoCloseEnabled, setAutoCloseEnabled, autoCloseTimer, setAutoCloseTimer,
  }), [
    language, currency, theme, resolvedTheme, autoNoResponse, autoNoResponseDays,
    defaultTimeRange, defaultOverviewScope, cvProfiles, storageMode,
    notifications, privacy, tableDisplay, useSoftIconBackground,
    isDraggable, autoCloseEnabled, autoCloseTimer,
  ]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
