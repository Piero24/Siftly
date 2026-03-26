import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('loads theme from storage and applies it to the document', () => {
    window.localStorage.setItem('lumina-theme-mode', 'dark');

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('persists theme updates', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(window.localStorage.getItem('lumina-theme-mode')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
