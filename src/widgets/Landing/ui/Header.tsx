import { List, X } from '@phosphor-icons/react';
import { useEffect, useId, useState } from 'react';
import { content, resource } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import styles from './Header.module.css';

export const SECTION_IDS = {
  about: 'sobre',
  hobbies: 'hobbies',
  volunteer: 'voluntario',
  contact: 'contato',
} as const;

export const Header = () => {
  const { t, text, toggleLanguage } = useContentLanguage();
  const [open, setOpen] = useState(false);
  const navId = useId();

  const links = [
    { id: SECTION_IDS.about, label: text(content.sobre.titulo) },
    { id: SECTION_IDS.hobbies, label: text(content.hobbies.titulo) },
    { id: SECTION_IDS.volunteer, label: text(content.voluntario.titulo) },
    { id: SECTION_IDS.contact, label: text(content.contato.menu) },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a
          className={styles.brand}
          href="#inicio"
          aria-label={content.pessoa.nome}
        >
          <span
            className={styles.signature}
            style={{
              ['--signature' as string]: `url("${resource(content.pessoa.assinatura.arquivo)}")`,
            }}
            aria-hidden="true"
          />
        </a>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? t('landing.closeMenu') : t('landing.menu')}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X size={22} weight="bold" />
          ) : (
            <List size={22} weight="bold" />
          )}
        </button>

        <nav
          id={navId}
          className={styles.nav}
          data-open={open}
          aria-label={t('landing.mainNav')}
        >
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.language}
            aria-label={t('landing.switchLanguage')}
            onClick={toggleLanguage}
          >
            {t('landing.languageShort')}
          </button>
        </nav>
      </div>
    </header>
  );
};
