import { content, pick } from '../../../entities/Content';
import i18n from '../../../shared/i18n';

const badge = (label: string, color: string, logo: string) =>
  `https://img.shields.io/badge/${encodeURIComponent(label).replace(/-/g, '--')}-${color}?style=for-the-badge&logo=${logo}&logoColor=white`;

export const about = (): string => {
  const lang = i18n.language;
  const { sobre, contato } = content;
  const linkedinLabel = contato.linkedin
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');
  const paragraphs = sobre.paragrafos.map((p) => pick(p, lang)).join('\n\n');

  return `
## ${pick(sobre.saudacao, lang)}

${paragraphs}

### ${i18n.t('about.contactTitle')}
[![${contato.email}](${badge(contato.email, 'D14836', 'gmail')})](mailto:${contato.email})
[![${linkedinLabel}](${badge(linkedinLabel, '0077B5', 'linkedin')})](${contato.linkedin})
`;
};
