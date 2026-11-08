import React, { useCallback, useEffect, useRef } from 'react';
import { CommandHistory } from '../../../features/CommandHistory/ui/CommandHistory';
import { CommandInput } from '../../../features/CommandInput/ui/CommandInput';
import type { ProgramProps } from '../../../entities/Program/model/types';
import { useTerminal } from '../model/useTerminal';
import { useTerminalSize } from '../model/useTerminalSize';
import { TerminalEffect } from './TerminalEffect';
import styles from './Terminal.module.css';

// The command prompt field rendered by CommandInput (a textarea).
const PROMPT_SELECTOR = '[name="command"]';

export const Terminal: React.FC<Partial<ProgramProps>> = ({
  isActive = true,
  onClose,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalSize = useTerminalSize(terminalRef);
  const { commands, handleCommand, inputHistory, effect, endEffect } =
    useTerminal(terminalSize, { onExit: onClose });
  const lastCommandRef = useRef<HTMLDivElement | null>(null);

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
  const focusInput = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest(`a, button, ${PROMPT_SELECTOR}`)) {
      focusPrompt();
    }
  };

  // When the window comes to the front (desktop, mouse), typing goes to the prompt.
  useEffect(() => {
    if (isActive && window.matchMedia?.('(pointer: fine)').matches) {
      focusPrompt();
    }
    // focusPrompt only reads a ref.
  }, [isActive]);

  // Scroll only this terminal (never the page or the desktop): to the start
  // of a long output, otherwise to the bottom.
  useEffect(() => {
    if (commands.length === 0) return;

    requestAnimationFrame(() => {
      const terminal = terminalRef.current;
      const commandElement = lastCommandRef.current;
      if (!terminal || !commandElement) return;

      const commandTop =
        commandElement.getBoundingClientRect().top -
        terminal.getBoundingClientRect().top +
        terminal.scrollTop;
      const top =
        commandElement.offsetHeight > terminal.clientHeight
          ? commandTop
          : terminal.scrollHeight;
      terminal.scrollTo?.({ top, behavior: 'smooth' });
    });
  }, [commands]);

  return (
    <div className={styles.frame}>
      <div
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
      </div>
      {effect && (
        <TerminalEffect
          effect={effect}
          onDone={() => {
            endEffect();
            focusPrompt();
          }}
        />
      )}
    </div>
  );
};
