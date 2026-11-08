import { ArrowUpRight } from '@phosphor-icons/react';
import { content, resource } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import { SECTION_IDS } from './Header';
import { Rich } from './Rich';
import { Section } from './Section';
import styles from './Volunteer.module.css';

export const Volunteer = () => {
  const { t, text } = useContentLanguage();
  const { voluntario } = content;

  return (
    <Section id={SECTION_IDS.volunteer} title={text(voluntario.titulo)}>
      <ol className={styles.list}>
        {voluntario.itens.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.logo}>
              <img
                src={resource(item.logo.arquivo)}
                alt={text(item.logo.alt)}
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
                  aria-label={t('landing.visitSite', { name: text(item.nome) })}
                >
                  {text(item.nome)}
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                </a>
              </h3>
              <Rich className={styles.description}>{text(item.descricao)}</Rich>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
};
