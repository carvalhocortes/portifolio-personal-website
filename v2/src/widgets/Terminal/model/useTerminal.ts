import { useState } from 'react';
import type { Command } from '../../../entities/Command/model/types';

const executeCommand = (command: string): string => {
  const cmd = command.toLowerCase().trim();
  switch (cmd) {
    case 'help':
      return 'Available commands: help, about, date, clear, welcome';
    case 'about':
      return 'React Terminal v1.0 - Created with Feature-Sliced Design';
    case 'date':
      return new Date().toLocaleString('pt-BR');
    case 'welcome':
      return `
██████╗ ███████╗ █████╗  ██████╗████████╗
██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝
██████╔╝█████╗  ███████║██║        ██║
██╔══██╗██╔══╝  ██╔══██║██║        ██║
██║  ██║███████╗██║  ██║╚██████╗   ██║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝
Welcome to the React Terminal! Type 'help' to see available commands.
`;
    case 'clear':
      return 'clearing...';
    default:
      return `zsh: command not found: ${command}`;
  }
};

export const useTerminal = () => {
  const [commands, setCommands] = useState<Command[]>([{
    id: 0,
    text: 'welcome',
    output: executeCommand('welcome'),
  }]);

  const handleCommand = (text: string) => {
    if (text.toLowerCase().trim() === 'clear') {
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
