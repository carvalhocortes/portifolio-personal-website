import { formatObjectArray, type TextObject } from "./render-text";

export const welcome = (): string => {
  return formatObjectArray(welcomePtBr);
};

const welcomePtBr: TextObject = {
  'Bem vindo a minha pagina!': [
    '```',
    ' █████╗  █████╗ ██████╗ ██╗   ██╗ █████╗ ██╗     ██╗  ██╗ █████╗',
    '██╔══██╗██╔══██╗██╔══██╗██║   ██║██╔══██╗██║     ██║  ██║██╔══██╗',
    '██║  ╚═╝███████║██████╔╝╚██╗ ██╔╝███████║██║     ███████║██║  ██║',
    '██║  ██╗██╔══██║██╔══██╗ ╚████╔╝ ██╔══██║██║     ██╔══██║██║  ██║',
    '╚█████╔╝██║  ██║██║  ██║  ╚██╔╝  ██║  ██║███████╗██║  ██║╚█████╔╝ █▀▀ █▀█ █▀█ ▀█▀ █▀▀ █▀',
    ' ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚════╝  █▄▄ █▄█ █▀▄  █  ██▄ ▄█',
    '```',
    '',
    'Digite \'ajuda\' para ver os comandos.',
  ]
}
