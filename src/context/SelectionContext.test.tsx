import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SelectionProvider, useSelection } from './SelectionContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SelectionProvider>{children}</SelectionProvider>
);

describe('SelectionContext', () => {
  it('provides default selection values', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });

    expect(result.current.selectorMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.bulkStatus).toBe('applied');
    expect(result.current.bulkLinkKind).toBe('job');
  });

  it('allows updating selection state', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });

    act(() => {
      result.current.setSelectorMode(true);
      result.current.setBulkStatus('offer');
      result.current.setBulkLinkKind('linkedin');
      result.current.setSelectedIds(new Set(['app-1', 'app-2']));
    });

    expect(result.current.selectorMode).toBe(true);
    expect(result.current.bulkStatus).toBe('offer');
    expect(result.current.bulkLinkKind).toBe('linkedin');
    expect(Array.from(result.current.selectedIds)).toEqual(['app-1', 'app-2']);
  });
});
