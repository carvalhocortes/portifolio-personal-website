export const TERMINAL_COLORS = {
  PROMPT_CURRENT: '#61afef',
  PROMPT_HISTORY: '#c71616',
  TEXT_INPUT: '#98c379',
  TEXT_OUTPUT: '#98c379',
  BACKGROUND: '#282c34',
} as const;

export const TERMINAL_SYMBOLS = {
  PROMPT: '❯',
  SEPARATOR: '─',
  CORNER: '└',
} as const;

export const BREAKPOINTS = {
  MOBILE: 0,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
} as const;

export const TERMINAL_MESSAGES = {
  COMMAND_NOT_FOUND: (command: string) => `Comando não encontrado: ${command}`,
  CLEARING: 'limpando...',
  HELP_HEADER: 'Comandos disponíveis:',
  HELP_FOOTER: 'Digite o nome do comando para executá-lo.',
} as const;
