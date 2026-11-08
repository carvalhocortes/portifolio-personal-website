import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import { useProgramTitles } from '../../../entities/Program/model/useProgramTitles';
import { Window, useWindowManager } from '../../../features/WindowManager';
import { Taskbar } from '../../Taskbar/ui/Taskbar';
import styles from './Desktop.module.css';

interface DesktopProps {
  programs: ProgramDefinition[];
}

export const Desktop: React.FC<DesktopProps> = ({ programs }) => {
  const { t } = useTranslation();
  const { nameOf, windowTitleOf } = useProgramTitles();
  const { state, activeId, open, minimize, desktopRef } = useWindowManager();

  const openProgram = (program: ProgramDefinition) =>
    open(program.id, program.defaultSize, { centered: program.centered });

  // Each program says how it starts. Minimized ones open first, so the ones
  // that start open end up in front, and the last of them is active.
  useEffect(() => {
    const minimized = programs.filter((p) => p.startup === 'minimized');
    const opened = programs.filter((p) => p.startup === 'open');
    minimized.forEach((program) => {
      openProgram(program);
      minimize(program.id);
    });
    opened.forEach(openProgram);
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
                <span className={styles.iconLabel}>{nameOf(program)}</span>
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
              title={windowTitleOf(program)}
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
