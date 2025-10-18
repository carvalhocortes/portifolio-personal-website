import i18n from '../i18n';

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
  COMMAND_NOT_FOUND: (command: string) =>
    i18n.t('terminal.commandNotFound', { command }),
  CLEARING: () => i18n.t('terminal.clearing'),
  HELP_HEADER: () => i18n.t('terminal.helpHeader'),
  HELP_FOOTER: () => i18n.t('terminal.helpFooter'),
};
