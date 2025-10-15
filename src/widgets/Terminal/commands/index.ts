import { about } from './about';
import { hobbies } from './hobbies';
import { volunteer } from './volunteer';
import { welcome } from './welcome';

type CommandFn = () => string;

export const help = (): string => {
  return `Comandos disponíveis: ${Object.keys(commandsMap).join(', ')}`;
};

const commandsMap: Record<string, CommandFn> = {
  'ajuda': help,
  'bem-vindo': welcome,
  'sobre': about,
  'hobbies': hobbies,
  'trabalho-voluntario': volunteer,
  // 'fale-comigo': contact,
  'limpar': () => 'limpando...',
  // 'mudar-idioma': language
};

export const executeCommand = (command: string): string => {
  const cmd = command.toLowerCase().trim();
  const fn = commandsMap[cmd];
  if (fn) return fn();
  return `zsh: comando não encontrado: ${command}`;
};
