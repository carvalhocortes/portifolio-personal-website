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

  // How each program starts (open, minimized) is set in PROGRAMS.
  return (
    <main className={styles.page}>
      <WindowManagerProvider>
        <Desktop programs={PROGRAMS} />
      </WindowManagerProvider>
    </main>
  );
};

export default DesktopPage;
