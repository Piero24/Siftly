import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/glass.css';
import { SettingsProvider } from '../context/SettingsContext';
import { UIProvider } from '../context/UIContext';
import { SelectionProvider } from '../context/SelectionContext';
import { TableFilterProvider } from '../context/TableFilterContext';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <UIProvider>
        <SelectionProvider>
          <TableFilterProvider>
            <App />
          </TableFilterProvider>
        </SelectionProvider>
      </UIProvider>
    </SettingsProvider>
  </React.StrictMode>
);
