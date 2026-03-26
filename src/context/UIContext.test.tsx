import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { UIProvider, useUI } from './UIContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UIProvider>{children}</UIProvider>
);

afterEach(() => {
  window.location.hash = '';
});

describe('UIContext', () => {
  it('initializes current view from hash', () => {
    window.location.hash = '#settings';

    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.currentView).toBe('settings');
  });

  it('updates current view on hash changes', () => {
    window.location.hash = '#dashboard';
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      window.location.hash = '#interviewing';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.currentView).toBe('interviewing');
  });
});
