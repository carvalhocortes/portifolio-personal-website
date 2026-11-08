import { useCallback, useRef, useState } from 'react';
import type { Command } from '../../../entities/Command/model/types';
import { useScreenSize } from '../../../shared/lib/useScreenSize';
import {
  executeCommand,
  getClearCommands,
  getWelcomeCommands,
} from '../commands';

const INITIAL_COMMAND_ID = 0;
const WELCOME_COMMANDS = getWelcomeCommands();

export const useTerminal = () => {
  const screenSize = useScreenSize();

  const createWelcomeCommand = useCallback(
    (): Command => ({
      id: INITIAL_COMMAND_ID,
      text: WELCOME_COMMANDS[0],
      output: executeCommand(WELCOME_COMMANDS[0], screenSize),
    }),
    [screenSize]
  );

  const [commands, setCommands] = useState<Command[]>([createWelcomeCommand()]);
  // Everything run in this session (typed or clicked), for ArrowUp/ArrowDown.
  // Kept apart from `commands` so that `cls` clears the screen, not the history.
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  // Monotonic ids: unique even if several commands run before a re-render.
  const nextIdRef = useRef(INITIAL_COMMAND_ID + 1);

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
