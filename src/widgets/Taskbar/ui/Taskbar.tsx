import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import {
  getTaskbarWindows,
  useWindowManager,
} from '../../../features/WindowManager';
import { useProgramTitles } from '../../../entities/Program/model/useProgramTitles';
import { MUSSUM, turnMussumOn } from '../../../shared/i18n/mussumMode';
import { IcqIcon, StartLogo } from '../../../shared/ui/icons';
import { Clock } from './Clock';
import { StartMenu, type Language } from './StartMenu';
import styles from './Taskbar.module.css';

interface TaskbarProps {
  programs: ProgramDefinition[];
  onOpenProgram: (program: ProgramDefinition) => void;
  onRestart?: () => void;
  onShutdown?: () => void;
}

const START_MENU_ID = 'start-menu';
export const PLUS_CLICKS = 10;
const PLUS_WINDOW_MS = 5000;

export const Taskbar: React.FC<TaskbarProps> = ({
  programs,
  onOpenProgram,
  onRestart,
  onShutdown,
}) => {
  const { t, i18n } = useTranslation();
  const { state, activeId, focus, minimize } = useWindowManager();
  const { nameOf } = useProgramTitles();
  const [menuOpen, setMenuOpen] = useState(false);
  const startRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuOpen(false);
    if (returnFocus) startRef.current?.focus();
  }, []);

  const clockProgram = programs.find((program) => program.id === 'clock');
  const icqProgram = programs.find((program) => program.id === 'icq');

  // 10 clicks on Start within a few seconds: the menu banner gets a "Plus!".
  const [plus, setPlus] = useState(false);
  const startClicks = useRef<number[]>([]);
  const countStartClick = () => {
    const now = Date.now();
    startClicks.current = [
      ...startClicks.current.filter((at) => now - at < PLUS_WINDOW_MS),
      now,
    ];
    if (startClicks.current.length >= PLUS_CLICKS) setPlus(true);
  };

  const toggleLanguage = () =>
    // The Mussum mode counts as Portuguese, so it goes to English.
    i18n.changeLanguage(i18n.language.startsWith('en') ? 'pt-BR' : 'en-US');

  return (
    <footer className={styles.taskbar}>
      <button
        ref={startRef}
        type="button"
        className={`${styles.button} ${styles.start} ${menuOpen ? styles.pressed : ''}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? START_MENU_ID : undefined}
        onClick={() => {
          countStartClick();
          setMenuOpen((open) => !open);
        }}
      >
        <StartLogo size={16} />
        <span>{t('taskbar.start')}</span>
      </button>

      {menuOpen && (
        <StartMenu
          id={START_MENU_ID}
          programs={programs}
          onOpenProgram={onOpenProgram}
          language={i18n.language}
          onSetLanguage={(language: Language) =>
            language === MUSSUM
              ? turnMussumOn()
              : void i18n.changeLanguage(language)
          }
          onClose={closeMenu}
          onRestart={onRestart}
          onShutdown={onShutdown}
          plus={plus}
          ignoreRef={startRef}
        />
      )}

      <div className={styles.divider} aria-hidden="true" />

      <nav className={styles.tasks} aria-label={t('taskbar.openWindows')}>
        {getTaskbarWindows(state).map((win) => {
          const program = programs.find((p) => p.id === win.id);
          if (!program) return null;
          const isActive = activeId === win.id;
          return (
            <button
              key={win.id}
              type="button"
              className={`${styles.button} ${styles.task} ${isActive ? styles.pressed : ''}`}
              aria-pressed={isActive}
              onClick={() => (isActive ? minimize(win.id) : focus(win.id))}
            >
              <program.Icon size={16} />
              <span className={styles.taskLabel}>{nameOf(program)}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.tray}>
        {icqProgram && (
          // Like ICQ in the Windows tray: the flower opens the messenger.
          <button
            type="button"
            className={`${styles.trayButton} ${styles.trayIcon}`}
            aria-label={t('taskbar.openIcq')}
            title={t('taskbar.openIcq')}
            onClick={() => onOpenProgram(icqProgram)}
          >
            <IcqIcon size={16} />
          </button>
        )}
        <button
          type="button"
          className={styles.trayButton}
          aria-label={t('taskbar.switchLanguage')}
          title={t('taskbar.switchLanguage')}
          onClick={toggleLanguage}
        >
          {t('taskbar.languageCode')}
        </button>
        {clockProgram ? (
          // Like Windows: the time in the tray opens the Clock program.
          <button
            type="button"
            className={`${styles.trayButton} ${styles.clock}`}
            aria-label={t('taskbar.openClock')}
            title={t('taskbar.openClock')}
            onClick={() => onOpenProgram(clockProgram)}
          >
            <Clock />
          </button>
        ) : (
          <Clock className={styles.clock} />
        )}
      </div>
    </footer>
  );
};
