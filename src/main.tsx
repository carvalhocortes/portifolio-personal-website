import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { routeFor } from './app/routes';
import { hasBooted } from './shared/lib/bootMark';
import './shared/i18n';

// Scopes the global styles of each page (see app/styles/global.css).
const route = routeFor(window.location.pathname);
document.documentElement.dataset.route = route;

// While the desktop loads, the page shows the colour of what comes next: black
// if the boot screen will play, the desktop teal otherwise (no black flash).
if (route === 'desktop' && !hasBooted()) {
  document.documentElement.dataset.boot = '';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
