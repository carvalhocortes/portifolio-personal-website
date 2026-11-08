import { lazy, Suspense, useLayoutEffect } from 'react';
import { WindowManagerProvider } from '../../../features/WindowManager';
import { useScreenSize } from '../../../shared/lib/useScreenSize';
import { Desktop } from '../../../widgets/Desktop/ui/Desktop';
import { PROGRAMS } from '../model/programs';
import styles from './DesktopPage.module.css';

const LandingPage = lazy(() => import('../../LandingPage/ui/LandingPage'));

const DesktopPage = () => {
  const isPhone = useScreenSize() === 'small';

  // Phones get the landing page, so they take its page styles.
  useLayoutEffect(() => {
    document.documentElement.dataset.route = isPhone ? 'landing' : 'desktop';
  }, [isPhone]);

  if (isPhone) {
    return (
      <Suspense fallback={<div className="loading-screen" aria-busy="true" />}>
        <LandingPage />
      </Suspense>
    );
  }

  // Every program starts open but minimized: one click on the taskbar shows it.
  return (
    <main className={styles.page}>
      <WindowManagerProvider>
        <Desktop
          programs={PROGRAMS}
          startupPrograms={PROGRAMS.map((p) => p.id)}
          startMinimized
        />
      </WindowManagerProvider>
    </main>
  );
};

export default DesktopPage;
