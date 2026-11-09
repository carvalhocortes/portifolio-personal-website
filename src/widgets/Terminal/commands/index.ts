import type {
  CommandDefinition,
  CommandsMap,
} from '../../../entities/Command/model/commandTypes';
import { TERMINAL_MESSAGES } from '../../../shared/config/constants';
import { commandLink } from '../../../shared/lib/commandLink';
import i18n from '../../../shared/i18n';
import type { ScreenSize } from '../../../shared/lib/useScreenSize';
import { about } from './about';
import { getAliases, getAllAliases } from './aliases';
import { contact } from './contact';
import { dir } from './dir';
import { hobbies } from './hobbies';
import { language } from './language';
import {
  coffee,
  exitHome,
  fortune,
  hack,
  matrix,
  sudo,
  sudoHelp,
  EFFECT_COMMANDS,
  type TerminalEffect,
} from './secrets';
import { ver } from './ver';
import { volunteer } from './volunteer';
import { welcome } from './welcome';

const getCommandDefinitions = (): CommandDefinition[] => [
  {
    key: 'welcome',
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: getAliases('welcome'),
    description: i18n.t('commands.welcome.description'),
    fn: welcome,
    shouldShowInHelp: false,
  },
  {
    key: 'about',
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: getAliases('about'),
    description: i18n.t('commands.about.description'),
    fn: about,
  },
  {
    key: 'hobbies',
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: getAliases('hobbies'),
    description: i18n.t('commands.hobbies.description'),
    fn: hobbies,
  },
  {
    key: 'volunteer',
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: getAliases('volunteer'),
    description: i18n.t('commands.volunteer.description'),
    fn: volunteer,
  },
  {
    key: 'contact',
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: getAliases('contact'),
    description: i18n.t('commands.contact.description'),
    fn: contact,
  },
  {
    key: 'help',
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: getAliases('help'),
    description: i18n.t('commands.help.description'),
    fn: help,
  },
  {
    key: 'dir',
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: getAliases('dir'),
    description: i18n.t('commands.dir.description'),
    fn: dir,
  },
  {
    key: 'ver',
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: getAliases('ver'),
    description: i18n.t('commands.ver.description'),
    fn: ver,
  },
  {
    key: 'language',
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: getAliases('language'),
    description: i18n.t('commands.language.description'),
    fn: language,
  },
  {
    key: 'clear',
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: getAliases('clear'),
    description: i18n.t('commands.clear.description'),
    fn: () => TERMINAL_MESSAGES.CLEARING(),
  },
  // Hidden: not in `ajuda`, only in `sudo ajuda`.
  ...(
    [
      ['coffee', coffee],
      ['matrix', matrix],
      ['fortune', () => fortune()],
      ['hack', hack],
      ['exit', exitHome],
      ['sudo', sudo],
      ['sudoHelp', sudoHelp],
    ] as const
  ).map(([key, fn]): CommandDefinition => ({
    key,
    classification: i18n.t('commands.classifications.secret'),
    acceptedCommands: getAliases(key),
    description: i18n.t(`commands.${key}.description`),
    fn,
    shouldShowInHelp: false,
  })),
];

export function help(): string {
  const COMMAND_DEFINITIONS = getCommandDefinitions();
  const groupedCommands = COMMAND_DEFINITIONS.reduce(
    (acc, cmd) => {
      if (cmd.shouldShowInHelp === false) return acc;

      if (!acc[cmd.classification]) {
        acc[cmd.classification] = [];
      }
      acc[cmd.classification].push(cmd);
      return acc;
    },
    {} as Record<string, CommandDefinition[]>
  );

  const sections = Object.keys(groupedCommands)
    .sort()
    .map((classification) => {
      const items = groupedCommands[classification].map((cmd) => {
        const [main, ...aliases] = cmd.acceptedCommands;
        const aliasText = aliases.length ? ` (${aliases.join(', ')})` : '';
        return `- ${commandLink(main)}${aliasText} — ${cmd.description}`;
      });
      return `**${classification}**\n\n${items.join('\n')}`;
    });

  return [
    TERMINAL_MESSAGES.HELP_HEADER(),
    ...sections,
    TERMINAL_MESSAGES.HELP_FOOTER(),
  ].join('\n\n');
}

const getCommandsMap = (): CommandsMap => {
  const COMMAND_DEFINITIONS = getCommandDefinitions();
  const map: CommandsMap = {};
  // Current language first, then the other languages, so links already on
  // screen keep working after `idioma` without overriding current aliases.
  COMMAND_DEFINITIONS.forEach((cmd) => {
    cmd.acceptedCommands.forEach((alias) => {
      map[alias] = cmd.fn;
    });
  });
  COMMAND_DEFINITIONS.forEach((cmd) => {
    getAllAliases(cmd.key).forEach((alias) => {
      map[alias] ??= cmd.fn;
    });
  });
  return map;
};

export const executeCommand = (
  command: string,
  screenSize?: ScreenSize
): string => {
  const normalizedCommand = command.toLowerCase().trim();
  const commandsMap = getCommandsMap();
  const commandFn = commandsMap[normalizedCommand];

  if (commandFn) {
    return commandFn(screenSize);
  }

  return TERMINAL_MESSAGES.COMMAND_NOT_FOUND(command);
};

export const getClearCommands = (): string[] => getAllAliases('clear');

/** The effect a command plays over the terminal, if any (`matrix`, `hackear`). */
export const getEffect = (command: string): TerminalEffect | null => {
  const text = command.toLowerCase().trim();
  return (
    EFFECT_COMMANDS.find((key) => getAllAliases(key).includes(text)) ?? null
  );
};

/** True for `sair`/`exit`. */
export const isExitCommand = (command: string): boolean =>
  getAllAliases('exit').includes(command.toLowerCase().trim());

export const getWelcomeCommands = (): string[] => getAliases('welcome');
