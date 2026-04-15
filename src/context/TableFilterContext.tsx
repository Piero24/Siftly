import React, { createContext, useContext, useMemo, useState } from 'react';

import { FilterField } from '../types/ui';

interface TableFilterContextValue {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  showFilterRow: boolean;
  setShowFilterRow: React.Dispatch<React.SetStateAction<boolean>>;
  filterField: FilterField | '';
  setFilterField: React.Dispatch<React.SetStateAction<FilterField | ''>>;
  filterValue: string;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
}

const TableFilterContext = createContext<TableFilterContextValue | null>(null);

export const TableFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [filterField, setFilterField] = useState<FilterField | ''>('');
  const [filterValue, setFilterValue] = useState('');

  const value = useMemo<TableFilterContextValue>(
    () => ({
      searchTerm,
      setSearchTerm,
      showFilterRow,
      setShowFilterRow,
      filterField,
      setFilterField,
      filterValue,
      setFilterValue,
    }),
    [searchTerm, showFilterRow, filterField, filterValue]
  );

  return <TableFilterContext.Provider value={value}>{children}</TableFilterContext.Provider>;
};

export const useTableFilters = () => {
  const context = useContext(TableFilterContext);
  if (!context) {
    throw new Error('useTableFilters must be used within a TableFilterProvider');
  }
  return context;
};
