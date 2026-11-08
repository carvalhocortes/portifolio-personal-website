import { lazy, Suspense } from 'react';
import { routeFor, type Route } from './app/routes';
import { useDocumentLanguage } from './shared/lib/useDocumentLanguage';
import './app/styles/index.css';

const PAGES: Record<Route, ReturnType<typeof lazy>> = {
  desktop: lazy(() => import('./pages/DesktopPage/ui/DesktopPage')),
  terminal: lazy(() => import('./pages/TerminalPage/ui/TerminalPage')),
  landing: lazy(() => import('./pages/LandingPage/ui/LandingPage')),
};

function App() {
  useDocumentLanguage();
  const Page = PAGES[routeFor(window.location.pathname)];
  return (
    // While a page chunk loads, keep the screen blank instead of flashing text.
    <Suspense fallback={<div className="loading-screen" aria-busy="true" />}>
      <Page />
    </Suspense>
  );
}

export default App;
