import { useState } from 'react';
import type { Command } from '../../../entities/Command/model/types';
import { executeCommand, getClearCommands, getWelcomeCommands } from '../commands';

export const useTerminal = () => {
  const welcomeCommands = getWelcomeCommands();
  const clearCommands = getClearCommands();

  const [commands, setCommands] = useState<Command[]>([{
    id: 0,
    text: welcomeCommands[0],
    output: executeCommand(welcomeCommands[0]),
  }]);

  const handleCommand = (text: string) => {
    const normalizedText = text.toLowerCase().trim();
    if (clearCommands.includes(normalizedText)) {
      setCommands([{
        id: 0,
        text: welcomeCommands[0],
        output: executeCommand(welcomeCommands[0]),
      }]);
    } else {
      const newCommand: Command = {
        id: commands.length + 1,
        text,
        output: executeCommand(text),
      };
      setCommands((prevCommands) => [...prevCommands, newCommand]);
    }
  };

  return { commands, handleCommand };
};
