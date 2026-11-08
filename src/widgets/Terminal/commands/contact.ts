import { content } from '../../../entities/Content';
import i18n from '../../../shared/i18n';

export const contact = (): string => {
  const { contato } = content;
  const linkedinLabel = contato.linkedin
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');

  return `
| ${i18n.t('contato.titulo')} |
|:---|
| **${i18n.t('contact.email')}** [${contato.email}](mailto:${contato.email}) |
| **${i18n.t('contact.linkedin')}** [${linkedinLabel}](${contato.linkedin}) |
`;
};
