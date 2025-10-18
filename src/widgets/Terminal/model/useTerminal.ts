import { useCallback, useState } from 'react';
import type { Command } from '../../../entities/Command/model/types';
import { useScreenSize } from '../../../shared/lib/useScreenSize';
import {
  executeCommand,
  getClearCommands,
  getWelcomeCommands,
} from '../commands';

const INITIAL_COMMAND_ID = 0;
const WELCOME_COMMANDS = getWelcomeCommands();
const CLEAR_COMMANDS = getClearCommands();

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

  const handleCommand = useCallback(
    (text: string) => {
      const normalizedText = text.toLowerCase().trim();

      if (CLEAR_COMMANDS.includes(normalizedText)) {
        setCommands([createWelcomeCommand()]);
        return;
      }

      const newCommand: Command = {
        id: commands.length,
        text,
        output: executeCommand(text, screenSize),
      };

      setCommands((prevCommands) => [...prevCommands, newCommand]);
    },
    [commands.length, screenSize, createWelcomeCommand]
  );

  return { commands, handleCommand };
};
