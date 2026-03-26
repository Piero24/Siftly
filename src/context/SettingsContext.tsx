import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { CVProfile } from '../types/job';
import { ResolvedTheme, ThemeMode } from '../types/ui';

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
  cvProfiles: CVProfile[];
  setCvProfiles: React.Dispatch<React.SetStateAction<CVProfile[]>>;
}

const THEME_STORAGE_KEY = 'lumina-theme-mode';

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
  const [defaultTimeRange, setDefaultTimeRange] = useState<'today' | 'total' | '7d' | '30d' | '1y'>('total');
  const [cvProfiles, setCvProfiles] = useState<CVProfile[]>([
    { id: 'cv-default', name: 'Default CV', color: '#007AFF' },
  ]);

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
    cvProfiles,
    setCvProfiles,
  }), [
    language,
    currency,
    theme,
    resolvedTheme,
    autoNoResponse,
    autoNoResponseDays,
    defaultTimeRange,
    cvProfiles,
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
