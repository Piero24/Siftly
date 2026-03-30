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

type RoutingMode = 'hash' | 'path';

const isValidView = (value: string): value is ViewType => (
  value === 'settings' || value === 'table' || value === 'interviewing' || value === 'dashboard' || value === 'account'
);

const getViewFromHash = (): ViewType => {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (isValidView(hash)) return hash;
  return 'dashboard';
};

const viewToPath = (view: ViewType): string => {
  if (view === 'dashboard') return '/';
  return `/${view}`;
};

const getViewFromPath = (): ViewType => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  const normalized = path === '' ? '/' : path;
  if (normalized === '/') return 'dashboard';
  const value = normalized.startsWith('/') ? normalized.slice(1) : normalized;
  if (isValidView(value)) return value;
  return 'dashboard';
};

const UIContext = createContext<UIContextValue | null>(null);

interface UIProviderProps {
  children: React.ReactNode;
  routingMode?: RoutingMode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children, routingMode = 'hash' }) => {
  const [currentView, setCurrentViewState] = useState<ViewType>(() => (
    routingMode === 'path' ? getViewFromPath() : getViewFromHash()
  ));
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const setCurrentView: React.Dispatch<React.SetStateAction<ViewType>> = (next) => {
    setCurrentViewState((previous) => {
      const resolved = typeof next === 'function' ? next(previous) : next;

      if (typeof window !== 'undefined') {
        if (routingMode === 'path') {
          const nextPath = viewToPath(resolved);
          const currentPath = window.location.pathname || '/';
          if (nextPath !== currentPath) {
            window.history.pushState({}, '', nextPath);
          }
        } else {
          const nextHash = resolved === 'dashboard' ? '' : `#${resolved}`;
          const currentHash = window.location.hash || '';
          if (nextHash !== currentHash) {
            window.location.hash = nextHash;
          }
        }
      }

      return resolved;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (routingMode === 'path') {
      const onPopState = () => setCurrentViewState(getViewFromPath());
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }

    const onHashChange = () => setCurrentViewState(getViewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [routingMode]);

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
