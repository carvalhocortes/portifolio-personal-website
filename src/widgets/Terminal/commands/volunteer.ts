import { content, resource } from '../../../entities/Content';
import i18n from '../../../shared/i18n';

export const volunteer = (): string => {
  const { t } = i18n;
  const { voluntario } = content;

  const items = voluntario.itens.map((item) => {
    const key = `voluntario.itens.${item.id}`;
    const logo = `![${t(`${key}.logo.alt`)}](${resource(item.logo.arquivo)} "small")`;
    return `### [${t(`${key}.nome`)}](${item.url})

|     |   |
| --- | :--- |
| ${logo} | ${t(`${key}.descricao`)} |
`;
  });

  return `## ${t('voluntario.titulo')}\n\n${items.join('\n\n')}`;
};
