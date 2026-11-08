import { lazy, Suspense } from 'react';
import { routeFor } from './app/routes';
import './app/styles/index.css';

const DesktopPage = lazy(() => import('./pages/DesktopPage/ui/DesktopPage'));
const LandingPage = lazy(() => import('./pages/LandingPage/ui/LandingPage'));

function App() {
  const route = routeFor(window.location.pathname);
  return (
    // While a page chunk loads, keep the screen blank instead of flashing text.
    <Suspense fallback={<div className="loading-screen" aria-busy="true" />}>
      {route === 'desktop' ? <DesktopPage /> : <LandingPage />}
    </Suspense>
  );
}

export default App;
