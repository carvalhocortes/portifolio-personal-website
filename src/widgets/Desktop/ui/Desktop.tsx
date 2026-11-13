import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import { useProgramTitles } from '../../../entities/Program/model/useProgramTitles';
import {
  Window,
  WINDOW_FRAME,
  getTaskbarWindows,
  useWindowManager,
} from '../../../features/WindowManager';
import { Taskbar } from '../../Taskbar/ui/Taskbar';
import styles from './Desktop.module.css';

interface DesktopProps {
  programs: ProgramDefinition[];
  /** Start menu: run the boot again. */
  onRestart?: () => void;
  /** Start menu: show the shutdown screen. */
  onShutdown?: () => void;
}

export const Desktop: React.FC<DesktopProps> = ({
  programs,
  onRestart,
  onShutdown,
}) => {
  const { t } = useTranslation();
  const { nameOf, windowTitleOf } = useProgramTitles();
  const { state, activeId, open, minimize, close, setSize, desktopRef } =
    useWindowManager();

  const openProgram = (program: ProgramDefinition) =>
    open(program.id, program.defaultSize, {
      placement: program.placement,
    });

  // Each program says how it starts. Minimized ones open first, then the open
  // ones, and last the 'front' one, which ends up on top and active.
  useEffect(() => {
    const starting = (startup: ProgramDefinition['startup']) =>
      programs.filter((p) => p.startup === startup);
    starting('minimized').forEach((program) => {
      openProgram(program);
      minimize(program.id);
    });
    starting('open').forEach(openProgram);
    starting('front').forEach(openProgram);
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

        {/* Windows stay in opening order in the page and stack by z-index:
            moving a window in the page mid-click (to bring it to the front)
            would make the browser drop that first click. */}
        {getTaskbarWindows(state).map((win) => {
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
              layer={state.windows.indexOf(win) + 1}
            >
              <program.Component
                isActive={isActive}
                onClose={() => close(win.id)}
                onFitContent={(size) =>
                  setSize(win.id, {
                    width: size.width + WINDOW_FRAME.width,
                    height: size.height + WINDOW_FRAME.height,
                  })
                }
              />
            </Window>
          );
        })}
      </div>
      <Taskbar
        programs={programs}
        onOpenProgram={openProgram}
        onRestart={onRestart}
        onShutdown={onShutdown}
      />
    </div>
  );
};
