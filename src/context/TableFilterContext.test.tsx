import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { TableFilterProvider, useTableFilters } from './TableFilterContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TableFilterProvider>{children}</TableFilterProvider>
);

describe('TableFilterContext', () => {
  it('provides default filter values', () => {
    const { result } = renderHook(() => useTableFilters(), { wrapper });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.showFilterRow).toBe(false);
    expect(result.current.filterField).toBe('');
    expect(result.current.filterValue).toBe('');
  });

  it('allows updating table filters', () => {
    const { result } = renderHook(() => useTableFilters(), { wrapper });

    act(() => {
      result.current.setSearchTerm('google');
      result.current.setShowFilterRow(true);
      result.current.setFilterField('company');
      result.current.setFilterValue('Google');
    });

    expect(result.current.searchTerm).toBe('google');
    expect(result.current.showFilterRow).toBe(true);
    expect(result.current.filterField).toBe('company');
    expect(result.current.filterValue).toBe('Google');
  });
});
