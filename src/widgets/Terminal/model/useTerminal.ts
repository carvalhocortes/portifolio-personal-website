import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Command } from '../../../entities/Command/model/types';
import {
  useScreenSize,
  type ScreenSize,
} from '../../../shared/lib/useScreenSize';
import {
  executeCommand,
  getClearCommands,
  getWelcomeCommands,
} from '../commands';

const INITIAL_COMMAND_ID = 0;
const WELCOME_COMMANDS = getWelcomeCommands();

/**
 * @param size Size class for responsive output (the welcome banner). Defaults
 * to the screen size; the terminal passes its own size when it lives in a window.
 */
export const useTerminal = (size?: ScreenSize) => {
  const screenSizeFallback = useScreenSize();
  const screenSize = size ?? screenSizeFallback;
  // Re-render on language change so the welcome can be redrawn in it.
  const { i18n } = useTranslation();
  const language = i18n.language;

  const createWelcomeCommand = useCallback(
    (): Command => ({
      id: INITIAL_COMMAND_ID,
      text: WELCOME_COMMANDS[0],
      output: executeCommand(WELCOME_COMMANDS[0], screenSize),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- language drives i18n output
    [screenSize, language]
  );

  const [commands, setCommands] = useState<Command[]>([createWelcomeCommand()]);
  // Everything run in this session (typed or clicked), for ArrowUp/ArrowDown.
  // Kept apart from `commands` so that `cls` clears the screen, not the history.
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  // Monotonic ids: unique even if several commands run before a re-render.
  const nextIdRef = useRef(INITIAL_COMMAND_ID + 1);

  // While only the welcome is on screen, redraw it when the terminal changes
  // size (first measurement, window maximized or restored) or language.
  useEffect(() => {
    setCommands((prev) =>
      prev.length === 1 && prev[0].id === INITIAL_COMMAND_ID
        ? [createWelcomeCommand()]
        : prev
    );
  }, [createWelcomeCommand]);

  const handleCommand = useCallback(
    (text: string) => {
      const normalizedText = text.toLowerCase().trim();
      setInputHistory((prev) => [...prev, text]);

      // Read per call: aliases depend on the language, which `idioma` changes.
      if (getClearCommands().includes(normalizedText)) {
        setCommands([createWelcomeCommand()]);
        return;
      }

      const newCommand: Command = {
        id: nextIdRef.current++,
        text,
        output: executeCommand(text, screenSize),
      };

      setCommands((prevCommands) => [...prevCommands, newCommand]);
    },
    [screenSize, createWelcomeCommand]
  );

  return { commands, handleCommand, inputHistory };
};
