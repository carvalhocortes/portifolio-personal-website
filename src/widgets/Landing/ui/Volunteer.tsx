import { ArrowUpRight } from '@phosphor-icons/react';
import { content, resource } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import { SECTION_IDS } from '../lib/sections';
import { Rich } from './Rich';
import { Section } from './Section';
import styles from './Volunteer.module.css';

export const Volunteer = () => {
  const { t } = useContentLanguage();
  const { voluntario } = content;

  return (
    <Section id={SECTION_IDS.volunteer} title={t('voluntario.titulo')}>
      <ol className={styles.list}>
        {voluntario.itens.map((item) => {
          // Texts of each item live at voluntario.itens.<id>.
          const key = `voluntario.itens.${item.id}`;
          const name = t(`${key}.nome`);
          return (
            <li key={item.id} className={styles.item}>
              <div className={styles.logo}>
                <img
                  src={resource(item.logo.arquivo)}
                  alt={t(`${key}.logo.alt`)}
                  width={112}
                  height={112}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className={styles.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('landing.visitSite', { name })}
                  >
                    {name}
                    <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                  </a>
                </h3>
                <Rich className={styles.description}>
                  {t(`${key}.descricao`)}
                </Rich>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
};
