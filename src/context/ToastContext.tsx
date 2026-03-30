import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { XIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../components/common/Icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircleIcon size={18} />}
              {toast.type === 'error' && <XCircleIcon size={18} />}
              {toast.type === 'info' && <ClockIcon size={18} />}
            </div>
            <div className="toast-message">
              {toast.type === 'error' && <strong style={{ display: 'block', marginBottom: '4px' }}>Error</strong>}
              {toast.message}
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <XIcon size={14} />
            </button>
            <div className="toast-progress-bar" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
