import i18n from '../../../shared/i18n';

export const contact = (): string => {
  return `
| ${i18n.t('contact.title')} |
|:---|
| **${i18n.t('contact.email')}** [carvalhocortes@gmail.com](mailto:carvalhocortes@gmail.com) |
| **${i18n.t('contact.linkedin')}** [linkedin.com/in/carvalhocortes](https://www.linkedin.com/in/carvalhocortes/) |
`;
};
