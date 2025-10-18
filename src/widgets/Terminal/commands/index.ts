import { about } from './about';
import { hobbies } from './hobbies';
import { volunteer } from './volunteer';
import { welcome } from './welcome';

type CommandFn = () => string;

interface Command {
  classification: string;
  AcceptedCommands: string[];
  description: string;
  fn: CommandFn;
}

const commands: Command[] = [
  {
    classification: 'Navegação e utilidades',
    AcceptedCommands: ['bem-vindo', 'welcome', 'inicio', 'start'],
    description: 'Mostra a mensagem de boas-vindas',
    fn: welcome,
  },
  {
    classification: 'Informações pessoais',
    AcceptedCommands: ['sobre', 'about', 'info'],
    description: 'Exibe informações sobre mim',
    fn: about,
  },
  {
    classification: 'Informações pessoais',
    AcceptedCommands: ['hobbies', 'interesses', 'interests'],
    description: 'Lista meus hobbies e interesses',
    fn: hobbies,
  },
  {
    classification: 'Informações pessoais',
    AcceptedCommands: ['trabalho-voluntario', 'voluntario', 'volunteer', 'tv'],
    description: 'Mostra meu trabalho voluntário',
    fn: volunteer,
  },
  {
    classification: 'Navegação e utilidades',
    AcceptedCommands: ['ajuda', 'help', 'h'],
    description: 'Mostra esta mensagem de ajuda',
    fn: help,
  },
  {
    classification: 'Navegação e utilidades',
    AcceptedCommands: ['limpar', 'clear', 'cls'],
    description: 'Limpa o terminal',
    fn: () => 'limpando...',
  },
];

export function help(): string {
  const grouped = commands.reduce((acc, cmd) => {
    if (!acc[cmd.classification]) {
      acc[cmd.classification] = [];
    }
    acc[cmd.classification].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  let output = 'Comandos disponíveis:\n\n';

  Object.keys(grouped).sort().forEach(classification => {

    output += `${classification}:\n`;
    grouped[classification].forEach(cmd => {
      if (cmd.description === 'Mostra a mensagem de boas-vindas') return;

      output += `  - ${cmd.AcceptedCommands[0]},\n`;

      for (let i = 1; i < cmd.AcceptedCommands.length - 1; i++) {
        output += `    ${cmd.AcceptedCommands[i]},\n`;
      }

      if (cmd.AcceptedCommands.length > 1) {
        output += `    ${cmd.AcceptedCommands[cmd.AcceptedCommands.length - 1]} - ${cmd.description}\n`;
      } else {
        output = output.slice(0, -2);
        output += ` - ${cmd.description}\n`;
      }
    });
    output += '\n';
  });

  output += 'Digite o nome do comando para executá-lo.';

  return `\`\`\`\n${output}\n\`\`\``;
}

const commandsMap: Record<string, CommandFn> = commands.reduce((acc, cmd) => {
  cmd.AcceptedCommands.forEach(acceptedCmd => {
    acc[acceptedCmd] = cmd.fn;
  });

  return acc;
}, {} as Record<string, CommandFn>);

export const executeCommand = (command: string): string => {
  const cmd = command.toLowerCase().trim();
  const fn = commandsMap[cmd];
  if (fn) return fn();
  return `Comando não encontrado: ${command}`;
};

export const getClearCommands = (): string[] => {
  const clearCommand = commands.find(cmd => cmd.description.includes('Limpa o terminal'));
  return clearCommand ? clearCommand.AcceptedCommands : [];
};

export const getWelcomeCommands = (): string[] => {
  const welcomeCommand = commands.find(cmd => cmd.description.includes('boas-vindas'));
  return welcomeCommand ? welcomeCommand.AcceptedCommands : [];
};
