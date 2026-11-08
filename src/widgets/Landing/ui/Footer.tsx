import { content } from '../../../entities/Content';
import { useContentLanguage } from '../lib/useContentLanguage';
import styles from './Footer.module.css';

export const Footer = () => {
  const { t } = useContentLanguage();
  return (
    <footer className={styles.footer}>
      <p>
        {t('landing.footer', {
          year: new Date().getFullYear(),
          name: content.pessoa.nome,
        })}
      </p>
    </footer>
  );
};
