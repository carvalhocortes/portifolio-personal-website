import i18n from '../i18n';

export const DOS_PROMPT = 'C:\\CARVALHO-CORTES\\>';

export const DOS_VERSION = '1984.02.07';

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
