import { LinkedinLogo } from '@phosphor-icons/react';
import { content } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import { useReveal } from '../lib/useReveal';
import { ContactForm } from './ContactForm';
import { SECTION_IDS } from './Header';
import reveal from './Reveal.module.css';
import styles from './Contact.module.css';

export const Contact = () => {
  const { t } = useContentLanguage();
  const { contato } = content;
  const ref = useReveal<HTMLDivElement>();
  // The content title ends with a colon for the Terminal table.
  const title = t('contato.titulo').replace(/:\s*$/, '');

  return (
    <section
      id={SECTION_IDS.contact}
      aria-labelledby="contato-title"
      className={styles.section}
    >
      <div ref={ref} className={`${styles.panel} ${reveal.reveal}`}>
        <div className={styles.intro}>
          <h2 id="contato-title" className={styles.title}>
            {title}
          </h2>
          <a
            className={styles.linkedin}
            href={contato.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            <LinkedinLogo size={20} weight="fill" aria-hidden="true" />
            {t('landing.linkedin')}
          </a>
        </div>
        <ContactForm />
      </div>
    </section>
  );
};
