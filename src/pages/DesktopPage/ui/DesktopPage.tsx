import { lazy, Suspense, useLayoutEffect, useState } from 'react';
import { WindowManagerProvider } from '../../../features/WindowManager';
import { hasBooted, markBooted } from '../../../shared/lib/bootMark';
import { useIdle } from '../../../shared/lib/useIdle';
import { toggleMussum } from '../../../shared/i18n/mussumMode';
import {
  CACILDIS,
  useKonami,
  useSecretSequence,
} from '../../../shared/lib/useKonami';
import { useScreenSize } from '../../../shared/lib/useScreenSize';
import { BootScreen } from '../../../widgets/BootScreen';
import { Desktop } from '../../../widgets/Desktop/ui/Desktop';
import { FunScreen } from '../../../widgets/FunScreens';
import { Screensaver } from '../../../widgets/Screensaver';
import { PROGRAMS } from '../model/programs';
import styles from './DesktopPage.module.css';

const LandingPage = lazy(() => import('../../LandingPage/ui/LandingPage'));

/** The shutdown screen stays this long, or until a click or key. */
export const SHUTDOWN_MS = 3000;
/** The screensaver shows after this long without activity. */
export const SCREENSAVER_MS = 2 * 60 * 1000;

type Screen = 'boot' | 'desktop' | 'off' | 'bsod';

const DesktopPage = () => {
  const isPhone = useScreenSize() === 'small';
  const [screen, setScreen] = useState<Screen>(() =>
    hasBooted() ? 'desktop' : 'boot'
  );
  // A new key on restart: the desktop starts over, as after a real reboot.
  const [session, setSession] = useState(0);
  const onDesktop = screen === 'desktop';

  const restart = () => {
    setSession((n) => n + 1);
    setScreen('boot');
  };

  useKonami(() => setScreen('bsod'), onDesktop && !isPhone);
  useSecretSequence(CACILDIS, toggleMussum, onDesktop && !isPhone);
  const idle = useIdle(SCREENSAVER_MS, onDesktop && !isPhone);

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
  // mounts under the boot and joke screens, so leaving them lands on it
  // ready; until then it is inert, so Tab can't wander behind them.
  return (
    <>
      <main className={styles.page} inert={!onDesktop}>
        <WindowManagerProvider key={session}>
          <Desktop
            programs={PROGRAMS}
            onRestart={restart}
            onShutdown={() => setScreen('off')}
          />
        </WindowManagerProvider>
      </main>
      {screen === 'boot' && (
        <BootScreen
          onFinish={() => {
            markBooted();
            delete document.documentElement.dataset.boot;
            setScreen('desktop');
          }}
        />
      )}
      {screen === 'off' && (
        <FunScreen variant="off" autoExitMs={SHUTDOWN_MS} onExit={restart} />
      )}
      {screen === 'bsod' && (
        <FunScreen variant="bsod" onExit={() => setScreen('desktop')} />
      )}
      {onDesktop && idle && <Screensaver />}
    </>
  );
};

export default DesktopPage;
