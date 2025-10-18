import i18n from '../../../shared/i18n';
import type { ScreenSize } from '../../../shared/lib/useScreenSize';

export const welcome = (screenSize: ScreenSize = 'xlarge'): string => {
  const title = i18n.t('welcome.title');
  const helpText = i18n.t('welcome.helpText');

  switch (screenSize) {
    case 'small':
      return `${title}\n\n"${helpText}"`;
    case 'medium':
      return `## ${title}\n\n\`\`\`${i18n.t('welcome.ascii.medium')}\n\`\`\`\n\n"${helpText}"`;
    case 'large':
    case 'xlarge':
    default:
      return `## ${title}\n\n\`\`\`${i18n.t('welcome.ascii.xlarge')}\n\`\`\`\n\n"${helpText}"`;
  }
};
