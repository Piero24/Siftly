import React, { createContext, useContext, useMemo, useState } from 'react';

import { JobStatus } from '../types/job';

interface SelectionContextValue {
  selectorMode: boolean;
  setSelectorMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  bulkStatus: JobStatus;
  setBulkStatus: React.Dispatch<React.SetStateAction<JobStatus>>;
  bulkLinkKind: 'job' | 'website' | 'linkedin';
  setBulkLinkKind: React.Dispatch<React.SetStateAction<'job' | 'website' | 'linkedin'>>;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectorMode, setSelectorMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<JobStatus>('applied');
  const [bulkLinkKind, setBulkLinkKind] = useState<'job' | 'website' | 'linkedin'>('job');

  const value = useMemo<SelectionContextValue>(() => ({
    selectorMode,
    setSelectorMode,
    selectedIds,
    setSelectedIds,
    bulkStatus,
    setBulkStatus,
    bulkLinkKind,
    setBulkLinkKind,
  }), [
    selectorMode,
    selectedIds,
    bulkStatus,
    bulkLinkKind,
  ]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
