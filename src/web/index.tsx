import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '../dashboard/App';
import '../styles/glass.css';
import { SelectionProvider } from '../context/SelectionContext';
import { SettingsProvider } from '../context/SettingsContext';
import { TableFilterProvider } from '../context/TableFilterContext';
import { UIProvider } from '../context/UIContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoginPage } from '../components/auth/LoginPage';
import { ToastProvider } from '../context/ToastContext';
import { FEATURES } from '../config/features';
import { DEPLOYMENT_MODE } from '../config/deploymentMode';
import '../styles/toast.css';

/** Gate that shows the login page or the main app based on auth state. */
const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--glass-border, #e0e0e0)', borderTopColor: 'var(--accent, #007AFF)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ToastProvider>
      {FEATURES.debug.showToolbar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#FF3B30',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '2px 6px',
          zIndex: 10001,
          borderBottomRightRadius: '4px',
          pointerEvents: 'none'
        }}>
          DEV MODE ({DEPLOYMENT_MODE})
        </div>
      )}
      <SettingsProvider>
        <UIProvider routingMode="path">
          <SelectionProvider>
            <TableFilterProvider>
              <App />
            </TableFilterProvider>
          </SelectionProvider>
        </UIProvider>
      </SettingsProvider>
    </ToastProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </React.StrictMode>
);
