import i18n from '../../../shared/i18n';

export const volunteer = (): string => {
  const vText1 = i18n.t('volunteer.demolay.description');
  const vLabel1 = i18n.t('volunteer.demolay.logoAlt');
  const vImg1 = `![${vLabel1}](./resources/demolay.png)`;

  const vText2 = i18n.t('volunteer.vivo.description');
  const vLabel2_1 = i18n.t('volunteer.vivo.logoAlt');
  const vImg2_1 = `![${vLabel2_1}](./resources/fundacao-telefonica-vivo.png)`;

  const vText3 = i18n.t('volunteer.minhacena.description');
  const vLabel3 = i18n.t('volunteer.minhacena.logoAlt');
  const vImg3 = `![${vLabel3}](./resources/minha-cena.jpeg)`;

  return `## ${i18n.t('volunteer.title')}

### [${i18n.t('volunteer.demolay.name')}](https://www.demolay.org.br/)

|     |   |
| --- | :--- |
| ${vImg1} | ${vText1} |


### [${i18n.t('volunteer.vivo.name')}](https://www.fundacaotelefonicavivo.org.br/)

|     |   |
| --- | :--- |
| ${vImg2_1} | ${vText2} |


## [${i18n.t('volunteer.minhacena.name')}](https://www.instagram.com/projetominhacena/)

|     |   |
| --- | :--- |
| ${vImg3} | ${vText3} |
`;
};
