import { lazy, Suspense, useLayoutEffect, useState } from 'react';
import { WindowManagerProvider } from '../../../features/WindowManager';
import { hasBooted, markBooted } from '../../../shared/lib/bootMark';
import { useScreenSize } from '../../../shared/lib/useScreenSize';
import { BootScreen } from '../../../widgets/BootScreen';
import { Desktop } from '../../../widgets/Desktop/ui/Desktop';
import { PROGRAMS } from '../model/programs';
import styles from './DesktopPage.module.css';

const LandingPage = lazy(() => import('../../LandingPage/ui/LandingPage'));

const DesktopPage = () => {
  const isPhone = useScreenSize() === 'small';
  const [booting, setBooting] = useState(() => !hasBooted());

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

  // How each program starts (open, minimized) is set in PROGRAMS. The desktop
  // mounts under the boot screen, so skipping lands on it ready; until then
  // it is inert, so Tab can't wander behind the boot screen.
  return (
    <>
      <main className={styles.page} inert={booting}>
        <WindowManagerProvider>
          <Desktop programs={PROGRAMS} />
        </WindowManagerProvider>
      </main>
      {booting && (
        <BootScreen
          onFinish={() => {
            markBooted();
            delete document.documentElement.dataset.boot;
            setBooting(false);
          }}
        />
      )}
    </>
  );
};

export default DesktopPage;
