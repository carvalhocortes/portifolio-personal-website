import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ProgramDefinition,
  ProgramId,
} from '../../../entities/Program/model/types';
import { Window, useWindowManager } from '../../../features/WindowManager';
import { Taskbar } from '../../Taskbar/ui/Taskbar';
import styles from './Desktop.module.css';

interface DesktopProps {
  programs: ProgramDefinition[];
  /** Programs opened when the desktop first appears. */
  startupPrograms?: ProgramId[];
  /** Start those programs minimized: only their taskbar buttons show. */
  startMinimized?: boolean;
}

export const Desktop: React.FC<DesktopProps> = ({
  programs,
  startupPrograms = [],
  startMinimized = false,
}) => {
  const { t } = useTranslation();
  const { state, activeId, open, minimize, desktopRef } = useWindowManager();

  const openProgram = (program: ProgramDefinition) =>
    open(program.id, program.defaultSize);

  useEffect(() => {
    startupPrograms.forEach((id) => {
      const program = programs.find((p) => p.id === id);
      if (!program) return;
      open(program.id, program.defaultSize);
      if (startMinimized) minimize(program.id);
    });
    // Only on first mount: later opens come from the visitor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.screen}>
      <div
        ref={desktopRef}
        className={styles.desktop}
        role="region"
        aria-label={t('desktop.label')}
      >
        <ul className={styles.icons} aria-label={t('desktop.programs')}>
          {programs.map((program) => (
            <li key={program.id}>
              <button
                type="button"
                className={styles.icon}
                onClick={() => openProgram(program)}
              >
                <program.Icon size={32} />
                <span className={styles.iconLabel}>{t(program.titleKey)}</span>
              </button>
            </li>
          ))}
        </ul>

        {state.windows.map((win) => {
          const program = programs.find((p) => p.id === win.id);
          if (!program) return null;
          const isActive = activeId === win.id;
          return (
            <Window
              key={win.id}
              window={win}
              title={t(program.titleKey)}
              icon={<program.Icon size={16} />}
              isActive={isActive}
            >
              <program.Component isActive={isActive} />
            </Window>
          );
        })}
      </div>
      <Taskbar programs={programs} onOpenProgram={openProgram} />
    </div>
  );
};
