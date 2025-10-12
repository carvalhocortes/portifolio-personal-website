import { ajuda } from './ajuda';
import { sobre } from './sobre';
import { data } from './data';
import { bemVindo } from './bem-vindo';
import { limpar } from './limpar';

type CommandFn = () => string;

const commandsMap: Record<string, CommandFn> = {
  'ajuda': ajuda,
  'sobre': sobre,
  'data': data,
  'bem-vindo': bemVindo,
  'limpar': limpar,
};

export const executeCommand = (command: string): string => {
  const cmd = command.toLowerCase().trim();
  const fn = commandsMap[cmd];
  if (fn) return fn();
  return `zsh: comando não encontrado: ${command}`;
};
