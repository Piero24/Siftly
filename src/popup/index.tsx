import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './Main';
import '../styles/glass.css';
import '../styles/popup.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ width: '372px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
      <Main />
    </div>
  </React.StrictMode>
);
