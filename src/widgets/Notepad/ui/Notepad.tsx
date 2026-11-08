import { useTranslation } from 'react-i18next';
import type { ProgramProps } from '../../../entities/Program/model/types';
import styles from './Notepad.module.css';

const MENU = ['file', 'edit', 'search', 'help'] as const;

/**
 * Notepad with the site's Leia-me.txt. Anyone can type in it, but nothing is
 * saved: closing the window or switching the language brings the text back.
 */
export const Notepad = (_props: ProgramProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  return (
    <div className={styles.notepad}>
      <div className={styles.menu} aria-hidden="true">
        {MENU.map((item) => {
          const label = t(`notepad.menu.${item}`);
          return (
            <span key={item}>
              <u>{label[0]}</u>
              {label.slice(1)}
            </span>
          );
        })}
      </div>
      <textarea
        // A new language starts over with that language's text.
        key={language}
        className={styles.text}
        aria-label={t('leiame.nome')}
        defaultValue={t('leiame.texto')}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
};
