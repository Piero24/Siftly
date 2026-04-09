import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './Main';
import { SettingsProvider } from '../context/SettingsContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/glass.css';
import '../styles/popup.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <AuthProvider>
          <div style={{ width: '372px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
            <Main />
          </div>
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  </React.StrictMode>
);
