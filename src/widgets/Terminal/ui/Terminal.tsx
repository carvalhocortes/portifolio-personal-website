import React, { useEffect, useRef } from 'react';
import { CommandHistory } from '../../../features/CommandHistory/ui/CommandHistory';
import { CommandInput } from '../../../features/CommandInput/ui/CommandInput';
import { useTerminal } from '../model/useTerminal';
import styles from './Terminal.module.css';

export const Terminal = () => {
  const { commands, handleCommand } = useTerminal();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const lastCommandRef = useRef<HTMLDivElement | null>(null);

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
      className={styles.terminal}
      onClick={focusInput}
      role="application"
      aria-label="Interactive terminal interface"
    >
      <section aria-label="Command history output">
        <CommandHistory commands={commands} lastCommandRef={lastCommandRef} />
      </section>
      <CommandInput onEnter={handleCommand} />
      <div
        ref={terminalEndRef}
        className={styles.scrollAnchor}
        aria-hidden="true"
      />
    </main>
  );
};
