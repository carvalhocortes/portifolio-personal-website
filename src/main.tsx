import React from 'react';
import ReactDOM from 'react-dom/client';
import './shared/i18n'; // Inicializa i18n antes do App
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
