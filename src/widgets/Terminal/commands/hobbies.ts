import i18n from '../../../shared/i18n';

export const hobbies = (): string => {
  // Marcenaria
  const marcenariaInfo1 = i18n.t('hobbies.woodworking.bench');
  const marcenariaInfo2 = i18n.t('hobbies.woodworking.keyholder');
  const marcenariaInfo3 = i18n.t('hobbies.woodworking.desk');
  const marcenariaImg1 = `![${marcenariaInfo1}](./resources/banco.png)`;
  const marcenariaImg2 = `![${marcenariaInfo2}](./resources/guarda-bolsa.png)`;
  const marcenariaImg3 = `![${marcenariaInfo3}](./resources/mesa-madeira.png)`;

  // Fotografia
  const fotografiaInfo1 = i18n.t('hobbies.photography.macaw1');
  const fotografiaInfo2 = i18n.t('hobbies.photography.macaw2');
  const fotografiaInfo3 = i18n.t('hobbies.photography.bird');
  const fotografiaInfo4 = i18n.t('hobbies.photography.lake');
  const fotografiaImg1 = `![${fotografiaInfo1}](./resources/arara-azul.png)`;
  const fotografiaImg2 = `![${fotografiaInfo2}](./resources/araras-vermelhas.png)`;
  const fotografiaImg3 = `![${fotografiaInfo3}](./resources/passaro-preto.png)`;
  const fotografiaImg4 = `![${fotografiaInfo4}](./resources/rio-lagoa.png)`;

  // DIY
  const diyInfo1 = i18n.t('hobbies.diy.skull');
  const diyInfo2 = i18n.t('hobbies.diy.table');
  const diyInfo3 = i18n.t('hobbies.diy.lamp');
  const diyImg1 = `![${diyInfo1}](./resources/voronai.png)`;
  const diyImg2 = `![${diyInfo2}](./resources/mesa.png)`;
  const diyImg3 = `![${diyInfo3}](./resources/luminaria.png)`;

  return `### ${i18n.t('hobbies.woodworking.title')}
  ${i18n.t('hobbies.woodworking.intro')}

  ${i18n.t('hobbies.woodworking.mentor')}

  ${i18n.t('hobbies.woodworking.projects')}

  | ${marcenariaInfo1} | ${marcenariaInfo2} | ${marcenariaInfo3} |
  | --- | --- | --- |
  | ${marcenariaImg1} | ${marcenariaImg2} | ${marcenariaImg3} |

  ### ${i18n.t('hobbies.photography.title')}
  ${i18n.t('hobbies.photography.intro')}

  ${i18n.t('hobbies.photography.passion')}

  | ${fotografiaInfo1} | ${fotografiaInfo2} | ${fotografiaInfo3} | ${fotografiaInfo4} |
  | --- | --- | --- | --- |
  | ${fotografiaImg1} | ${fotografiaImg2} | ${fotografiaImg3} | ${fotografiaImg4} |

  **${i18n.t('hobbies.photography.funFact')}** ${i18n.t('hobbies.photography.macawFact')} [${i18n.t('hobbies.photography.learnMore')}](https://g1.globo.com/sp/itapetininga-regiao/noticia/2019/06/12/biologa-do-interior-de-sp-explica-sobre-relacionamento-entre-araras-sem-traicao.ghtml).

  ### ${i18n.t('hobbies.diy.title')}
  ${i18n.t('hobbies.diy.intro')}

  ${i18n.t('hobbies.diy.passion')}

  | ${diyInfo1} | ${diyInfo2} | ${diyInfo3} |
  | --- | --- | --- |
  | ${diyImg1} | ${diyImg2} | ${diyImg3} |`;
};
