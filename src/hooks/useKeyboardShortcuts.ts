/**
 * useKeyboardShortcuts — Global keyboard shortcuts for the dashboard.
 *
 * Extracted from App.tsx to keep the orchestrator clean.
 */
import { useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';

export function useKeyboardShortcuts() {
  const { showNewModal, setShowNewModal, editingJob, setEditingJob, selectedJob, setSelectedJob, setCurrentView } = useUI();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.closest('.modal-content') && e.key !== 'Escape')
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setShowNewModal(true);
            showToast('Adding new application', 'info');
          }
          break;
        case 'd':
          e.preventDefault();
          setCurrentView('dashboard');
          break;
        case 'a':
          e.preventDefault();
          setCurrentView('table');
          break;
        case 'i':
          e.preventDefault();
          setCurrentView('interviewing');
          break;
        case '/':
          e.preventDefault();
          (document.querySelector('.search-input-field') as HTMLInputElement)?.focus();
          break;
        case 'escape':
          if (showNewModal) setShowNewModal(false);
          if (editingJob) setEditingJob(null);
          if (selectedJob) setSelectedJob(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView, setShowNewModal, showToast, showNewModal, editingJob, selectedJob, setEditingJob, setSelectedJob]);
}
