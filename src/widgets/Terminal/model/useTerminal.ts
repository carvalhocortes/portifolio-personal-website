import { useCallback, useState } from 'react';
import type { Command } from '../../../entities/Command/model/types';
import {
  executeCommand,
  getClearCommands,
  getWelcomeCommands,
} from '../commands';

const INITIAL_COMMAND_ID = 0;
const WELCOME_COMMANDS = getWelcomeCommands();
const CLEAR_COMMANDS = getClearCommands();

const createWelcomeCommand = (): Command => ({
  id: INITIAL_COMMAND_ID,
  text: WELCOME_COMMANDS[0],
  output: executeCommand(WELCOME_COMMANDS[0]),
});

export const useTerminal = () => {
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
        output: executeCommand(text),
      };

      setCommands((prevCommands) => [...prevCommands, newCommand]);
    },
    [commands.length]
  );

  return { commands, handleCommand };
};
