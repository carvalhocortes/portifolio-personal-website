import { content, pick, resource } from '../../../entities/Content';
import i18n from '../../../shared/i18n';

export const volunteer = (): string => {
  const lang = i18n.language;
  const { voluntario } = content;

  const items = voluntario.itens.map((item) => {
    const logo = `![${pick(item.logo.alt, lang)}](${resource(item.logo.arquivo)} "small")`;
    return `### [${pick(item.nome, lang)}](${item.url})

|     |   |
| --- | :--- |
| ${logo} | ${pick(item.descricao, lang)} |
`;
  });

  return `## ${pick(voluntario.titulo, lang)}\n\n${items.join('\n\n')}`;
};
