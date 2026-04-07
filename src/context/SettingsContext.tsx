import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { CVProfile } from '../types/job';
import { ResolvedTheme, ThemeMode } from '../types/ui';
import { StorageMode } from '../lib/storage';
import { DEPLOYMENT } from '../config/deploymentMode';
import { OverviewScope } from '../constants/dashboard';

interface SettingsContextValue {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  currency: string;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  theme: ThemeMode;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
  resolvedTheme: ResolvedTheme;
  autoNoResponse: boolean;
  setAutoNoResponse: React.Dispatch<React.SetStateAction<boolean>>;
  autoNoResponseDays: number;
  setAutoNoResponseDays: React.Dispatch<React.SetStateAction<number>>;
  defaultTimeRange: 'today' | 'total' | '7d' | '30d' | '1y';
  setDefaultTimeRange: React.Dispatch<React.SetStateAction<'today' | 'total' | '7d' | '30d' | '1y'>>;
  defaultOverviewScope: OverviewScope;
  setDefaultOverviewScope: React.Dispatch<React.SetStateAction<OverviewScope>>;
  cvProfiles: CVProfile[];
  setCvProfiles: React.Dispatch<React.SetStateAction<CVProfile[]>>;
  storageMode: StorageMode;
  setStorageMode: (mode: StorageMode) => void;
  notifications: { email: boolean };
  setNotifications: React.Dispatch<React.SetStateAction<{ email: boolean }>>;
  privacy: { telemetry: boolean; dataRetention: number };
  setPrivacy: React.Dispatch<React.SetStateAction<{ telemetry: boolean; dataRetention: number }>>;
  tableDisplay: { visibleColumns: string[]; defaultSort: string; rowsPerPage: number };
  setTableDisplay: React.Dispatch<React.SetStateAction<{ visibleColumns: string[]; defaultSort: string; rowsPerPage: number }>>;
  useSoftIconBackground: boolean;
  setUseSoftIconBackground: React.Dispatch<React.SetStateAction<boolean>>;
}

