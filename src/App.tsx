import { lazy, Suspense } from 'react';
import './app/styles/index.css';

const TerminalPage = lazy(() => import('./pages/TerminalPage/ui/TerminalPage'));

function App() {
  return (
    <Suspense fallback={<div className="loading-screen">Loading...</div>}>
      <TerminalPage />
    </Suspense>
  );
}

export default App;
