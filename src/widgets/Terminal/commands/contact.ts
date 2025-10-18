import i18n from '../../../shared/i18n';

export const contact = (): string => {
  return `
| ${i18n.t('contact.title')} |
|:---|
| **${i18n.t('contact.email')}** [fernando@carvalhocortes.com.br](mailto:fernando@carvalhocortes.com.br) |
| **${i18n.t('contact.linkedin')}** [linkedin.com/in/carvalhocortes](https://www.linkedin.com/in/carvalhocortes/) |
| **${i18n.t('contact.instagram')}** [@carvalhocortes](https://www.instagram.com/carvalhocortes/) |
`;
};
