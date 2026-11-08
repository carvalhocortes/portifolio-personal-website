import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import {
  getTaskbarWindows,
  useWindowManager,
} from '../../../features/WindowManager';
import { useProgramTitles } from '../../../entities/Program/model/useProgramTitles';
import { StartLogo } from '../../../shared/ui/icons';
import { Clock } from './Clock';
import { StartMenu } from './StartMenu';
import styles from './Taskbar.module.css';

interface TaskbarProps {
  programs: ProgramDefinition[];
  onOpenProgram: (program: ProgramDefinition) => void;
}

const START_MENU_ID = 'start-menu';

export const Taskbar: React.FC<TaskbarProps> = ({
  programs,
  onOpenProgram,
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

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === 'pt-BR' ? 'en-US' : 'pt-BR');

  return (
    <footer className={styles.taskbar}>
      <button
        ref={startRef}
        type="button"
        className={`${styles.button} ${styles.start} ${menuOpen ? styles.pressed : ''}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? START_MENU_ID : undefined}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <StartLogo size={16} />
        <span>{t('taskbar.start')}</span>
      </button>

      {menuOpen && (
        <StartMenu
          id={START_MENU_ID}
          programs={programs}
          onOpenProgram={onOpenProgram}
          onToggleLanguage={toggleLanguage}
          onClose={closeMenu}
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
        <button
          type="button"
          className={styles.trayButton}
          aria-label={t('taskbar.switchLanguage')}
          title={t('taskbar.switchLanguage')}
          onClick={toggleLanguage}
        >
          {t('taskbar.languageCode')}
        </button>
        <Clock className={styles.clock} />
      </div>
    </footer>
  );
};
