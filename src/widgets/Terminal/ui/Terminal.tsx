import React, { useCallback, useEffect, useRef } from 'react';
import { CommandHistory } from '../../../features/CommandHistory/ui/CommandHistory';
import { CommandInput } from '../../../features/CommandInput/ui/CommandInput';
import { useTerminal } from '../model/useTerminal';
import styles from './Terminal.module.css';

export const Terminal = () => {
  const { commands, handleCommand, inputHistory } = useTerminal();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const lastCommandRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<HTMLElement>(null);

  // Clicked commands run like typed ones; with a mouse, typing can continue
  // right away. On touch screens we skip this so the keyboard stays closed.
  const runClickedCommand = useCallback(
    (command: string) => {
      handleCommand(command);
      if (window.matchMedia?.('(pointer: fine)').matches) {
        terminalRef.current?.querySelector('input')?.focus();
      }
    },
    [handleCommand]
  );

  const focusInput = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT') {
      const input = e.currentTarget.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  };

  useEffect(() => {
    if (commands.length === 0) return;

    requestAnimationFrame(() => {
      if (lastCommandRef.current) {
        const commandElement = lastCommandRef.current;
        const terminalWidget = commandElement.closest(`.${styles.terminal}`);

        if (terminalWidget) {
          const commandHeight = commandElement.offsetHeight;
          const viewportHeight = terminalWidget.clientHeight;

          if (commandHeight > viewportHeight) {
            commandElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          } else {
            terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }, [commands]);

  return (
    <main
      ref={terminalRef}
      className={styles.terminal}
      onClick={focusInput}
      role="application"
      aria-label="Interactive terminal interface"
    >
      <section aria-label="Command history output">
        <CommandHistory
          commands={commands}
          lastCommandRef={lastCommandRef}
          onCommand={runClickedCommand}
        />
      </section>
      <CommandInput onEnter={handleCommand} history={inputHistory} />
      <div
        ref={terminalEndRef}
        className={styles.scrollAnchor}
        aria-hidden="true"
      />
    </main>
  );
};
