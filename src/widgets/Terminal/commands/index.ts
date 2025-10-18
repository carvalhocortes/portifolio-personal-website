import type {
  CommandDefinition,
  CommandsMap,
} from '../../../entities/Command/model/commandTypes';
import { TERMINAL_MESSAGES } from '../../../shared/config/constants';
import i18n from '../../../shared/i18n';
import type { ScreenSize } from '../../../shared/lib/useScreenSize';
import { about } from './about';
import { contact } from './contact';
import { hobbies } from './hobbies';
import { language } from './language';
import { volunteer } from './volunteer';
import { welcome } from './welcome';

const getCommandDefinitions = (): CommandDefinition[] => [
  {
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: i18n.t('commands.welcome.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.welcome.description'),
    fn: welcome,
    shouldShowInHelp: false,
  },
  {
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: i18n.t('commands.about.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.about.description'),
    fn: about,
  },
  {
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: i18n.t('commands.hobbies.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.hobbies.description'),
    fn: hobbies,
  },
  {
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: i18n.t('commands.volunteer.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.volunteer.description'),
    fn: volunteer,
  },
  {
    classification: i18n.t('commands.classifications.personal'),
    acceptedCommands: i18n.t('commands.contact.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.contact.description'),
    fn: contact,
  },
  {
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: i18n.t('commands.help.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.help.description'),
    fn: help,
  },
  {
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: i18n.t('commands.language.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.language.description'),
    fn: language,
  },
  {
    classification: i18n.t('commands.classifications.navigation'),
    acceptedCommands: i18n.t('commands.clear.aliases', { returnObjects: true }) as string[],
    description: i18n.t('commands.clear.description'),
    fn: () => TERMINAL_MESSAGES.CLEARING(),
  },
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

  let output = `${TERMINAL_MESSAGES.HELP_HEADER()}\n\n`;

  Object.keys(groupedCommands)
    .sort()
    .forEach((classification) => {
      output += `${classification}:\n`;
      groupedCommands[classification].forEach((cmd) => {
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

  output += TERMINAL_MESSAGES.HELP_FOOTER();

  return `\`\`\`\n${output}\n\`\`\``;
}

const getCommandsMap = (): CommandsMap => {
  const COMMAND_DEFINITIONS = getCommandDefinitions();
  return COMMAND_DEFINITIONS.reduce((acc, cmd) => {
    cmd.acceptedCommands.forEach((acceptedCmd) => {
      acc[acceptedCmd] = cmd.fn;
    });
    return acc;
  }, {} as CommandsMap);
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

export const getClearCommands = (): string[] => {
  const COMMAND_DEFINITIONS = getCommandDefinitions();
  const clearCommand = COMMAND_DEFINITIONS.find((cmd) =>
    cmd.acceptedCommands.includes('cls')
  );
  return clearCommand ? clearCommand.acceptedCommands : [];
};

export const getWelcomeCommands = (): string[] => {
  const COMMAND_DEFINITIONS = getCommandDefinitions();
  const welcomeCommand = COMMAND_DEFINITIONS.find((cmd) =>
    cmd.acceptedCommands.includes('start')
  );
  return welcomeCommand ? welcomeCommand.acceptedCommands : [];
};
