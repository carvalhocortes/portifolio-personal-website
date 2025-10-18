import type {
  CommandDefinition,
  CommandsMap,
} from '../../../entities/Command/model/commandTypes';
import { TERMINAL_MESSAGES } from '../../../shared/config/constants';
import { about } from './about';
import { hobbies } from './hobbies';
import { volunteer } from './volunteer';
import { welcome } from './welcome';

const COMMAND_DEFINITIONS: CommandDefinition[] = [
  {
    classification: 'Navegação e utilidades',
    acceptedCommands: ['bem-vindo', 'welcome', 'inicio', 'start'],
    description: 'Mostra a mensagem de boas-vindas',
    fn: welcome,
  },
  {
    classification: 'Informações pessoais',
    acceptedCommands: ['sobre', 'about', 'info'],
    description: 'Exibe informações sobre mim',
    fn: about,
  },
  {
    classification: 'Informações pessoais',
    acceptedCommands: ['hobbies', 'interesses', 'interests'],
    description: 'Lista meus hobbies e interesses',
    fn: hobbies,
  },
  {
    classification: 'Informações pessoais',
    acceptedCommands: ['trabalho-voluntario', 'voluntario', 'volunteer', 'tv'],
    description: 'Mostra meu trabalho voluntário',
    fn: volunteer,
  },
  {
    classification: 'Navegação e utilidades',
    acceptedCommands: ['ajuda', 'help', 'h'],
    description: 'Mostra esta mensagem de ajuda',
    fn: help,
  },
  {
    classification: 'Navegação e utilidades',
    acceptedCommands: ['limpar', 'clear', 'cls'],
    description: 'Limpa o terminal',
    fn: () => TERMINAL_MESSAGES.CLEARING,
  },
];

export function help(): string {
  const groupedCommands = COMMAND_DEFINITIONS.reduce(
    (acc, cmd) => {
      if (!acc[cmd.classification]) {
        acc[cmd.classification] = [];
      }
      acc[cmd.classification].push(cmd);
      return acc;
    },
    {} as Record<string, CommandDefinition[]>
  );

  let output = `${TERMINAL_MESSAGES.HELP_HEADER}\n\n`;

  Object.keys(groupedCommands)
    .sort()
    .forEach((classification) => {
      output += `${classification}:\n`;
      groupedCommands[classification].forEach((cmd) => {
        if (cmd.description === 'Mostra a mensagem de boas-vindas') return;

        output += `  - ${cmd.acceptedCommands[0]}`;

        for (let i = 1; i < cmd.acceptedCommands.length - 1; i++) {
          output += `,\n    ${cmd.acceptedCommands[i]}`;
        }

        if (cmd.acceptedCommands.length > 1) {
          output += `,\n    ${cmd.acceptedCommands[cmd.acceptedCommands.length - 1]} - ${cmd.description}\n`;
        } else {
          output += ` - ${cmd.description}\n`;
        }
      });
      output += '\n';
    });

  output += TERMINAL_MESSAGES.HELP_FOOTER;

  return `\`\`\`\n${output}\n\`\`\``;
}

const commandsMap: CommandsMap = COMMAND_DEFINITIONS.reduce((acc, cmd) => {
  cmd.acceptedCommands.forEach((acceptedCmd) => {
    acc[acceptedCmd] = cmd.fn;
  });
  return acc;
}, {} as CommandsMap);

export const executeCommand = (command: string): string => {
  const normalizedCommand = command.toLowerCase().trim();
  const commandFn = commandsMap[normalizedCommand];

  if (commandFn) {
    return commandFn();
  }

  return TERMINAL_MESSAGES.COMMAND_NOT_FOUND(command);
};

export const getClearCommands = (): string[] => {
  const clearCommand = COMMAND_DEFINITIONS.find((cmd) =>
    cmd.description.includes('Limpa o terminal')
  );
  return clearCommand ? clearCommand.acceptedCommands : [];
};

export const getWelcomeCommands = (): string[] => {
  const welcomeCommand = COMMAND_DEFINITIONS.find((cmd) =>
    cmd.description.includes('boas-vindas')
  );
  return welcomeCommand ? welcomeCommand.acceptedCommands : [];
};
