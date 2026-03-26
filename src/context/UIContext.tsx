import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { JobApplication } from '../types/job';
import { ViewType } from '../types/ui';

interface UIContextValue {
  currentView: ViewType;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  selectedJob: JobApplication | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<JobApplication | null>>;
  editingJob: JobApplication | null;
  setEditingJob: React.Dispatch<React.SetStateAction<JobApplication | null>>;
  showNewModal: boolean;
  setShowNewModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const getViewFromHash = (): ViewType => {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'settings' || hash === 'table' || hash === 'interviewing' || hash === 'dashboard') {
    return hash as ViewType;
  }
  return 'dashboard';
};

const UIContext = createContext<UIContextValue | null>(null);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>(() => getViewFromHash());
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      setCurrentView(getViewFromHash());
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const value = useMemo<UIContextValue>(() => ({
    currentView,
    setCurrentView,
    selectedJob,
    setSelectedJob,
    editingJob,
    setEditingJob,
    showNewModal,
    setShowNewModal,
  }), [
    currentView,
    selectedJob,
    editingJob,
    showNewModal,
  ]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
