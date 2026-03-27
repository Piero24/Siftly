import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import WebApp from './App';
import '../styles/glass.css';
import { SettingsProvider } from '../context/SettingsContext';
import { UIProvider } from '../context/UIContext';
import { SelectionProvider } from '../context/SelectionContext';
import { TableFilterProvider } from '../context/TableFilterContext';

const basename = process.env.NODE_ENV === 'production' ? '/Siftly' : '/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <SettingsProvider>
        <UIProvider>
          <SelectionProvider>
            <TableFilterProvider>
              <WebApp />
            </TableFilterProvider>
          </SelectionProvider>
        </UIProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);