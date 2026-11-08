import { content, resource, textList } from '../../../entities/Content';
import type { Hobby } from '../../../entities/Content';
import i18n from '../../../shared/i18n';

// Each hobby is a title, its paragraphs and a table with the photo captions
// over the photos, so they sit side by side.
const hobbyBlock = (hobby: Hobby): string => {
  const { t } = i18n;
  const key = `hobbies.itens.${hobby.id}`;
  const captions = hobby.fotos.map((_, i) => t(`${key}.fotos.${i}.legenda`));
  const images = hobby.fotos.map(
    (photo, i) => `![${captions[i]}](${resource(photo.arquivo)})`
  );
  const table = [
    `| ${captions.join(' | ')} |`,
    `| ${captions.map(() => '---').join(' | ')} |`,
    `| ${images.join(' | ')} |`,
  ].join('\n  ');
  const paragraphs = textList(t, `${key}.paragrafos`).join('\n\n  ');

  let block = `### ${t(`${key}.titulo`)}\n  ${paragraphs}\n\n  ${table}`;
  if (hobby.curiosidade) {
    const fact = `${key}.curiosidade`;
    block += `\n\n  **${t(`${fact}.rotulo`)}** ${t(`${fact}.texto`)} [${t(`${fact}.link.texto`)}](${hobby.curiosidade.link.url}).`;
  }
  return block;
};

export const hobbies = (): string =>
  content.hobbies.itens.map(hobbyBlock).join('\n\n  ');
