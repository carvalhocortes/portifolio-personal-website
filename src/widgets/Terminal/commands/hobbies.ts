import { content, pick, resource } from '../../../entities/Content';
import type { Hobby } from '../../../entities/Content';
import i18n from '../../../shared/i18n';

// Each hobby is a title, its paragraphs and a table with the photo captions
// over the photos, so they sit side by side.
const hobbyBlock = (hobby: Hobby, lang: string): string => {
  const captions = hobby.fotos.map((photo) => pick(photo.legenda, lang));
  const images = hobby.fotos.map(
    (photo, i) => `![${captions[i]}](${resource(photo.arquivo)})`
  );
  const table = [
    `| ${captions.join(' | ')} |`,
    `| ${captions.map(() => '---').join(' | ')} |`,
    `| ${images.join(' | ')} |`,
  ].join('\n  ');
  const paragraphs = hobby.paragrafos.map((p) => pick(p, lang)).join('\n\n  ');

  let block = `### ${pick(hobby.titulo, lang)}\n  ${paragraphs}\n\n  ${table}`;
  if (hobby.curiosidade) {
    const { rotulo, texto, link } = hobby.curiosidade;
    block += `\n\n  **${pick(rotulo, lang)}** ${pick(texto, lang)} [${pick(link.texto, lang)}](${link.url}).`;
  }
  return block;
};

export const hobbies = (): string =>
  content.hobbies.itens
    .map((hobby) => hobbyBlock(hobby, i18n.language))
    .join('\n\n  ');
