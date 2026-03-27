import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '../dashboard/App';
import '../styles/glass.css';
import { SelectionProvider } from '../context/SelectionContext';
import { SettingsProvider } from '../context/SettingsContext';
import { TableFilterProvider } from '../context/TableFilterContext';
import { UIProvider } from '../context/UIContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <UIProvider routingMode="path">
        <SelectionProvider>
          <TableFilterProvider>
            <App />
          </TableFilterProvider>
        </SelectionProvider>
      </UIProvider>
    </SettingsProvider>
  </React.StrictMode>
);
