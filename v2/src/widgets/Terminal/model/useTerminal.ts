import { useState } from 'react';
import type { Command } from '../../../entities/Command/model/types';
import { executeCommand } from '../commands';

export const useTerminal = () => {
  const [commands, setCommands] = useState<Command[]>([{
    id: 0,
    text: 'bem-vindo',
    output: executeCommand('bem-vindo'),
  }]);

  const handleCommand = (text: string) => {
    if (text.toLowerCase().trim() === 'limpar') {
      setCommands([]);
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
