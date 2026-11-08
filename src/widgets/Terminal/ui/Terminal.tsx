import React, { useCallback, useEffect, useRef } from 'react';
import { CommandHistory } from '../../../features/CommandHistory/ui/CommandHistory';
import { CommandInput } from '../../../features/CommandInput/ui/CommandInput';
import { useTerminal } from '../model/useTerminal';
import styles from './Terminal.module.css';

// The command prompt field rendered by CommandInput (a textarea).
const PROMPT_SELECTOR = '[name="command"]';

export const Terminal = () => {
  const { commands, handleCommand, inputHistory } = useTerminal();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const lastCommandRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<HTMLElement>(null);

  // Clicked commands run like typed ones; with a mouse, typing can continue
  // right away. On touch screens we skip this so the keyboard stays closed.
  const focusPrompt = () => {
    terminalRef.current
      ?.querySelector<HTMLTextAreaElement>(PROMPT_SELECTOR)
      ?.focus({ preventScroll: true });
  };

  const runClickedCommand = useCallback(
    (command: string) => {
      handleCommand(command);
      if (window.matchMedia?.('(pointer: fine)').matches) {
        focusPrompt();
      }
    },
    [handleCommand]
  );

  // Clicking anywhere on the screen (except a link or the prompt itself)
  // puts the keyboard back on the prompt, as in a real terminal.
  const focusInput = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest(`a, button, ${PROMPT_SELECTOR}`)) {
      focusPrompt();
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
