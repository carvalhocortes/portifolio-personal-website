import { commandLink } from '../../../shared/lib/commandLink';
import i18n from '../../../shared/i18n';
import { firstAlias } from './aliases';

/** Hidden commands: not in `ajuda`, listed only by `sudo ajuda`. */
export const SECRET_COMMANDS = [
  'coffee',
  'matrix',
  'fortune',
  'hack',
  'exit',
  'sudo',
] as const;

/** Commands that play an effect over the terminal instead of only printing. */
export const EFFECT_COMMANDS = ['matrix', 'hack'] as const;
export type TerminalEffect = (typeof EFFECT_COMMANDS)[number];

export const coffee = (): string =>
  [
    '```',
    i18n.t('secrets.coffee.art'),
    '```',
    '',
    i18n.t('secrets.coffee.text'),
  ].join('\n');

export const matrix = (): string => i18n.t('secrets.matrix.end');

export const fortune = (random: () => number = Math.random): string => {
  const lines = i18n.t('secrets.fortune', { returnObjects: true }) as string[];
  return `> ${lines[Math.floor(random() * lines.length)]}`;
};

export const hackLines = (): string[] =>
  i18n.t('secrets.hack.lines', { returnObjects: true }) as string[];

export const hack = (): string =>
  [
    ...hackLines().map((line) => `\`${line}\``),
    '',
    i18n.t('secrets.hack.end'),
  ].join('  \n');

/** `sair` outside a window (the /terminal page): there's nowhere to go. */
export const exitHome = (): string => i18n.t('secrets.exit.home');

export const sudo = (): string => i18n.t('secrets.sudo.denied');

export const sudoHelp = (): string => {
  const items = SECRET_COMMANDS.map(
    (key) =>
      `- ${commandLink(firstAlias(key))} — ${i18n.t(`commands.${key}.description`)}`
  );
  return [`**${i18n.t('secrets.sudo.helpHeader')}**`, '', ...items].join('\n');
};
