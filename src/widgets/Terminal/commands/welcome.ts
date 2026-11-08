import { commandLink } from '../../../shared/lib/commandLink';
import i18n from '../../../shared/i18n';
import { firstAlias, getAliases } from './aliases';
import type { ScreenSize } from '../../../shared/lib/useScreenSize';

// "trabalho-voluntario" is too long for a menu label, so the volunteer
// shortcut uses its second alias when that is a real word ("voluntario").
const shortcutAlias = (command: string): string => {
  const [first, second] = getAliases(command);
  return command === 'volunteer' && second && second.length > 2
    ? second
    : first;
};

const SHORTCUTS = ['about', 'hobbies', 'volunteer', 'contact', 'help'];

const helpLine = (): string => {
  const helpAlias = firstAlias('help');
  const text = i18n.t('welcome.helpText', { help: commandLink(helpAlias) });
  const shortcuts = SHORTCUTS.map((command) => {
    const alias = shortcutAlias(command);
    return commandLink(alias.toUpperCase(), alias);
  }).join(' · ');

  return `${text}\n\n${shortcuts}`;
};

export const welcome = (screenSize: ScreenSize = 'xlarge'): string => {
  const title = i18n.t('welcome.title');

  switch (screenSize) {
    case 'small':
      return `## ${title}\n\n${helpLine()}`;
    case 'medium':
      return `## ${title}\n\n\`\`\`${i18n.t('welcome.ascii.medium')}\n\`\`\`\n\n${helpLine()}`;
    case 'large':
    case 'xlarge':
    default:
      return `## ${title}\n\n\`\`\`${i18n.t('welcome.ascii.xlarge')}\n\`\`\`\n\n${helpLine()}`;
  }
};
