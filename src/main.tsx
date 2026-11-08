import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { routeFor } from './app/routes';
import './shared/i18n';

// Scopes the global styles of each page (see app/styles/global.css).
document.documentElement.dataset.route = routeFor(window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
