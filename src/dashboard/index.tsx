import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/glass.css';
import '../styles/toast.css';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { UIProvider } from '../context/UIContext';
import { SelectionProvider } from '../context/SelectionContext';
import { TableFilterProvider } from '../context/TableFilterContext';
import { ToastProvider } from '../context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <UIProvider routingMode="hash">
            <SelectionProvider>
              <TableFilterProvider>
                <App />
              </TableFilterProvider>
            </SelectionProvider>
          </UIProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