const THEME_STORAGE_KEY = 'lumina-theme-mode';
const STORAGE_MODE_KEY = 'siftly-storage-mode';
const NOTIFICATIONS_KEY = 'siftly-notifications';
const PRIVACY_KEY = 'siftly-privacy';
const TABLE_DISPLAY_KEY = 'siftly-table-display';
const ICON_STYLE_KEY = 'siftly-use-soft-icon-background';
const DEFAULT_TIME_RANGE_KEY = 'siftly-default-time-range';
const DEFAULT_OVERVIEW_SCOPE_KEY = 'siftly-default-overview-scope';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        return storedTheme;
      }
    } catch {
      // Ignore storage failures and fallback to system preference.
    }
    return 'system';
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [autoNoResponse, setAutoNoResponse] = useState(false);
  const [autoNoResponseDays, setAutoNoResponseDays] = useState(60);
  const [defaultTimeRange, setDefaultTimeRange] = useState<'today' | 'total' | '7d' | '30d' | '1y'>(() => {
    if (typeof window === 'undefined') return 'total';
    try {
      const stored = window.localStorage.getItem(DEFAULT_TIME_RANGE_KEY);
      if (stored === 'today' || stored === '7d' || stored === '30d' || stored === '1y' || stored === 'total') {
        return stored;
      }
      return 'total';
    } catch {
      return 'total';
    }
  });
  const [defaultOverviewScope, setDefaultOverviewScope] = useState<OverviewScope>(() => {
    if (typeof window === 'undefined') return 'total';
    try {
      const stored = window.localStorage.getItem(DEFAULT_OVERVIEW_SCOPE_KEY);
      return stored === 'current' ? 'current' : 'total';
    } catch {
      return 'total';
    }
  });
  const [cvProfiles, setCvProfiles] = useState<CVProfile[]>([
    { id: 'cv-default', name: 'Default CV', color: '#007AFF' },
  ]);

  // Storage mode is determined by deployment target.
  // Only editable in dev mode; otherwise locked.
  const [storageMode, setStorageModeInternal] = useState<StorageMode>(() => {
    if (!DEPLOYMENT.storageEditable) return DEPLOYMENT.storageMode;
    if (typeof window === 'undefined') return DEPLOYMENT.storageMode;
    const stored = window.localStorage.getItem(STORAGE_MODE_KEY);
    if (stored === 'remote' || stored === 'local' || stored === 'both') return stored;
    return DEPLOYMENT.storageMode;
  });

  // Guard: only allow storage mode changes when deployment permits it.
  const setStorageMode = (mode: StorageMode) => {
    if (!DEPLOYMENT.storageEditable) return;
    setStorageModeInternal(mode);
  };

  const [notifications, setNotifications] = useState(() => {
    if (typeof window === 'undefined') return { email: false };
    try {
      const stored = window.localStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : { email: false };
    } catch { return { email: false }; }
  });

  const [privacy, setPrivacy] = useState(() => {
    if (typeof window === 'undefined') return { telemetry: true, dataRetention: 0 };
    try {
      const stored = window.localStorage.getItem(PRIVACY_KEY);
      return stored ? JSON.parse(stored) : { telemetry: true, dataRetention: 0 };
    } catch { return { telemetry: true, dataRetention: 0 }; }
  });

  const [tableDisplay, setTableDisplay] = useState(() => {
    if (typeof window === 'undefined') return { visibleColumns: ['company', 'position', 'status', 'date'], defaultSort: 'date-desc', rowsPerPage: 20 };
    try {
      const stored = window.localStorage.getItem(TABLE_DISPLAY_KEY);
      return stored ? JSON.parse(stored) : { visibleColumns: ['company', 'position', 'status', 'date'], defaultSort: 'date-desc', rowsPerPage: 20 };
    } catch { return { visibleColumns: ['company', 'position', 'status', 'date'], defaultSort: 'date-desc', rowsPerPage: 20 }; }
  });

  const [useSoftIconBackground, setUseSoftIconBackground] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = window.localStorage.getItem(ICON_STYLE_KEY);
      if (stored == null) return true;
      return stored === 'true';
    } catch {
      return true;
    }
  });

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateFromSystem = (event?: MediaQueryListEvent) => {
      const isDark = event ? event.matches : mediaQuery.matches;
      setSystemTheme(isDark ? 'dark' : 'light');
    };

    updateFromSystem();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateFromSystem);
      return () => mediaQuery.removeEventListener('change', updateFromSystem);
    }

    mediaQuery.addListener(updateFromSystem);
    return () => mediaQuery.removeListener(updateFromSystem);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }, [theme]);

  // Only persist storage mode in dev where it's editable.
  useEffect(() => {
    if (!DEPLOYMENT.storageEditable) return;
    try {
      window.localStorage.setItem(STORAGE_MODE_KEY, storageMode);
    } catch { /* ignore */ }
  }, [storageMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch { /* ignore */ }
  }, [notifications]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacy));
    } catch { /* ignore */ }
  }, [privacy]);

  useEffect(() => {
    try {
      window.localStorage.setItem(TABLE_DISPLAY_KEY, JSON.stringify(tableDisplay));
    } catch { /* ignore */ }
  }, [tableDisplay]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ICON_STYLE_KEY, String(useSoftIconBackground));
    } catch { /* ignore */ }
  }, [useSoftIconBackground]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEFAULT_TIME_RANGE_KEY, defaultTimeRange);
    } catch { /* ignore */ }
  }, [defaultTimeRange]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEFAULT_OVERVIEW_SCOPE_KEY, defaultOverviewScope);
    } catch { /* ignore */ }
  }, [defaultOverviewScope]);

  const value = useMemo<SettingsContextValue>(() => ({
    language,
    setLanguage,
    currency,
    setCurrency,
    theme,
    setTheme,
    resolvedTheme,
    autoNoResponse,
    setAutoNoResponse,
    autoNoResponseDays,
    setAutoNoResponseDays,
    defaultTimeRange,
    setDefaultTimeRange,
    defaultOverviewScope,
    setDefaultOverviewScope,
    cvProfiles,
    setCvProfiles,
    storageMode,
    setStorageMode,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    tableDisplay,
    setTableDisplay,
    useSoftIconBackground,
    setUseSoftIconBackground,
  }), [
    language,
    currency,
    theme,
    resolvedTheme,
    autoNoResponse,
    autoNoResponseDays,
    defaultTimeRange,
    defaultOverviewScope,
    cvProfiles,
    storageMode,
    notifications,
    privacy,
    tableDisplay,
    useSoftIconBackground,
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
