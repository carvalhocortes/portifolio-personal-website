import { lazy, Suspense } from 'react';
import './app/styles/index.css';

const DesktopPage = lazy(() => import('./pages/DesktopPage/ui/DesktopPage'));

function App() {
  return (
    <Suspense fallback={<div className="loading-screen">Loading…</div>}>
      <DesktopPage />
    </Suspense>
  );
}

export default App;
