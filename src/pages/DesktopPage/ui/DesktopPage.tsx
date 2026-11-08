import { WindowManagerProvider } from '../../../features/WindowManager';
import { useScreenSize } from '../../../shared/lib/useScreenSize';
import { Desktop } from '../../../widgets/Desktop/ui/Desktop';
import { MAIN_PROGRAM, PROGRAMS } from '../model/programs';
import styles from './DesktopPage.module.css';

const DesktopPage = () => {
  const isPhone = useScreenSize() === 'small';

  if (isPhone) {
    // Phones: no desktop, the main program fills the screen.
    const Main = PROGRAMS.find((p) => p.id === MAIN_PROGRAM)!.Component;
    return (
      <main className={styles.phone}>
        <Main isActive />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <WindowManagerProvider>
        <Desktop programs={PROGRAMS} startupPrograms={[MAIN_PROGRAM]} />
      </WindowManagerProvider>
    </main>
  );
};

export default DesktopPage;
