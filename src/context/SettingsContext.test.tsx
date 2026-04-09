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

  it('loads dashboard defaults from storage', () => {
    window.localStorage.setItem('siftly-default-time-range', '1y');
    window.localStorage.setItem('siftly-default-overview-scope', 'current');

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.defaultTimeRange).toBe('1y');
    expect(result.current.defaultOverviewScope).toBe('current');
  });

  it('persists dashboard default selector changes', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setDefaultTimeRange('30d');
      result.current.setDefaultOverviewScope('current');
    });

    expect(window.localStorage.getItem('siftly-default-time-range')).toBe('30d');
    expect(window.localStorage.getItem('siftly-default-overview-scope')).toBe('current');
  });

  it('uses popup behavior defaults when nothing is stored', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.isDraggable).toBe(true);
    expect(result.current.autoCloseEnabled).toBe(true);
    expect(result.current.autoCloseTimer).toBe(5);
  });

  it('persists popup behavior settings', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setIsDraggable(false);
      result.current.setAutoCloseEnabled(false);
      result.current.setAutoCloseTimer(8);
    });

    expect(window.localStorage.getItem('siftly-draggable-popup')).toBe('false');
    expect(window.localStorage.getItem('siftly-auto-close-enabled')).toBe('false');
    expect(window.localStorage.getItem('siftly-auto-close-timer')).toBe('8');
  });
});
